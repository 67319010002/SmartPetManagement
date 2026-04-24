'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  PawPrint, 
  LogOut, 
  User, 
  Calendar, 
  PlusCircle, 
  FileText,
  LayoutDashboard,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'py-2 bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20' 
        : 'py-4 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] px-6 py-2 border border-white/40 shadow-sm flex justify-between items-center transition-all duration-500">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/dashboard" className="group flex items-center gap-2">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-2xl shadow-indigo-200 shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tighter">
                SmartPet
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center bg-gray-100/50 p-1.5 rounded-2xl border border-white/50">
            <NavLink href="/dashboard" active={isActive('/dashboard')} icon={<LayoutDashboard className="w-4 h-4" />}>
              แดชบอร์ด
            </NavLink>

            {user.role === 'OWNER' && (
              <>
                <NavLink href="/pets" active={isActive('/pets')} icon={<PawPrint className="w-4 h-4" />}>
                  สัตว์เลี้ยง
                </NavLink>
                <NavLink href="/appointments" active={isActive('/appointments')} icon={<Calendar className="w-4 h-4" />}>
                  การจอง
                </NavLink>
              </>
            )}

            {user.role === 'VET' && (
              <NavLink href="/medical-records" active={isActive('/medical-records')} icon={<FileText className="w-4 h-4" />}>
                ประวัติการรักษา
              </NavLink>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {user.role === 'OWNER' && (
              <Link
                href="/pets/add"
                className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>เพิ่มสัตว์เลี้ยง</span>
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-300 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white transition-all">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-gray-900 leading-none">{user.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    โปรไฟล์ของฉัน
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    ตั้งค่า
                  </Link>
                  <div className="h-px bg-gray-100 my-2 mx-2"></div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, icon, children }: { href: string; active: boolean; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
        active 
          ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
          : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
