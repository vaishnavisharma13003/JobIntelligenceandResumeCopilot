"use client";

import { useState } from "react";
import StatusBar from "./components/StatusBar";
import ResumeUpload from "./components/ResumeUpload";
import ResumeChat from "./components/ResumeChat";
import JobAnalyzer from "./components/JobAnalyzer";
import MatchResult from "./components/MatchResult";
import WorkflowPanel from "./components/WorkflowPanel";

export default function Home() {
  // Shared state: once the resume + job description have both been
  // analyzed once, we reuse the raw text for matching & the workflow
  // instead of asking the user to re-upload/re-paste everything again.
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  return (
    <main className="page">
      <div className="header">
        <h1>🧠 AI Job Intelligence & Resume Copilot</h1>
        <p>A local, GenAI-powered resume & job-matching assistant - runs entirely on Ollama + Llama 3.2.</p>
        <StatusBar />
      </div>

      <div className="grid grid-2">
        <ResumeUpload onResumeAnalyzed={setResumeText} />
        <JobAnalyzer onJobDescriptionChange={setJobDescription} />
      </div>

      <div className="section-title">Resume Chat</div>
      <ResumeChat />

      <div className="section-title">Resume vs Job Match</div>
      <MatchResult resumeText={resumeText} jobDescription={jobDescription} />

      <div className="section-title">Interview Prep & Learning Plan</div>
      <WorkflowPanel resumeText={resumeText} jobDescription={jobDescription} />
    </main>
  );
}
