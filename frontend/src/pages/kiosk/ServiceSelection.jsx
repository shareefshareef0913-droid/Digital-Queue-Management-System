import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../../styles/kiosk.css";

const SVC_ICONS = {
  // Original
  Consultation: "🩺",
  Pharmacy: "💊",
  "Lab Test": "🧪",
  "Account Opening": "📋",
  "Cash Deposit": "💰",
  "Loan Inquiry": "📊",
  "Birth Certificate": "📜",
  "Property Tax": "🏠",
  "Water Bill": "💧",
  "New Connection": "📶",
  Recharge: "⚡",
  "Customer Support": "🎧",
  Support: "🎧",

  // New Hospital
  "Blood Donation": "🩸",
  "X-Ray & Imaging": "🦴",
  "Emergency Room": "🚑",
  Pediatrics: "🧸",

  // New Bank
  "Cheque Deposit": "📝",
  "Credit Card Issues": "💳",
  "Forex Services": "💱",
  "Investment Advisory": "📈",

  // New Municipal
  "Marriage Registration": "💍",
  "Building Plan Approval": "🏗️",
  "Trade License": "🏢",
  "Grievance Redressal": "🗣️",

  // New Telecom
  "SIM Replacement": "📱",
  "Broadband Inquiry": "🌐",
  "Plan Upgrade": "🚀",
  "Porting Services": "🔄",
};

export default function ServiceSelection() {
  const { orgId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const orgName = location.state?.orgName || "Organization";
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/services/?organization=${orgId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [orgId]);

  return (
    <div className="kiosk-page">
      <header className="kiosk-header">
        <button
          className="kiosk-back-btn"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>
        <div className="kiosk-logo">🎫</div>
        <h1 className="kiosk-title">{orgName}</h1>
        <p className="kiosk-subtitle">Select the service you need</p>
      </header>

      <main className="kiosk-main">
        {loading && (
          <div className="kiosk-loader">
            <div className="spinner"></div>
            <p>Loading services…</p>
          </div>
        )}
        {error && <p className="kiosk-error">⚠️ {error}</p>}
        {!loading && !error && (
          <div className="svc-grid">
            {services.map((svc) => (
              <button
                key={svc.id}
                className="svc-card"
                onClick={() =>
                  navigate(`/register/${orgId}/${svc.id}`, {
                    state: {
                      orgName,
                      serviceName: svc.service_name,
                    },
                  })
                }
              >
                <span className="svc-icon">
                  {SVC_ICONS[svc.service_name] || "📋"}
                </span>
                <span className="svc-name">{svc.service_name}</span>
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="kiosk-footer">
        <p>Touch a service to continue &nbsp;|&nbsp; {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}
