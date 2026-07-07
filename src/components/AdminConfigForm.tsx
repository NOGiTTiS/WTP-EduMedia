'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setActiveConfig } from '@/lib/actions';

interface AdminConfigFormProps {
  currentYear: string;
  currentSemester: string;
}

export default function AdminConfigForm({
  currentYear,
  currentSemester,
}: AdminConfigFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [year, setYear] = useState(currentYear);
  const [semester, setSemester] = useState(currentSemester);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!year.trim()) return toast.error('กรุณาระบุปีการศึกษา');

    startTransition(async () => {
      try {
        await setActiveConfig(year.trim(), semester);
        toast.success('บันทึกการตั้งค่าปีการศึกษา/ภาคเรียนเรียบร้อย');
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || 'บันทึกการตั้งค่าล้มเหลว');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 max-w-md">
      <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
        ตั้งค่าปีการศึกษาและภาคเรียนปัจจุบัน
      </h3>

      <div className="space-y-1.5">
        <Label htmlFor="year" className="text-xs font-semibold text-slate-600">ปีการศึกษาปัจจุบัน (พ.ศ.)</Label>
        <Input
          id="year"
          placeholder="ระบุปีการศึกษา เช่น 2569"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="semester" className="text-xs font-semibold text-slate-600">ภาคเรียนปัจจุบัน</Label>
        <select
          id="semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
        >
          <option value="1">ภาคเรียนที่ 1</option>
          <option value="2">ภาคเรียนที่ 2</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center transition-all h-[40px] mt-4"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังบันทึก...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            บันทึกการตั้งค่า
          </>
        )}
      </Button>
    </form>
  );
}
