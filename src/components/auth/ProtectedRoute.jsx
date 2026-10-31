import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-canvas text-slate-500">กำลังตรวจสอบบัญชี...</div>;
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (profile && !profile.is_active) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas p-6">
        <div className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-card">
          <h1 className="text-2xl font-black">บัญชีกำลังรออนุมัติ</h1>
          <p className="mt-3 text-slate-500">กรุณาให้เจ้าของระบบเปิดใช้งานบัญชีนี้ในตาราง profiles ของ Supabase</p>
        </div>
      </div>
    );
  }
  return children;
}
