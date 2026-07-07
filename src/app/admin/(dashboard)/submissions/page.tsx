import { getMedia, getUsageReports } from '@/lib/actions';
import AdminSubmissions from '@/components/AdminSubmissions';
import { Eye } from 'lucide-react';

export default async function AdminSubmissionsPage() {
  const media = await getMedia();
  const reports = await getUsageReports();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-brand-50 text-brand-700 rounded-xl">
          <Eye className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">ตรวจสอบและควบคุมข้อมูลการส่งสื่อ/รายงาน</h2>
          <p className="text-xs text-slate-500">
            แผงควบคุมหลักในการลบข้อมูลสื่อหรือรายงานผลการใช้งานเมื่อครูผู้สอนกรอกข้อมูลผิดพลาด
          </p>
        </div>
      </div>

      <AdminSubmissions mediaItems={media} reports={reports} />
    </div>
  );
}
