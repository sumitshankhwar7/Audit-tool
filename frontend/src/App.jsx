import React, { useContext } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import ScoringRules from "./pages/admin/ScoringRules";
import Analytics from "./pages/admin/Analytics";
import AllReports from "./pages/admin/AllReports";
import TelecallerDashboard from "./pages/telecaller/TelecallerDashboard";
import SalesDashboard from "./pages/sales/SalesDashboard";
import Leads from "./pages/telecaller/Leads";
import CreateLead from "./pages/telecaller/CreateLead";
import LeadDetails from "./pages/sales/LeadDetails";
import RoleBasedRedirect from "./components/auth/RoleBasedRedirect";
import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={<RoleBasedRedirect />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scoring-rules"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ScoringRules />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/all-reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AllReports />
            </ProtectedRoute>
          }
        />

        {/* Telecaller Routes */}
        <Route
          path="/telecaller/dashboard"
          element={
            <ProtectedRoute allowedRoles={["telecaller"]}>
              <TelecallerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedRoute allowedRoles={["telecaller", "admin"]}>
              <Leads />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-lead"
          element={
            <ProtectedRoute allowedRoles={["telecaller", "admin"]}>
              <CreateLead />
            </ProtectedRoute>
          }
        />

        {/* Sales Routes */}
        <Route
          path="/sales/dashboard"
          element={
            <ProtectedRoute allowedRoles={["sales", "user"]}>
              <SalesDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shared Routes */}
        <Route
          path="/lead/:id"
          element={
            <ProtectedRoute>
              <LeadDetails />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
