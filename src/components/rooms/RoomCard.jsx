import { Building2, MoreHorizontal, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";

const statusLabels = {
  occupied: { label: "มีผู้เช่า", className: "bg-blue-50 text-blue-700 ring-blue-100" },
  vacant: { label: "ว่าง", className: "bg-white text-emerald-700 ring-emerald-200" },
  booked: { label: "มีการจอง", className: "bg-amber-50 text-amber-700 ring-amber-100" },
  maintenance: { label: "ไม่พร้อมเช่า", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export default function RoomCard({ room, tenants, view = "grid" }) {
  const status = statusLabels[room.status] || statusLabels.vacant;
  const roomTenants = tenants.filter((tenant) => tenant.room_id === room.id && tenant.is_active);
  const isVacant = room.status === "vacant";

  return (
    <article className={`group overflow-hidden rounded-2xl border shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-xl ${isVacant ? "border-emerald-200 bg-emerald-50/70" : "border-slate-100 bg-white"} ${view === "list" ? "sm:flex" : ""}`}>
      <div className={`relative overflow-hidden ${view === "list" ? "h-48 sm:h-auto sm:w-64 sm:shrink-0" : "h-44"}`}>
        <Link to={`/rooms/${room.id}`} aria-label={`ดูรายละเอียดห้อง ${room.room_number}`} className="absolute inset-0 z-10" />
        <img src={room.image_url || "/images/room-default.jpg"} alt={`ห้อง ${room.room_number}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ${status.className}`}>{status.label}</span>
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur"><Building2 size={13} /> ชั้น {room.floor || "-"}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between">
          <div><p className="text-xs font-medium uppercase tracking-wider text-slate-400">ห้องพัก</p><Link to={`/rooms/${room.id}`} className="text-xl font-extrabold text-slate-900 hover:text-blue-600">{room.room_number}</Link></div>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-white/80" aria-label={`เมนูห้อง ${room.room_number}`}><MoreHorizontal size={18} /></button>
        </div>
        <p className="mt-2 text-sm text-slate-500">{room.room_type || "ห้องมาตรฐาน"}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Users size={16} /> {roomTenants.length}/{room.max_occupants || 2} คน</div>
        <div className="mt-auto pt-4">
          <div className="border-t border-slate-200/70 pt-4"><span className="text-xs text-slate-400">ราคาเช่า</span><p className="font-bold text-slate-900">{formatCurrency(room.rent_price)}<span className="text-xs font-normal text-slate-400"> /เดือน</span></p></div>
          <p className={`mt-2 truncate rounded-lg px-2.5 py-1.5 text-xs ${isVacant ? "bg-white text-emerald-700 ring-1 ring-emerald-200" : "text-slate-500"}`}>{roomTenants.map((tenant) => tenant.name).join(", ") || "พร้อมให้เช่า"}</p>
        </div>
      </div>
    </article>
  );
}
