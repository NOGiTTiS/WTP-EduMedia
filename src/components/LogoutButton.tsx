'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAdmin } from '@/lib/auth-actions';
import { toast } from 'sonner';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdmin();
      toast.success('ออกจากระบบแอดมินเรียบร้อยแล้ว');
      router.push('/');
      router.refresh();
    });
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isPending}
      className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 h-10 px-3 rounded-lg text-sm font-semibold"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-red-500" />
          กำลังออก...
        </>
      ) : (
        <>
          <LogOut className="mr-2.5 h-4.5 w-4.5" />
          ออกจากระบบ
        </>
      )}
    </Button>
  );
}
