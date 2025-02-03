import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Student } from '@/types/student';

interface EditStudentDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (student: Partial<Student>) => void;
}

export const EditStudentDialog = ({
  student,
  open,
  onOpenChange,
  onSave,
}: EditStudentDialogProps) => {
  const [formData, setFormData] = useState<Partial<Student>>({});

  useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add Student'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Student Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="class">Class</Label>
            <Input
              id="class"
              value={formData.class || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, class: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent_name">Parent Name</Label>
            <Input
              id="parent_name"
              value={formData.parent_name || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, parent_name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent_phone_number">Contact Number</Label>
            <Input
              id="parent_phone_number"
              value={formData.parent_phone_number || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, parent_phone_number: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent_email">Email</Label>
            <Input
              id="parent_email"
              type="email"
              value={formData.parent_email || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, parent_email: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="disabilities_allergies">Special Needs/Allergies</Label>
            <Input
              id="disabilities_allergies"
              value={formData.disabilities_allergies || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, disabilities_allergies: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};