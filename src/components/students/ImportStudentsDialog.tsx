import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface ImportStudentsDialogProps {
  onImport: (students: any[]) => void;
}

export const ImportStudentsDialog = ({ onImport }: ImportStudentsDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel columns to our database fields
        const mappedData = jsonData.map((row: any) => ({
          name: row['Student Name'] || row['Name'] || '',
          class: row['Class'] || '',
          parent_name: row['Parent Name'] || '',
          parent_phone_number: row['Contact'] || row['Phone'] || '',
          parent_email: row['Email'] || '',
          address: row['Address'] || '',
          disabilities_allergies: row['Special Needs'] || row['Allergies'] || '',
        }));

        onImport(mappedData);
        setIsOpen(false);
        toast({
          title: 'Success',
          description: `${mappedData.length} students imported successfully`,
        });
      } catch (error) {
        console.error('Error importing file:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to import students. Please check your file format.',
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import Students
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Students from Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="text-sm text-muted-foreground">
            Upload an Excel file (.xlsx) with the following columns:
            <ul className="list-disc list-inside mt-2">
              <li>Student Name</li>
              <li>Class</li>
              <li>Parent Name</li>
              <li>Contact</li>
              <li>Email</li>
              <li>Address</li>
              <li>Special Needs/Allergies</li>
            </ul>
          </div>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};