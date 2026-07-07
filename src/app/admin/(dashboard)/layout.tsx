import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import {
  Settings,
  Users,
  Award,
  FolderOpen,
  Eye,
  Home,
} from 'lucide-react';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If no session exists, redirect to login page
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 md:sticky md:top-0 md:h-screen flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 justify-between">
            <Link href="/" className="flex items-center space-x-2 text-brand-700 font-extrabold text-lg">
              <img
                src="/logo.jpg"
                alt="wtp-edumedia logo"
                className="h-7 w-7 object-contain rounded-md border border-slate-200"
              />
              <span>wtp-edumedia</span>
            </Link>
            <span className="bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              แอดมิน
            </span>
          </div>

          {/* Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            <Link
              href="/admin/dashboard"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Settings className="mr-2.5 h-4.5 w-4.5 text-slate-400" />
              ตั้งค่าภาคเรียน/ปีการศึกษา
            </Link>

            <Link
              href="/admin/learning-areas"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Award className="mr-2.5 h-4.5 w-4.5 text-slate-400" />
              จัดการกลุ่มสาระฯ (CRUD)
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <FolderOpen className="mr-2.5 h-4.5 w-4.5 text-slate-400" />
              จัดการหมวดหมู่สื่อ (CRUD)
            </Link>
            
            <Link
              href="/admin/teachers"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Users className="mr-2.5 h-4.5 w-4.5 text-slate-400" />
              จัดการรายชื่อครู (CRUD)
            </Link>

            <Link
              href="/admin/submissions"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Eye className="mr-2.5 h-4.5 w-4.5 text-slate-400" />
              ตรวจสอบสื่อและรายงาน
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link
            href="/"
            className="flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Home className="mr-2.5 h-4.5 w-4.5" />
            กลับหน้าหลักสาธารณะ
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 sm:px-8 justify-between shrink-0">
          <h1 className="text-md font-bold text-slate-700">แผงควบคุมระบบบริหารจัดการหลังบ้าน</h1>
          <span className="text-xs text-slate-500 font-medium">
            สิทธิ์: แอดมินหลัก ({session.username})
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
