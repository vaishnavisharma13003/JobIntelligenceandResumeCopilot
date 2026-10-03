"use client";

export default function MatchResult({ resumeText, jobDescription }) {
  const matchScore = 82;

  const skills = [
    {
      name: "React",
      score: 95,
      type: "match",
    },
    {
      name: "Next.js",
      score: 90,
      type: "match",
    },
    {
      name: "JavaScript",
      score: 94,
      type: "match",
    },
    {
      name: "Node.js",
      score: 78,
      type: "match",
    },
    {
      name: "TypeScript",
      score: 45,
      type: "gap",
    },
    {
      name: "PostgreSQL",
      score: 35,
      type: "gap",
    },
  ];

  return (
    <div className="match-dashboard">
      <div className="section-heading">
        <div>
          <span className="eyebrow">AI ANALYSIS</span>

          <h2>Resume Match Intelligence</h2>

          <p>
            AI-generated compatibility analysis between your resume and the
            target role.
          </p>
        </div>

        <button className="secondary-button">↻ Re-analyze</button>
      </div>

      <div className="match-overview">
        <div className="score-card">
          <div className="score-circle">
            <strong>{matchScore}%</strong>
            <span>Match</span>
          </div>

          <div>
            <h3>Strong alignment</h3>

            <p>
              Your experience matches many of the core requirements for this
              role.
            </p>
          </div>
        </div>

        <div className="metric">
          <span>Skills</span>
          <strong>91%</strong>
        </div>

        <div className="metric">
          <span>Experience</span>
          <strong>78%</strong>
        </div>

        <div className="metric">
          <span>ATS</span>
          <strong>85%</strong>
        </div>
      </div>

      <div className="skills-section">
        <div className="skills-column">
          <h3>Skill Compatibility</h3>

          {skills.map((skill) => (
            <div className="skill-row" key={skill.name}>
              <div className="skill-name">
                <span>{skill.name}</span>
                <span>{skill.score}%</span>
              </div>

              <div className="progress-track">
                <div
                  className={
                    skill.type === "gap" ? "progress-fill gap" : "progress-fill"
                  }
                  style={{
                    width: `${skill.score}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="recommendation-box">
          <span className="eyebrow">AI RECOMMENDATION</span>

          <h3>Focus on TypeScript & PostgreSQL</h3>

          <p>
            These skills appear in the target role but have weaker
            representation in your resume. Strengthening them could improve your
            profile for similar full-stack positions.
          </p>

          <button className="secondary-button">View Learning Plan →</button>
        </div>
      </div>
    </div>
  );
}
