'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions';

interface Category {
  _rowIndex: number;
  Id: string;
  Name: string;
  Description: string;
}

interface AdminCategoriesProps {
  categories: Category[];
}

export default function AdminCategories({ categories }: AdminCategoriesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Edit state
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Delete state
  const [deletingItem, setDeletingItem] = useState<Category | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return toast.error('กรุณาระบุชื่อหมวดหมู่สื่อ');

    startTransition(async () => {
      try {
        await createCategory(newName.trim(), newDesc.trim());
        toast.success('เพิ่มหมวดหมู่เรียบร้อย');
        setNewName('');
        setNewDesc('');
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
    if (!editName.trim()) return toast.error('กรุณาระบุชื่อหมวดหมู่สื่อ');

    startTransition(async () => {
      try {
        await updateCategory(editingItem._rowIndex, editingItem.Id, editName.trim(), editDesc.trim());
        toast.success('แก้ไขข้อมูลเรียบร้อย');
        setEditingItem(null);
        setEditName('');
        setEditDesc('');
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
        await deleteCategory(deletingItem._rowIndex);
        toast.success('ลบหมวดหมู่สื่อเรียบร้อย');
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
          <h3 className="font-bold text-slate-800">รายชื่อหมวดหมู่สื่อและนวัตกรรม ({categories.length})</h3>
          <p className="text-xs text-slate-500">จัดการข้อมูลประเภท สื่อ นวัตกรรม แหล่งเรียนรู้</p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold h-9 px-4 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          เพิ่มหมวดหมู่สื่อ
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            ไม่พบข้อมูลหมวดหมู่สื่อ กรุณากดปุ่มเพิ่มข้อมูลเพื่อเริ่มต้นระบบครับ
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-16 text-center font-bold text-slate-600">ที่</TableHead>
                <TableHead className="w-32 font-bold text-slate-600">รหัสหมวดหมู่</TableHead>
                <TableHead className="font-bold text-slate-600">ชื่อหมวดหมู่</TableHead>
                <TableHead className="font-bold text-slate-600">คำอธิบาย</TableHead>
                <TableHead className="w-32 text-center font-bold text-slate-600">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {categories.map((cat, idx) => (
                <TableRow key={cat.Id} className="hover:bg-slate-50/50">
                  <TableCell className="text-center font-medium text-slate-500 text-xs">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-slate-600 text-xs">{cat.Id}</TableCell>
                  <TableCell className="font-semibold text-slate-800 text-sm">{cat.Name}</TableCell>
                  <TableCell className="text-slate-500 text-xs line-clamp-1 py-4">{cat.Description || '-'}</TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(cat);
                          setEditName(cat.Name);
                          setEditDesc(cat.Description);
                        }}
                        className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-lg"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingItem(cat)}
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
            <DialogTitle className="text-lg font-bold text-slate-800">เพิ่มหมวดหมู่สื่อการสอน</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="newName" className="text-xs font-semibold text-slate-600">ชื่อหมวดหมู่</Label>
              <Input
                id="newName"
                placeholder="เช่น วิดีโอการเรียนการสอน, สไลด์นำเสนอ"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newDesc" className="text-xs font-semibold text-slate-600">คำอธิบายรายละเอียด</Label>
              <Textarea
                id="newDesc"
                placeholder="รายละเอียดปลีกย่อยของหมวดหมู่นี้..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
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
            <DialogTitle className="text-lg font-bold text-slate-800">แก้ไขหมวดหมู่สื่อการสอน</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="editName" className="text-xs font-semibold text-slate-600">ชื่อหมวดหมู่</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border-slate-300 focus-visible:ring-brand-500 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editDesc" className="text-xs font-semibold text-slate-600">คำอธิบายรายละเอียด</Label>
              <Textarea
                id="editDesc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
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
            คุณแน่ใจว่าต้องการลบหมวดหมู่สื่อ <b>"{deletingItem?.Name}"</b> หรือไม่?
            <p className="text-xs text-red-500 mt-2 font-semibold">
              * คำเตือน: สื่อการสอนทั้งหมดที่อยู่ใต้หมวดหมู่นี้ อาจสูญเสียความเชื่อมโยงกับหมวดหมู่หลัก
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
