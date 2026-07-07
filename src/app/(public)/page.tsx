import Link from 'next/link';
import { getMedia, getUsageReports, getActiveConfig, getCategories, getLearningAreas } from '@/lib/actions';
import { FileCode, Activity, FolderOpen, Award, ArrowRight, Library, Settings } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    year?: string;
    semester?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const config = await getActiveConfig();

  // Selected year and semester (default to active config)
  const selectedYear = resolvedSearchParams.year || config.activeYear;
  const selectedSemester = resolvedSearchParams.semester || config.activeSemester;

  // Fetch all database records
  const allMedia = await getMedia();
  const allReports = await getUsageReports();
  const categories = await getCategories();
  const learningAreas = await getLearningAreas();

  // Filter media & reports by selected semester & academic year
  const filteredMedia = allMedia.filter(
    (m) => m.AcademicYear === selectedYear && m.Semester === selectedSemester
  );
  const filteredReports = allReports.filter(
    (r) => r.AcademicYear === selectedYear && r.Semester === selectedSemester
  );

  // Calculate unique years available in dataset for filter dropdown
  const years = Array.from(
    new Set([
      config.activeYear,
      ...allMedia.map((m) => m.AcademicYear),
      ...allReports.map((r) => r.AcademicYear),
    ])
  ).sort((a, b) => b.localeCompare(a)); // Descending order

  // Calculations for stats
  const totalMedia = filteredMedia.length;
  const totalReports = filteredReports.length;
  
  // Media by Learning Area
  const mediaByArea: Record<string, number> = {};
  learningAreas.forEach((area) => {
    mediaByArea[area.Name] = 0;
  });
  filteredMedia.forEach((m) => {
    const areaName = m.LearningAreaName || 'ไม่ระบุ';
    mediaByArea[areaName] = (mediaByArea[areaName] || 0) + 1;
  });

  // Sort areas by media count
  const areaChartData = Object.entries(mediaByArea)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Media by Category
  const mediaByCategory: Record<string, number> = {};
  categories.forEach((cat) => {
    mediaByCategory[cat.Name] = 0;
  });
  filteredMedia.forEach((m) => {
    const catName = m.CategoryName || 'ไม่ระบุ';
    mediaByCategory[catName] = (mediaByCategory[catName] || 0) + 1;
  });

  const categoryChartData = Object.entries(mediaByCategory)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Top Teachers (most media submitted)
  const teacherSubmissions: Record<string, number> = {};
  filteredMedia.forEach((m) => {
    teacherSubmissions[m.TeacherName] = (teacherSubmissions[m.TeacherName] || 0) + 1;
  });
  const topTeachers = Object.entries(teacherSubmissions)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner & Selector */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="bg-brand-600/50 text-brand-100 font-semibold px-3 py-1 rounded-full text-xs tracking-wider uppercase">
            ปีการศึกษา {config.activeYear} | ภาคเรียนที่ {config.activeSemester}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            ระบบสารสนเทศคลังสื่อ นวัตกรรม และแหล่งเรียนรู้
          </h1>
          <p className="text-brand-100/90 text-sm sm:text-base mt-2 max-w-2xl font-light">
            ยินดีต้อนรับสู่ระบบบริหารจัดการคลังสื่อ wtp-edumedia ค้นหาสื่อการสอน รายงานการใช้ และติดตามสถิติการใช้งานนวัตกรรมได้ที่นี่
          </p>
        </div>

        {/* Filter Dropdowns */}
        <form method="GET" className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex flex-wrap items-center gap-3 border border-white/20 self-start md:self-auto">
          <div className="flex flex-col">
            <label className="text-[10px] text-brand-200 uppercase font-semibold mb-1">ปีการศึกษา</label>
            <select
              name="year"
              defaultValue={selectedYear}
              className="bg-brand-900/40 text-white border border-brand-500 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 font-medium"
            >
              {years.map((y) => (
                <option key={y} value={y} className="text-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-brand-200 uppercase font-semibold mb-1">ภาคเรียน</label>
            <select
              name="semester"
              defaultValue={selectedSemester}
              className="bg-brand-900/40 text-white border border-brand-500 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400 font-medium"
            >
              <option value="1" className="text-slate-900">ภาคเรียนที่ 1</option>
              <option value="2" className="text-slate-900">ภาคเรียนที่ 2</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-white hover:bg-brand-50 text-brand-800 font-bold text-xs py-2 px-4 rounded-lg mt-auto self-end h-[38px] transition-colors"
          >
            ดึงข้อมูล
          </button>
        </form>
      </div>

      {/* Main stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3.5 bg-brand-50 text-brand-700 rounded-xl">
            <Library className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">สื่อ/นวัตกรรมที่ส่ง (ภาคเรียนนี้)</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-800">{totalMedia}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">รายงานการใช้งานสื่อ</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-800">{totalReports}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3.5 bg-violet-50 text-violet-700 rounded-xl">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">จำนวนหมวดหมู่สื่อ</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-800">{categories.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3.5 bg-amber-50 text-amber-700 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">กลุ่มสาระการเรียนรู้</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-800">{learningAreas.length}</h3>
          </div>
        </div>
      </div>

      {/* Charts & Graphs Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media count by Learning Area */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6">สื่อและนวัตกรรมจำแนกตามกลุ่มสาระการเรียนรู้</h2>
          {areaChartData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400">
              <FileCode className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">ไม่มีข้อมูลสื่อส่งเข้าในภาคเรียนนี้</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {areaChartData.map((item, index) => {
                const maxVal = Math.max(...areaChartData.map((d) => d.count), 1);
                const percentage = (item.count / maxVal) * 100;
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.name}</span>
                      <span>{item.count} รายการ</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Media count by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6">สื่อและนวัตกรรมจำแนกตามหมวดหมู่</h2>
          {categoryChartData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400">
              <FileCode className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">ไม่มีข้อมูลสื่อส่งเข้าในภาคเรียนนี้</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {categoryChartData.map((item, index) => {
                const maxVal = Math.max(...categoryChartData.map((d) => d.count), 1);
                const percentage = (item.count / maxVal) * 100;
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{item.name}</span>
                      <span>{item.count} รายการ</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top teachers list & Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Teachers Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">ครูผู้สอนที่ผลิตสื่อการสอนสูงสุด (Top Contributors)</h2>
          {topTeachers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8 text-slate-400 text-sm">
              ยังไม่มีประวัติการส่งสื่อการสอนในภาคเรียนนี้
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {topTeachers.map((teacher, index) => (
                <div key={teacher.name} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-bold text-xs">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">{teacher.name}</span>
                  </div>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                    {teacher.count} สื่อการสอน
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links Card */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold">เมนูเข้าถึงด่วน (Quick Links)</h2>
            <p className="text-slate-400 text-xs mt-1.5 font-light">
              ดำเนินการที่เกี่ยวข้องได้ทันทีจากแผงควบคุมนี้
            </p>
          </div>

          <div className="space-y-3 mt-6">
            <Link
              href="/submit-media"
              className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl group transition-all text-sm font-medium"
            >
              <span>ส่งสื่อการสอนใหม่</span>
              <ArrowRight className="h-4 w-4 text-brand-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/submit-report"
              className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl group transition-all text-sm font-medium"
            >
              <span>รายงานผลการใช้สื่อ</span>
              <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/archive"
              className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl group transition-all text-sm font-medium"
            >
              <span>ค้นหาในคลังสื่อ</span>
              <ArrowRight className="h-4 w-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>สำหรับผู้ดูแลระบบ:</span>
            <Link href="/admin/dashboard" className="text-brand-400 hover:underline flex items-center">
              <Settings className="h-3 w-3 mr-1" /> เข้าสู่แผงควบคุม
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
