import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerPage from "./pages/CustomerPage";
import QueueDisplay from "./pages/kiosk/QueueDisplay";
import OperatorPanel from "./pages/kiosk/OperatorPanel";
import OrganizationSelection from "./pages/kiosk/OrganizationSelection";
import ServiceSelection from "./pages/kiosk/ServiceSelection";
import TokenRegistration from "./pages/kiosk/TokenRegistration";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Navbar from "./components/Navbar";
import "./styles/main.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Kiosk flow (Public) */}
        <Route path="/" element={<OrganizationSelection />} />
        <Route path="/services/:orgId" element={<ServiceSelection />} />
        <Route path="/register/:orgId/:serviceId" element={<TokenRegistration />} />

        {/* Display & Operations (Public/Staff) */}
        <Route path="/display/:orgId" element={<QueueDisplay />} />
        <Route path="/operator/:orgId" element={<OperatorPanel />} />

        {/* Admin (Protected) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Legacy routes */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<CustomerPage />} />
                <Route path="/display" element={<QueueDisplay />} />
                <Route path="/panel" element={<OperatorPanel />} />
              </Routes>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;