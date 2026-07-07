import {
  getTeachers,
  getLearningAreas,
  getCategories,
  getMedia,
  getUsageReports,
  getActiveConfig,
} from '@/lib/actions';
import AdminConfigForm from '@/components/AdminConfigForm';
import { Users, Award, FolderOpen, Library, Activity, Settings } from 'lucide-react';

export default async function AdminDashboardPage() {
  const config = await getActiveConfig();
  const teachers = await getTeachers();
  const areas = await getLearningAreas();
  const categories = await getCategories();
  const media = await getMedia();
  const reports = await getUsageReports();

  // Statistics counters
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter((t) => t.Status === 'active').length;
  const totalAreas = areas.length;
  const totalCategories = categories.length;
  const totalMedia = media.length;
  const totalReports = reports.length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-brand-50 text-brand-700 rounded-xl">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">แดชบอร์ดหลังบ้านและการตั้งค่า</h2>
          <p className="text-xs text-slate-500">ดูภาพรวมสถิติดาต้าเบสและตั้งค่าปีการศึกษาทำงานปัจจุบัน</p>
        </div>
      </div>

      {/* Database KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">ครูในระบบ</span>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-2xl font-bold text-slate-800">{totalTeachers}</h4>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-green-600 mt-1 font-semibold">Active: {activeTeachers} คน</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">กลุ่มสาระฯ</span>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-2xl font-bold text-slate-800">{totalAreas}</h4>
            <Award className="h-4 w-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-light">ข้อมูลตารางเรียน</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">หมวดหมู่สื่อ</span>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-2xl font-bold text-slate-800">{totalCategories}</h4>
            <FolderOpen className="h-4 w-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-light">ประเภทของสื่อ</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">สื่อทั้งหมด</span>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-2xl font-bold text-slate-800">{totalMedia}</h4>
            <Library className="h-4 w-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-light">จำนวนคลังนวัตกรรม</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">รายงานใช้งาน</span>
          <div className="flex items-baseline justify-between mt-2">
            <h4 className="text-2xl font-bold text-slate-800">{totalReports}</h4>
            <Activity className="h-4 w-4 text-slate-400" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-light">จำนวนบันทึกใช้งาน</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Active config form */}
        <AdminConfigForm
          currentYear={config.activeYear}
          currentSemester={config.activeSemester}
        />

        {/* Right: Technical Info details */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-base">ระบบฐานข้อมูล Google Sheets</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              โปรเจกต์นี้ทำงานโดยอ่านและเขียนข้อมูลลงบน Google Sheet ส่วนกลางโดยตรง (แบบ Real-time) 
              ท่านสามารถเข้าไปดาวน์โหลดข้อมูลสำรอง จัดการตารางข้อมูล จัดทำประมวลผล หรือกรองข้อมูลขั้นสูงเพิ่มเติม ได้โดยการกดปุ่มทางด้านล่างนี้
            </p>
          </div>

          <div className="space-y-2 pt-2 text-xs border-t border-white/10 text-slate-400">
            <div className="flex justify-between">
              <span>Google Sheet ID:</span>
              <span className="font-mono text-slate-300 select-all truncate max-w-[200px]" title={process.env.GOOGLE_SPREADSHEET_ID}>
                {process.env.GOOGLE_SPREADSHEET_ID || 'ไม่ได้ตั้งค่า'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>บัญชี Service Account:</span>
              <span className="font-mono text-slate-300 truncate max-w-[200px]" title={process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}>
                {process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'ไม่ได้ตั้งค่า'}
              </span>
            </div>
          </div>

          <a
            href={
              process.env.GOOGLE_SPREADSHEET_ID
                ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SPREADSHEET_ID}/edit`
                : '#'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl font-semibold text-xs transition-colors"
          >
            เปิดตารางฐานข้อมูล Google Sheets
          </a>
        </div>
      </div>
    </div>
  );
}
