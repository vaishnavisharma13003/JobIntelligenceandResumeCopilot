"use client";

import { useState } from "react";
import { apiFetchJSON } from "../../lib/api";

export default function JobAnalyzer({ onJobDescriptionChange }) {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  async function handleAnalyze() {
    if (!jobDescription.trim()) {
      setError("Paste a job description first.");
      return;
    }

    setError("");
    setLoading(true);
    setAnalysis(null);
    setAnalyzed(false);

    try {
      const data = await apiFetchJSON("/analyze-job", {
        job_description: jobDescription,
      });

      console.log("Job analysis response:", data);

      setAnalysis(data);
      setAnalyzed(true);

      onJobDescriptionChange?.(jobDescription);
    } catch (err) {
      console.error("Job analysis failed:", err);

      setError(err?.message || "Failed to analyze job description.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    setJobDescription(event.target.value);
    setAnalysis(null);
    setAnalyzed(false);
    setError("");
  }

  // -----------------------------------
  // Render backend arrays
  // -----------------------------------

  function renderList(items) {
    if (!items || items.length === 0) {
      return <p className="muted-text">Not specified.</p>;
    }

    if (!Array.isArray(items)) {
      return <p>{String(items)}</p>;
    }

    return (
      <div className="tag-list">
        {items.map((item, index) => (
          <span className="tag" key={index}>
            {typeof item === "string" ? item : JSON.stringify(item)}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="input-card">
      {/* ================= HEADER ================= */}

      <div className="card-header">
        <div>
          <span className="step">02</span>

          <div>
            <h3>Target Job</h3>

            <p>Paste the job description you want to target</p>
          </div>
        </div>

        {analyzed && <span className="success-badge">✓ Analyzed</span>}
      </div>

      {/* ================= JOB DESCRIPTION ================= */}

      <textarea
        className="job-textarea"
        value={jobDescription}
        onChange={handleChange}
        placeholder="Paste the complete job description here..."
        rows={8}
      />

      {/* ================= ACTIONS ================= */}

      <div className="job-actions">
        <span>{jobDescription.length} characters</span>

        <button
          type="button"
          className="primary-button"
          onClick={handleAnalyze}
          disabled={!jobDescription.trim() || loading}
        >
          {loading ? "Analyzing..." : "Analyze Job →"}
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {error && <div className="error-message">{error}</div>}

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="analysis-loading">
          <p>AI is analyzing the job description...</p>

          <small>Please wait while the backend processes the job.</small>
        </div>
      )}

      {/* ================= BACKEND RESPONSE ================= */}

      {analysis && !loading && (
        <div className="analysis-result">
          <div className="analysis-result-header">
            <h4>Job Analysis</h4>

            <span className="success-badge">✓ Completed</span>
          </div>

          {/* REQUIRED SKILLS */}

          <div className="analysis-section">
            <h5>Required Skills</h5>

            {renderList(analysis.required_skills)}
          </div>

          {/* PREFERRED SKILLS */}

          <div className="analysis-section">
            <h5>Preferred Skills</h5>

            {renderList(analysis.preferred_skills)}
          </div>

          {/* EXPERIENCE */}

          <div className="analysis-section">
            <h5>Experience Required</h5>

            <p>{analysis.experience_requirements || "Not specified."}</p>
          </div>

          {/* FRONTEND */}

          <div className="analysis-section">
            <h5>Frontend Technologies</h5>

            {renderList(analysis.frontend_technologies)}
          </div>

          {/* BACKEND */}

          <div className="analysis-section">
            <h5>Backend Technologies</h5>

            {renderList(analysis.backend_technologies)}
          </div>

          {/* AI / GENAI */}

          <div className="analysis-section">
            <h5>AI / GenAI Technologies</h5>

            {renderList(analysis.ai_genai_technologies)}
          </div>

          {/* DATABASES */}

          <div className="analysis-section">
            <h5>Databases</h5>

            {renderList(analysis.databases)}
          </div>

          {/* OTHER REQUIREMENTS */}

          <div className="analysis-section">
            <h5>Other Requirements</h5>

            {renderList(analysis.other_requirements)}
          </div>

          {/* ================= RAW RESPONSE ================= */}

          <details className="raw-response">
            <summary>View Backend Response</summary>

            <pre>{JSON.stringify(analysis, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
