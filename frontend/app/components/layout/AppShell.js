import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <main className="dashboard">{children}</main>
      </div>
    </div>
  );
}
