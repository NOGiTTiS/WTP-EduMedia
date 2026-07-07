import Link from 'next/link';
import { getTeachers, getMedia, getUsageReports, getActiveConfig, getLearningAreas } from '@/lib/actions';
import { FileText, ExternalLink, Calendar, Users, FileCode, CheckCircle2 } from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PageProps {
  searchParams: Promise<{
    year?: string;
    semester?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const config = await getActiveConfig();

  // Selected year and semester (default to active config)
  const selectedYear = resolvedSearchParams.year || config.activeYear;
  const selectedSemester = resolvedSearchParams.semester || config.activeSemester;

  // Fetch all databases
  const teachers = await getTeachers();
  const mediaItems = await getMedia();
  const usageReports = await getUsageReports();
  const learningAreas = await getLearningAreas();

  // Filter media & reports by selected semester & academic year
  const filteredMedia = mediaItems.filter(
    (m) => m.AcademicYear === selectedYear && m.Semester === selectedSemester
  );
  const filteredReports = usageReports.filter(
    (r) => r.AcademicYear === selectedYear && r.Semester === selectedSemester
  );

  // Map teachers and count their media and reports
  const reportRows = teachers
    .filter((t) => t.Status === 'active')
    .map((teacher) => {
      const teacherMedia = filteredMedia.filter((m) => m.TeacherId === teacher.Id);
      const teacherReports = filteredReports.filter((r) => r.TeacherId === teacher.Id);
      const area = learningAreas.find((a) => a.Id === teacher.LearningAreaId);

      return {
        id: teacher.Id,
        name: `${teacher.Prefix}${teacher.FirstName} ${teacher.LastName}`,
        areaName: area ? area.Name : 'ไม่ระบุ',
        mediaCount: teacherMedia.length,
        reportsCount: teacherReports.length,
      };
    })
    .sort((a, b) => b.mediaCount - a.mediaCount); // Sort by media count descending

  // Unique years for selection
  const years = Array.from(
    new Set([
      config.activeYear,
      ...mediaItems.map((m) => m.AcademicYear),
      ...usageReports.map((r) => r.AcademicYear),
    ])
  ).sort((a, b) => b.localeCompare(a));

  const totalTeachersActive = teachers.filter((t) => t.Status === 'active').length;
  const totalSubmissionsInPeriod = filteredMedia.length;
  const totalReportsInPeriod = filteredReports.length;

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const googleSheetUrl = spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    : '#';

  return (
    <div className="space-y-6 py-4 animate-fade-in">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-brand-50 text-brand-700 rounded-2xl mb-2">
          <FileText className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">รายงานสรุปสารสนเทศสื่อและการใช้สื่อ</h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm">
          ตารางรายงานสรุปรายชื่อคุณครูที่จัดส่งสื่อการเรียนการสอนและบันทึกรายงานผลการใช้
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <form method="GET" className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">ปีการศึกษา:</span>
            <select
              name="year"
              defaultValue={selectedYear}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">ภาคเรียน:</span>
            <select
              name="semester"
              defaultValue={selectedSemester}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
            >
              <option value="1">ภาคเรียนที่ 1</option>
              <option value="2">ภาคเรียนที่ 2</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
          >
            กรองรายงาน
          </button>
        </form>

        {/* Google Sheet Direct Export Link */}
        {spreadsheetId && (
          <a
            href={googleSheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-xl shadow-sm transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            เปิดไฟล์ฐานข้อมูล Google Sheets
          </a>
        )}
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-150 flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 bg-brand-50 text-brand-700 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ครูในระบบปัจจุบัน</p>
            <h4 className="text-lg font-bold text-slate-800">{totalTeachersActive} คน</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <FileCode className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">จำนวนสื่อภาคเรียนนี้</p>
            <h4 className="text-lg font-bold text-slate-800">{totalSubmissionsInPeriod} รายการ</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">รายงานใช้งานสื่อ</p>
            <h4 className="text-lg font-bold text-slate-800">{totalReportsInPeriod} ฉบับ</h4>
          </div>
        </div>
      </div>

      {/* Report Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {reportRows.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            ยังไม่มีรายชื่อครูในฐานข้อมูล กรุณาเพิ่มรายชื่อครูก่อนในหน้าแผงควบคุมแอดมิน
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/75 border-b border-slate-200">
                <TableRow>
                  <TableHead className="w-12 text-center font-bold text-slate-600">ที่</TableHead>
                  <TableHead className="font-bold text-slate-600">ชื่อ-นามสกุล ครูผู้สอน</TableHead>
                  <TableHead className="font-bold text-slate-600">กลุ่มสาระการเรียนรู้</TableHead>
                  <TableHead className="text-center font-bold text-slate-600 w-32">จำนวนสื่อที่ส่ง</TableHead>
                  <TableHead className="text-center font-bold text-slate-600 w-36">รายงานการใช้สื่อ</TableHead>
                  <TableHead className="text-center font-bold text-slate-600 w-28">สถานะการส่ง</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {reportRows.map((row, idx) => (
                  <TableRow key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-center font-medium text-slate-500 text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-semibold text-slate-800 text-sm">{row.name}</TableCell>
                    <TableCell className="text-slate-600 text-xs">{row.areaName}</TableCell>
                    <TableCell className="text-center text-sm font-semibold text-indigo-700">{row.mediaCount}</TableCell>
                    <TableCell className="text-center text-sm font-semibold text-emerald-700">{row.reportsCount}</TableCell>
                    <TableCell className="text-center">
                      {row.mediaCount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                          ส่งแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          ยังไม่ส่ง
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
