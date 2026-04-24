'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  PawPrint, 
  User, 
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setIsDataLoading(true);
      const response = await api.get('/appointments');
      setAppointments(response.data.data);
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลการนัดหมายได้');
    } finally {
      setIsDataLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      toast.success('อัปเดตสถานะสำเร็จ');
      fetchAppointments();
    } catch (error) {
      toast.error('ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการนัดหมายนี้?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('ยกเลิกการนัดหมายเรียบร้อยแล้ว');
      fetchAppointments();
    } catch (error) {
      toast.error('ไม่สามารถยกเลิกการนัดหมายได้');
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
              <CalendarIcon className="w-8 h-8 mr-2 text-indigo-600" />
              รายการนัดหมาย
            </h1>
            <p className="text-gray-600 mt-1">
              {user.role === 'VET' 
                ? 'ดูและจัดการคิวนัดหมายของสัตว์เลี้ยงทั้งหมด' 
                : 'ประวัติและรายการนัดหมายสัตว์เลี้ยงของคุณ'}
            </p>
          </div>
          
          {user.role === 'OWNER' && (
            <Link 
              href="/appointments/new"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              จองนัดหมายใหม่
            </Link>
          )}
        </div>

        {/* Appointment List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">สัตว์เลี้ยง / เจ้าของ</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">วันและเวลา</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">เหตุผล / อาการ</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isDataLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : appointments.length > 0 ? (
                  appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl mr-3 overflow-hidden flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                            {appt.pet.imageUrl ? (
                              <img src={appt.pet.imageUrl} alt={appt.pet.name} className="w-full h-full object-cover" />
                            ) : (
                              <PawPrint className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{appt.pet.name}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {appt.owner.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(appt.date).toLocaleDateString('th-TH', { 
                            day: 'numeric', month: 'long', year: 'numeric' 
                          })}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(appt.startTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - {new Date(appt.endTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 max-w-xs truncate">{appt.reason}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                          appt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          appt.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {appt.status === 'PENDING' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {appt.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {appt.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {appt.status === 'CANCELLED' && <XCircle className="w-3 h-3 mr-1" />}
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {user.role === 'VET' && appt.status === 'PENDING' && (
                          <button 
                            onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                            className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"
                          >
                            ยืนยัน
                          </button>
                        )}
                        {user.role === 'VET' && appt.status === 'CONFIRMED' && (
                          <Link 
                            href={`/appointments/${appt.id}/record`}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                          >
                            บันทึกการรักษา
                          </Link>
                        )}
                        {user.role === 'OWNER' && (appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                          <button 
                            onClick={() => cancelAppointment(appt.id)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-lg font-medium">ยังไม่มีรายการนัดหมาย</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
