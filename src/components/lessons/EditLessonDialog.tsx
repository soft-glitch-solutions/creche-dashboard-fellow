import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  class_id: string;
  lesson_type: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  creche_classes?: { id: string; name: string; color: string };
}

interface EditLessonDialogProps {
  lesson: Lesson;
  onClose: () => void;
  onSave: (updatedLesson: Lesson) => void;
}

const EditLessonDialog: React.FC<EditLessonDialogProps> = ({ lesson, onClose, onSave }) => {
  const { toast } = useToast();
  const [newTitle, setNewTitle] = useState<string>(lesson.title);
  const [newLessonType, setNewLessonType] = useState<string>(lesson.lesson_type);
  const [newClassId, setNewClassId] = useState<string>(lesson.class_id);
  const [lessonTypes, setLessonTypes] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchLessonTypesAndClasses = async () => {
      try {
        // Fetch lesson types
        const { data: lessonTypeData, error: lessonTypeError } = await supabase
          .from("lesson_types")
          .select("id, name");
        if (lessonTypeError) throw lessonTypeError;
        setLessonTypes(lessonTypeData || []);

        // Fetch classes
        const { data: classData, error: classError } = await supabase
          .from("creche_classes")
          .select("id, name");
        if (classError) throw classError;
        setClasses(classData || []);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch lesson types and classes",
        });
      }
    };

    fetchLessonTypesAndClasses();
  }, [lesson.id, toast]);

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from("lessons")
        .update({ title: newTitle, lesson_type: newLessonType, class_id: newClassId })
        .eq("id", lesson.id);

      if (error) throw error;

      toast({
        variant: "success",
        title: "Success",
        description: "Lesson updated successfully.",
      });

      // Notify parent component to update the lesson state
      onSave({ ...lesson, title: newTitle, lesson_type: newLessonType, class_id: newClassId });
    } catch (error) {
      console.error("Error updating lesson:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update lesson.",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Edit Lesson</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Lesson Title</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Lesson Type</label>
          <select
            className="border p-2 w-full"
            value={newLessonType}
            onChange={(e) => setNewLessonType(e.target.value)}
          >
            {lessonTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Class</label>
          <select
            className="border p-2 w-full"
            value={newClassId}
            onChange={(e) => setNewClassId(e.target.value)}
          >
            {classes.map((classOption) => (
              <option key={classOption.id} value={classOption.id}>
                {classOption.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded text-sm"
            onClick={onClose} // Close modal without saving
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLessonDialog;
