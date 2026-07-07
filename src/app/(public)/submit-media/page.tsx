import { getTeachers, getCategories, getActiveConfig } from '@/lib/actions';
import SubmitMediaForm from '@/components/SubmitMediaForm';
import { Library } from 'lucide-react';

export default async function SubmitMediaPage() {
  const teachers = await getTeachers();
  const categories = await getCategories();
  const config = await getActiveConfig();

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-brand-50 text-brand-700 rounded-2xl mb-2">
          <Library className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">ส่งสื่อการสอนและนวัตกรรม</h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm">
          กรอกข้อมูลให้ครบถ้วนเพื่อขึ้นทะเบียนสื่อการสอนของท่านในระบบคลังสื่อของโรงเรียน
        </p>
      </div>

      <SubmitMediaForm
        teachers={teachers}
        categories={categories}
        activeYear={config.activeYear}
        activeSemester={config.activeSemester}
      />
    </div>
  );
}
