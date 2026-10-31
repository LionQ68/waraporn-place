// วางข้อมูลที่ export/copy จาก Base44 ในไฟล์นี้ได้โดยตรง
// ต้องคงชื่อ collection เป็น rooms, tenants และ bookings

export const seedData = {
  rooms: [
    { id: "room-101", room_number: "101", floor: 1, status: "vacant", room_type: "แอร์ / เตียงเดี่ยว", max_occupants: 2, rent_price: 4000 },
    { id: "room-102", room_number: "102", floor: 1, status: "occupied", room_type: "แอร์ / เตียงเดี่ยว", max_occupants: 2, rent_price: 4000 }
  ],
  tenants: [
    { id: "tenant-1", room_id: "room-102", name: "ผู้เช่าตัวอย่าง 1", phone: "", move_in_date: "2026-01-01", is_active: true }
  ],
  bookings: [],
  invoices: []
};
