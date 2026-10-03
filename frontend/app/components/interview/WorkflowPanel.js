"use client";

import { useState } from "react";

export default function WorkflowPanel({ resumeText, jobDescription }) {
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      number: "01",
      title: "Analyze Job Requirements",
      description:
        "Extract important skills, responsibilities and requirements.",
    },
    {
      number: "02",
      title: "Identify Skill Gaps",
      description: "Compare your resume against the target role.",
    },
    {
      number: "03",
      title: "Generate Interview Questions",
      description: "Create technical and role-specific questions.",
    },
    {
      number: "04",
      title: "Create Learning Plan",
      description: "Generate a personalized preparation roadmap.",
    },
  ];

  const startWorkflow = async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);
  };

  return (
    <div className="workflow">
      <div className="workflow-list">
        {steps.map((step) => (
          <div className="workflow-step" key={step.number}>
            <div className="workflow-number">{step.number}</div>

            <div>
              <h4>{step.title}</h4>

              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="primary-button workflow-button"
        onClick={startWorkflow}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Interview Plan →"}
      </button>
    </div>
  );
}
