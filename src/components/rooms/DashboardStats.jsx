import { ArrowDownRight, ArrowUpRight, BedDouble, CalendarClock, DoorOpen, Users, Wrench } from "lucide-react";

const statConfig = [
  { key: "rooms", label: "ห้องทั้งหมด", icon: BedDouble, color: "bg-amber-50 text-amber-600" },
  { key: "tenants", label: "ผู้เช่าปัจจุบัน", icon: Users, color: "bg-blue-50 text-blue-600" },
  { key: "vacant", label: "ห้องว่าง", icon: DoorOpen, color: "bg-emerald-50 text-emerald-600" },
  { key: "maintenance", label: "อยู่ระหว่างซ่อม", icon: Wrench, color: "bg-slate-100 text-slate-500" },
  { key: "bookings", label: "ผู้รอเข้าพัก", icon: CalendarClock, color: "bg-fuchsia-50 text-fuchsia-600" },
];

export default function DashboardStats({ stats, changes = {} }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {statConfig.map(({ key, label, icon: Icon, color }) => {
        const change = changes[key];
        const increased = change > 0;
        return (
          <article key={key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={20} /></div>
              <span className="text-xs text-slate-400">เดือนนี้</span>
            </div>
            <strong className="mt-5 block text-3xl text-slate-900">{stats[key] ?? 0}</strong>
            <span className="text-sm text-slate-500">{label}</span>
            <div className="mt-4 flex min-h-5 items-center gap-1.5 border-t border-slate-100 pt-3 text-xs">
              {change ? (
                <><span className={`flex items-center gap-0.5 font-semibold ${increased ? "text-emerald-600" : "text-rose-600"}`}>{increased ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(change)}</span><span className="text-slate-400">จากเดือนก่อน</span></>
              ) : <span className="text-slate-400">ไม่มีการเปลี่ยนแปลงจากเดือนก่อน</span>}
            </div>
          </article>
        );
      })}
    </section>
  );
}
