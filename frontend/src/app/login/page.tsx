'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  PawPrint, 
  Loader2, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      login(token, user);
      
      toast.success('ยินดีต้อนรับกลับเข้าสู่ระบบ!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
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

      <div className="max-w-5xl w-full bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl shadow-black/20 overflow-hidden flex flex-col md:flex-row border border-white/20 relative z-10">
        
        {/* Left Side: Branding & Illustration */}
        <div className="md:w-1/2 p-12 text-white flex flex-col justify-between relative overflow-hidden bg-indigo-600/50">
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-12 group w-fit">
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl group-hover:scale-110 transition-transform">
                <PawPrint className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">SmartPet</span>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              ดูแลสัตว์เลี้ยงตัวโปรด <br /> 
              <span className="text-indigo-200 underline decoration-indigo-400/50 underline-offset-8">ให้เหมือนคนในครอบครัว</span>
            </h1>
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-indigo-100">
                <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                <span>จัดการตารางนัดหมายอัจฉริยะ</span>
              </li>
              <li className="flex items-center gap-3 text-indigo-100">
                <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                <span>บันทึกประวัติการรักษาระบบ Cloud</span>
              </li>
              <li className="flex items-center gap-3 text-indigo-100">
                <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                <span>แจ้งเตือนวัคซีนและการดูแล</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2rem]">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/50 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">ความปลอดภัยสูงสุด</p>
                  <p className="text-xs text-indigo-200">ข้อมูลของคุณและสัตว์เลี้ยงจะถูกเก็บรักษาอย่างดี</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-gray-900 mb-2">เข้าสู่ระบบ</h2>
            <p className="text-gray-500 font-medium">กรอกข้อมูลของคุณเพื่อจัดการสัตว์เลี้ยงแสนรัก</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 ml-1">อีเมลผู้ใช้งาน</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-black text-gray-700">รหัสผ่าน</label>
                <Link href="#" className="text-xs font-bold text-indigo-600 hover:underline">ลืมรหัสผ่าน?</Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>ลงชื่อเข้าใช้งาน</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 font-medium">
              ยังไม่มีบัญชีผู้ใช้งาน?{' '}
              <Link href="/register" className="text-indigo-600 font-black hover:underline underline-offset-4">
                สมัครสมาชิกใหม่
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
