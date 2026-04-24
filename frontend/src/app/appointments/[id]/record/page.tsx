'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Stethoscope, 
  Save, 
  Loader2, 
  FileText, 
  Activity, 
  Calendar,
  User,
  PawPrint
} from 'lucide-react';

export default function RecordMedicalPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    nextVisitDate: '',
  });

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/appointments/${id}`);
        setAppointment(response.data.data);
        
        // If it already has a medical record, load it for editing
        if (response.data.data.medicalRecord) {
          const record = response.data.data.medicalRecord;
          setFormData({
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            prescription: record.prescription || '',
            notes: record.notes || '',
            nextVisitDate: record.nextVisitDate ? new Date(record.nextVisitDate).toISOString().split('T')[0] : '',
          });
        }
      } catch (error) {
        toast.error('ไม่สามารถโหลดข้อมูลนัดหมายได้');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAppointment();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        appointmentId: id,
        petId: appointment.petId,
        nextVisitDate: formData.nextVisitDate ? new Date(formData.nextVisitDate).toISOString() : undefined,
      };

      if (appointment.medicalRecord) {
        // Edit existing record
        await api.patch(`/medical-records/${appointment.medicalRecord.id}`, data);
        toast.success('แก้ไขประวัติการรักษาสำเร็จ');
      } else {
        // Create new record
        await api.post('/medical-records', data);
        toast.success('บันทึกประวัติการรักษาสำเร็จ');
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (!user || user.role !== 'VET') return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <main className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          <div className="bg-indigo-600 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold flex items-center">
              <Stethoscope className="w-8 h-8 mr-3" />
              บันทึกผลการรักษา
            </h1>
            <div className="mt-4 flex flex-wrap gap-4 text-indigo-100 text-sm">
              <span className="flex items-center"><PawPrint className="w-4 h-4 mr-1" /> {appointment.pet.name}</span>
              <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {appointment.owner.name}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(appointment.date).toLocaleDateString('th-TH')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-indigo-600" />
                  การวินิจฉัย (Diagnosis)
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="รายละเอียดการวินิจฉัยโรค..."
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-2 text-indigo-600" />
                  การรักษา (Treatment)
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="รายละเอียดการรักษาที่ทำ..."
                ></textarea>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                ใบสั่งยา (Prescription)
              </label>
              <textarea
                rows={3}
                value={formData.prescription}
                onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="ชื่อยาและวิธีใช้งาน..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">นัดหมายครั้งต่อไป</label>
                <input
                  type="date"
                  value={formData.nextVisitDate}
                  onChange={(e) => setFormData({ ...formData, nextVisitDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">บันทึกเพิ่มเติม</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="ข้อมูลอื่นๆ..."
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>บันทึกประวัติการรักษา</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
