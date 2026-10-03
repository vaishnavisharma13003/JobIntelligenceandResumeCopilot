"use client";

import { useRef, useState } from "react";
import { apiFetchForm } from "../../lib/api";
import TagList from "../TagList";

export default function ResumeUpload({ onResumeAnalyzed }) {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  // When user selects a file
  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    setError("");
    setAnalysis(null);

    // Only allow PDF because your existing API expects PDF
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  // File input change
  const handleChange = (event) => {
    const selectedFile = event.target.files?.[0];

    handleFile(selectedFile);
  };

  // Existing API functionality
  async function handleAnalyze() {
    if (!file) {
      setError("Please choose a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      // KEEPING YOUR EXISTING API
      const data = await apiFetchForm("/analyze-resume-structured", file);

      console.log("Resume analysis:", data);

      // Save complete analysis
      setAnalysis(data);

      // Send extracted resume text to parent
      onResumeAnalyzed?.(data.resume_text || "");
    } catch (err) {
      console.error("Resume analysis error:", err);

      setError(err.message || "Unable to analyze resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="input-card">
      {/* ================= HEADER ================= */}
      <div className="card-header">
        <div>
          <span className="step">01</span>

          <div>
            <h3>Your Resume</h3>
            <p>Upload your resume for AI analysis</p>
          </div>
        </div>

        {fileName && !loading && <span className="success-badge">✓ Ready</span>}

        {loading && <span className="success-badge">Processing...</span>}
      </div>

      {/* ================= HIDDEN FILE INPUT ================= */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleChange}
        hidden
      />

      {/* ================= UPLOAD BOX ================= */}
      <div
        className="upload-box"
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <div className="upload-icon">↑</div>

        <h4>
          {loading
            ? "Analyzing resume..."
            : fileName
              ? fileName
              : "Upload your resume"}
        </h4>

        <p>PDF resume only</p>

        <button
          type="button"
          className="upload-button"
          disabled={loading}
          onClick={(event) => {
            event.stopPropagation();

            fileInputRef.current?.click();
          }}
        >
          {fileName ? "Change File" : "Choose File"}
        </button>
      </div>

      {/* ================= ERROR ================= */}
      {error && <p className="error-message">{error}</p>}

      {/* ================= ANALYZE BUTTON ================= */}
      <button
        type="button"
        className="analyze-button"
        onClick={handleAnalyze}
        disabled={!file || loading}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {/* ================= LOADING MESSAGE ================= */}
      {loading && (
        <p className="loading-text">
          Reading PDF and asking Llama 3.2 to analyze it...
        </p>
      )}

      {/* ================= ANALYSIS RESULT ================= */}
      {analysis && (
        <div className="result-block">
          {/* Skills */}
          <h4>Skills</h4>

          <TagList items={analysis.skills || []} />

          {/* Experience */}
          <h4>Experience</h4>

          <p>{analysis.experience || "Not specified."}</p>

          {/* Technologies */}
          <h4>Technologies</h4>

          <TagList items={analysis.technologies || []} />

          {/* Projects */}
          <h4>Projects</h4>

          <TagList
            items={analysis.projects || []}
            emptyText="No projects detected."
          />

          {/* Strengths */}
          <h4>Strengths</h4>

          <TagList items={analysis.strengths || []} />

          {/* Improvements */}
          <h4>Areas to Improve</h4>

          <TagList items={analysis.improvements || []} />
        </div>
      )}
    </div>
  );
}
