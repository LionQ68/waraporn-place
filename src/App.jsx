import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Home from "@/pages/Home";
import ImportData from "@/pages/ImportData";
import Login from "@/pages/Login";
import RoomDetail from "@/pages/RoomDetail";
import RoomsManagement from "@/pages/RoomsManagement";
import TenantsManagement from "@/pages/TenantsManagement";
import BookingsManagement from "@/pages/BookingsManagement";
import BillingOverview from "@/pages/BillingOverview";
import Dashboard from "@/pages/Dashboard";
import InvoicePrint from "@/pages/InvoicePrint";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Register from "@/pages/Register";
import OAuthConsent from "@/pages/OAuthConsent";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<OAuthConsent />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/rooms/:roomId" element={<ProtectedRoute><RoomDetail /></ProtectedRoute>} />
      <Route path="/rooms" element={<ProtectedRoute><RoomsManagement /></ProtectedRoute>} />
      <Route path="/tenants" element={<ProtectedRoute><TenantsManagement /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><BookingsManagement /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><BillingOverview /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/invoices/:id/print" element={<ProtectedRoute><InvoicePrint /></ProtectedRoute>} />
      <Route path="/import" element={<ProtectedRoute><ImportData /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
