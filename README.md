# วราพรเพลส

โปรเจกต์ React + JavaScript สำหรับย้ายหน้าเว็บออกจาก Base44 โดยใช้ Supabase สำหรับฐานข้อมูล, Login และ Storage พร้อม API รูปแบบเดียวกับ `base44.entities.*`

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

เปิด URL ที่ Vite แสดงใน Terminal

## ตั้งค่า Supabase

1. สร้างโปรเจกต์ใน Supabase
2. เปิด SQL Editor แล้วรัน `supabase/migrations/202610310001_initial_schema.sql`
3. คัดลอก `.env.example` เป็น `.env.local`
4. ใส่ Project URL และ Publishable key จาก Supabase Project Settings → API
5. รัน `npm run dev` และสมัครบัญชีแรก บัญชีแรกจะเป็น owner อัตโนมัติ
6. เข้าระบบแล้วกดไอคอนฐานข้อมูลบน Header หรือเปิด `/import` เพื่อวาง JSON และนำเข้าข้อมูลจาก Base44

ไฟล์ Tenant ที่รวบรวมจาก Base44 อยู่ที่ `imports/base44-tenants.json` จำนวน 60 รายการ ไฟล์นี้มีข้อมูลส่วนบุคคลและถูกละเว้นจาก Git

ห้ามนำ `service_role` key มาใส่ใน React หรือไฟล์ `.env.local` ฝั่ง frontend

## นำข้อมูลมาใส่

1. เปิด `src/data/seedData.js`
2. แทนที่ข้อมูลตัวอย่างใน `rooms`, `tenants` และ `bookings`
3. นำข้อมูลเข้า Supabase โดยให้คงชื่อคอลัมน์ตาม migration

ข้อมูลจริงเก็บใน Supabase และถูกป้องกันด้วย RLS ไม่ควร commit ข้อมูลส่วนบุคคลของผู้เช่าลง Git

## นำโค้ดจาก Base44 มาใส่

- วางหน้าใน `src/pages`
- วางคอมโพเนนต์ใน `src/components`
- วาง hooks ใน `src/hooks`
- import client ด้วย `import { base44 } from "@/api/base44Client"`
- คำสั่งพื้นฐาน `list`, `filter`, `get`, `create`, `update`, `delete` รองรับแล้ว

ดูรายละเอียดเพิ่มเติมใน `MIGRATION.md`
