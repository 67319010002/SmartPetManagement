# 🐾 SmartPet Management System

ระบบจัดการคลินิกและสัตว์เลี้ยงอัจฉริยะ (Premium SmartPet Clinic System) ที่พัฒนาขึ้นด้วยดีไซน์ที่ทันสมัย (Premium UI/UX) และระบบหลังบ้านที่ทรงพลัง

---

## 🚀 Tech Stack

### **Frontend & Backend**
*   **Frontend**: Next.js 15+ (App Router), Tailwind CSS, Lucide Icons, Framer Motion
*   **Backend**: Node.js (TypeScript), Express.js, Prisma ORM, JWT, Zod
*   **Database**: Supabase PostgreSQL (AWS ap-northeast-1)
*   **Storage**: Supabase Storage (Cloud Storage)

---

## 🔑 ข้อมูลการเชื่อมต่อ (Database Details)
> [!IMPORTANT]
> ข้อมูลนี้มีความสำคัญสูง โปรดเก็บรักษาเป็นความลับ

*   **Supabase Project ID**: `xndlptznjxzbsomcmgmw`
*   **Database Password**: `smartpet0021810`
*   **Connection URL**: `postgresql://postgres.xndlptznjxzbsomcmgmw:smartpet0021810@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`

---

## 🛠 การติดตั้งและรันระบบ (Local Development)

