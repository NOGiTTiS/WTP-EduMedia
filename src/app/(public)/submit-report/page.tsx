import { getTeachers, getMedia, getActiveConfig } from '@/lib/actions';
import SubmitReportForm from '@/components/SubmitReportForm';
import { Upload } from 'lucide-react';

export default async function SubmitReportPage() {
  const teachers = await getTeachers();
  const mediaList = await getMedia();
  const config = await getActiveConfig();

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-brand-50 text-brand-700 rounded-2xl mb-2">
          <Upload className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">รายงานการใช้งานสื่อการสอน</h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm">
          กรอกรายงานการใช้สื่อหลังจากนำสื่อหรือนวัตกรรมไปประยุกต์ใช้ในการจัดกิจกรรมการเรียนรู้จริง
        </p>
      </div>

      <SubmitReportForm
        teachers={teachers}
        mediaList={mediaList}
        activeYear={config.activeYear}
        activeSemester={config.activeSemester}
      />
    </div>
  );
}
