import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Database, Grid2X2, List, LogOut, Menu, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import DashboardStats from "@/components/rooms/DashboardStats";
import RoomCard from "@/components/rooms/RoomCard";

const filters = [
  { value: "all", label: "ทั้งหมด" },
  { value: "occupied", label: "มีผู้เช่า" },
  { value: "vacant", label: "ว่าง" },
  { value: "booked", label: "มีการจอง" },
  { value: "maintenance", label: "ไม่พร้อมเช่า" },
];

export default function Home() {
  const { profile, user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: rooms = [], isLoading } = useQuery({ queryKey: ["rooms"], queryFn: () => base44.entities.Room.list("room_number") });
  const { data: tenants = [] } = useQuery({ queryKey: ["tenants"], queryFn: () => base44.entities.Tenant.filter({ is_active: true }) });
  const { data: bookings = [] } = useQuery({ queryKey: ["bookings"], queryFn: () => base44.entities.Booking.list() });

  const stats = useMemo(() => ({
    rooms: rooms.length,
    tenants: tenants.length,
    vacant: rooms.filter((room) => room.status === "vacant").length,
    maintenance: rooms.filter((room) => room.status === "maintenance").length,
    bookings: bookings.filter((booking) => booking.status !== "cancelled").length,
  }), [rooms, tenants, bookings]);

  const filteredRooms = useMemo(() => rooms.filter((room) => {
    const tenantNames = tenants.filter((tenant) => tenant.room_id === room.id).map((tenant) => tenant.name).join(" ");
    const matchesSearch = `${room.room_number} ${tenantNames}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesFloor = floorFilter === "all" || String(room.floor) === floorFilter;
    return matchesSearch && matchesStatus && matchesFloor;
  }), [rooms, tenants, search, statusFilter, floorFilter]);

  const countByStatus = (value) => value === "all" ? rooms.length : rooms.filter((room) => room.status === value).length;

  return (
    <div className="min-h-screen bg-canvas text-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
          <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}><Menu /></button>
          <label className="flex max-w-2xl flex-1 items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-slate-400">
            <Search size={19} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาห้อง หรือชื่อผู้เช่า..." className="w-full bg-transparent text-sm text-slate-700 outline-none" />
          </label>
          <button className="rounded-xl p-3 text-slate-500 hover:bg-slate-100"><Bell size={20} /></button>
          <div className="hidden items-center gap-3 sm:flex"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 font-bold text-white">A</span><span className="max-w-36 truncate text-sm font-semibold">{profile?.full_name || user?.email || "แอดมิน"}</span></div>
          {profile?.role === "owner" && <Link to="/import" title="นำเข้าข้อมูล" className="rounded-xl p-3 text-slate-500 hover:bg-slate-100"><Database size={20} /></Link>}
          <button onClick={signOut} title="ออกจากระบบ" className="rounded-xl p-3 text-slate-500 hover:bg-slate-100"><LogOut size={20} /></button>
        </header>

        <main className="space-y-6 p-4 md:p-8">
          <section className="relative overflow-hidden rounded-3xl bg-white p-7 shadow-card md:p-10">
            <div className="relative z-10 max-w-xl">
              <div className="mb-5 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-ink text-lg font-black text-gold">WP</div><div><h2 className="text-3xl font-black">วราพรเพลส</h2><p className="text-sm text-slate-500">Waraporn Place · Apartment Living</p></div></div>
              <p className="text-slate-500">จัดการหอพักได้ง่าย ครบจบในที่เดียว ตั้งแต่จัดการห้อง ผู้เช่า บิล และการชำระเงิน</p>
            </div>
            <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-gradient-to-br from-amber-100 via-orange-50 to-slate-200 md:block" />
          </section>

          <DashboardStats stats={stats} />

          <section className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button key={filter.value} onClick={() => setStatusFilter(filter.value)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === filter.value ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-100"}`}>
                  {filter.label} <span className="ml-1 opacity-70">{countByStatus(filter.value)}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <select value={floorFilter} onChange={(event) => setFloorFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                <option value="all">ชั้นทั้งหมด</option>
                {[...new Set(rooms.map((room) => room.floor))].sort().map((floor) => <option key={floor} value={floor}>ชั้น {floor}</option>)}
              </select>
              <div className="flex rounded-xl bg-white p-1"><button className="rounded-lg bg-blue-600 p-2 text-white"><Grid2X2 size={18} /></button><button className="rounded-lg p-2 text-slate-400"><List size={18} /></button></div>
            </div>

            {isLoading ? <p className="py-16 text-center text-slate-400">กำลังโหลดข้อมูล...</p> : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredRooms.map((room) => <RoomCard key={room.id} room={room} tenants={tenants} />)}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
