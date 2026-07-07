import { getTeachers, getLearningAreas } from '@/lib/actions';
import AdminTeachers from '@/components/AdminTeachers';
import { Users } from 'lucide-react';

export default async function AdminTeachersPage() {
  const teachers = await getTeachers();
  const learningAreas = await getLearningAreas();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-brand-50 text-brand-700 rounded-xl">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">จัดการทะเบียนรายชื่อครู (Teachers)</h2>
          <p className="text-xs text-slate-500">จัดการข้อมูลรายชื่อคุณครูผู้ผลิตสื่อการเรียนรู้</p>
        </div>
      </div>

      <AdminTeachers teachers={teachers} learningAreas={learningAreas} />
    </div>
  );
}
