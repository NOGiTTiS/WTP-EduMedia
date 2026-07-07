'use client';

import { useState, useMemo } from 'react';
import { Search, Library, ExternalLink, Calendar, User, Eye, Download, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MediaItem {
  Id: string;
  Timestamp: string;
  AcademicYear: string;
  Semester: string;
  TeacherId: string;
  TeacherName: string;
  LearningAreaName: string;
  CategoryId: string;
  CategoryName: string;
  Title: string;
  Description: string;
  Type: 'link' | 'file';
  Url: string;
}

interface LearningArea {
  Id: string;
  Name: string;
}

interface Category {
  Id: string;
  Name: string;
}

interface ArchiveRegistryProps {
  mediaItems: MediaItem[];
  learningAreas: LearningArea[];
  categories: Category[];
}

export default function ArchiveRegistry({
  mediaItems,
  learningAreas,
  categories,
}: ArchiveRegistryProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Extract unique academic years for filtering
  const availableYears = useMemo(() => {
    return Array.from(new Set(mediaItems.map((m) => m.AcademicYear))).sort((a, b) => b.localeCompare(a));
  }, [mediaItems]);

  // Dynamic filtering logic
  const filteredItems = useMemo(() => {
    return mediaItems.filter((m) => {
      const matchText =
        m.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.Description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.TeacherName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchArea = selectedArea ? m.LearningAreaName === selectedArea : true;
      const matchCategory = selectedCategory ? m.CategoryName === selectedCategory : true;
      const matchYear = selectedYear ? m.AcademicYear === selectedYear : true;
      const matchSemester = selectedSemester ? m.Semester === selectedSemester : true;

      return matchText && matchArea && matchCategory && matchYear && matchSemester;
    });
  }, [mediaItems, searchTerm, selectedArea, selectedCategory, selectedYear, selectedSemester]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="ค้นหาชื่อสื่อ, คำอธิบาย หรือชื่อผู้ส่งผลงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-300 focus-visible:ring-brand-500 text-sm h-[42px] rounded-xl"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
            >
              <option value="">-- ทุกกลุ่มสาระฯ --</option>
              {learningAreas.map((a) => (
                <option key={a.Id} value={a.Name}>
                  {a.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
            >
              <option value="">-- ทุกหมวดหมู่สื่อ --</option>
              {categories.map((c) => (
                <option key={c.Id} value={c.Name}>
                  {c.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
            >
              <option value="">-- ทุกปีการศึกษา --</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  ปีการศึกษา {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
            >
              <option value="">-- ทุกภาคเรียน --</option>
              <option value="1">ภาคเรียนที่ 1</option>
              <option value="2">ภาคเรียนที่ 2</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>พบสื่อทั้งหมด <b>{filteredItems.length}</b> รายการ จากในระบบ {mediaItems.length} รายการ</span>
          {(selectedArea || selectedCategory || selectedYear || selectedSemester || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('');
                setSelectedCategory('');
                setSelectedYear('');
                setSelectedSemester('');
              }}
              className="text-brand-700 font-semibold hover:underline"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Media Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Library className="h-12 w-12 mx-auto mb-3 opacity-30 text-slate-500" />
          <p className="font-semibold text-slate-700">ไม่พบสื่อหรือนวัตกรรมตามตัวกรองของคุณ</p>
          <p className="text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกกลุ่มสาระอื่น</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.Id} className="bg-white rounded-2xl border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
              <CardHeader className="p-5 pb-3">
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <span className="bg-brand-50 text-brand-700 font-semibold text-[10px] px-2 py-0.5 rounded-full">
                    {item.LearningAreaName}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {item.CategoryName}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-brand-700 transition-colors">
                  {item.Title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1.5 font-light text-slate-500">
                  {item.Description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-5 py-0 flex-1 flex flex-col justify-end text-xs text-slate-500 space-y-2 mb-4">
                <div className="flex items-center space-x-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">{item.TeacherName}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>ปีการศึกษา {item.AcademicYear} | ภาคเรียนที่ {item.Semester}</span>
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50/80 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                {/* Info Modal Button */}
                <Dialog>
                  <DialogTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8 text-slate-600 hover:text-slate-900 px-2 rounded-lg')}>
                    <Info className="h-3.5 w-3.5 mr-1" /> รายละเอียด
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-2xl bg-white p-6">
                    <DialogHeader className="space-y-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-brand-50 text-brand-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          {item.LearningAreaName}
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full">
                          {item.CategoryName}
                        </span>
                      </div>
                      <DialogTitle className="text-lg font-bold text-slate-800 pt-2">{item.Title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-sm text-slate-600 font-light border-y border-slate-100 my-4">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase">รายละเอียดสื่อ</span>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{item.Description || 'ไม่มีคำอธิบาย'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-400">ผู้ผลิตสื่อ</span>
                          <p className="font-medium text-slate-800">{item.TeacherName}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-400">ปีการศึกษา/ภาคเรียน</span>
                          <p className="font-medium text-slate-800">ปี {item.AcademicYear} | เทอม {item.Semester}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <a
                        href={item.Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: 'default' }),
                          'bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs flex items-center'
                        )}
                      >
                        {item.Type === 'file' ? (
                          <>
                            <Download className="h-3.5 w-3.5 mr-1" /> ดาวน์โหลดไฟล์
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-3.5 w-3.5 mr-1" /> เปิดดูผลงาน
                          </>
                        )}
                      </a>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Direct access button */}
                <a
                  href={item.Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'h-8 border-slate-200 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 rounded-lg text-[11px] flex items-center'
                  )}
                >
                  {item.Type === 'file' ? (
                    <>
                      <Download className="h-3.5 w-3.5 mr-1" /> ดาวน์โหลด
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> เปิดลิงก์
                    </>
                  )}
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
