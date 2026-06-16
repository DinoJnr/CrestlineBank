import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CrestlineAdminLayout from "./Components/CrestlineAdminLayout";
import CrestlineDashboard from "./Components/CrestlineDashboard";
import CrestlinePersonnelHub from "./Components/CrestlinePersonnelHub";
import CrestlineCustomerTable from "./Components/CrestlineCustomerTable";
import CrestlineCustomerView from "./Components/CrestlineCustomerView";
import CrestlineStaffDirectory from "./Components/CrestlineStaffDirectory";
import CrestlineStaffOnboarding from "./Components/CrestlineStaffOnboarding";
import CrestlineStaffDetailView from "./Components/CrestlineStaffDetailView";
import CrestlineStaffPermissionEdit from "./Components/CrestlineStaffPermissionEdit";
import CrestlineStaffEditView from "./Components/CrestlineStaffEditView";
import CrestlineAdminStaff from "./Components/CrestlineAdminStaff";
import CrestlineInspectAdminStaff from "./Components/CrestlineInspectAdminStaff";
import CrestlineModifyAdminStaff from "./Components/CrestlineModifyAdminStaff";
import CrestlineAdminLogin from "./Components/CrestlineAdminLogin";
import CrestlineLiquidity from "./Components/CrestlineLiquidity";
import CrestlineSecOps from "./Components/CrestlineSecOps";
import CrestlineFeesAndApi from "./Components/CrestlineFeesAndApi";
import CrestlineSettings from "./Components/CrestlineSettings";
import CrestlineAdminProfile from "./Components/CrestlineAdminProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CrestlineAdminLogin />} />

        <Route path="/admin/dashboard" element={<CrestlineAdminLayout><CrestlineDashboard /></CrestlineAdminLayout>} />
        <Route path="/admin/personnel" element={<CrestlineAdminLayout><CrestlinePersonnelHub /></CrestlineAdminLayout>} />
        
        <Route path="/admin/personnel/users" element={<CrestlineAdminLayout><CrestlineCustomerTable /></CrestlineAdminLayout>} />
        <Route path="/admin/personnel/users/:id" element={<CrestlineAdminLayout><CrestlineCustomerView /></CrestlineAdminLayout>} />
        
        <Route path="/admin/personnel/staffs" element={<CrestlineAdminLayout><CrestlineStaffDirectory /></CrestlineAdminLayout>} />
        <Route path="/admin/personnel/onboarding" element={<CrestlineAdminLayout><CrestlineStaffOnboarding /></CrestlineAdminLayout>} />
        
        <Route path="/admin/personnel/staffs/:id" element={<CrestlineAdminLayout><CrestlineStaffDetailView /></CrestlineAdminLayout>} />
        
        <Route path="/admin/personnel/staffs/:id/edit" element={<CrestlineAdminLayout><CrestlineStaffEditView /></CrestlineAdminLayout>} />
        
        <Route path="/admin/personnel/staffs/:id/manage" element={<CrestlineAdminLayout><CrestlineStaffPermissionEdit /></CrestlineAdminLayout>} />
        
        <Route path="/admin/personnel/admin" element={<CrestlineAdminLayout><CrestlineAdminStaff /></CrestlineAdminLayout>} />
        <Route path="/admin/personnel/insecption/:id" element={<CrestlineAdminLayout><CrestlineInspectAdminStaff /></CrestlineAdminLayout>} />
        <Route path="/admin/personnel/modify/:id" element={<CrestlineAdminLayout><CrestlineModifyAdminStaff /></CrestlineAdminLayout>} />
        
        <Route path="/admin/liquidity" element={<CrestlineAdminLayout><CrestlineLiquidity /></CrestlineAdminLayout>} />
        <Route path="/admin/sec-ops" element={<CrestlineAdminLayout><CrestlineSecOps /></CrestlineAdminLayout>} />
        <Route path="/admin/fees-api" element={<CrestlineAdminLayout><CrestlineFeesAndApi /></CrestlineAdminLayout>} />
        <Route path="/admin/settings" element={<CrestlineAdminLayout><CrestlineSettings /></CrestlineAdminLayout>} />
        <Route path="/admin/profile" element={<CrestlineAdminLayout><CrestlineAdminProfile /></CrestlineAdminLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;