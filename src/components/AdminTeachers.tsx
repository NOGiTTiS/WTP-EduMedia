'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash, Save, X, User, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createTeacher, updateTeacher, deleteTeacher, importTeachers } from '@/lib/actions';

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

  // Import state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importStep, setImportStep] = useState<'input' | 'preview'>('input');

  const handlePreviewAreaChange = (index: number, areaId: string) => {
    setImportPreview((prev) => {
      const updated = [...prev];
      const target = updated[index];
      updated[index] = {
        ...target,
        learningAreaId: areaId,
        isValid: !!target.firstName && !!target.lastName && !!areaId,
        errorMsg: !areaId ? 'กรุณาเลือกกลุ่มสาระฯ' : '',
      };
      return updated;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleAnalyze = () => {
    if (!importText.trim()) {
      return toast.error('กรุณากรอกข้อมูลครูหรือเลือกไฟล์ก่อนครับ');
    }

    const lines = importText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed: any[] = [];

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      if (
        index === 0 &&
        (lowerLine.includes('คำนำหน้า') ||
          lowerLine.includes('ชื่อ') ||
          lowerLine.includes('นามสกุล') ||
          lowerLine.includes('กลุ่มสาระ') ||
          lowerLine.includes('prefix') ||
          lowerLine.includes('first') ||
          lowerLine.includes('last'))
      ) {
        return;
      }

      let parts = line.split('\t');
      if (parts.length < 3) {
        parts = line.split(',');
      }
      if (parts.length < 3) {
        parts = line.split(';');
      }

      if (parts.length >= 3) {
        const prefix = parts[0]?.trim() || 'นาย';
        const firstName = parts[1]?.trim() || '';
        const lastName = parts[2]?.trim() || '';
        const rawArea = parts[3]?.trim() || '';

        let matchedAreaId = '';
        if (rawArea) {
          const match = learningAreas.find((a) => {
            const cleanA = a.Name.replace(/\s+/g, '').toLowerCase();
            const cleanRaw = rawArea.replace(/\s+/g, '').toLowerCase();
            return cleanA.includes(cleanRaw) || cleanRaw.includes(cleanA);
          });
          if (match) {
            matchedAreaId = match.Id;
          }
        }

        const isValid = !!firstName && !!lastName && !!matchedAreaId;
        const errorMsg = !firstName
          ? 'ไม่มีชื่อจริง'
          : !lastName
          ? 'ไม่มีนามสกุล'
          : !matchedAreaId
          ? 'ไม่สามารถจับคู่กลุ่มสาระฯ ได้อัตโนมัติ'
          : '';

        parsed.push({
          prefix,
          firstName,
          lastName,
          rawArea: rawArea || 'ไม่ได้ระบุ',
          learningAreaId: matchedAreaId,
          isValid,
          errorMsg,
        });
      }
    });

    if (parsed.length === 0) {
      return toast.error('ไม่พบข้อมูลครูในรูปแบบที่กำหนด (กรุณากรอก คำนำหน้า, ชื่อ, นามสกุล, กลุ่มสาระฯ)');
    }

    setImportPreview(parsed);
    setImportStep('preview');
  };

  const handleImportSubmit = () => {
    const invalidRows = importPreview.filter((p) => !p.isValid);
    if (invalidRows.length > 0) {
      return toast.error('กรุณาแก้ไขข้อผิดพลาดหรือเลือกกลุ่มสาระฯ ให้ครบถ้วนก่อนนำเข้าข้อมูลครับ');
    }

    startTransition(async () => {
      try {
        const formattedList = importPreview.map((p) => ({
          Prefix: p.prefix,
          FirstName: p.firstName,
          LastName: p.lastName,
          LearningAreaId: p.learningAreaId,
        }));

        await importTeachers(formattedList);
        toast.success(`นำเข้าข้อมูลคุณครูสำเร็จทั้งหมด ${formattedList.length} คน`);
        setIsImportOpen(false);
        setImportText('');
        setImportPreview([]);
        setImportStep('input');
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
      }
    });
  };

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
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (learningAreas.length === 0) {
                return toast.error('กรุณาเพิ่มกลุ่มสาระการเรียนรู้ก่อนนำเข้าคุณครู');
              }
              setIsImportOpen(true);
            }}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold h-9 px-4 flex items-center"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            นำเข้ารายชื่อครู (Import)
          </Button>
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

      {/* Import Dialog */}
      <Dialog
        open={isImportOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsImportOpen(false);
            setImportText('');
            setImportPreview([]);
            setImportStep('input');
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-2xl bg-white p-6 font-sans">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">
              นำเข้าข้อมูลรายชื่อคุณครู
            </DialogTitle>
          </DialogHeader>

          {importStep === 'input' ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">
                  วิธีการนำเข้าข้อมูล:
                </Label>
                <ul className="text-xs text-slate-500 list-disc pl-5 space-y-1">
                  <li>คุณสามารถคัดลอกคอลัมน์จาก Excel/Google Sheets มาวางในช่องด้านล่างได้ทันที โดยคอลัมน์ควรเรียงลำดับดังนี้: <span className="font-semibold text-slate-700">คำนำหน้าชื่อ, ชื่อจริง, นามสกุล, กลุ่มสาระการเรียนรู้</span></li>
                  <li>หรือจะอัปโหลดเป็นไฟล์ CSV (.csv หรือ .txt) ที่มีการคั่นด้วย เครื่องหมายคอมมา (,) หรือ แท็บ (\t)</li>
                  <li>ระบบจะพยายามจับคู่กลุ่มสาระการเรียนรู้ให้โดยอัตโนมัติ หากไม่พบคุณสามารถเลือกจับคู่ใหม่ในหน้าถัดไปได้ครับ</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="importText" className="text-xs font-semibold text-slate-600">
                    วางข้อมูลตรงนี้
                  </Label>
                  <label className="text-xs text-brand-600 hover:text-brand-700 font-semibold cursor-pointer flex items-center">
                    <Upload className="h-3.5 w-3.5 mr-1" />
                    เลือกไฟล์ CSV/TXT
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  id="importText"
                  rows={8}
                  placeholder={`นาย\tสมชาย\tใจดี\tวิทยาศาสตร์และเทคโนโลยี
นางสาว\tสมศรี\tรักเรียน\tคณิตศาสตร์
นาง\tสมร\tสอนสนุก\tภาษาไทย`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl text-xs p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans font-medium text-slate-700"
                />
              </div>

              <DialogFooter className="pt-2 gap-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsImportOpen(false)}
                  className="text-slate-600 rounded-xl text-xs h-9"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  onClick={handleAnalyze}
                  className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs h-9 px-4 font-semibold"
                >
                  ตรวจสอบข้อมูล
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-slate-600">
                  ตัวอย่างข้อมูลที่ตรวจพบ ({importPreview.length} รายการ)
                </h4>
                <p className="text-[11px] text-slate-500">
                  โปรดตรวจสอบความถูกต้องและเลือกกลุ่มสาระฯ สำหรับรายการที่ระบบไม่สามารถจับคู่ได้โดยอัตโนมัติ (กรอบสีแดง)
                </p>
              </div>

              <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl">
                <Table>
                  <TableHeader className="bg-slate-50/75 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-10 text-center text-xs font-bold text-slate-600">ที่</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">ชื่อ-นามสกุล</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">กลุ่มสาระฯ (จากไฟล์)</TableHead>
                      <TableHead className="text-xs font-bold text-slate-600">กลุ่มสาระฯ ในระบบ</TableHead>
                      <TableHead className="w-24 text-center text-xs font-bold text-slate-600">สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importPreview.map((item, idx) => (
                      <TableRow key={idx} className={item.isValid ? '' : 'bg-red-50/50'}>
                        <TableCell className="text-center text-xs text-slate-500">{idx + 1}</TableCell>
                        <TableCell className="text-xs font-semibold text-slate-800">
                          {item.prefix}{item.firstName} {item.lastName}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">{item.rawArea}</TableCell>
                        <TableCell className="text-xs">
                          <select
                            value={item.learningAreaId}
                            onChange={(e) => handlePreviewAreaChange(idx, e.target.value)}
                            className={`w-full bg-white border rounded-lg text-xs p-1 focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans ${
                              !item.learningAreaId
                                ? 'border-red-300 bg-red-50 text-red-700 font-semibold'
                                : 'border-slate-300 text-slate-700'
                            }`}
                          >
                            <option value="">-- เลือกกลุ่มสาระฯ --</option>
                            {learningAreas.map((a) => (
                              <option key={a.Id} value={a.Id}>
                                {a.Name}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {item.isValid ? (
                            <span className="text-green-600 font-semibold">✓ พร้อมนำเข้า</span>
                          ) : (
                            <span className="text-red-600 font-semibold text-[10px]" title={item.errorMsg}>
                              ⚠️ ไม่สมบูรณ์
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter className="pt-2 gap-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setImportStep('input')}
                  className="text-slate-600 rounded-xl text-xs h-9 font-sans"
                  disabled={isPending}
                >
                  ย้อนกลับ
                </Button>
                <Button
                  type="button"
                  onClick={handleImportSubmit}
                  disabled={isPending || importPreview.filter(p => !p.isValid).length > 0}
                  className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs h-9 px-4 font-semibold flex items-center justify-center font-sans"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      กำลังนำเข้า...
                    </>
                  ) : (
                    `ยืนยันนำเข้า ${importPreview.length} คน`
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
