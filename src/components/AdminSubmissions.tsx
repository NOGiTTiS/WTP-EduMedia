'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trash, ExternalLink, Download, Search, FileText, Library } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { deleteMedia, deleteUsageReport } from '@/lib/actions';

interface MediaItem {
  _rowIndex: number;
  Id: string;
  Timestamp: string;
  AcademicYear: string;
  Semester: string;
  TeacherName: string;
  LearningAreaName: string;
  CategoryName: string;
  Title: string;
  Type: 'link' | 'file';
  Url: string;
}

interface UsageReport {
  _rowIndex: number;
  Id: string;
  Timestamp: string;
  AcademicYear: string;
  Semester: string;
  TeacherName: string;
  MediaTitle: string;
  UsageDate: string;
  TargetClass: string;
  StudentCount: string;
  OutcomeProblems: string;
}

interface AdminSubmissionsProps {
  mediaItems: MediaItem[];
  reports: UsageReport[];
}

export default function AdminSubmissions({ mediaItems, reports }: AdminSubmissionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search filter
  const [searchMedia, setSearchMedia] = useState('');
  const [searchReport, setSearchReport] = useState('');

  // Delete states
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);
  const [deletingReport, setDeletingReport] = useState<UsageReport | null>(null);

  // Filter lists
  const filteredMedia = mediaItems.filter(
    (m) =>
      m.Title.toLowerCase().includes(searchMedia.toLowerCase()) ||
      m.TeacherName.toLowerCase().includes(searchMedia.toLowerCase())
  );

  const filteredReports = reports.filter(
    (r) =>
      r.MediaTitle.toLowerCase().includes(searchReport.toLowerCase()) ||
      r.TeacherName.toLowerCase().includes(searchReport.toLowerCase())
  );

  const handleDeleteMedia = () => {
    if (!deletingMedia) return;

    startTransition(async () => {
      try {
        await deleteMedia(deletingMedia._rowIndex);
        toast.success('ลบสื่อการสอนสำเร็จ');
        setDeletingMedia(null);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || 'ลบข้อมูลล้มเหลว');
      }
    });
  };

  const handleDeleteReport = () => {
    if (!deletingReport) return;

    startTransition(async () => {
      try {
        await deleteUsageReport(deletingReport._rowIndex);
        toast.success('ลบรายงานการใช้สื่อสำเร็จ');
        setDeletingReport(null);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || 'ลบข้อมูลล้มเหลว');
      }
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="media" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 max-w-sm mb-6">
          <TabsTrigger value="media" className="rounded-lg text-xs font-semibold py-2">
            คลังสื่อและนวัตกรรม ({mediaItems.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg text-xs font-semibold py-2">
            รายงานการใช้งาน ({reports.length})
          </TabsTrigger>
        </TabsList>

        {/* Media Submissions Tab */}
        <TabsContent value="media" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="ค้นหาชื่อสื่อ หรือครูผู้ส่ง..."
                value={searchMedia}
                onChange={(e) => setSearchMedia(e.target.value)}
                className="pl-9 text-xs border-slate-350 rounded-xl"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">พบทั้งหมด {filteredMedia.length} รายการ</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredMedia.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">ไม่พบข้อมูลสื่อการสอน</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/75 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="w-12 text-center font-bold text-slate-600">ที่</TableHead>
                    <TableHead className="w-20 text-center font-bold text-slate-600">ปี/เทอม</TableHead>
                    <TableHead className="font-bold text-slate-600">ชื่อผลงานสื่อ</TableHead>
                    <TableHead className="font-bold text-slate-600">ผู้ผลิตสื่อ</TableHead>
                    <TableHead className="font-bold text-slate-600">สาระ/หมวดหมู่</TableHead>
                    <TableHead className="w-24 text-center font-bold text-slate-600">การเข้าถึง</TableHead>
                    <TableHead className="w-16 text-center font-bold text-slate-600">ลบ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 text-xs">
                  {filteredMedia.map((media, idx) => (
                    <TableRow key={media.Id} className="hover:bg-slate-50/50">
                      <TableCell className="text-center font-medium text-slate-500">{idx + 1}</TableCell>
                      <TableCell className="text-center font-medium text-slate-700">
                        {media.AcademicYear}/{media.Semester}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800 text-sm max-w-[200px] truncate" title={media.Title}>
                        {media.Title}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{media.TeacherName}</TableCell>
                      <TableCell className="space-y-0.5 text-[10px]">
                        <p className="font-bold text-slate-600">{media.LearningAreaName}</p>
                        <p className="text-slate-400">{media.CategoryName}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <a
                          href={media.Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="เปิดดูไฟล์หรือลิงก์"
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                            'h-7 w-7 p-0 rounded-lg flex items-center justify-center'
                          )}
                        >
                          {media.Type === 'file' ? <Download className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingMedia(media)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Usage Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="ค้นหาชื่อสื่อ หรือครูผู้รายงาน..."
                value={searchReport}
                onChange={(e) => setSearchReport(e.target.value)}
                className="pl-9 text-xs border-slate-350 rounded-xl"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">พบทั้งหมด {filteredReports.length} รายการ</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">ไม่พบรายงานผลการใช้งาน</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/75 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="w-12 text-center font-bold text-slate-600">ที่</TableHead>
                    <TableHead className="w-20 text-center font-bold text-slate-600">ปี/เทอม</TableHead>
                    <TableHead className="font-bold text-slate-600">สื่อที่ใช้</TableHead>
                    <TableHead className="font-bold text-slate-600">ผู้รายงาน</TableHead>
                    <TableHead className="font-bold text-slate-600">ห้องเรียน/นร.</TableHead>
                    <TableHead className="font-bold text-slate-600">ผลสัมฤทธิ์ / ปัญหา</TableHead>
                    <TableHead className="w-16 text-center font-bold text-slate-600">ลบ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 text-xs">
                  {filteredReports.map((rep, idx) => (
                    <TableRow key={rep.Id} className="hover:bg-slate-50/50">
                      <TableCell className="text-center font-medium text-slate-500">{idx + 1}</TableCell>
                      <TableCell className="text-center font-medium text-slate-700">
                        {rep.AcademicYear}/{rep.Semester}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800 text-sm max-w-[150px] truncate" title={rep.MediaTitle}>
                        {rep.MediaTitle}
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{rep.TeacherName}</TableCell>
                      <TableCell className="font-medium text-slate-600">
                        ชั้น {rep.TargetClass} ({rep.StudentCount} คน)
                      </TableCell>
                      <TableCell className="text-slate-500 max-w-[200px] truncate" title={rep.OutcomeProblems}>
                        {rep.OutcomeProblems || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingReport(rep)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Media Dialog */}
      <Dialog open={!!deletingMedia} onOpenChange={(open) => !open && setDeletingMedia(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">ยืนยันการลบสื่อการสอน?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600 font-light">
            คุณแน่ใจว่าต้องการลบข้อมูลสื่อการสอน <b>"{deletingMedia?.Title}"</b> ใช่หรือไม่?
            <p className="text-xs text-red-500 mt-2 font-semibold">
              * คำเตือน: ไฟล์จริงบน Google Drive จะไม่ถูกลบโดยอัตโนมัติ เพื่อป้องกันความปลอดภัยของข้อมูลดิบ 
              แต่ตัวบันทึกข้อมูลและลิงก์เชื่อมโยงจะถูกลบออกจากฐานข้อมูล Google Sheets ทันที
            </p>
          </div>
          <DialogFooter className="gap-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingMedia(null)}
              className="text-slate-600 rounded-xl text-xs h-9"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleDeleteMedia}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs h-9 px-4"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ยืนยันลบ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Report Dialog */}
      <Dialog open={!!deletingReport} onOpenChange={(open) => !open && setDeletingReport(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">ยืนยันการลบรายงานการใช้งาน?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600 font-light">
            คุณแน่ใจว่าต้องการลบรายงานการใช้งานสำหรับสื่อ <b>"{deletingReport?.MediaTitle}"</b> ของครู <b>"{deletingReport?.TeacherName}"</b> ใช่หรือไม่?
          </div>
          <DialogFooter className="gap-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingReport(null)}
              className="text-slate-600 rounded-xl text-xs h-9"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleDeleteReport}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs h-9 px-4"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ยืนยันลบ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
