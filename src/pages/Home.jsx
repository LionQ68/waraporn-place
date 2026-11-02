import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Database, Grid2X2, List, LogOut, Menu, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import DashboardStats from "@/components/rooms/DashboardStats";
import RoomCard from "@/components/rooms/RoomCard";

const filters = [
  { value: "all", label: "ทั้งหมด" }, { value: "occupied", label: "มีผู้เช่า" },
  { value: "vacant", label: "ว่าง" }, { value: "booked", label: "มีการจอง" },
  { value: "maintenance", label: "ไม่พร้อมเช่า" },
];

export default function Home() {
  const { profile, user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");

  const { data: rooms = [], isLoading } = useQuery({ queryKey: ["rooms"], queryFn: () => base44.entities.Room.list("room_number") });
  const { data: tenants = [] } = useQuery({ queryKey: ["tenants"], queryFn: () => base44.entities.Tenant.list() });
  const { data: bookings = [] } = useQuery({ queryKey: ["bookings"], queryFn: () => base44.entities.Booking.list() });
  const activeTenants = useMemo(() => tenants.filter((tenant) => tenant.is_active), [tenants]);
  const stats = useMemo(() => ({ rooms: rooms.length, tenants: activeTenants.length, vacant: rooms.filter(r => r.status === "vacant").length, maintenance: rooms.filter(r => r.status === "maintenance").length, bookings: bookings.filter(b => b.status !== "cancelled").length }), [rooms, activeTenants, bookings]);

  const filteredRooms = useMemo(() => rooms.filter((room) => {
    const tenantNames = activeTenants.filter(t => t.room_id === room.id).map(t => t.name).join(" ");
    return `${room.room_number} ${tenantNames}`.toLowerCase().includes(search.trim().toLowerCase()) && (statusFilter === "all" || room.status === statusFilter) && (floorFilter === "all" || String(room.floor) === floorFilter);
  }).sort((a, b) => String(a.room_number).localeCompare(String(b.room_number), "th", { numeric: true }) * (sortOrder === "asc" ? 1 : -1)), [rooms, activeTenants, search, statusFilter, floorFilter, sortOrder]);

  const groupedRooms = useMemo(() => Object.entries(filteredRooms.reduce((groups, room) => { const floor = room.floor || "ไม่ระบุ"; (groups[floor] ||= []).push(room); return groups; }, {})).sort(([a], [b]) => Number(b) - Number(a)), [filteredRooms]);
  const floors = useMemo(() => [...new Set(rooms.map(r => r.floor).filter(Boolean))].sort((a, b) => Number(a) - Number(b)), [rooms]);
  const countByStatus = (value) => value === "all" ? rooms.length : rooms.filter(r => r.status === value).length;

  return (
    <div className="min-h-screen bg-canvas text-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl md:px-8">
          <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}><Menu /></button>
          <label className="flex max-w-2xl flex-1 items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-slate-400"><Search size={19} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาห้อง หรือชื่อผู้เช่า..." className="w-full bg-transparent text-sm text-slate-700 outline-none" /></label>
          <button className="rounded-xl p-3 text-slate-500 hover:bg-slate-100"><Bell size={20} /></button>
          <div className="hidden items-center gap-3 sm:flex"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 font-bold text-white">{(profile?.full_name || user?.email || "A").charAt(0).toUpperCase()}</span><span className="max-w-36 truncate text-sm font-semibold">{profile?.full_name || user?.email || "แอดมิน"}</span></div>
          {profile?.role === "owner" && <Link to="/import" title="นำเข้าข้อมูล" className="rounded-xl p-3 text-slate-500 hover:bg-slate-100"><Database size={20} /></Link>}
          <button onClick={signOut} title="ออกจากระบบ" className="rounded-xl p-3 text-slate-500 hover:bg-slate-100"><LogOut size={20} /></button>
        </header>

        <main className="space-y-7 p-4 md:p-8">
          <section className="relative min-h-72 overflow-hidden rounded-3xl bg-slate-900 shadow-card md:min-h-80">
            <img src="/images/waraporn-banner.png" alt="อาคารวราพรเพลส" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/55 to-transparent" />
            <div className="relative z-10 flex min-h-72 max-w-2xl flex-col justify-center p-7 text-white md:min-h-80 md:p-12">
              <div className="mb-5 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-gold text-lg font-black text-ink shadow-lg">WP</div><div><h2 className="text-3xl font-black md:text-4xl">วราพรเพลส</h2><p className="text-sm text-white/70">Waraporn Place · Apartment Living</p></div></div>
              <p className="max-w-lg text-sm leading-7 text-white/80 md:text-base">จัดการหอพักได้ง่าย ครบจบในที่เดียว ตั้งแต่จัดการห้อง ผู้เช่า บิล และการชำระเงิน</p>
            </div>
          </section>

          <DashboardStats stats={stats} />
          <section className="space-y-5">
            <div><h2 className="text-2xl font-extrabold">ห้องพักทั้งหมด</h2><p className="mt-1 text-sm text-slate-500">ดูสถานะและผู้เช่าของแต่ละห้อง แยกตามชั้น</p></div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">{filters.map(filter => <button key={filter.value} onClick={() => setStatusFilter(filter.value)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === filter.value ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>{filter.label} <span className="ml-1 opacity-70">{countByStatus(filter.value)}</span></button>)}</div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap items-center gap-2"><SlidersHorizontal size={18} className="text-slate-400" /><select value={floorFilter} onChange={e => setFloorFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"><option value="all">ชั้นทั้งหมด</option>{floors.map(floor => <option key={floor} value={floor}>ชั้น {floor}</option>)}</select><select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"><option value="asc">เลขห้องน้อย → มาก</option><option value="desc">เลขห้องมาก → น้อย</option></select></div>
                <div className="flex rounded-xl bg-slate-100 p-1"><button onClick={() => setView("grid")} aria-label="มุมมองกริด" className={`rounded-lg p-2 ${view === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}><Grid2X2 size={18} /></button><button onClick={() => setView("list")} aria-label="มุมมองรายการ" className={`rounded-lg p-2 ${view === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}><List size={18} /></button></div>
              </div>
            </div>

            {isLoading ? <p className="py-16 text-center text-slate-400">กำลังโหลดข้อมูล...</p> : groupedRooms.length ? groupedRooms.map(([floor, floorRooms]) => (
              <section key={floor} className="space-y-3"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Floor {floor}</p><h3 className="text-xl font-extrabold">ชั้น {floor}</h3></div><span className="text-sm text-slate-400">{floorRooms.length} ห้อง</span></div><div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid gap-4 xl:grid-cols-2"}>{floorRooms.map(room => <RoomCard key={room.id} room={room} tenants={activeTenants} view={view} />)}</div></section>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">ไม่พบห้องที่ตรงกับการค้นหา</div>}
          </section>
        </main>
      </div>
    </div>
  );
}
