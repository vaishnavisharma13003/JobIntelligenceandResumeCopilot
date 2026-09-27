"""
main.py - FastAPI backend for the AI Job Intelligence & Resume Copilot

Run with:
    uvicorn main:app --reload --port 8000

Make sure Ollama is running first:
    ollama run llama3.2
"""

import os
import io
import json
import re
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
import ollama

import rag
import langchain_rag
import langgraph_workflow
import agent
import evaluation

load_dotenv()

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

app = FastAPI(title="AI Job Copilot Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_ollama_client = ollama.Client(host=OLLAMA_BASE_URL)

# Keeps the most recently analyzed resume's raw text in memory so the
# frontend doesn't have to re-upload the PDF for every follow-up request
# (simple in-memory demo state - not multi-user safe, which is fine here).
_last_resume_text = {"text": ""}


# ---------------------------------------------------------------------
# Helpers / guardrails
# ---------------------------------------------------------------------

def call_ollama(prompt: str, as_json: bool = False) -> str:
    """Central place to call Ollama, with connection-error guardrails."""
    try:
        kwargs = {"model": OLLAMA_MODEL, "messages": [{"role": "user", "content": prompt}]}
        if as_json:
            kwargs["format"] = "json"
        response = _ollama_client.chat(**kwargs)
        return response["message"]["content"].strip()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=(
                "Could not reach Ollama. Make sure it is running "
                f"(`ollama run {OLLAMA_MODEL}`) and reachable at {OLLAMA_BASE_URL}. "
                f"Original error: {e}"
            ),
        )


def extract_json_object(text: str) -> dict:
    """Guardrail: pull a JSON object out of model output, handling malformed cases."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    raise HTTPException(
        status_code=502,
        detail="The model returned output that could not be parsed as JSON. Please try again.",
    )


async def read_and_validate_pdf(file: UploadFile) -> tuple[bytes, str]:
    """Guardrail: reject empty/invalid files before we waste an LLM call."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = "\n".join((page.extract_text() or "") for page in reader.pages).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {e}")

    if not text:
        raise HTTPException(
            status_code=400,
            detail="No extractable text found in this PDF (it may be a scanned image).",
        )

    print(text,"textDataaaaaaaaaaaaaaaaaaaaa")

    return file_bytes, text


# ---------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------

class JobDescriptionRequest(BaseModel):
    job_description: str


class MatchRequest(BaseModel):
    resume_text: str
    job_description: str


class WorkflowRequest(BaseModel):
    resume_text: str
    job_description: str


class EvaluateRequest(BaseModel):
    question: str
    context: str
    answer: str


class ToolDemoRequest(BaseModel):
    message: str


# ---------------------------------------------------------------------
# 1. Health check
# ---------------------------------------------------------------------

@app.get("/")
def health_check():
    return {"message": "AI Job Copilot Backend is running"}


# ---------------------------------------------------------------------
# 2. Simple LLM test
# ---------------------------------------------------------------------

@app.get("/ask")
def ask(question: str = Query(..., min_length=1)):
    answer = call_ollama(question)
    return {"question": question, "answer": answer}


# ---------------------------------------------------------------------
# 3. Resume analysis (free text)
# ---------------------------------------------------------------------

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    _, resume_text = await read_and_validate_pdf(file)
    _last_resume_text["text"] = resume_text

    prompt = f"""Analyze the resume below. Summarize the candidate's skills,
experience, and technologies. Base your analysis ONLY on the text given -
do not invent details that are not present.

RESUME:
{resume_text}
"""
    analysis = call_ollama(prompt)
    
    return {"resume_text": resume_text, "analysis": analysis}


# ---------------------------------------------------------------------
# 4. Structured resume analysis
# ---------------------------------------------------------------------

@app.post("/analyze-resume-structured")
async def analyze_resume_structured(file: UploadFile = File(...)):
    _, resume_text = await read_and_validate_pdf(file)
    _last_resume_text["text"] = resume_text

    prompt = f"""Read the resume text below and extract structured information.

Respond with ONLY valid JSON, no extra commentary, in exactly this shape:
{{
  "skills": [],
  "experience": "",
  "technologies": [],
  "projects": [],
  "strengths": [],
  "improvements": []
}}

Rules:
- Only include information that is ACTUALLY present in the resume text.
- Do NOT invent skills, companies, projects, or years of experience.
- "experience" should be a short text summary (e.g. "2 years, mostly backend").
- If a field has nothing relevant, return an empty list or empty string.

RESUME:
{resume_text}
"""
    raw = call_ollama(prompt, as_json=True)
    data = extract_json_object(raw)

    expected_keys = ["skills", "experience", "technologies", "projects", "strengths", "improvements"]
    for key in expected_keys:
        if key not in data:
            data[key] = [] if key != "experience" else ""

    data["resume_text"] = resume_text
    return data


# ---------------------------------------------------------------------
# 5. Job analysis
# ---------------------------------------------------------------------

