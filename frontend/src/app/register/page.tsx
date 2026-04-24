'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  PawPrint, 
  Loader2, 
  CheckCircle2,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';

import api from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'OWNER' as 'OWNER' | 'VET',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      const { token, user } = response.data.data;
      
      // บันทึกสถานะการล็อกอิน
      login(token, user);
      
      toast.success('ลงทะเบียนสำเร็จ! ยินดีต้อนรับสู่ SmartPet');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Page Background with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('/auth-bg.png')" }}
      ></div>
      <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm"></div>

      <div className="max-w-6xl w-full bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl shadow-black/20 overflow-hidden flex flex-col md:flex-row border border-white/20 relative z-10">
        
        {/* Left Side: Branding & Role Selection Illustration */}
        <div className="md:w-5/12 p-12 text-white flex flex-col justify-between relative overflow-hidden bg-indigo-600/50">
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-12 group w-fit">
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl group-hover:scale-110 transition-transform">
                <PawPrint className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">SmartPet</span>
            </Link>
            
            <h1 className="text-4xl font-black leading-tight mb-6">
              เริ่มต้นจัดการ <br /> 
              <span className="text-indigo-200">สุขภาพสัตว์เลี้ยง</span> <br />
              อย่างมืออาชีพ
            </h1>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/50 flex flex-shrink-0 items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">ฟรี! สำหรับเจ้าของสัตว์เลี้ยง</p>
                  <p className="text-xs text-indigo-100">เริ่มต้นจัดการข้อมูลและนัดหมายได้ทันทีวันนี้</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/50 flex flex-shrink-0 items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">สำหรับสัตวแพทย์</p>
                  <p className="text-xs text-indigo-100">ยกระดับการให้บริการด้วยระบบบันทึกการรักษาดิจิทัล</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 text-center text-indigo-200 text-xs font-medium">
            เข้าร่วมกับเราเพื่อสร้างสังคมที่สัตว์เลี้ยงมีสุขภาพดี
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="md:w-7/12 p-12 lg:p-16 overflow-y-auto max-h-[90vh]">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">สร้างบัญชีใหม่</h2>
            <p className="text-gray-500 font-medium">เริ่มต้นการใช้งานระบบ SmartPet Management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 p-1.5 bg-gray-100 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'OWNER' })}
                className={`py-3 rounded-xl text-sm font-black transition-all ${
                  formData.role === 'OWNER' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                เจ้าของสัตว์เลี้ยง
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'VET' })}
                className={`py-3 rounded-xl text-sm font-black transition-all ${
                  formData.role === 'VET' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                สัตวแพทย์
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 ml-1">ชื่อ-นามสกุล</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="สมชาย ใจดี"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 ml-1">เบอร์โทรศัพท์</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="081-234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 ml-1">อีเมล</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 ml-1">รหัสผ่าน</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="•••••••• (อย่างน้อย 6 ตัวอักษร)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>สมัครสมาชิก</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              มีบัญชีผู้ใช้งานแล้ว?{' '}
              <Link href="/login" className="text-indigo-600 font-black hover:underline underline-offset-4">
                เข้าสู่ระบบที่นี่
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
