"use client";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "⌂",
  },
  {
    id: "resume",
    label: "Resume Analyzer",
    icon: "📄",
  },
  {
    id: "job",
    label: "Job Analyzer",
    icon: "💼",
  },
  {
    id: "match",
    label: "Resume Match",
    icon: "🎯",
  },
  {
    id: "chat",
    label: "Resume Chat",
    icon: "💬",
  },
  {
    id: "workflow",
    label: "AI Workflow",
    icon: "🧠",
  },
];

export default function Sidebar({ activePage, onPageChange }) {
  return (
    <aside className="sidebar">
      {/* Logo */}

      <div className="sidebar-logo">
        <div className="logo-container">
          <div className="logo">✦</div>
        </div>

        <div className="logo-content">
          <h2>AI Copilot</h2>

          <span>Resume Intelligence</span>
        </div>
      </div>

      {/* Menu */}

      <div className="sidebar-menu">
        <p className="menu-heading">WORKSPACE</p>

        {menuItems.map((item) => {
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => onPageChange(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>

              <span className="sidebar-label">{item.label}</span>

              {isActive && <span className="active-indicator">→</span>}
            </button>
          );
        })}
      </div>

      {/* AI Status */}

      <div className="sidebar-footer">
        <div className="ai-status-card">
          <div className="status-icon">✦</div>

          <div className="status-content">
            <div className="status-title">
              <span className="green-dot"></span>

              <strong>AI Engine</strong>
            </div>

            <small>Ollama · Llama 3.2</small>
          </div>

          <span className="status-online">ON</span>
        </div>
      </div>
    </aside>
  );
}
