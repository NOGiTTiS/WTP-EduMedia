'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/auth-actions';
import { toast } from 'sonner';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAdmin(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success('เข้าสู่ระบบสำเร็จ');
        router.push('/admin/dashboard');
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
        <div className="text-center">
          <img
            src="/logo.jpg"
            alt="wtp-edumedia logo"
            className="mx-auto h-20 w-20 object-contain rounded-2xl border border-slate-200 shadow-sm p-1.5 bg-slate-50 transition-transform hover:scale-105 duration-300"
          />
          <h2 className="mt-4 text-2xl font-extrabold text-slate-800">ผู้ดูแลระบบ Login</h2>
          <p className="mt-1.5 text-xs text-slate-500">
            เฉพาะผู้ดูแลระบบและแอดมินจัดการระบบคลังสื่อ wtp-edumedia เท่านั้น
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center space-x-2 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold text-slate-600">ชื่อผู้ใช้งาน (Username)</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              placeholder="กรอกชื่อผู้ใช้แอดมิน"
              className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-600">รหัสผ่าน (Password)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="กรอกรหัสผ่าน"
              className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center transition-all h-[42px] mt-6"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังยืนยันตัวตน...
              </>
            ) : (
              'เข้าสู่ระบบควบคุม'
            )}
          </Button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => router.push('/')}
            className="text-xs font-semibold text-slate-500 hover:text-brand-700 transition-colors"
          >
            ← กลับไปหน้าหลักสาธารณะ
          </button>
        </div>
      </div>
    </div>
  );
}
