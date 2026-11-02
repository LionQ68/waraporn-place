import { requireSupabase } from "@/lib/supabase";

export const WATER_RATE_PER_PERSON = 100;
export const ELECTRICITY_RATE_PER_UNIT = 7;

function unwrap(result) {
  if (result.error) throw result.error;
  return result.data;
}

async function syncRoomOccupancy(roomId) {
  const client = requireSupabase();
  const { count, error } = await client.from("tenants").select("id", { count: "exact", head: true }).eq("room_id", roomId).eq("is_active", true);
  if (error) throw error;
  const room = unwrap(await client.from("rooms").select("status").eq("id", roomId).single());
  const nextStatus = count > 0 && room.status !== "maintenance"
    ? "occupied"
    : count === 0 && room.status === "occupied" ? "vacant" : room.status;
  if (nextStatus !== room.status) unwrap(await client.from("rooms").update({ status: nextStatus }).eq("id", roomId));
}

export async function saveRoomTenant(roomId, values) {
  const client = requireSupabase();
  const payload = { room_id: roomId, name: values.name.trim(), phone: values.phone?.trim() || null, move_in_date: values.move_in_date || null, is_active: values.is_active ?? true };
  const tenant = values.id
    ? unwrap(await client.from("tenants").update(payload).eq("id", values.id).select().single())
    : unwrap(await client.from("tenants").insert(payload).select().single());
  await syncRoomOccupancy(roomId);
  return tenant;
}

export async function setTenantActive(roomId, tenantId, isActive) {
  const client = requireSupabase();
  const tenant = unwrap(await client.from("tenants").update({ is_active: isActive }).eq("id", tenantId).select().single());
  await syncRoomOccupancy(roomId);
  return tenant;
}

export async function createRoomInvoice({ room, tenantCount, billingMonth, electricityStart, electricityEnd }) {
  const client = requireSupabase();
  const start = Number(electricityStart || 0);
  const end = Number(electricityEnd || 0);
  if (!billingMonth) throw new Error("กรุณาเลือกรอบบิล");
  if (end < start) throw new Error("เลขมิเตอร์ปัจจุบันต้องไม่น้อยกว่าครั้งก่อน");
  const existing = unwrap(await client.from("invoices").select("id").eq("room_id", room.id).eq("billing_month", billingMonth).maybeSingle());
  if (existing) throw new Error("ห้องนี้มีใบแจ้งหนี้ของเดือนดังกล่าวแล้ว");
  const units = end - start;
  const water = tenantCount * WATER_RATE_PER_PERSON;
  const electricity = units * ELECTRICITY_RATE_PER_UNIT;
  const rent = Number(room.rent_price || 0);
  return unwrap(await client.from("invoices").insert({ room_id: room.id, room_number: room.room_number, billing_month: billingMonth, rent_amount: rent, water_amount: water, occupant_count: tenantCount, electricity_start: start, electricity_end: end, electricity_units: units, electricity_amount: electricity, total_amount: rent + water + electricity, status: "pending" }).select().single());
}

export async function setInvoiceStatus(invoiceId, status) {
  return unwrap(await requireSupabase().from("invoices").update({ status }).eq("id", invoiceId).select().single());
}
