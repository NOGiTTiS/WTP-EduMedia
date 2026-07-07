import { getMedia, getLearningAreas, getCategories } from '@/lib/actions';
import ArchiveRegistry from '@/components/ArchiveRegistry';
import { Search } from 'lucide-react';

export default async function ArchivePage() {
  const mediaItems = await getMedia();
  const learningAreas = await getLearningAreas();
  const categories = await getCategories();

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-brand-50 text-brand-700 rounded-2xl mb-2">
          <Search className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">คลังทะเบียนสื่อ นวัตกรรม และแหล่งเรียนรู้</h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm">
          ค้นหาและเข้าถึงสื่อการสอน นวัตกรรมสร้างสรรค์ และแหล่งเรียนรู้ของคณะครูในโรงเรียน
        </p>
      </div>

      <ArchiveRegistry
        mediaItems={mediaItems}
        learningAreas={learningAreas}
        categories={categories}
      />
    </div>
  );
}
