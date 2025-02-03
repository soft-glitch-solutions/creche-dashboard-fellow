import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/types/student';
import { useNavigate } from 'react-router-dom'; // 🔥 Import React Router's useNavigate

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
}

export const StudentList = ({ students, onEdit }: StudentListProps) => {
  const navigate = useNavigate(); // 🔥 Initialize React Router's navigation

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
          <div>Student</div>
          <div>Class</div>
          <div>Parent</div>
          <div>Contact</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {students.map((student) => (
          <div
            key={student.id}
            className="grid grid-cols-6 gap-4 py-3 items-center border-b border-border/50 hover:bg-accent/5 rounded-lg px-2"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-sm font-medium">
                  {student.name.charAt(0)}
                </div>
              </Avatar>
              <span className="font-medium">{student.name}</span>
            </div>
            <div>
              <Badge variant="outline">{student.class || 'Unassigned'}</Badge>
            </div>
            <div>{student.parent_name || 'Not specified'}</div>
            <div>{student.parent_phone_number || 'Not provided'}</div>
            <div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center gap-2">
              {/* 🔥 Updated Eye Button: Navigates to /dashboard/student/{id} */}
              <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(student)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StudentList;