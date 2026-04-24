'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { 
  PawPrint, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  Plus, 
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [apptsRes, petsRes] = await Promise.all([
          api.get('/appointments'),
          user?.role === 'OWNER' ? api.get('/pets') : Promise.resolve({ data: { data: [] } }),
        ]);
        
        setAppointments(apptsRes.data.data);
        
        // Calculate basic stats
        if (user?.role === 'OWNER') {
          setStats({
            petsCount: petsRes.data.data.length,
            upcomingAppts: apptsRes.data.data.filter((a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING').length,
            completedAppts: apptsRes.data.data.filter((a: any) => a.status === 'COMPLETED').length,
          });
        } else {
          setStats({
            pendingAppts: apptsRes.data.data.filter((a: any) => a.status === 'PENDING').length,
            confirmedAppts: apptsRes.data.data.filter((a: any) => a.status === 'CONFIRMED').length,
            todayAppts: apptsRes.data.data.filter((a: any) => {
              const today = new Date().toISOString().split('T')[0];
              return a.date.startsWith(today);
            }).length,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              ยินดีต้อนรับกลับมา, {user.name} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              {user.role === 'VET' 
                ? 'วันนี้มีคิวตรวจที่ต้องดูแลจัดการ' 
                : 'จัดการสัตว์เลี้ยงและนัดหมายของคุณได้ที่นี่'}
            </p>
          </div>
          {user.role === 'OWNER' && (
            <div className="flex gap-3">
              <Link
                href="/pets/add"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus className="w-5 h-5 mr-2" />
                เพิ่มสัตว์เลี้ยง
              </Link>
              <Link
                href="/appointments/new"
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all"
              >
                <Calendar className="w-5 h-5 mr-2" />
                จองคิว
              </Link>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {user.role === 'OWNER' ? (
            <>
              <Link href="/pets">
                <StatCard icon={<PawPrint />} title="สัตว์เลี้ยงทั้งหมด" value={stats?.petsCount || 0} color="indigo" />
              </Link>
              <Link href="/appointments">
                <StatCard icon={<Clock3 />} title="นัดหมายที่รออยู่" value={stats?.upcomingAppts || 0} color="amber" />
              </Link>
              <Link href="/appointments">
                <StatCard icon={<CheckCircle2 />} title="รักษาสร็จแล้ว" value={stats?.completedAppts || 0} color="emerald" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/appointments">
                <StatCard icon={<AlertCircle />} title="รอการยืนยัน" value={stats?.pendingAppts || 0} color="amber" />
              </Link>
              <Link href="/appointments">
                <StatCard icon={<Stethoscope />} title="ยืนยันแล้ว" value={stats?.confirmedAppts || 0} color="indigo" />
              </Link>
              <Link href="/appointments">
                <StatCard icon={<Calendar />} title="นัดหมายวันนี้" value={stats?.todayAppts || 0} color="emerald" />
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List: Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">การนัดหมายล่าสุด</h2>
                <Link href="/appointments" className="text-indigo-600 text-sm font-bold hover:underline">ดูทั้งหมด</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {loading ? (
                  <div className="p-10 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  </div>
                ) : appointments.length > 0 ? (
                  appointments.map((appt: any) => (
                    <div key={appt.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 overflow-hidden border border-indigo-100">
                            {appt.pet.imageUrl ? (
                              <img src={appt.pet.imageUrl} alt={appt.pet.name} className="w-full h-full object-cover" />
                            ) : (
                              <PawPrint className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <Link href={`/pets/${appt.petId}`} className="text-lg font-bold text-gray-900 hover:text-indigo-600">
                              {appt.pet.name}
                            </Link>
                            <p className="text-sm text-gray-500">{appt.reason}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-8">
                          <div className="hidden sm:block">
                            <div className="flex items-center text-gray-600 text-sm mb-1">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {new Date(appt.date).toLocaleDateString('th-TH')}
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              {new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                              appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                              appt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                              appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {appt.status}
                            </span>
                            
                            {user.role === 'VET' && appt.status === 'CONFIRMED' && (
                              <Link
                                href={`/appointments/${appt.id}/record`}
                                className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                              >
                                บันทึกการรักษา
                              </Link>
                            )}
                            
                            {appt.status === 'COMPLETED' && appt.medicalRecord && (
                              <Link
                                href={`/medical-records/${appt.medicalRecord.id}`}
                                className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-xl transition-colors"
                                title="ดูผลการรักษา"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center">
                    <p className="text-gray-400">ไม่พบรายการนัดหมาย</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
              <h3 className="text-xl font-bold mb-4">สถานะสุขภาพสัตว์เลี้ยง</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                ติดตามประวัติการรักษาและตารางนัดหมายอย่างใกล้ชิด เพื่อสุขภาพที่ดีของสัตว์เลี้ยงแสนรักของคุณ
              </p>
              <Link 
                href="/pets"
                className="block w-full text-center bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold py-3 rounded-2xl transition-all"
              >
                ดูรายชื่อสัตว์เลี้ยงทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color }: any) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
