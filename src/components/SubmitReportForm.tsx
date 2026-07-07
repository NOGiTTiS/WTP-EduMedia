'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createUsageReport } from '@/lib/actions';

interface Teacher {
  Id: string;
  Prefix: string;
  FirstName: string;
  LastName: string;
  Status: string;
}

interface MediaItem {
  Id: string;
  Title: string;
  TeacherId: string;
  AcademicYear: string;
  Semester: string;
}

interface SubmitReportFormProps {
  teachers: Teacher[];
  mediaList: MediaItem[];
  activeYear: string;
  activeSemester: string;
}

export default function SubmitReportForm({
  teachers,
  mediaList,
  activeYear,
  activeSemester,
}: SubmitReportFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [teacherId, setTeacherId] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetClass, setTargetClass] = useState('');
  const [studentCount, setStudentCount] = useState<number | ''>('');
  const [outcomeProblems, setOutcomeProblems] = useState('');

  const activeTeachers = teachers.filter((t) => t.Status === 'active');

  // Filter media items dynamically by the selected teacher, and matching active year/semester
  const filteredMedia = useMemo(() => {
    if (!teacherId) return [];
    return mediaList.filter(
      (m) =>
        m.TeacherId === teacherId &&
        m.AcademicYear === activeYear &&
        m.Semester === activeSemester
    );
  }, [teacherId, mediaList, activeYear, activeSemester]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherId) return toast.error('กรุณาเลือกชื่อผู้ส่งรายงาน');
    if (!mediaId) return toast.error('กรุณาเลือกสื่อการสอนที่นำไปใช้งาน');
    if (!usageDate) return toast.error('กรุณาระบุวันที่ใช้งาน');
    if (!targetClass.trim()) return toast.error('กรุณาระบุชั้นเรียนที่นำไปใช้');
    if (studentCount === '' || Number(studentCount) <= 0) return toast.error('กรุณาระบุจำนวนนักเรียนที่เข้าร่วม (มากกว่า 0)');

    setLoading(true);

    try {
      await createUsageReport(
        teacherId,
        mediaId,
        usageDate,
        targetClass.trim(),
        Number(studentCount),
        outcomeProblems.trim()
      );

      toast.success('ส่งรายงานการใช้งานสื่อการสอนเรียบร้อยแล้ว!');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error('Submit report error:', err);
      toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกรายงาน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">ส่งรายงานผลการใช้สื่อการสอน</h2>
        <p className="text-xs text-slate-500 mt-1">
          บันทึกผลการจัดกิจกรรมสำหรับปีการศึกษา {activeYear} ภาคเรียนที่ {activeSemester}
        </p>
      </div>

      {/* Select Teacher Name */}
      <div className="space-y-2">
        <Label htmlFor="teacher" className="text-slate-700 font-semibold">ชื่อครูผู้สอน / รายงาน</Label>
        {activeTeachers.length === 0 ? (
          <p className="text-sm text-red-500">ไม่พบรายชื่อครูในระบบ กรุณาติดต่อแอดมินเพื่อเพิ่มรายชื่อก่อนครับ</p>
        ) : (
          <select
            id="teacher"
            value={teacherId}
            onChange={(e) => {
              setTeacherId(e.target.value);
              setMediaId(''); // Reset media selection when teacher changes
            }}
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

      {/* Select Media Item */}
      {teacherId && (
        <div className="space-y-2">
          <Label htmlFor="media" className="text-slate-700 font-semibold">เลือกสื่อการสอนที่ใช้งาน</Label>
          {filteredMedia.length === 0 ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-1">
              <p className="font-semibold">คุณยังไม่มีการส่งสื่อการสอนเข้ามาในภาคเรียนนี้</p>
              <p>ระบบอนุญาตให้ส่งรายงานได้เฉพาะสื่อที่คุณลงทะเบียนส่งเข้ามาแล้วเท่านั้น กรุณาเข้าไปส่งสื่อก่อนครับ</p>
            </div>
          ) : (
            <select
              id="media"
              value={mediaId}
              onChange={(e) => setMediaId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800"
            >
              <option value="">-- เลือกผลงานสื่อของคุณ --</option>
              {filteredMedia.map((m) => (
                <option key={m.Id} value={m.Id}>
                  {m.Title}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Date of usage */}
      <div className="space-y-2">
        <Label htmlFor="date" className="text-slate-700 font-semibold">วันที่ใช้งานสื่อ</Label>
        <Input
          id="date"
          type="date"
          value={usageDate}
          onChange={(e) => setUsageDate(e.target.value)}
          className="border-slate-300 focus-visible:ring-brand-500"
        />
      </div>

      {/* Target Class and Student Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="class" className="text-slate-700 font-semibold">ชั้นเรียนที่ใช้สอน</Label>
          <Input
            id="class"
            placeholder="เช่น ม.1/1 หรือ ประถม 6"
            value={targetClass}
            onChange={(e) => setTargetClass(e.target.value)}
            className="border-slate-300 focus-visible:ring-brand-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="students" className="text-slate-700 font-semibold">จำนวนนักเรียนที่เรียน (คน)</Label>
          <Input
            id="students"
            type="number"
            min={1}
            placeholder="ระบุจำนวนนักเรียน"
            value={studentCount}
            onChange={(e) => setStudentCount(e.target.value === '' ? '' : Number(e.target.value))}
            className="border-slate-300 focus-visible:ring-brand-500"
          />
        </div>
      </div>

      {/* Outcome / Problems */}
      <div className="space-y-2">
        <Label htmlFor="outcome" className="text-slate-700 font-semibold">ผลการนำไปใช้ / ปัญหาและอุปสรรคที่พบ</Label>
        <Textarea
          id="outcome"
          placeholder="อธิบายว่า นักเรียนเรียนรู้ได้ดีขึ้นอย่างไร หรือสื่อมีข้อบกพร่องที่ต้องปรับปรุงอย่างไรบ้าง..."
          rows={4}
          value={outcomeProblems}
          onChange={(e) => setOutcomeProblems(e.target.value)}
          className="border-slate-300 focus-visible:ring-brand-500"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || !teacherId || filteredMedia.length === 0}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center transition-all h-[42px]"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังส่งข้อมูล...
          </>
        ) : (
          'ยืนยันการส่งรายงานการใช้สื่อ'
        )}
      </Button>
    </form>
  );
}
