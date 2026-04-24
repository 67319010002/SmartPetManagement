# 🐾 SmartPet Management System

ระบบจัดการคลินิกและสัตว์เลี้ยงอัจฉริยะ (Premium SmartPet Clinic System) ที่พัฒนาขึ้นด้วยดีไซน์ที่ทันสมัย (Premium UI/UX) และระบบหลังบ้านที่ทรงพลัง รองรับการทำงานทั้งฝั่งสัตวแพทย์ (Vet) และเจ้าของสัตว์เลี้ยง (Owner)

---

## 🚀 Tech Stack

### **Frontend**
*   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **State Management**: React Context API
*   **Animations**: Framer Motion & CSS Transitions

### **Backend**
*   **Runtime**: [Node.js](https://nodejs.org/) (TypeScript)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Authentication**: JSON Web Token (JWT) & BcryptJS
*   **Validation**: Zod

### **Database & Storage**
*   **Database**: [Supabase PostgreSQL](https://supabase.com/)
*   **File Storage**: [Supabase Storage](https://supabase.com/storage) (Cloud Storage)

---

## 🛠 การติดตั้งและรันระบบ (Local Development)

### 1. โคลนโปรเจกต์
```bash
git clone https://github.com/67319010002/SmartPetManagement.git
cd SmartPetManagement
```

### 2. ติดตั้ง Dependencies
```bash
# ติดตั้งทั้งหมด (ใช้สคริปต์ที่เตรียมไว้)
npm run install:all
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` และใส่ข้อมูลดังนี้:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your_secret_key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. รันระบบ
```bash
npm run dev
```
*   Frontend: `http://localhost:3000`
*   Backend: `http://localhost:4000`

---

## 🤖 ชุดคำสั่ง (Prompts) ที่ใช้สื่อสารกับ AI Agent

ในการพัฒนาโปรเจกต์นี้ เราแบ่งการทำงานออกเป็น 5 Phases หลัก โดยใช้คำสั่งที่เน้นความเป็น **Premium** และ **Functional**:

### **Phase 1: Foundation & Architecture**
> "สร้างระบบจัดการสัตว์เลี้ยง (SmartPet) โดยแบ่งเป็น Frontend (Next.js) และ Backend (Express) ใช้ Prisma เชื่อมต่อ Supabase ตั้งค่า Architecture แบบ Monorepo ที่รองรับระบบ Role (Vet/Owner)"

### **Phase 2: Core Features Development**
> "พัฒนาระบบ CRUD สำหรับสัตว์เลี้ยง, ระบบจองคิว (Appointment), และบันทึกการรักษา (Medical Records) โดยสัตวแพทย์สามารถดูข้อมูลสัตว์เลี้ยงทั้งหมดได้ ส่วนเจ้าของดูได้เฉพาะของตัวเอง"

### **Phase 3: Premium UI/UX Transformation**
> "เปลี่ยนดีไซน์ Navbar ให้เป็นแบบ Glassmorphism (ลอยตัวและโปร่งแสง) และออกแบบหน้า Login/Register ให้ดูพรีเมียม มีการใช้ภาพประกอบ Background ที่สวยงามระดับ 4K"

### **Phase 4: Cloud Integration (Supabase Storage)**
> "ย้ายระบบการเก็บรูปภาพสัตว์เลี้ยงจาก Local Folder ไปยัง Supabase Storage เพื่อให้รองรับการ Deploy บน Vercel และทำให้ข้อมูลเป็น Cloud สมบูรณ์แบบ"

### **Phase 5: Git & Deployment**
> "เชื่อมต่อโปรเจกต์กับ GitHub และตั้งค่าการ Deploy บน Vercel โดยแยกเป็น 2 Projects (Frontend/Backend) พร้อมตั้งค่า Environment Variables ให้ถูกต้อง"

---

## 📄 ใบอนุญาต (License)
โปรเจกต์นี้สร้างขึ้นเพื่อการศึกษาและพัฒนาโดยทีม **SmartPet** และ **AI Coding Assistant (Antigravity)**
