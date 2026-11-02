import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Banknote, BedDouble, Building2, CalendarDays, DoorOpen, Phone, ReceiptText, UserRound, Users, Wrench } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { formatCurrency } from "@/lib/utils";

const statusOptions = {
  vacant: { label: "ว่าง", icon: DoorOpen, dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
  occupied: { label: "มีผู้เช่า", icon: Users, dot: "bg-blue-500", chip: "bg-blue-50 text-blue-700" },
  booked: { label: "มีการจอง", icon: CalendarDays, dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700" },
  maintenance: { label: "ไม่พร้อมเช่า", icon: Wrench, dot: "bg-slate-500", chip: "bg-slate-100 text-slate-700" },
};

const tabs = [
  { value: "overview", label: "ภาพรวม" },
  { value: "tenants", label: "ผู้เช่า" },
  { value: "invoices", label: "บิลและการชำระเงิน" },
  { value: "bookings", label: "การจอง" },
];

const formatDate = (value) => value ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(value)) : "ไม่ระบุ";

export default function RoomDetail() {
  const { roomId: routeRoomId } = useParams();
  const [searchParams] = useSearchParams();
  const roomId = routeRoomId || searchParams.get("id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: room, isLoading, isError } = useQuery({ queryKey: ["room", roomId], queryFn: () => base44.entities.Room.get(roomId), enabled: Boolean(roomId) });
  const { data: tenants = [] } = useQuery({ queryKey: ["room-tenants", roomId], queryFn: () => base44.entities.Tenant.filter({ room_id: roomId }), enabled: Boolean(roomId) });
  const { data: invoices = [] } = useQuery({ queryKey: ["room-invoices", roomId], queryFn: () => base44.entities.Invoice.filter({ room_id: roomId }, "-billing_month"), enabled: Boolean(roomId) });
  const { data: bookings = [] } = useQuery({ queryKey: ["room-bookings", roomId], queryFn: () => base44.entities.Booking.filter({ room_id: roomId }, "-created_date"), enabled: Boolean(roomId) });
  const activeTenants = useMemo(() => tenants.filter(t => t.is_active), [tenants]);
  const unpaidTotal = useMemo(() => invoices.filter(i => i.status !== "paid").reduce((sum, item) => sum + Number(item.total_amount || 0), 0), [invoices]);

  const updateStatus = useMutation({
    mutationFn: (status) => base44.entities.Room.update(roomId, { status }),
    onSuccess: (updated) => { queryClient.setQueryData(["room", roomId], updated); queryClient.invalidateQueries({ queryKey: ["rooms"] }); },
  });

  if (isLoading) return <div className="grid min-h-screen place-items-center bg-canvas text-slate-400">กำลังโหลดข้อมูลห้อง...</div>;
  if (!roomId || isError || !room) return <div className="grid min-h-screen place-items-center bg-canvas"><div className="text-center"><h1 className="text-2xl font-bold">ไม่พบข้อมูลห้อง</h1><Link to="/" className="mt-4 inline-block text-blue-600">กลับหน้าหลัก</Link></div></div>;

  const status = statusOptions[room.status] || statusOptions.vacant;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-canvas text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><ArrowLeft size={18} /> กลับ</button>
          <Link to="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-ink font-black text-gold">WP</span><span className="hidden font-bold sm:block">วราพรเพลส</span></Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-9">
        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
          <div className="grid lg:grid-cols-[420px_1fr]">
            <div className="relative min-h-72 overflow-hidden bg-slate-100 lg:min-h-[390px]">
              <img src={room.image_url || "/images/room-default.jpg"} alt={`ห้อง ${room.room_number}`} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className={`absolute left-5 top-5 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm ${status.chip}`}><span className={`h-2 w-2 rounded-full ${status.dot}`} />{status.label}</span>
              <div className="absolute bottom-5 left-5 text-white"><p className="text-sm text-white/70">ห้องพัก</p><h1 className="text-4xl font-black">{room.room_number}</h1></div>
            </div>
            <div className="flex flex-col justify-between p-6 md:p-9">
              <div><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-blue-600">รายละเอียดห้องพัก</p><h2 className="mt-1 text-3xl font-black">ห้อง {room.room_number}</h2><p className="mt-2 text-slate-500">{room.room_type || "ห้องมาตรฐาน"}</p></div><StatusIcon className="text-slate-300" size={44} /></div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3"><Info icon={Building2} label="ชั้น" value={`ชั้น ${room.floor || "-"}`} /><Info icon={BedDouble} label="รองรับ" value={`${room.max_occupants || 2} คน`} /><Info icon={Banknote} label="ค่าเช่า" value={`${formatCurrency(room.rent_price)} / เดือน`} /></div>
              </div>
              <div className="mt-8 border-t border-slate-100 pt-5"><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">เปลี่ยนสถานะห้อง</label><select value={room.status} disabled={updateStatus.isPending} onChange={e => updateStatus.mutate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 sm:max-w-xs">{Object.entries(statusOptions).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></div>
            </div>
          </div>
        </section>

        <nav className="flex gap-2 overflow-x-auto rounded-3xl border border-slate-100 bg-white p-2 shadow-sm md:gap-3">{tabs.map(tab => <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`whitespace-nowrap rounded-2xl px-6 py-4 text-base font-bold transition md:px-8 ${activeTab === tab.value ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>{tab.label}</button>)}</nav>

        {activeTab === "overview" && <div className="grid gap-6 md:grid-cols-3"><Summary icon={Users} label="ผู้เช่าปัจจุบัน" value={`${activeTenants.length} คน`} tone="blue" /><Summary icon={ReceiptText} label="บิลทั้งหมด" value={`${invoices.length} รายการ`} tone="amber" /><Summary icon={Banknote} label="ยอดค้างชำระ" value={formatCurrency(unpaidTotal)} tone="rose" /><section className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm md:col-span-2 md:p-9"><h3 className="text-xl font-extrabold">ผู้เช่าปัจจุบัน</h3><TenantRows tenants={activeTenants} /></section><section className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm md:p-9"><h3 className="text-xl font-extrabold">ข้อมูลเพิ่มเติม</h3><dl className="mt-7 space-y-6 text-base"><Row label="วันที่สร้าง" value={formatDate(room.created_date)} /><Row label="อัปเดตล่าสุด" value={formatDate(room.updated_date)} /><Row label="จำนวนการจอง" value={`${bookings.length} รายการ`} /></dl></section></div>}
        {activeTab === "tenants" && <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="text-xl font-bold">รายชื่อผู้เช่า</h3><p className="text-sm text-slate-400">ประวัติผู้เช่าทั้งหมดของห้องนี้</p></div><UserRound className="text-slate-300" /></div><TenantRows tenants={tenants} showStatus /></section>}
        {activeTab === "invoices" && <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"><div className="p-6"><h3 className="text-xl font-bold">บิลและการชำระเงิน</h3></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-6 py-3">รอบบิล</th><th className="px-6 py-3">ค่าเช่า</th><th className="px-6 py-3">ค่าน้ำ</th><th className="px-6 py-3">ค่าไฟ</th><th className="px-6 py-3">ยอดรวม</th><th className="px-6 py-3">สถานะ</th></tr></thead><tbody>{invoices.map(item => <tr key={item.id} className="border-t border-slate-100"><td className="px-6 py-4 font-semibold">{item.billing_month}</td><td className="px-6 py-4">{formatCurrency(item.rent_amount)}</td><td className="px-6 py-4">{formatCurrency(item.water_amount)}</td><td className="px-6 py-4">{formatCurrency(item.electricity_amount)}</td><td className="px-6 py-4 font-bold">{formatCurrency(item.total_amount)}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.status === "paid" ? "ชำระแล้ว" : "รอชำระ"}</span></td></tr>)}</tbody></table>{!invoices.length && <Empty text="ยังไม่มีข้อมูลบิล" />}</div></section>}
        {activeTab === "bookings" && <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h3 className="text-xl font-bold">การจองห้อง</h3><div className="mt-5 grid gap-3">{bookings.map(item => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4"><div><p className="font-semibold">{item.guest_name}</p><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400"><Phone size={14} />{item.guest_phone || "ไม่ระบุเบอร์โทร"}</p></div><div className="text-right"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{item.status}</span><p className="mt-2 text-xs text-slate-400">{formatDate(item.created_date)}</p></div></article>)}{!bookings.length && <Empty text="ยังไม่มีข้อมูลการจอง" />}</div></section>}
      </main>
    </div>
  );
}

function Info({ icon: Icon, label, value }) { return <div className="rounded-2xl bg-slate-50 p-4"><Icon size={19} className="text-slate-400" /><p className="mt-3 text-xs text-slate-400">{label}</p><p className="mt-1 font-bold">{value}</p></div>; }
function Summary({ icon: Icon, label, value, tone }) { const colors = { blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600" }; return <article className="flex min-h-56 flex-col justify-center rounded-3xl border border-slate-100 bg-white p-7 shadow-sm md:p-9"><div className={`grid h-14 w-14 place-items-center rounded-2xl ${colors[tone]}`}><Icon size={25} /></div><p className="mt-7 text-base text-slate-400">{label}</p><p className="mt-1 text-3xl font-black tracking-tight md:text-4xl">{value}</p></article>; }
function Row({ label, value }) { return <div className="flex justify-between gap-3"><dt className="text-slate-400">{label}</dt><dd className="font-semibold">{value}</dd></div>; }
function Empty({ text }) { return <div className="py-12 text-center text-sm text-slate-400">{text}</div>; }
function TenantRows({ tenants, showStatus = false }) { return <div className="mt-7 space-y-4">{tenants.map(tenant => <article key={tenant.id} className="flex min-h-28 flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 px-6 py-5"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{tenant.name?.charAt(0) || "ผ"}</span><div><p className="text-lg font-bold">{tenant.name}</p><p className="mt-1 flex items-center gap-2 text-sm text-slate-400"><Phone size={14} />{tenant.phone || "ไม่ระบุเบอร์โทร"}</p></div></div><div className="text-right"><p className="text-sm text-slate-400">เข้าอยู่ {formatDate(tenant.move_in_date)}</p>{showStatus && <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${tenant.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{tenant.is_active ? "กำลังเช่า" : "ย้ายออกแล้ว"}</span>}</div></article>)}{!tenants.length && <Empty text="ยังไม่มีข้อมูลผู้เช่า" />}</div>; }
