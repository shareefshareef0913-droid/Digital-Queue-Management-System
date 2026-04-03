import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const orgId = location.state?.orgId;
  const orgName = location.state?.orgName;

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!form.username || !form.password) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    setLoading(true);

    fetch("http://127.0.0.1:8000/api/admin-login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((e) => { throw new Error(e.error || "Login failed"); });
        return res.json();
      })
      .then((data) => {
        // Store admin session in sessionStorage
        sessionStorage.setItem("admin_user", data.username);
        navigate("/admin/dashboard", { state: { orgId, orgName } });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="admin-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">🔐</div>
        <h1 className="admin-login-title">Admin Login</h1>
        <p className="admin-login-sub">Queue Management System — Staff Access</p>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className="admin-input"
            placeholder="Enter admin username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="admin-input"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button className="admin-btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? "Verifying…" : "Login to Dashboard"}
        </button>

        <button
          className="admin-btn-ghost"
          onClick={() => navigate(orgId ? `/display/${orgId}` : "/")}
        >
          ← Back to Queue Display
        </button>
      </div>
    </div>
  );
}
