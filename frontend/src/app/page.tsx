'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PawPrint, Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50">
      <div className="text-center">
        <div className="bg-white p-6 rounded-3xl shadow-xl inline-block mb-6 animate-bounce">
          <PawPrint className="w-16 h-16 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">SmartPet Management</h1>
        <p className="text-gray-600 mb-8">กำลังพาคุณไปยังหน้าหลัก...</p>
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
      </div>
    </div>
  );
}
