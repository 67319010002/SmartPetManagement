# 🐾 SmartPetManagement

ระบบจัดการสัตว์เลี้ยงและการจองนัดหมายสัตวแพทย์อัจฉริยะ พัฒนาด้วย Next.js, Node.js, Prisma และ Supabase

## 🚀 ฟีเจอร์ที่ทำเสร็จแล้ว (Phase 1-4)
- **ระบบสมาชิก (Auth)**: แยกสิทธิ์การใช้งานระหว่างเจ้าของสัตว์เลี้ยง (Owner) และสัตวแพทย์ (Vet)
- **จัดการสัตว์เลี้ยง**: เพิ่ม/แก้ไข/ลบ ข้อมูลสัตว์เลี้ยง พร้อมประวัติ
- **ระบบจองนัดหมาย (No Double Booking)**: ระบบจองคิวอัจฉริยะที่ใช้ Database Transaction ป้องกันการจองซ้อนในเวลาเดียวกัน
- **Dashboard**: หน้าสรุปข้อมูลแยกตามบทบาทผู้ใช้งาน
- **ประวัติการรักษา**: สัตวแพทย์สามารถบันทึกประวัติการรักษาหลังตรวจเสร็จ
- **Calendar View**: หน้าจอปฏิทินที่เลือกวันนัดหมายได้ง่าย
- **Automated Testing**: ผ่านการทดสอบ Concurrency Test ด้วย Vitest เพื่อยืนยันความถูกต้องของระบบจองคิว

## 🛠 วิธีเริ่มใช้งานโครงการ

### 1. ตั้งค่าฐานข้อมูล (Supabase)
1. เข้าไปที่ **backend/.env** (สร้างจาก `.env.example`)
2. ใส่ค่า `DATABASE_URL` และ `DIRECT_URL` จากโครงการ Supabase ของคุณ
   ```env
   DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```
3. รันคำสั่ง Sync Schema:
   ```bash
   cd backend
   npx prisma db push
   ```

### 2. รัน Backend
```bash
cd backend
npm install
npm run dev
```
เซิร์ฟเวอร์จะรันที่: `http://localhost:4000`

### 3. รัน Frontend
```bash
cd frontend
npm install
npm run dev
```
เข้าใช้งานได้ที่: `http://localhost:3000`

## 🧪 การทดสอบ
หากต้องการรัน Unit Test สำหรับระบบจองคิว:
```bash
cd backend
npm test
```

---
**SmartPet Management** - พัฒนาด้วย ❤️ โดย AI Coding Assistant
