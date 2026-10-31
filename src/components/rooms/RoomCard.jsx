import { BedDouble, MoreHorizontal, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const statusLabels = {
  occupied: { label: "มีผู้เช่า", className: "bg-blue-50 text-blue-600" },
  vacant: { label: "ว่าง", className: "bg-emerald-50 text-emerald-600" },
  booked: { label: "มีการจอง", className: "bg-amber-50 text-amber-600" },
  maintenance: { label: "ไม่พร้อมเช่า", className: "bg-slate-100 text-slate-600" },
};

export default function RoomCard({ room, tenants }) {
  const status = statusLabels[room.status] || statusLabels.vacant;
  const roomTenants = tenants.filter((tenant) => tenant.room_id === room.id && tenant.is_active);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-1">
      <div className="relative grid h-28 place-items-center bg-gradient-to-br from-slate-200 via-slate-100 to-amber-50">
        <BedDouble className="text-slate-400" size={34} />
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{room.room_number}</h3>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label={`เมนูห้อง ${room.room_number}`}><MoreHorizontal size={18} /></button>
        </div>
        <p className="mt-2 text-sm text-slate-500">{room.room_type}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Users size={16} /> {roomTenants.length}/{room.max_occupants || 2} คน
        </div>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">ราคาเช่า</span>
          <p className="font-bold text-slate-900">{formatCurrency(room.rent_price)}<span className="text-xs font-normal text-slate-400"> /เดือน</span></p>
          <p className="mt-2 truncate text-xs text-slate-500">{roomTenants.map((tenant) => tenant.name).join(", ") || "พร้อมให้เช่า"}</p>
        </div>
      </div>
    </article>
  );
}
