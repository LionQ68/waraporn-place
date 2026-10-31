import { BedDouble, CalendarClock, DoorOpen, Users, Wrench } from "lucide-react";

const statConfig = [
  { key: "rooms", label: "ห้องทั้งหมด", icon: BedDouble, color: "bg-amber-50 text-amber-600" },
  { key: "tenants", label: "ผู้เช่าปัจจุบัน", icon: Users, color: "bg-blue-50 text-blue-600" },
  { key: "vacant", label: "ห้องว่าง", icon: DoorOpen, color: "bg-emerald-50 text-emerald-600" },
  { key: "maintenance", label: "อยู่ระหว่างซ่อม", icon: Wrench, color: "bg-slate-100 text-slate-500" },
  { key: "bookings", label: "ผู้รอเข้าพัก", icon: CalendarClock, color: "bg-fuchsia-50 text-fuchsia-600" },
];

export default function DashboardStats({ stats }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {statConfig.map(({ key, label, icon: Icon, color }) => (
        <article key={key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <div className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={20} /></div>
          <strong className="mt-5 block text-3xl text-slate-900">{stats[key]}</strong>
          <span className="text-sm text-slate-500">{label}</span>
        </article>
      ))}
    </section>
  );
}
