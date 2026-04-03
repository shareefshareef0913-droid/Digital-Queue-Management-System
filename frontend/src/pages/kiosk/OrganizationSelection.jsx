import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/kiosk.css";

const ORG_ICONS = {
  "City Hospital": "🏥",
  "State Bank": "🏦",
  "Municipal Office": "🏛️",
  "Telecom Center": "📡",
};

export default function OrganizationSelection() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/organizations/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch organizations");
        return res.json();
      })
      .then((data) => {
        setOrganizations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="kiosk-page">
      <header className="kiosk-header">
        <div className="kiosk-logo">🎫</div>
        <h1 className="kiosk-title">Queue Management System</h1>
        <p className="kiosk-subtitle">Select your organization to get started</p>
      </header>

      <main className="kiosk-main">
        {loading && (
          <div className="kiosk-loader">
            <div className="spinner"></div>
            <p>Loading organizations…</p>
          </div>
        )}
        {error && <p className="kiosk-error">⚠️ {error}</p>}
        {!loading && !error && (
          <div className="org-grid">
            {organizations.map((org) => (
              <button
                key={org.id}
                className="org-card"
                onClick={() =>
                  navigate(`/services/${org.id}`, {
                    state: { orgName: org.name },
                  })
                }
              >
                <span className="org-icon">
                  {ORG_ICONS[org.name] || "🏢"}
                </span>
                <span className="org-name">{org.name}</span>
                <span className="org-arrow">→</span>
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="kiosk-footer">
        <p>Touch a tile to continue &nbsp;|&nbsp; {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}