@app.post("/analyze-job")
def analyze_job(payload: JobDescriptionRequest):
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description cannot be empty.")

    prompt = f"""Read the job description below and extract structured information.

Respond with ONLY valid JSON, no extra commentary, in exactly this shape:
{{
  "required_skills": [],
  "preferred_skills": [],
  "experience_requirements": "",
  "frontend_technologies": [],
  "backend_technologies": [],
  "ai_genai_technologies": [],
  "databases": [],
  "other_requirements": []
}}

Only include information ACTUALLY present in the text below. Do not invent
requirements that aren't mentioned.

JOB DESCRIPTION:
{payload.job_description}
"""
    raw = call_ollama(prompt, as_json=True)
    data = extract_json_object(raw)

    expected_keys = [
        "required_skills", "preferred_skills", "experience_requirements",
        "frontend_technologies", "backend_technologies",
        "ai_genai_technologies", "databases", "other_requirements",
    ]
    for key in expected_keys:
        if key not in data:
            data[key] = [] if key != "experience_requirements" else ""

    return data


# ---------------------------------------------------------------------
# 6. Resume vs job matching
# ---------------------------------------------------------------------

@app.post("/match-resume")
def match_resume(payload: MatchRequest):
    if not payload.resume_text.strip() or not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="resume_text and job_description are both required.")

    prompt = f"""Compare the RESUME and JOB DESCRIPTION below.

Respond with ONLY valid JSON, no extra commentary, in exactly this shape:
{{
  "matching_skills": [],
  "missing_skills": [],
  "partially_matching_skills": [],
  "relevant_projects": [],
  "experience_match": "",
  "explanation": "",
  "resume_improvement_suggestions": []
}}

IMPORTANT: Never invent skills or experience that are not present in the
RESUME text. Only compare what is actually written.

RESUME:
{payload.resume_text}

JOB DESCRIPTION:
{payload.job_description}
"""
    raw = call_ollama(prompt, as_json=True)
    data = extract_json_object(raw)

    expected_keys = [
        "matching_skills", "missing_skills", "partially_matching_skills",
        "relevant_projects", "experience_match", "explanation",
        "resume_improvement_suggestions",
    ]
    for key in expected_keys:
        if key not in data:
            data[key] = [] if key not in ("experience_match", "explanation") else ""

    return data


# ---------------------------------------------------------------------
# 7. Manual RAG endpoints
# ---------------------------------------------------------------------

@app.post("/upload-resume-rag")
async def upload_resume_rag(file: UploadFile = File(...)):
    file_bytes, _ = await read_and_validate_pdf(file)

    text = rag.extract_text_from_pdf(file_bytes)
    chunks = rag.chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="Could not build chunks from this resume.")

    rag.build_faiss_index(chunks)
    return {"message": "Resume indexed for manual RAG.", "chunk_count": len(chunks)}


@app.get("/resume-chat")
def resume_chat(question: str = Query(..., min_length=1)):
    if not rag.manual_rag_store.is_ready():
        raise HTTPException(
            status_code=400,
            detail="No resume has been uploaded for manual RAG yet. Call /upload-resume-rag first.",
        )
    try:
        return rag.answer_resume_question(question)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


# ---------------------------------------------------------------------
# 8. LangChain RAG endpoints
# ---------------------------------------------------------------------

@app.post("/langchain-upload-resume")
async def langchain_upload_resume(file: UploadFile = File(...)):
    file_bytes, _ = await read_and_validate_pdf(file)
    try:
        chunk_count = langchain_rag.build_langchain_index(file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Resume indexed with LangChain RAG.", "chunk_count": chunk_count}


@app.get("/langchain-resume-chat")
def langchain_resume_chat(question: str = Query(..., min_length=1)):
    if not langchain_rag.langchain_rag_store.is_ready():
        raise HTTPException(
            status_code=400,
            detail="No resume has been uploaded for LangChain RAG yet. Call /langchain-upload-resume first.",
        )
    try:
        return langchain_rag.answer_question_langchain(question)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


# ---------------------------------------------------------------------
# 9. LangGraph workflow
# ---------------------------------------------------------------------

@app.post("/run-job-workflow")
def run_job_workflow(payload: WorkflowRequest):
    if not payload.resume_text.strip() or not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="resume_text and job_description are both required.")
    try:
        result = langgraph_workflow.run_job_workflow(payload.resume_text, payload.job_description)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Workflow failed: {e}")
    return result


# ---------------------------------------------------------------------
# 10. Tool calling demo (agent.py)
# ---------------------------------------------------------------------

@app.post("/tool-demo")
def tool_demo(payload: ToolDemoRequest):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty.")
    try:
        return agent.run_tool_calling_demo(payload.message)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Tool calling demo failed: {e}")


# ---------------------------------------------------------------------
# 11. Evaluation
# ---------------------------------------------------------------------

@app.post("/evaluate-answer")
def evaluate_answer(payload: EvaluateRequest):
    return evaluation.evaluate_answer(payload.question, payload.context, payload.answer)
