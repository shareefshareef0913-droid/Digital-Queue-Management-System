import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/admin.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const orgId = location.state?.orgId;
  const orgName = location.state?.orgName || "All Organizations";

  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const adminUser = sessionStorage.getItem("admin_user");

  useEffect(() => {
    if (!adminUser) {
      navigate("/admin/login");
      return;
    }
    const url = orgId
      ? `http://127.0.0.1:8000/api/admin-tokens/?organization=${orgId}`
      : "http://127.0.0.1:8000/api/admin-tokens/";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setTokens(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orgId, adminUser, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  const filtered = filter === "all" ? tokens : tokens.filter((t) => t.status === filter);

  const statusColor = (s) => {
    if (s === "serving") return "status-serving";
    if (s === "completed") return "status-completed";
    return "status-waiting";
  };

  // Group by organization
  const grouped = filtered.reduce((acc, t) => {
    const key = t.organization_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const formatTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="admin-page dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">🎫</div>
        <h2 className="admin-sidebar-title">QMS Admin</h2>
        <nav className="admin-nav">
          <button className="admin-nav-item active">📋 Token List</button>
        </nav>
        <div className="admin-sidebar-footer">
          <p className="admin-user-label">Logged in as</p>
          <p className="admin-user-name">{adminUser}</p>
          <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">Token Dashboard</h1>
            <p className="admin-page-sub">{orgName} — All token records</p>
          </div>
          <div className="admin-filter-group">
            {["all", "waiting", "serving", "completed"].map((s) => (
              <button
                key={s}
                className={`admin-filter-btn ${filter === s ? "active" : ""}`}
                onClick={() => setFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats-row">
          {["waiting", "serving", "completed"].map((s) => (
            <div key={s} className={`admin-stat-card stat-${s}`}>
              <div className="stat-value">{tokens.filter((t) => t.status === s).length}</div>
              <div className="stat-label">{s.charAt(0).toUpperCase() + s.slice(1)}</div>
            </div>
          ))}
          <div className="admin-stat-card stat-total">
            <div className="stat-value">{tokens.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        {/* Tables grouped by org */}
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <p>Loading tokens…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">No tokens found.</div>
        ) : (
          Object.entries(grouped).map(([org, rows]) => (
            <div key={org} className="admin-table-section">
              <h3 className="admin-org-heading">🏢 {org}</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Token</th>
                      <th>Customer Name</th>
                      <th>Phone</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Generated At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((t, i) => (
                      <tr key={t.id}>
                        <td className="td-num">{i + 1}</td>
                        <td className="td-token">{t.token_number}</td>
                        <td>{t.customer_name}</td>
                        <td>{t.customer_phone}</td>
                        <td>{t.service_name}</td>
                        <td>
                          <span className={`status-badge ${statusColor(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="td-time">{formatTime(t.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
