'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createLearningArea, updateLearningArea, deleteLearningArea } from '@/lib/actions';

interface LearningArea {
  _rowIndex: number;
  Id: string;
  Name: string;
}

interface AdminLearningAreasProps {
  learningAreas: LearningArea[];
}

export default function AdminLearningAreas({ learningAreas }: AdminLearningAreasProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create state
  const [newName, setNewName] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Edit state
  const [editingItem, setEditingItem] = useState<LearningArea | null>(null);
  const [editName, setEditName] = useState('');

  // Delete state
  const [deletingItem, setDeletingItem] = useState<LearningArea | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return toast.error('กรุณาระบุชื่อกลุ่มสาระฯ');

    startTransition(async () => {
      try {
        await createLearningArea(newName.trim());
        toast.success('เพิ่มกลุ่มสาระการเรียนรู้เรียบร้อย');
        setNewName('');
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
    if (!editName.trim()) return toast.error('กรุณาระบุชื่อกลุ่มสาระฯ');

    startTransition(async () => {
      try {
        await updateLearningArea(editingItem._rowIndex, editingItem.Id, editName.trim());
        toast.success('แก้ไขข้อมูลเรียบร้อย');
        setEditingItem(null);
        setEditName('');
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
        await deleteLearningArea(deletingItem._rowIndex);
        toast.success('ลบกลุ่มสาระการเรียนรู้เรียบร้อย');
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
          <h3 className="font-bold text-slate-800">รายชื่อกลุ่มสาระการเรียนรู้ ({learningAreas.length})</h3>
          <p className="text-xs text-slate-500">จัดการข้อมูลกลุ่มสาระการเรียนรู้ต่าง ๆ ภายในโรงเรียน</p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold h-9 px-4 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          เพิ่มกลุ่มสาระฯ
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {learningAreas.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            ไม่พบข้อมูลกลุ่มสาระการเรียนรู้ กรุณากดปุ่มเพิ่มข้อมูลเพื่อเริ่มต้นระบบครับ
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-16 text-center font-bold text-slate-600">ที่</TableHead>
                <TableHead className="w-32 font-bold text-slate-600">รหัสกลุ่มสาระฯ</TableHead>
                <TableHead className="font-bold text-slate-600">ชื่อกลุ่มสาระการเรียนรู้</TableHead>
                <TableHead className="w-32 text-center font-bold text-slate-600">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {learningAreas.map((area, idx) => (
                <TableRow key={area.Id} className="hover:bg-slate-50/50">
                  <TableCell className="text-center font-medium text-slate-500 text-xs">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-slate-600 text-xs">{area.Id}</TableCell>
                  <TableCell className="font-semibold text-slate-800 text-sm">{area.Name}</TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(area);
                          setEditName(area.Name);
                        }}
                        className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-lg"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingItem(area)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg"
                        title="ลบข้อมูล"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">เพิ่มกลุ่มสาระการเรียนรู้</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="newName" className="text-xs font-semibold text-slate-600">ชื่อกลุ่มสาระฯ</Label>
              <Input
                id="newName"
                placeholder="เช่น คณิตศาสตร์, วิทยาศาสตร์ฯ"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
              />
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
            <DialogTitle className="text-lg font-bold text-slate-800">แก้ไขกลุ่มสาระการเรียนรู้</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="editName" className="text-xs font-semibold text-slate-600">ชื่อกลุ่มสาระฯ</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
              />
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
            <DialogTitle className="text-lg font-bold text-red-600">ยืนยันการลบข้อมูล?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-slate-600 font-light">
            คุณแน่ใจว่าต้องการลบกลุ่มสาระการเรียนรู้ <b>"{deletingItem?.Name}"</b> หรือไม่?
            <p className="text-xs text-red-500 mt-2 font-semibold">
              * คำเตือน: การลบกลุ่มสาระฯ นี้อาจมีผลกับข้อมูลคุณครูในระบบที่สังเกตกลุ่มสาระฯ นี้
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
