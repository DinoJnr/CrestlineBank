import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import CrestlineStaffLogin from "./Component/CrestlineStaffLogin";
import CrestlineStaffLayout from "./Component/CrestlineStaffLayout";
import CrestlineStaffDashboard from "./Component/CrestlineStaffDashboard";
import CrestlineUserManagement from "./Component/CrestlineUserManagement";
import CrestlineInquiriesManagement from "./Component/CrestlineInquiriesManagement"

// ── 1. PROTECTED ROUTE GUARDIAN COMPONENT ──────────────────────────
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("staffcrestline_token");
  
  // If no token exists, boot them out to the login page immediately
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  // Otherwise, render the requested component safely
  return children;
};


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Route (Login Screen) */}
          <Route path="/" element={<CrestlineStaffLogin />} />

          
          <Route path="/staff/navbar" element={<ProtectedRoute><CrestlineStaffLayout /></ProtectedRoute>} />
          <Route path="/staff/dashboard" element={<ProtectedRoute><CrestlineStaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/user-management" element={<ProtectedRoute><CrestlineUserManagement /></ProtectedRoute>} />
         <Route path="/staff/inquries" element={<ProtectedRoute><CrestlineInquiriesManagement></CrestlineInquiriesManagement></ProtectedRoute>}></Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;