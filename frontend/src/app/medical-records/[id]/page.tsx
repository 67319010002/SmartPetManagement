'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { 
  Stethoscope, 
  Calendar, 
  User, 
  PawPrint, 
  FileText, 
  Activity, 
  Pill, 
  Clock,
  ArrowLeft,
  Loader2,
  Printer,
  Edit,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MedicalRecordDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editData, setEditData] = useState({
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    nextVisitDate: '',
  });

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await api.get(`/medical-records/${id}`);
        const data = response.data.data;
        setRecord(data);
        setEditData({
          diagnosis: data.diagnosis,
          treatment: data.treatment,
          prescription: data.prescription || '',
          notes: data.notes || '',
          nextVisitDate: data.nextVisitDate ? data.nextVisitDate.split('T')[0] : '',
        });
      } catch (error) {
        console.error('Error fetching record:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecord();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.patch(`/medical-records/${id}`, {
        ...editData,
        nextVisitDate: editData.nextVisitDate ? new Date(editData.nextVisitDate).toISOString() : null
      });
      setRecord(response.data.data);
      setIsEditing(false);
      toast.success('อัปเดตประวัติการรักษาสำเร็จ');
    } catch (error) {
      toast.error('ไม่สามารถอัปเดตข้อมูลได้');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (!record) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <FileText className="w-16 h-16 text-gray-200 mb-4" />
      <p className="text-gray-500 font-bold">ไม่พบข้อมูลประวัติการรักษา</p>
      <Link href="/dashboard" className="mt-4 text-indigo-600 hover:underline">กลับไปหน้าแดชบอร์ด</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <main className="max-w-4xl mx-auto py-10 px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/pets/${record.petId}`} className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            กลับไปที่ประวัติสัตว์เลี้ยง
          </Link>
          
          <div className="flex gap-2">
            {!isEditing && user?.role === 'VET' && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center text-sm font-bold text-amber-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:bg-amber-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                แก้ไขข้อมูล
              </button>
            )}
            {!isEditing && (
              <button 
                onClick={() => window.print()}
                className="flex items-center text-sm font-bold text-indigo-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:bg-indigo-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                พิมพ์เอกสาร
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdate} className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 print:shadow-none print:border-none">
          {/* Header */}
          <div className="bg-indigo-600 px-8 py-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Stethoscope className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  ใบสรุปผลการรักษา
                </span>
              </div>
              <h1 className="text-3xl font-bold">บันทึกประวัติการรักษา</h1>
              <p className="text-indigo-100 mt-1">วันที่ตรวจ: {new Date(record.visitDate).toLocaleDateString('th-TH')}</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 text-right">
              <p className="text-xs uppercase font-bold text-indigo-200">สัตวแพทย์ผู้ตรวจ</p>
              <p className="text-xl font-bold">นพ./พญ. {record.vet?.name}</p>
            </div>
          </div>

          <div className="p-8 space-y-10">
            {/* Info Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">สัตว์เลี้ยง</p>
                <div className="flex items-center mt-1">
                  <PawPrint className="w-4 h-4 mr-2 text-indigo-600" />
                  <span className="font-bold text-gray-900">{record.pet?.name}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">ประเภท</p>
                <span className="font-bold text-gray-900">{record.pet?.species}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">เจ้าของ</p>
                <div className="flex items-center mt-1">
                  <User className="w-4 h-4 mr-2 text-indigo-600" />
                  <span className="font-bold text-gray-900">{record.appointment?.owner?.name || '-'}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">เวลานัดหมาย</p>
                <div className="flex items-center mt-1">
                  <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                  <span className="font-bold text-gray-900">
                    {record.appointment ? new Date(record.appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-indigo-100 pb-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900">การวินิจฉัย (Diagnosis)</h3>
                </div>
                {isEditing ? (
                  <textarea
                    required
                    value={editData.diagnosis}
                    onChange={(e) => setEditData({ ...editData, diagnosis: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]"
                  />
                ) : (
                  <div className="text-gray-700 leading-relaxed bg-indigo-50/30 p-4 rounded-2xl min-h-[120px]">
                    {record.diagnosis}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-indigo-100 pb-2">
                  <Stethoscope className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900">การรักษา (Treatment)</h3>
                </div>
                {isEditing ? (
                  <textarea
                    required
                    value={editData.treatment}
                    onChange={(e) => setEditData({ ...editData, treatment: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]"
                  />
                ) : (
                  <div className="text-gray-700 leading-relaxed bg-indigo-50/30 p-4 rounded-2xl min-h-[120px]">
                    {record.treatment}
                  </div>
                )}
              </div>
            </div>

            {/* Prescription & Follow-up */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-indigo-100 pb-2">
                  <Pill className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900">รายการยา (Prescription)</h3>
                </div>
                {isEditing ? (
                  <textarea
                    value={editData.prescription}
                    onChange={(e) => setEditData({ ...editData, prescription: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                    placeholder="เช่น Paracetamol 500mg, Amoxicillin..."
                  />
                ) : (
                  <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200 italic text-gray-600">
                    {record.prescription || 'ไม่มีข้อมูลรายการยา'}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${isEditing ? 'bg-gray-50 border border-gray-200' : 'bg-indigo-600 text-white'} p-6 rounded-3xl`}>
                  <p className={`text-xs font-bold uppercase ${isEditing ? 'text-gray-400' : 'text-indigo-200'} mb-1`}>นัดหมายติดตามผลครั้งถัดไป</p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.nextVisitDate}
                      onChange={(e) => setEditData({ ...editData, nextVisitDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                    />
                  ) : (
                    record.nextVisitDate ? (
                      <div className="flex items-center text-2xl font-bold">
                        <Calendar className="w-6 h-6 mr-3" />
                        {new Date(record.nextVisitDate).toLocaleDateString('th-TH', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    ) : <p className="text-gray-300">ไม่มีนัดหมาย</p>
                  )}
                </div>
                
                <div className="bg-gray-900 p-6 rounded-3xl text-white">
                  <p className="text-xs font-bold uppercase text-gray-400 mb-1">หมายเหตุเพิ่มเติม</p>
                  {isEditing ? (
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                    />
                  ) : (
                    <p className="text-gray-300">{record.notes || 'ไม่มีหมายเหตุเพิ่มเติม'}</p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-6 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all flex items-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  ยกเลิก
                </button>
              </div>
            )}
          </div>

          {/* Footer for print */}
          {!isEditing && (
            <div className="hidden print:block p-8 border-t mt-10">
              <div className="flex justify-between items-end">
                <div className="text-gray-400 text-xs">
                  พิมพ์โดยระบบ SmartPet Management เมื่อ {new Date().toLocaleString('th-TH')}
                </div>
                <div className="text-center w-48 border-t border-gray-900 pt-2">
                  <p className="text-sm font-bold">ลงชื่อสัตวแพทย์</p>
                  <p className="text-xs text-gray-500">(นพ./พญ. {record.vet?.name})</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
