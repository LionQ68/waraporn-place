import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Home from "@/pages/Home";
import ImportData from "@/pages/ImportData";
import Login from "@/pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/import" element={<ProtectedRoute><ImportData /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
