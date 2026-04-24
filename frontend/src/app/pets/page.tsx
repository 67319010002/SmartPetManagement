'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { PawPrint, Plus, ChevronRight, Search, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PetsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchPets();
  }, [user]);

  const fetchPets = async () => {
    try {
      setIsDataLoading(true);
      const response = await api.get('/pets');
      setPets(response.data.data);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลสัตว์เลี้ยงได้');
    } finally {
      setIsDataLoading(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            กลับหน้าหลัก
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <PawPrint className="w-8 h-8 mr-2 text-indigo-600" />
              {user.role === 'VET' ? 'สัตว์เลี้ยงทั้งหมดในระบบ' : 'สัตว์เลี้ยงของฉัน'}
            </h1>
            <p className="text-gray-600 mt-1">
              {user.role === 'VET' 
                ? 'ดูข้อมูลและประวัติการรักษาของสัตว์เลี้ยงทั้งหมด' 
                : 'จัดการข้อมูลและประวัติของน้องๆ ทั้งหมด'}
            </p>
          </div>
          
          {user.role === 'OWNER' && (
            <Link 
              href="/pets/add"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              เพิ่มสัตว์เลี้ยง
            </Link>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อสัตว์เลี้ยง..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Pets Grid */}
        {isDataLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 h-48 animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : pets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <Link 
                key={pet.id} 
                href={`/pets/${pet.id}`}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:ring-4 group-hover:ring-indigo-50 transition-all duration-300 overflow-hidden">
                    {pet.imageUrl ? (
                      <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <PawPrint className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {pet.name}
                    </h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                      {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex space-x-4">
                    <span>{pet.age ? `${pet.age} ปี` : 'ไม่ระบุอายุ'}</span>
                    <span>{pet.weight ? `${pet.weight} กก.` : ''}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
            <PawPrint className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีสัตว์เลี้ยง</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              เริ่มต้นด้วยการเพิ่มข้อมูลสัตว์เลี้ยงของคุณ เพื่อติดตามประวัติการรักษาและนัดหมาย
            </p>
            <Link 
              href="/pets/add"
              className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              เพิ่มสัตว์เลี้ยงตัวแรก
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
