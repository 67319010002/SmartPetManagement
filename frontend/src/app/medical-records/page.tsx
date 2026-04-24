'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { 
  FileText, 
  Search, 
  Calendar, 
  User, 
  PawPrint, 
  ChevronRight, 
  Loader2,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Since we don't have a global "get all records" endpoint, 
        // we might need to use the appointments endpoint or similar 
        // to find pets then fetch their records. 
        // But for now, let's assume we have an endpoint for Vets to see all records.
        // I will add a new endpoint /api/medical-records in the backend.
        const response = await api.get('/medical-records');
        setRecords(response.data.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'VET') fetchRecords();
  }, [user]);

  const filteredRecords = records.filter((record: any) => 
    record.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.vet?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== 'VET') return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <main className="max-w-6xl mx-auto py-10 px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-indigo-600" />
            ประวัติการรักษาทั้งหมด
          </h1>
          <p className="text-gray-500 mt-2">ดูและจัดการประวัติการรักษาของสัตว์เลี้ยงทุกตัวในระบบ</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="ค้นหาตามชื่อสัตว์เลี้ยง, ผลวินิจฉัย หรือชื่อหมอ..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-6 py-3 bg-gray-50 text-gray-600 font-bold rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center">
            <Filter className="w-4 h-4 mr-2" />
            กรองข้อมูล
          </button>
        </div>

        {/* Records Table/List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">วันที่ตรวจ</th>
                  <th className="px-8 py-5">สัตว์เลี้ยง</th>
                  <th className="px-8 py-5">การวินิจฉัย</th>
                  <th className="px-8 py-5">สัตวแพทย์</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record: any) => (
                    <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{new Date(record.visitDate).toLocaleDateString('th-TH')}</span>
                          <span className="text-xs text-gray-400">{new Date(record.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} น.</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl mr-3 overflow-hidden flex items-center justify-center text-indigo-600">
                            {record.pet?.imageUrl ? (
                              <img src={record.pet.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <PawPrint className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{record.pet?.name}</p>
                            <p className="text-xs text-gray-400">{record.pet?.species}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-gray-700 line-clamp-1 max-w-[200px]">{record.diagnosis}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center text-sm font-medium text-gray-600">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {record.vet?.name}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link 
                          href={`/medical-records/${record.id}`}
                          className="inline-flex items-center text-indigo-600 font-bold hover:translate-x-1 transition-all"
                        >
                          รายละเอียด
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-gray-400 font-medium">
                      ไม่พบประวัติการรักษา
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
