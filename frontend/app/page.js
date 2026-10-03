"use client";

import { useState } from "react";

import AppShell from "./components/layout/AppShell";

import HeroSection from "./components/dashboard/HeroSection";
import EmptyState from "./components/dashboard/EmptyState";

import ResumeUpload from "./components/resume/ResumeUpload";
import ResumeChat from "./components/resume/ResumeChat";

import JobAnalyzer from "./components/job/JobAnalyzer";

import MatchResult from "./components/analysis/MatchResult";

import WorkflowPanel from "./components/interview/WorkflowPanel";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const hasAnalysis = resumeText.length > 0 && jobDescription.length > 0;

  return (
    <AppShell>
      <HeroSection />

      {/* Resume + Job Input */}
      <section className="workspace-grid">
        <ResumeUpload onResumeAnalyzed={setResumeText} />

        <JobAnalyzer onJobDescriptionChange={setJobDescription} />
      </section>

      {/* Analysis */}
      {hasAnalysis ? (
        <>
          <section className="analysis-section">
            <MatchResult
              resumeText={resumeText}
              jobDescription={jobDescription}
            />
          </section>

          {/* AI Tools */}
          <section className="two-column-section">
            <div className="feature-card">
              <div className="feature-header">
                <div className="feature-icon">◌</div>

                <div>
                  <h3>AI Resume Assistant</h3>

                  <p>Ask questions about your resume and target role.</p>
                </div>
              </div>

              <ResumeChat />
            </div>

            <div className="feature-card">
              <div className="feature-header">
                <div className="feature-icon">◇</div>

                <div>
                  <h3>Interview Intelligence</h3>

                  <p>Generate a personalized preparation roadmap.</p>
                </div>
              </div>

              <WorkflowPanel
                resumeText={resumeText}
                jobDescription={jobDescription}
              />
            </div>
          </section>
        </>
      ) : (
        <EmptyState />
      )}
    </AppShell>
  );
}
