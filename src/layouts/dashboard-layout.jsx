export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar" />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
