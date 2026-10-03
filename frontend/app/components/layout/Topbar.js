export default function Topbar() {
  return (
    <header className="topbar">
      <div>
        <span className="breadcrumb">Workspace / Overview</span>
      </div>

      <div className="topbar-actions">
        <div className="system-status">
          <span className="online-dot" />
          Local AI Connected
        </div>

        <button className="icon-button">?</button>

        <div className="profile">
          <div className="avatar">VS</div>

          <div>
            <strong>Career Workspace</strong>
            <span>Developer</span>
          </div>
        </div>
      </div>
    </header>
  );
}
