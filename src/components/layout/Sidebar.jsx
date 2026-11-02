import { BarChart3, BedDouble, CalendarDays, CreditCard, Home, LogOut, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const items = [
  { label: "หน้าหลัก", icon: Home, to: "/" }, { label: "ห้องพัก", icon: BedDouble, to: "/rooms" },
  { label: "ผู้เช่า", icon: Users, to: "/tenants" }, { label: "การชำระเงิน", icon: CreditCard, to: "/billing" },
  { label: "การจอง", icon: CalendarDays, to: "/bookings" }, { label: "แดชบอร์ด", icon: BarChart3, to: "/dashboard" },
];

export default function Sidebar({ open, onClose }) {
  const { signOut } = useAuth();
  return <>{open && <button aria-label="ปิดเมนู" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}<aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}><NavLink to="/" className="flex items-center gap-3 border-b border-white/10 px-6 py-7"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gold font-black text-ink">WP</div><div><h1 className="text-lg font-bold">วราพรเพลส</h1><p className="text-xs text-white/50">Waraporn Place</p></div></NavLink><nav className="space-y-2 p-4">{items.map(({ label, icon: Icon, to }) => <NavLink key={to} to={to} end={to === "/"} onClick={onClose} className={({ isActive }) => `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive ? "bg-gold font-semibold text-ink" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon size={19} />{label}</NavLink>)}</nav><div className="mt-auto border-t border-white/10 p-4"><button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 hover:bg-white/10 hover:text-white"><LogOut size={18} />ออกจากระบบ</button><p className="px-4 pt-3 text-xs text-white/30">Apartment Management · v1.0</p></div></aside></>;
}
