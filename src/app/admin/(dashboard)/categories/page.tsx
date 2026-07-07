import { getCategories } from '@/lib/actions';
import AdminCategories from '@/components/AdminCategories';
import { FolderOpen } from 'lucide-react';

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-brand-50 text-brand-700 rounded-xl">
          <FolderOpen className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">จัดการหมวดหมู่สื่อและนวัตกรรม (Media Categories)</h2>
          <p className="text-xs text-slate-500">จัดการ เพิ่ม แก้ไข และลบข้อมูลตารางหมวดหมู่เพื่อจำแนกสื่อ</p>
        </div>
      </div>

      <AdminCategories categories={categories} />
    </div>
  );
}
