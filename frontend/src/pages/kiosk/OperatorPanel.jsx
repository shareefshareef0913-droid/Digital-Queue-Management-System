import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../../styles/operator.css";

export default function OperatorPanel() {
  const { orgId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const orgName = location.state?.orgName || "Organization";

  const [queue, setQueue] = useState({ serving: null, waiting: [] });
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState(""); // "success" | "error" | "info"
  const [loading, setLoading] = useState(false);

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

  const showMsg = (text, type = "info") => {
    setMessage(text);
    setMsgType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const callNext = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/call-next/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organization: orgId }),
    })
      .then((res) => res.json().then((d) => ({ ok: res.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok) {
          showMsg(`✅ Now calling: ${data.token}`, "success");
        } else {
          showMsg(data.message || "No tokens in queue.", "error");
        }
        fetchQueue();
        setLoading(false);
      })
      .catch(() => {
        showMsg("Network error. Please retry.", "error");
        setLoading(false);
      });
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="op-page">
      <header className="op-header">
        <button className="op-back-btn" onClick={() => navigate(`/display/${orgId}`, { state: { orgName } })}>
          ← Back to Display
        </button>
        <div className="op-header-center">
          <span className="op-logo">🖥️</span>
          <div>
            <h1 className="op-title">Operator Panel</h1>
            <p className="op-org">{orgName}</p>
          </div>
        </div>
        <div className="op-header-right" />
      </header>

      <main className="op-main">
        {/* Message Banner */}
        {message && (
          <div className={`op-message ${msgType}`}>{message}</div>
        )}

        {/* Now Serving */}
        <div className="op-serving-card">
          <p className="op-card-label">NOW SERVING</p>
          {queue.serving ? (
            <>
              <div className="op-token-big">{queue.serving.token_number}</div>
              <p className="op-token-meta">
                {queue.serving.service_name || "Service"} &nbsp; • &nbsp; Since {formatTime(queue.serving.served_at)}
              </p>
            </>
          ) : (
            <div className="op-token-big idle">—</div>
          )}
        </div>

        {/* Call Next */}
        <button
          className="op-call-btn"
          onClick={callNext}
          disabled={loading}
        >
          {loading ? "Processing…" : "📢 Call Next Token"}
        </button>

        {/* Queue Status */}
        <div className="op-queue-panel">
          <div className="op-queue-header">
            <h2>Waiting Queue</h2>
            <span className="op-count">{queue.waiting.length} waiting</span>
          </div>

          {queue.waiting.length === 0 ? (
            <div className="op-empty">
              <span className="op-empty-icon">✅</span>
              <p>No tokens in queue.</p>
            </div>
          ) : (
            <ul className="op-queue-list">
              {queue.waiting.map((t, idx) => (
                <li key={t.id} className={`op-queue-item ${idx === 0 ? "next-up" : ""}`}>
                  <div className="op-item-left">
                    <span className="op-item-pos">#{idx + 1}</span>
                    <span className="op-item-token">{t.token_number}</span>
                  </div>
                  <div className="op-item-right">
                    <span className="op-item-service">{t.service_name || "Service"}</span>
                    <span className="op-item-time">{formatTime(t.created_at)}</span>
                  </div>
                  {idx === 0 && <span className="op-next-badge">NEXT</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
