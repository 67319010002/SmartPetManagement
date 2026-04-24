'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { 
  PawPrint, 
  Calendar, 
  Clock, 
  Stethoscope, 
  History, 
  User, 
  Weight, 
  Cake,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Edit
} from 'lucide-react';
import Link from 'next/link';

export default function PetDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get(`/pets/${id}`);
        setPet(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPet();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'ไม่พบข้อมูล'}</h2>
        <Link href="/dashboard" className="text-indigo-600 hover:underline">กลับไปหน้าหลัก</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับหน้าหลัก
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              {pet.imageUrl ? (
                <img 
                  src={pet.imageUrl} 
                  alt={pet.name} 
                  className="w-40 h-40 rounded-3xl object-cover shadow-2xl ring-4 ring-indigo-50"
                />
              ) : (
                <div className="w-40 h-40 rounded-3xl bg-indigo-100 flex items-center justify-center shadow-inner">
                  <PawPrint className="w-16 h-16 text-indigo-300" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-xl text-white shadow-lg">
                <Cake className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-extrabold text-gray-900">{pet.name}</h1>
                {user?.role === 'OWNER' && user?.id === pet.ownerId && (
                  <Link 
                    href={`/pets/${pet.id}/edit`}
                    className="p-2 bg-gray-100 text-gray-500 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                )}
                <span className="px-4 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full uppercase tracking-wider">
                  {pet.species}
                </span>
              </div>
              <p className="text-gray-500 text-lg mb-6">{pet.breed || 'ไม่ระบุสายพันธุ์'}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">อายุ</p>
                  <p className="text-gray-900 font-bold">{pet.age} ปี {pet.ageMonths} ด. {pet.ageDays} ว.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">น้ำหนัก</p>
                  <p className="text-gray-900 font-bold">{pet.weight ? `${pet.weight} kg` : '-'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">เจ้าของ</p>
                  <p className="text-gray-900 font-bold">{pet.owner?.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">ติดต่อ</p>
                  <p className="text-gray-900 font-bold truncate">{pet.owner?.phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
              นัดหมายล่าสุด
            </h2>
            {user?.role === 'OWNER' && (
              <Link href="/appointments/new" className="text-sm text-indigo-600 font-bold hover:underline">
                จองเพิ่ม
              </Link>
            )}
          </div>
          
          <div className="space-y-4">
            {pet.appointments?.length > 0 ? (
              pet.appointments.map((apt: any) => (
                <div key={apt.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-indigo-600 border border-indigo-100">
                    {pet.imageUrl ? (
                      <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <PawPrint className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-gray-900 text-sm">{new Date(apt.date).toLocaleDateString('th-TH')}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 truncate">{apt.reason}</p>
                    <div className="flex items-center text-[10px] text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-100/50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">ไม่มีประวัติการนัดหมาย</p>
              </div>
            )}
          </div>
        </div>

        {/* Medical History Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <History className="w-5 h-5 mr-2 text-indigo-600" />
            ประวัติการรักษาทั้งหมด
          </h2>

          <div className="space-y-6">
            {pet.medicalRecords?.length > 0 ? (
              pet.medicalRecords.map((record: any) => (
                <Link 
                  href={`/medical-records/${record.id}`} 
                  key={record.id}
                  className="block group"
                >
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group-hover:border-indigo-300 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-50 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{new Date(record.visitDate).toLocaleDateString('th-TH')}</p>
                          <p className="text-xs text-gray-400">โดย {record.vet?.name}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">การวินิจฉัย</p>
                        <p className="text-gray-800 line-clamp-2">{record.diagnosis}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-gray-50 px-4 py-2 rounded-xl">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">การรักษา</p>
                          <p className="text-sm text-gray-700 truncate">{record.treatment}</p>
                        </div>
                        {record.nextVisitDate && (
                          <div className="bg-indigo-50 px-4 py-2 rounded-xl">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase">นัดครั้งต่อไป</p>
                            <p className="text-sm text-indigo-700">{new Date(record.nextVisitDate).toLocaleDateString('th-TH')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">ยังไม่พบประวัติการรักษาในฐานข้อมูล</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
