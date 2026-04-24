'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';
import toast from 'react-hot-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MessageSquare, 
  Save, 
  Loader2, 
  PawPrint,
  Stethoscope,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function NewAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [busySlots, setBusySlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    petId: '',
    vetId: '',
    time: '',
    reason: '',
    note: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsRes, vetsRes] = await Promise.all([
          api.get('/pets'),
          api.get('/auth/vets'),
        ]);
        setPets(petsRes.data.data);
        setVets(vetsRes.data.data);
      } catch (error) {
        toast.error('โหลดข้อมูลไม่สำเร็จ');
      }
    };
    fetchData();
  }, []);

  // Fetch availability when date or vet changes
  useEffect(() => {
    const fetchAvailability = async () => {
      setFetchingAvailability(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await api.get(`/appointments/availability?date=${dateStr}`);
        const appointments = response.data.data;
        
        // Filter busy slots
        const busy = appointments
          .filter((a: any) => !formData.vetId || a.vetId === formData.vetId)
          .map((a: any) => {
            const date = new Date(a.startTime);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          });
        
        setBusySlots(busy);
        
        // Reset time if selected time becomes busy
        if (busy.includes(formData.time)) {
          setFormData(prev => ({ ...prev, time: '' }));
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setFetchingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, formData.vetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time) {
      toast.error('กรุณาเลือกเวลาที่ต้องการ');
      return;
    }
    setLoading(true);

    try {
      const startTime = new Date(selectedDate);
      const [hours, minutes] = formData.time.split(':');
      startTime.setHours(parseInt(hours), parseInt(minutes), 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      await api.post('/appointments', {
        date: selectedDate.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        reason: formData.reason,
        note: formData.note,
        petId: formData.petId,
        vetId: formData.vetId || undefined,
      });

      toast.success('จองคิวนัดหมายสำเร็จ');
      router.push('/appointments');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <main className="max-w-6xl mx-auto py-10 px-4">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            กลับหน้าหลัก
          </Link>
        </div>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          <div className="bg-indigo-600 px-8 py-10 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <CalendarIcon className="w-8 h-8 mr-3" />
                จองคิวนัดหมายใหม่
              </h1>
              <p className="text-indigo-100 mt-2">ตรวจสอบเวลาว่างและยืนยันการนัดหมาย</p>
            </div>
            {fetchingAvailability && <Loader2 className="w-8 h-8 animate-spin text-white/50" />}
          </div>

          <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Date Selection */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
                1. เลือกวันที่และเวลา
              </h2>
              
              <div className="bg-white p-4 rounded-3xl border border-gray-200">
                <Calendar
                  onChange={(date: any) => setSelectedDate(date)}
                  value={selectedDate}
                  minDate={new Date()}
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-700">เวลาที่ว่างสำหรับวันที่ {selectedDate.toLocaleDateString('th-TH')}</p>
                  <div className="flex gap-4 text-[10px] uppercase font-bold">
                    <span className="flex items-center text-green-500"><CheckCircle className="w-3 h-3 mr-1" /> ว่าง</span>
                    <span className="flex items-center text-red-400"><XCircle className="w-3 h-3 mr-1" /> เต็ม</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((slot) => {
                    const isBusy = busySlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBusy}
                        onClick={() => setFormData({ ...formData, time: slot })}
                        className={`py-3 rounded-xl font-bold text-sm transition-all relative overflow-hidden ${
                          formData.time === slot
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                            : isBusy
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                      >
                        {slot}
                        {isBusy && <div className="absolute inset-0 bg-red-400/10 flex items-center justify-center"></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Pet & Vet Selection */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center border-b pb-2">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                2. ข้อมูลเพิ่มเติม
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <PawPrint className="w-4 h-4 mr-2" />
                    เลือกสัตว์เลี้ยง
                  </label>
                  <select
                    required
                    value={formData.petId}
                    onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">เลือกสัตว์เลี้ยง</option>
                    {pets.map((pet: any) => (
                      <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    เลือกคุณหมอ
                  </label>
                  <select
                    value={formData.vetId}
                    onChange={(e) => setFormData({ ...formData, vetId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">ไม่ระบุ (คุณหมอท่านใดก็ได้)</option>
                    {vets.map((vet: any) => (
                      <option key={vet.id} value={vet.id}>นพ./พญ. {vet.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400">* หากเลือกคุณหมอ ระบบจะแสดงเวลาว่างเฉพาะของคุณหมอท่านนั้น</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    เหตุผลที่มา
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ปวดหู, ตรวจสุขภาพประจำปี"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    บันทึกเพิ่มเติม
                  </label>
                  <textarea
                    rows={3}
                    placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading || !formData.time}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>ยืนยันการจองนัดหมาย</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
