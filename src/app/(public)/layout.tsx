import Link from 'next/link';
import { getAdminSession } from '@/lib/auth';
import { Search, FileText, Upload, PlusCircle, UserCheck } from 'lucide-react';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminSession = await getAdminSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 text-brand-700 font-bold text-xl group">
            <img
              src="/logo.jpg"
              alt="wtp-edumedia logo"
              className="h-9 w-9 object-contain rounded-lg border border-slate-200 shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
            <span className="tracking-tight">wtp-edumedia</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              แดชบอร์ด
            </Link>
            <Link
              href="/archive"
              className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Search className="h-4 w-4 mr-1.5" />
              สืบค้นคลังสื่อ
            </Link>
            
            <Link
              href="/submit-media"
              className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              ส่งสื่อการสอน
            </Link>
            <Link
              href="/submit-report"
              className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Upload className="h-4 w-4 mr-1.5" />
              รายงานการใช้สื่อ
            </Link>
            <Link
              href="/reports"
              className="flex items-center px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              รายงาน
            </Link>
          </nav>

          {/* Admin Login Button */}
          <div className="flex items-center space-x-2">
            {adminSession ? (
              <Link
                href="/admin/dashboard"
                className="flex items-center px-4 py-2 border border-brand-200 text-sm font-medium rounded-lg text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors duration-200"
              >
                <UserCheck className="h-4 w-4 mr-1.5" />
                แผงแอดมิน
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ผู้ดูแลระบบ
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav for smaller screens */}
      <div className="md:hidden flex items-center justify-around border-b border-slate-200 bg-white py-2 text-xs font-medium text-slate-600">
        <Link href="/" className="flex flex-col items-center space-y-0.5 hover:text-brand-700">
          <span>แดชบอร์ด</span>
        </Link>
        <Link href="/archive" className="flex flex-col items-center space-y-0.5 hover:text-brand-700">
          <span>คลังสื่อ</span>
        </Link>
        <Link href="/reports" className="flex flex-col items-center space-y-0.5 hover:text-brand-700">
          <span>รายงาน</span>
        </Link>
        <Link href="/submit-media" className="flex flex-col items-center space-y-0.5 hover:text-brand-700">
          <span>ส่งสื่อ</span>
        </Link>
        <Link href="/submit-report" className="flex flex-col items-center space-y-0.5 hover:text-brand-700">
          <span>รายงานการใช้</span>
        </Link>
      </div>

      {/* Content wrapper */}
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear() + 543} wtp-edumedia. ระบบบริหารจัดการสื่อเทคโนโลยีสารสนเทศและแหล่งเรียนรู้.</p>
          <p className="mt-1 text-xs text-slate-400">พัฒนาด้วย Next.js 16 & Google Workspace Integration</p>
        </div>
      </footer>
    </div>
  );
}
