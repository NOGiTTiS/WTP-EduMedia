'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash, Save, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createTeacher, updateTeacher, deleteTeacher } from '@/lib/actions';

interface Teacher {
  _rowIndex: number;
  Id: string;
  Prefix: string;
  FirstName: string;
  LastName: string;
  LearningAreaId: string;
  Status: string;
}

interface LearningArea {
  Id: string;
  Name: string;
}

interface AdminTeachersProps {
  teachers: Teacher[];
  learningAreas: LearningArea[];
}

export default function AdminTeachers({ teachers, learningAreas }: AdminTeachersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create state
  const [prefix, setPrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [learningAreaId, setLearningAreaId] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Edit state
  const [editingItem, setEditingItem] = useState<Teacher | null>(null);
  const [editPrefix, setEditPrefix] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editLearningAreaId, setEditLearningAreaId] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Delete state
  const [deletingItem, setDeletingItem] = useState<Teacher | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return toast.error('กรุณาระบุชื่อครู');
    if (!lastName.trim()) return toast.error('กรุณาระบุนามสกุลครู');
    if (!learningAreaId) return toast.error('กรุณาเลือกกลุ่มสาระการเรียนรู้');

    startTransition(async () => {
      try {
        await createTeacher(prefix, firstName.trim(), lastName.trim(), learningAreaId);
        toast.success('เพิ่มข้อมูลคุณครูเรียบร้อย');
        setFirstName('');
        setLastName('');
        setPrefix('นาย');
        setLearningAreaId('');
        setIsAddOpen(false);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editFirstName.trim()) return toast.error('กรุณาระบุชื่อครู');
    if (!editLastName.trim()) return toast.error('กรุณาระบุนามสกุลครู');
    if (!editLearningAreaId) return toast.error('กรุณาเลือกกลุ่มสาระการเรียนรู้');

    startTransition(async () => {
      try {
        await updateTeacher(
          editingItem._rowIndex,
          editingItem.Id,
          editPrefix,
          editFirstName.trim(),
          editLastName.trim(),
          editLearningAreaId,
          editStatus
        );
        toast.success('แก้ไขข้อมูลเรียบร้อย');
        setEditingItem(null);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    });
  };

  const handleDelete = () => {
    if (!deletingItem) return;

    startTransition(async () => {
      try {
        await deleteTeacher(deletingItem._rowIndex);
        toast.success('ลบข้อมูลครูเรียบร้อยแล้ว');
        setDeletingItem(null);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800">รายชื่อคณะครูผู้สอน ({teachers.length})</h3>
          <p className="text-xs text-slate-500">จัดการข้อมูลครูผู้ส่งสื่อ และบันทึกประวัติการใช้งานในโรงเรียน</p>
        </div>
        <Button
          onClick={() => {
            if (learningAreas.length === 0) {
              return toast.error('กรุณาเพิ่มกลุ่มสาระการเรียนรู้ก่อนเพิ่มคุณครู');
            }
            setIsAddOpen(true);
          }}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold h-9 px-4 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          เพิ่มคุณครู
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {teachers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            ไม่พบข้อมูลคุณครูในระบบ กรุณากดปุ่มเพิ่มข้อมูลเพื่อเริ่มต้นระบบครับ
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-16 text-center font-bold text-slate-600">ที่</TableHead>
                <TableHead className="w-32 font-bold text-slate-600">รหัสครู</TableHead>
                <TableHead className="font-bold text-slate-600">ชื่อ-นามสกุล</TableHead>
                <TableHead className="font-bold text-slate-600">กลุ่มสาระการเรียนรู้</TableHead>
                <TableHead className="w-28 text-center font-bold text-slate-600">สถานะ</TableHead>
                <TableHead className="w-32 text-center font-bold text-slate-600">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {teachers.map((teacher, idx) => {
                const area = learningAreas.find((a) => a.Id === teacher.LearningAreaId);
                const areaName = area ? area.Name : 'ไม่ระบุ';
                const isTeacherActive = teacher.Status === 'active';

                return (
                  <TableRow key={teacher.Id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center font-medium text-slate-500 text-xs">{idx + 1}</TableCell>
                    <TableCell className="font-mono text-slate-600 text-xs">{teacher.Id}</TableCell>
                    <TableCell className="font-semibold text-slate-800 text-sm">
                      {teacher.Prefix}{teacher.FirstName} {teacher.LastName}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">{areaName}</TableCell>
                    <TableCell className="text-center">
                      {isTeacherActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingItem(teacher);
                            setEditPrefix(teacher.Prefix);
                            setEditFirstName(teacher.FirstName);
                            setEditLastName(teacher.LastName);
                            setEditLearningAreaId(teacher.LearningAreaId);
                            setEditStatus(teacher.Status);
                          }}
                          className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-lg"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingItem(teacher)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg"
                          title="ลบข้อมูล"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">เพิ่มรายชื่อคุณครูผู้สอน</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prefix" className="text-xs font-semibold text-slate-600">คำนำหน้า</Label>
                <select
                  id="prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs px-2.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700 font-sans"
                >
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="ดร.">ดร.</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-600">ชื่อจริง</Label>
                <Input
                  id="firstName"
                  placeholder="กรอกชื่อจริง"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-semibold text-slate-600">นามสกุล</Label>
              <Input
                id="lastName"
                placeholder="กรอกนามสกุล"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="area" className="text-xs font-semibold text-slate-600">กลุ่มสาระการเรียนรู้</Label>
              <select
                id="area"
                value={learningAreaId}
                onChange={(e) => setLearningAreaId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
              >
                <option value="">-- เลือกกลุ่มสาระฯ --</option>
                {learningAreas.map((a) => (
                  <option key={a.Id} value={a.Id}>
                    {a.Name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-4 gap-2 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-600 rounded-xl text-xs h-9"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs h-9 px-4"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">แก้ไขข้อมูลคุณครู</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="editPrefix" className="text-xs font-semibold text-slate-600">คำนำหน้า</Label>
                <select
                  id="editPrefix"
                  value={editPrefix}
                  onChange={(e) => setEditPrefix(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs px-2.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
                >
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="ดร.">ดร.</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="editFirstName" className="text-xs font-semibold text-slate-600">ชื่อจริง</Label>
                <Input
                  id="editFirstName"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editLastName" className="text-xs font-semibold text-slate-600">นามสกุล</Label>
              <Input
                id="editLastName"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editArea" className="text-xs font-semibold text-slate-600">กลุ่มสาระการเรียนรู้</Label>
              <select
                id="editArea"
                value={editLearningAreaId}
                onChange={(e) => setEditLearningAreaId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
              >
                {learningAreas.map((a) => (
                  <option key={a.Id} value={a.Id}>
                    {a.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editStatus" className="text-xs font-semibold text-slate-600">สถานะทำงาน</Label>
              <select
                id="editStatus"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-700"
              >
                <option value="active">Active (ใช้งาน)</option>
                <option value="inactive">Inactive (ระงับชั่วคราว)</option>
              </select>
            </div>

            <DialogFooter className="pt-4 gap-2 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingItem(null)}
                className="text-slate-600 rounded-xl text-xs h-9"
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs h-9 px-4"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'บันทึก'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">ยืนยันการลบข้อมูลครู?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600 font-light">
            คุณแน่ใจว่าต้องการลบรายชื่อคุณครู <b>"{deletingItem?.Prefix}{deletingItem?.FirstName} {deletingItem?.LastName}"</b> ออกจากระบบหรือไม่?
            <p className="text-xs text-red-500 mt-2 font-semibold">
              * คำเตือน: ประวัติการส่งสื่อการสอนและรายงานการใช้งานของคุณครูรายนี้ จะขาดความถูกต้องสมบูรณ์ทางสถิติ
            </p>
          </div>
          <DialogFooter className="gap-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingItem(null)}
              className="text-slate-600 rounded-xl text-xs h-9"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
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
