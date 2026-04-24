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

## 📄 ใบอนุญาต (License)
โปรเจกต์นี้สร้างขึ้นเพื่อการศึกษาและพัฒนาโดยทีม **SmartPet** และ **AI Coding Assistant (Antigravity)**
