'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { PawPrint, Save, Loader2, Camera, Info, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditPetPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    imageUrl: '',
    age: 0,
    ageMonths: 0,
    ageDays: 0,
    weight: 0,
  });

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await api.get(`/pets/${id}`);
        const pet = response.data.data;
        setFormData({
          name: pet.name,
          species: pet.species,
          breed: pet.breed || '',
          imageUrl: pet.imageUrl || '',
          age: pet.age || 0,
          ageMonths: pet.ageMonths || 0,
          ageDays: pet.ageDays || 0,
          weight: pet.weight || 0,
        });
      } catch (error) {
        toast.error('ไม่สามารถโหลดข้อมูลสัตว์เลี้ยงได้');
        router.push('/pets');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPet();
  }, [id, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, imageUrl: response.data.url });
      toast.success('อัปโหลดรูปภาพสำเร็จ');
    } catch (error: any) {
      toast.error('อัปโหลดล้มเหลว');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/pets/${id}`, {
        ...formData,
        age: Number(formData.age),
        ageMonths: Number(formData.ageMonths),
        ageDays: Number(formData.ageDays),
        weight: formData.weight ? Number(formData.weight) : undefined,
      });
      toast.success('แก้ไขข้อมูลสัตว์เลี้ยงสำเร็จ');
      router.push(`/pets/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลสัตว์เลี้ยงนี้?')) return;
    try {
      await api.delete(`/pets/${id}`);
      toast.success('ลบข้อมูลสัตว์เลี้ยงสำเร็จ');
      router.push('/pets');
    } catch (error) {
      toast.error('ไม่สามารถลบข้อมูลได้');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (!user || user.role !== 'OWNER') return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <main className="max-w-4xl mx-auto py-10 px-4">
        <div className="mb-6 flex justify-between items-center">
          <Link href={`/pets/${id}`} className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            กลับหน้าประวัติ
          </Link>
          <button 
            onClick={handleDelete}
            className="flex items-center text-sm font-bold text-red-500 hover:text-red-600 transition-colors bg-red-50 px-4 py-2 rounded-xl border border-red-100"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            ลบสัตว์เลี้ยง
          </button>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold flex items-center">
              <PawPrint className="w-8 h-8 mr-3" />
              แก้ไขข้อมูล {formData.name}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="relative w-48 h-48 rounded-3xl bg-gray-100 border-4 border-white shadow-xl overflow-hidden cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Pet" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Camera className="w-12 h-12 mb-2" />
                    <span className="text-xs">คลิกเพื่ออัปโหลด</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Upload className="w-8 h-8" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
              <p className="text-xs text-gray-400">เปลี่ยนรูปโปรไฟล์น้อง</p>
            </div>

            {/* Section 1: Basic Info */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">ข้อมูลพื้นฐาน</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">ชื่อสัตว์เลี้ยง</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">ประเภทสัตว์เลี้ยง</label>
                  <select
                    required
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="DOG">สุนัข</option>
                    <option value="CAT">แมว</option>
                    <option value="RABBIT">กระต่าย</option>
                    <option value="BIRD">นก</option>
                    <option value="OTHER">อื่นๆ</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">สายพันธุ์</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Detailed Age & Weight */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">อายุและน้ำหนัก</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">อายุ (ปี)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">เดือน</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={formData.ageMonths}
                    onChange={(e) => setFormData({ ...formData, ageMonths: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">วัน</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.ageDays}
                    onChange={(e) => setFormData({ ...formData, ageDays: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">น้ำหนัก (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>บันทึกการเปลี่ยนแปลง</span>
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
