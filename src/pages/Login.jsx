import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Building2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { user, signIn, signUp, configured } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const allowSignup = import.meta.env.VITE_ALLOW_SIGNUP !== "false";
  const destination = location.state?.from?.pathname || "/";

  if (user) return <Navigate to={destination} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signup") {
        const data = await signUp(email, password, fullName);
        if (!data.session) setMessage("สมัครสำเร็จ กรุณาตรวจอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ");
      } else {
        await signIn(email, password);
      }
    } catch (submitError) {
      setError(submitError.message || "ไม่สามารถดำเนินการได้");
    } finally {
      setSubmitting(false);
    }
  }

  if (!configured) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink p-6">
        <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
          <h1 className="text-2xl font-black">ตั้งค่า Supabase ก่อนใช้งาน</h1>
          <p className="mt-3 text-slate-500">คัดลอกไฟล์ <code>.env.example</code> เป็น <code>.env.local</code> แล้วใส่ Project URL และ Publishable key</p>
          <pre className="mt-5 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-emerald-300">{`VITE_SUPABASE_URL=https://...supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=...`}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      <section className="hidden bg-ink p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold font-black text-ink">WP</div><div><h1 className="text-xl font-bold">วราพรเพลส</h1><p className="text-sm text-white/50">Waraporn Place</p></div></div>
        <div><Building2 className="mb-6 text-gold" size={58} /><h2 className="max-w-lg text-5xl font-black leading-tight">จัดการหอพัก<br />ครบจบในที่เดียว</h2><p className="mt-5 max-w-md text-white/55">ห้องพัก ผู้เช่า การจอง และการชำระเงิน พร้อมระบบรักษาความปลอดภัยด้วย Supabase</p></div>
        <p className="text-xs text-white/35">Waraporn Place · Apartment Management</p>
      </section>

      <section className="grid place-items-center p-6 md:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card md:p-10">
          <div className="mb-8 lg:hidden"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink font-black text-gold">WP</div></div>
          <h2 className="text-3xl font-black">{mode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}</h2>
          <p className="mt-2 text-sm text-slate-500">{mode === "login" ? "เข้าสู่ระบบจัดการวราพรเพลส" : "บัญชีใหม่อาจต้องรอเจ้าของระบบอนุมัติ"}</p>
          <div className="mt-8 space-y-4">
            {mode === "signup" && <label className="block"><span className="mb-2 block text-sm font-semibold">ชื่อผู้ใช้</span><input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" /></label>}
            <label className="block"><span className="mb-2 block text-sm font-semibold">อีเมล</span><div className="flex items-center rounded-xl border border-slate-200 px-4 focus-within:border-blue-500"><Mail size={18} className="text-slate-400" /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full px-3 py-3 outline-none" /></div></label>
            <label className="block"><span className="mb-2 block text-sm font-semibold">รหัสผ่าน</span><div className="flex items-center rounded-xl border border-slate-200 px-4 focus-within:border-blue-500"><LockKeyhole size={18} className="text-slate-400" /><input required minLength={8} type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-3 py-3 outline-none" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
          </div>
          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          <button disabled={submitting} className="mt-6 w-full rounded-xl bg-ink px-5 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">{submitting ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</button>
          {allowSignup && <button type="button" onClick={() => { setMode((value) => value === "login" ? "signup" : "login"); setError(""); setMessage(""); }} className="mt-5 w-full text-sm font-semibold text-blue-600">{mode === "login" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}</button>}
        </form>
      </section>
    </div>
  );
}
