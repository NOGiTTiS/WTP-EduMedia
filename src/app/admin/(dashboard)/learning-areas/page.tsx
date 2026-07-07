import { getLearningAreas } from '@/lib/actions';
import AdminLearningAreas from '@/components/AdminLearningAreas';
import { Award } from 'lucide-react';

export default async function AdminLearningAreasPage() {
  const learningAreas = await getLearningAreas();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-brand-50 text-brand-700 rounded-xl">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">จัดการกลุ่มสาระการเรียนรู้ (Learning Areas)</h2>
          <p className="text-xs text-slate-500">จัดการ เพิ่ม แก้ไข และลบข้อมูลตารางรายชื่อกลุ่มสาระการเรียนรู้</p>
        </div>
      </div>

      <AdminLearningAreas learningAreas={learningAreas} />
    </div>
  );
}
