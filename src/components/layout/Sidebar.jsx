import { BarChart3, BedDouble, CalendarDays, CreditCard, Home, Users } from "lucide-react";

const menuItems = [
  { label: "หน้าหลัก", icon: Home, active: true },
  { label: "ห้องพัก", icon: BedDouble },
  { label: "ผู้เช่า", icon: Users },
  { label: "การชำระเงิน", icon: CreditCard },
  { label: "การจอง", icon: CalendarDays },
  { label: "แดชบอร์ด", icon: BarChart3 },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <button aria-label="ปิดเมนู" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-7">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gold font-black text-ink">WP</div>
          <div>
            <h1 className="text-lg font-bold">วราพรเพลส</h1>
            <p className="text-xs text-white/50">Waraporn Place</p>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          {menuItems.map(({ label, icon: Icon, active }) => (
            <button key={label} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${active ? "bg-gold font-semibold text-ink" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 p-6 text-xs text-white/40">
          <p>Waraporn Place</p>
          <p>Apartment Management · v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
