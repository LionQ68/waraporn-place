import { useState } from "react";
import { ArrowLeft, Database, FileJson, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { requireSupabase } from "@/lib/supabase";

const example = {
  rooms: [{ id: "room-101", room_number: "101", floor: 1, status: "vacant", rent_price: 4000, max_occupants: 2 }],
  tenants: [{ id: "tenant-1", room_id: "room-101", name: "ชื่อผู้เช่า", phone: "", move_in_date: "2026-01-01", is_active: true }],
  bookings: [{ id: "booking-1", room_id: "room-101", room_number: "101", guest_name: "ชื่อผู้จอง", guest_phone: "", notes: "" }],
  invoices: [],
};

function normalizeRecords(records, allowedFields) {
  return records.map((record) => {
    const normalized = {};
    const metadata = { ...(record.metadata || {}) };
    Object.entries(record).forEach(([key, value]) => {
      if (allowedFields.includes(key)) normalized[key] = value;
      else metadata[key] = value;
    });
    normalized.metadata = metadata;
    return normalized;
  });
}

export default function ImportData() {
  const { profile } = useAuth();
  const [json, setJson] = useState(JSON.stringify(example, null, 2));
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setStatus("");
    try {
      const contents = await file.text();
      const parsed = JSON.parse(contents);
      setJson(JSON.stringify(parsed, null, 2));
      setStatus(`โหลดไฟล์ ${file.name} แล้ว กรุณาตรวจจำนวนข้อมูลก่อนกดนำเข้า`);
    } catch {
      setError("อ่านไฟล์ไม่ได้ กรุณาเลือกไฟล์ JSON ที่ถูกต้อง");
    }
  }

  async function handleImport() {
    setError("");
    setStatus("");
    if (profile?.role !== "owner") {
      setError("เฉพาะ owner เท่านั้นที่นำเข้าข้อมูลจำนวนมากได้");
      return;
    }

    try {
      const parsed = JSON.parse(json);
      const rooms = normalizeRecords(parsed.rooms || [], ["id", "room_number", "floor", "rent_price", "status", "room_type", "max_occupants", "image_url", "created_date", "updated_date"]);
      const tenants = normalizeRecords(parsed.tenants || [], ["id", "room_id", "name", "phone", "move_in_date", "is_active", "created_date", "updated_date"]);
      const bookings = normalizeRecords(parsed.bookings || [], ["id", "room_id", "room_number", "guest_name", "guest_phone", "notes", "status", "created_date", "updated_date"]);
      const invoices = normalizeRecords(parsed.invoices || [], ["id", "room_id", "billing_month", "rent_amount", "water_amount", "occupant_count", "electricity_start", "electricity_end", "electricity_units", "electricity_amount", "total_amount", "status", "room_number", "created_date", "updated_date"]);

      setImporting(true);
      const client = requireSupabase();
      for (const [table, records] of [["rooms", rooms], ["tenants", tenants], ["bookings", bookings], ["invoices", invoices]]) {
        if (!records.length) continue;
        const { error: importError } = await client.from(table).upsert(records, { onConflict: "id" });
        if (importError) throw new Error(`${table}: ${importError.message}`);
      }
      setStatus(`นำเข้าสำเร็จ: ห้อง ${rooms.length}, ผู้เช่า ${tenants.length}, การจอง ${bookings.length}, ใบแจ้งหนี้ ${invoices.length}`);
    } catch (importError) {
      setError(importError.message || "ข้อมูล JSON ไม่ถูกต้อง");
    } finally {
      setImporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-canvas p-5 md:p-10">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={18} /> กลับหน้าหลัก</Link>
        <section className="mt-5 rounded-3xl bg-white p-6 shadow-card md:p-9">
          <div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Database /></div><div><h1 className="text-2xl font-black">นำเข้าข้อมูลไป Supabase</h1><p className="text-sm text-slate-500">วาง JSON จาก Base44 แล้วนำเข้าห้อง ผู้เช่า และการจอง</p></div></div>
          <div className="mt-7 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">ระบบใช้ <code>id</code> เป็นตัวระบุ หากมีข้อมูลเดิม ID เดียวกันจะอัปเดตแทนการสร้างซ้ำ กรุณาสำรองข้อมูลก่อนนำเข้าชุดใหญ่</div>
          <label className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-5 py-5 text-sm font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600">
            <FileJson size={20} /> เลือกไฟล์ JSON ที่เตรียมไว้
            <input type="file" accept="application/json,.json" onChange={handleFile} className="sr-only" />
          </label>
          <textarea value={json} onChange={(event) => setJson(event.target.value)} spellCheck={false} className="mt-5 min-h-[480px] w-full rounded-2xl border border-slate-200 bg-slate-950 p-5 font-mono text-sm text-emerald-300 outline-none focus:border-blue-500" />
          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          {status && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p>}
          <button onClick={handleImport} disabled={importing || profile?.role !== "owner"} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Upload size={18} /> {importing ? "กำลังนำเข้า..." : "นำเข้าข้อมูล"}</button>
        </section>
      </div>
    </main>
  );
}