### 1. ติดตั้ง Dependencies
```bash
npm run install:all
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `backend/.env` และใส่ข้อมูล API Keys จาก Supabase (URL, Anon Key, Service Role Key)

### 3. รันระบบ
```bash
npm run dev
```

---

## 📖 คู่มือการใช้งานเว็บไซต์ (Usage Guide)

### **1. สำหรับเจ้าของสัตว์เลี้ยง (Owner)**
*   **ลงทะเบียน**: สมัครสมาชิกใหม่โดยเลือกบทบาทเป็น "เจ้าของสัตว์เลี้ยง"
*   **จัดการสัตว์เลี้ยง**: เพิ่มข้อมูลสัตว์เลี้ยงของคุณ (ชื่อ, สายพันธุ์, วันเกิด) พร้อมอัปโหลดรูปภาพผ่าน Cloud
*   **จองคิว**: เลือกสัตว์เลี้ยงและระบุวันเวลาที่สะดวกเพื่อจองคิวรักษากับคุณหมอ
*   **ประวัติการรักษา**: ดูบันทึกการรักษาและผลวินิจฉัยจากคุณหมอได้แบบ Real-time

### **2. สำหรับสัตวแพทย์ (Vet)**
*   **แดชบอร์ด**: ดูตารางนัดหมายทั้งหมดในแต่ละวัน
*   **การรักษา**: บันทึกอาการ, ผลวินิจฉัย, และสั่งยาให้กับสัตว์เลี้ยงที่มาใช้บริการ
*   **การจัดการ**: สามารถเรียกดูข้อมูลสัตว์เลี้ยงทั้งหมดในระบบและแก้ไขประวัติการรักษาได้
*   **ความปลอดภัย**: เฉพาะสัตวแพทย์เท่านั้นที่สามารถแก้ไขข้อมูลการวินิจฉัยได้

---

## 🧪 การทดสอบระบบ (Automated Testing)
เราได้เพิ่มระบบทดสอบอัตโนมัติเพื่อให้มั่นใจว่าฟีเจอร์หลักทำงานได้ถูกต้อง:
*   **Unit Tests**: ทดสอบ Logic การสมัครสมาชิกและการล็อกอิน (Auth Controller)
*   **Integration Tests**: ทดสอบระบบการจองคิว (Appointment)
*   **คำสั่งรัน Test**:
    ```bash
    cd backend
    npm test
    ```

---

## 🤖 ชุดคำสั่ง (Prompts) สำคัญในการพัฒนา
*   **Phase 1-2**: สร้างฐานระบบ Monorepo และระบบ CRUD สัตว์เลี้ยง/นัดหมาย
*   **Phase 3**: "Redesign the Navbar with glassmorphism and Auth pages with premium 4K backgrounds"
*   **Phase 4**: "Integrate Supabase Storage for cloud image uploads"
*   **Phase 5**: "Fix CORS policy and Deploy to Vercel with Serverless functions"

---

## 🛠 ปัญหาที่พบและแนวทางการแก้ไข (Troubleshooting)

ในระหว่างการพัฒนาและ Deploy เราพบปัญหาสำคัญดังนี้:

### **1. ปัญหา CORS Policy บน Vercel**
*   **อาการ**: หน้าเว็บ Frontend ไม่สามารถเรียกใช้ API ได้ (ติด Error: `No 'Access-Control-Allow-Origin' header`)
*   **สาเหตุ**: เกิดจาก Browser บล็อกการเชื่อมต่อข้ามโดเมน และความขัดแย้งระหว่างการใช้ Wildcard (`*`) กับ `Credentials: true`
*   **การแก้ไข**: ปรับการตั้งค่าใน `src/index.ts` และ `vercel.json` ให้ใช้ `Origin: '*'` คู่กับ `Credentials: false` เนื่องจากเราใช้ Bearer Token (Authorization Header) อยู่แล้ว ซึ่งไม่ต้องใช้ Cookie

### **2. ปัญหา Express 5 Wildcard Crash**
*   **อาการ**: Backend ล่ม (500 Internal Server Error) เมื่อรันบน Vercel
*   **สาเหตุ**: Express เวอร์ชั่น 5 ไม่รองรับการเขียน Path แบบ `*` ในบางกรณี (เช่น `app.options('*')`) และต้องการการนิยาม Parameter ที่ชัดเจน
*   **การแก้ไข**: นำการจัดการ OPTIONS แบบ Manual ออก และให้ `cors()` middleware จัดการทั้งหมดแทน เพื่อความเสถียรบน Express 5

---
🟢 Phase 1: Setup & Core Infrastructure (รากฐาน)
Initialize Project: สร้าง Folder หลักและแยก frontend (Next.js) กับ backend (Node.js/Express)

Database Modeling: * เขียนไฟล์ schema.prisma เพื่อกำหนดตาราง User, Pet, Appointment, และ MedicalRecord

Setup PostgreSQL (Local หรือ Docker)

Backend Core: * ตั้งค่า Express และเชื่อมต่อ Prisma

ทำระบบ Authentication (JWT + Bcrypt) และ Middleware ตรวจสอบ Role (Vet/Owner)

🟡 Phase 2: Business Logic & Anti-Bug (หัวใจของระบบ)
No Double Booking Logic: * เขียน Service การจองนัดหมายโดยใช้ Database Transaction (เพื่อให้ชัวร์ว่าถ้าจองพร้อมกัน 2 คน คนที่ช้ากว่าจะถูก Reject ทันที)

API Development: * สร้าง Endpoint สำหรับจัดการสัตว์เลี้ยง, การดึงตารางนัดหมาย, และการบันทึกประวัติการรักษา

Validation: ใช้ Zod ตรวจสอบข้อมูลที่ส่งมาจาก Frontend ตั้งแต่หน้าประตู API

🔵 Phase 3: Frontend & Integration (ส่วนติดต่อผู้ใช้)
Frontend Setup: * สร้างหน้า UI ด้วย Next.js และ TailwindCSS

ทำระบบ Login/Register และ Dashboard แยกตาม Role

Connecting API: * เชื่อมต่อ Frontend กับ Backend (จัดการเรื่อง CORS และการเก็บ Token ใน Cookie/LocalStorage)

Calendar View: สร้างหน้าแสดงผลการจองที่ดูง่าย

🔴 Phase 4: Testing & Debugging (ตรวจสอบความถูกต้อง)
Unit & Integration Testing: * รัน Vitest ทดสอบ Logic การจอง (Concurrency Test) ว่ากันการจองซ้อนได้จริงไหม

Manual Bug Hunt: * ไล่เช็ค Error ทั่วไป เช่น การกรอกข้อมูลผิดประเภท, Token หมดอายุ, หรือ Database หลุด

Database Check: * ใช้ Prisma Studio เพื่อเปิดดูข้อมูลใน Database จริงๆ ว่าบันทึกถูกต้องไหม

Testing: เขียนชดุ ทดสอบอตัโนมัติ(Unit, Integration หรือ E2E)

**Database: ใช้Supabaseเลยนะเพราะฉันต้องการให้ทุกเครื่องเข้าถึงข้อมูลได้


เอาขึ้น GitHub ลิ้งค์.......
 Deploy โดยใช้ Vercel, Render หรือ Railway หรอื Cloud อื่น ทำให้สำเร็จ 

🟣 Phase 5: Git & Deployment (ปล่อยของ)
Git Version Control: * git init และเชื่อมต่อกับ GitHub Repo ที่คุณให้มา

Push Code ขึ้นไปเก็บไว้

Production Deployment:

Database: เราใช้Supabase มันออนไลน์อยู่แล้วถูกมั้ย

Backend & Frontend: Deploy ขึ้น Vercel 15. Final Link: ตรวจสอบความเรียบร้อยบน URL จริงและส่งมอบ Link
-
## 📄 ใบอนุญาต (License)
โปรเจกต์นี้สร้างขึ้นเพื่อการศึกษาและพัฒนาโดยทีม **SmartPet** และ **AI Coding Assistant (Antigravity)**
