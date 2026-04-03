import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/queue-display.css";

export default function QueueDisplay() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [queue, setQueue] = useState({ serving: null, waiting: [] });
  const [orgName, setOrgName] = useState("Queue Display");
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch org name
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/organizations/")
      .then((r) => r.json())
      .then((orgs) => {
        const org = orgs.find((o) => String(o.id) === String(orgId));
        if (org) setOrgName(org.name);
      })
      .catch(() => {});
  }, [orgId]);

  // Fetch queue (auto-refresh every 5s)
  const fetchQueue = useCallback(() => {
    fetch(`http://127.0.0.1:8000/api/queue/?organization=${orgId}`)
      .then((r) => r.json())
      .then((data) => setQueue(data))
      .catch(() => {});
  }, [orgId]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const formatTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="qd-page">

      {/* Header */}
      <header className="qd-header">
        <div className="qd-header-left">
          <span className="qd-logo">🎫</span>
          <div>
            <h1 className="qd-org-name">{orgName}</h1>
            <p className="qd-sub">Queue Management System</p>
          </div>
        </div>
        <div className="qd-header-center">
          <div className="qd-clock">{time.toLocaleTimeString("en-IN")}</div>
          <div className="qd-date">{time.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
        <div className="qd-header-right">
          <button
            className="qd-btn admin-btn"
            onClick={() => navigate("/admin/login", { state: { orgId, orgName } })}
          >
            🔐 Admin Panel
          </button>
          <button
            className="qd-btn operator-btn"
            onClick={() => navigate(`/operator/${orgId}`, { state: { orgName } })}
          >
            🖥️ Operator Panel
          </button>
        </div>
      </header>

      {/* Main Display */}
      <main className="qd-main">

        {/* Now Serving */}
        <section className="qd-serving-section">
          <div className="qd-serving-label">NOW SERVING</div>
          {queue.serving ? (
            <div className="qd-serving-card">
              <div className="qd-token-number">{queue.serving.token_number}</div>
              <div className="qd-serving-detail">
                <span className="qd-chip service">{queue.serving.service_name || "Service"}</span>
                <span className="qd-chip time">Since {formatTime(queue.serving.served_at)}</span>
              </div>
            </div>
          ) : (
            <div className="qd-serving-card empty">
              <div className="qd-token-number dash">—</div>
              <div className="qd-serving-detail">
                <span className="qd-chip idle">No token currently serving</span>
              </div>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="qd-divider" />

        {/* Waiting Queue */}
        <section className="qd-waiting-section">
          <div className="qd-waiting-header">
            <h2 className="qd-waiting-title">⏳ Waiting Queue</h2>
            <span className="qd-waiting-count">{queue.waiting.length} in queue</span>
          </div>

          {queue.waiting.length === 0 ? (
            <div className="qd-empty-queue">
              <div className="qd-empty-icon">✅</div>
              <p>No tokens waiting</p>
            </div>
          ) : (
            <div className="qd-tokens-grid">
              {queue.waiting.map((t, idx) => (
                <div key={t.id} className={`qd-token-badge ${idx === 0 ? "next" : ""}`}>
                  <span className="qd-badge-pos">#{idx + 1}</span>
                  <span className="qd-badge-token">{t.token_number}</span>
                  <span className="qd-badge-service">{t.service_name || "—"}</span>
                  {idx === 0 && <span className="qd-next-label">NEXT</span>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="qd-footer">
        <p>🔄 Auto-refreshes every 5 seconds &nbsp;|&nbsp; Please wait for your token number to appear on screen</p>
      </footer>
    </div>
  );
}
