import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../../styles/kiosk.css";

export default function TokenRegistration() {
  const { orgId, serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const orgName = location.state?.orgName || "Organization";
  const serviceName = location.state?.serviceName || "Service";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = () => {
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setError(null);
    setLoading(true);

    fetch("http://127.0.0.1:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
        service: serviceId,
      }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => { throw new Error(JSON.stringify(e)); });
        return res.json();
      })
      .then((data) => {
        setToken(data.token);
        setLoading(false);
        // Automatically redirect to Queue Display page after 3 seconds
        setTimeout(() => {
          navigate(`/display/${data.organization_id}`);
        }, 3000);
      })
      .catch((err) => {
        setError("Failed to generate token. Please try again.");
        setLoading(false);
      });
  };

  if (token) {
    return (
      <div className="kiosk-page kiosk-success">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2 className="success-heading">Token Generated!</h2>
          <div className="token-display">{token}</div>
          <p className="success-meta">
            <strong>{orgName}</strong> &mdash; {serviceName}
          </p>
          <p className="success-instructions">
            Redirecting to Queue Display board...
          </p>
          <button
            className="kiosk-btn primary large"
            onClick={() => navigate(`/display/${orgId}`)}
          >
            📺 Go to Queue Display Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-page">
      <header className="kiosk-header">
        <button
          className="kiosk-back-btn"
          onClick={() =>
            navigate(`/services/${orgId}`, {
              state: { orgName },
            })
          }
        >
          ← Back
        </button>
        <div className="kiosk-logo">🎫</div>
        <h1 className="kiosk-title">Register for Token</h1>
        <p className="kiosk-subtitle">
          {orgName} &nbsp;&mdash;&nbsp; {serviceName}
        </p>
      </header>

      <main className="kiosk-main">
        <div className="reg-form-card">
          <div className="reg-info-row">
            <div className="reg-info-item">
              <span className="reg-info-label">Organization</span>
              <span className="reg-info-value">{orgName}</span>
            </div>
            <div className="reg-info-item">
              <span className="reg-info-label">Service</span>
              <span className="reg-info-value">{serviceName}</span>
            </div>
          </div>

          {error && <p className="kiosk-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="custName">👤 Full Name</label>
            <input
              id="custName"
              type="text"
              className="kiosk-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="custPhone">📱 Phone Number</label>
            <input
              id="custPhone"
              type="tel"
              className="kiosk-input"
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/, ""))}
            />
          </div>

          <button
            className="kiosk-btn primary large"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating…" : "🎟️ Generate Token"}
          </button>
        </div>
      </main>

      <footer className="kiosk-footer">
        <p>Please have your details ready &nbsp;|&nbsp; {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}
