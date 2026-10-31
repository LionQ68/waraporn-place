# ย้ายจาก Base44

## สิ่งที่คัดลอกได้

- ไฟล์ `.jsx`, `.js` และ CSS ที่คุณเป็นเจ้าของ
- รูปภาพ/โลโก้ที่คุณมีสิทธิ์ใช้งาน
- ข้อมูล Room, Tenant และ Booking ที่ export จากบัญชีของคุณ

ไม่ควรนำ token, secret, session cookie หรือข้อมูลผู้เช่าจริงไปวางใน repository สาธารณะ

## ตำแหน่งไฟล์

| Base44 | โปรเจกต์นี้ |
| --- | --- |
| `src/pages` | `src/pages` |
| `src/components` | `src/components` |
| `src/hooks` | `src/hooks` |
| `src/lib` | `src/lib` |
| `src/api/base44Client` | `src/api/base44Client.js` |

## รูปแบบข้อมูล

```js
export const seedData = {
  rooms: [{ id: "room-101", room_number: "101", floor: 1, status: "vacant", rent_price: 4000, max_occupants: 2 }],
  tenants: [{ id: "tenant-1", room_id: "room-101", name: "ชื่อผู้เช่า", phone: "", move_in_date: "2026-01-01", is_active: true }],
  bookings: [{ id: "booking-1", room_id: "room-101", room_number: "101", guest_name: "ชื่อผู้จอง" }],
  invoices: []
};
```

## Supabase

ข้อมูลถูกอ่านและเขียนผ่าน `src/api/base44Client.js` ไปยัง Supabase โดยตรง ระบบ Login ใช้ Supabase Auth และตารางทั้งหมดเปิด RLS ตามไฟล์ migration

บัญชีแรกที่สมัครหลังรัน migration จะเป็น owner และเปิดใช้งานทันที บัญชีที่สมัครภายหลังจะมี `is_active = false` จนกว่า owner จะอนุมัติในตาราง `profiles`

## นำเข้าไฟล์จาก `old-data`

1. รัน `node scripts/prepare-old-data.mjs` เพื่อรวมและตรวจไฟล์ CSV
2. เปิดเว็บและเข้าสู่ระบบด้วยบัญชี owner
3. ไปที่ `/import` แล้วเลือกไฟล์ `imports/old-data-import.json`
4. ตรวจจำนวนข้อมูล แล้วกด **นำเข้าข้อมูล**

ต้องนำเข้าห้องก่อนผู้เช่าและใบแจ้งหนี้เพื่อให้ `room_id` เชื่อมกันได้ หน้านำเข้าจะจัดลำดับนี้ให้อัตโนมัติ และใช้ `id` เดิมเพื่อป้องกันข้อมูลซ้ำเมื่อรันอีกครั้ง

หาก Supabase ยังไม่มีตาราง ให้เปิด **SQL Editor** แล้ววางไฟล์ `imports/supabase-import.sql` และกด **Run** ครั้งเดียว ไฟล์นี้จะสร้างโครงสร้างฐานข้อมูลและนำเข้าห้อง ผู้เช่า และใบแจ้งหนี้ตามลำดับภายใน transaction เดียว
