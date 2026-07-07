'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, UploadCloud, Link as LinkIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createMedia } from '@/lib/actions';

interface Teacher {
  Id: string;
  Prefix: string;
  FirstName: string;
  LastName: string;
  LearningAreaId: string;
  Status: string;
}

interface Category {
  Id: string;
  Name: string;
  Description: string;
}

interface SubmitMediaFormProps {
  teachers: Teacher[];
  categories: Category[];
  activeYear: string;
  activeSemester: string;
}

export default function SubmitMediaForm({
  teachers,
  categories,
  activeYear,
  activeSemester,
}: SubmitMediaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [teacherId, setTeacherId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submissionType, setSubmissionType] = useState<'link' | 'file'>('link');
  const [externalLink, setExternalLink] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const activeTeachers = teachers.filter((t) => t.Status === 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherId) return toast.error('กรุณาเลือกชื่อผู้ส่ง');
    if (!categoryId) return toast.error('กรุณาเลือกหมวดหมู่สื่อ');
    if (!title.trim()) return toast.error('กรุณากรอกชื่อสื่อ/นวัตกรรม');

    setLoading(true);

    try {
      let finalUrl = '';

      if (submissionType === 'file') {
        if (!uploadFile) {
          toast.error('กรุณาเลือกไฟล์ที่ต้องการอัปโหลด');
          setLoading(false);
          return;
        }

        // Fetch teacher metadata to structure folder path on server
        const selectedTeacher = teachers.find((t) => t.Id === teacherId);
        const teacherName = selectedTeacher
          ? `${selectedTeacher.Prefix}${selectedTeacher.FirstName} ${selectedTeacher.LastName}`
          : 'ไม่ระบุ';
        const dummyArea = 'ข้อมูลประกอบสื่อ'; // Real name fetched on server side during actions.ts

        // Upload to Google Drive via server api route
        const uploadData = new FormData();
        uploadData.append('file', uploadFile);
        uploadData.append('academicYear', activeYear);
        uploadData.append('semester', activeSemester);
        uploadData.append('learningArea', dummyArea);
        uploadData.append('teacherName', teacherName);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok || uploadResult.error) {
          throw new Error(uploadResult.error || 'การอัปโหลดไฟล์ล้มเหลว');
        }
        finalUrl = uploadResult.url;
      } else {
        if (!externalLink.trim()) {
          toast.error('กรุณากรอกลิงก์ของสื่อการสอน (เช่น Google Drive, YouTube)');
          setLoading(false);
          return;
        }
        finalUrl = externalLink.trim();
      }

      // Save to Google Sheet using Server Action
      await createMedia(teacherId, categoryId, title.trim(), description.trim(), submissionType, finalUrl);

      toast.success('ส่งสื่อการสอนและนวัตกรรมเรียบร้อยแล้ว!');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error('Submit media error:', err);
      toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">กรอกข้อมูลเพื่อส่งสื่อการสอน</h2>
        <p className="text-xs text-slate-500 mt-1">
          ระบบจะบันทึกข้อมูลลงในฐานข้อมูลปีการศึกษา {activeYear} ภาคเรียนที่ {activeSemester}
        </p>
      </div>

      {/* Select Teacher Name */}
      <div className="space-y-2">
        <Label htmlFor="teacher" className="text-slate-700 font-semibold">ชื่อครูผู้สอน / ผู้ส่ง</Label>
        {activeTeachers.length === 0 ? (
          <p className="text-sm text-red-500">ไม่พบรายชื่อครูในระบบ กรุณาติดต่อแอดมินเพื่อเพิ่มรายชื่อก่อนครับ</p>
        ) : (
          <select
            id="teacher"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800"
          >
            <option value="">-- เลือกชื่อ-นามสกุลของคุณ --</option>
            {activeTeachers.map((t) => (
              <option key={t.Id} value={t.Id}>
                {t.Prefix}{t.FirstName} {t.LastName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Select Media Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-slate-700 font-semibold">หมวดหมู่สื่อและนวัตกรรม</Label>
        {categories.length === 0 ? (
          <p className="text-sm text-red-500">ไม่พบหมวดหมู่สื่อในระบบ กรุณาติดต่อแอดมินเพื่อเพิ่มหมวดหมู่ก่อนครับ</p>
        ) : (
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800"
          >
            <option value="">-- เลือกหมวดหมู่สื่อ --</option>
            {categories.map((c) => (
              <option key={c.Id} value={c.Id}>
                {c.Name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Media Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-slate-700 font-semibold">ชื่อสื่อการสอน / นวัตกรรม</Label>
        <Input
          id="title"
          placeholder="ระบุชื่อที่ชัดเจนของผลงานสื่อ"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-slate-300 focus-visible:ring-brand-500"
        />
      </div>

      {/* Media Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-700 font-semibold">รายละเอียดสื่อ (โดยย่อ)</Label>
        <Textarea
          id="description"
          placeholder="อธิบายข้อมูลเบื้องต้น วัตถุประสงค์ หรือวิชาที่นำไปใช้สอน..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-slate-300 focus-visible:ring-brand-500"
        />
      </div>

      {/* Submission Type Toggle */}
      <div className="space-y-2">
        <Label className="text-slate-700 font-semibold block">รูปแบบการส่งสื่อ</Label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSubmissionType('link')}
            className={`flex items-center justify-center p-3 border rounded-xl font-medium text-sm transition-all ${
              submissionType === 'link'
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            ส่งลิงก์ภายนอก
          </button>
          <button
            type="button"
            onClick={() => setSubmissionType('file')}
            className={`flex items-center justify-center p-3 border rounded-xl font-medium text-sm transition-all ${
              submissionType === 'file'
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            อัปโหลดไฟล์
          </button>
        </div>
      </div>

      {/* Dynamic Form fields based on selection */}
      {submissionType === 'link' ? (
        <div className="space-y-2">
          <Label htmlFor="link" className="text-slate-700 font-semibold">ลิงก์สื่อการสอน (Link URL)</Label>
          <Input
            id="link"
            type="url"
            placeholder="วางลิงก์ เช่น https://drive.google.com/... หรือ https://youtube.com/..."
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            className="border-slate-300 focus-visible:ring-brand-500"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="file" className="text-slate-700 font-semibold">อัปโหลดไฟล์สื่อการสอน</Label>
          <div className="border-2 border-dashed border-slate-300 hover:border-brand-400 bg-slate-50 rounded-xl p-6 text-center cursor-pointer transition-colors relative group">
            <input
              id="file"
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              <UploadCloud className="h-8 w-8 mx-auto text-slate-400 group-hover:text-brand-500 transition-colors" />
              <p className="text-sm font-semibold text-slate-700">
                {uploadFile ? uploadFile.name : 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่'}
              </p>
              <p className="text-xs text-slate-400">
                (ระบบจะส่งไฟล์นี้ไปจัดเก็บที่ Google Drive ของส่วนกลางโดยอัตโนมัติ)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center transition-all h-[42px]"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังส่งข้อมูลและบันทึกไฟล์...
          </>
        ) : (
          'ยืนยันการส่งสื่อการสอน'
        )}
      </Button>
    </form>
  );
}
