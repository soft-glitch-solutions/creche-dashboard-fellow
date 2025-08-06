import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import EditLessonDialog from "./EditLessonDialog"; // Import the EditLessonDialog component

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

const WeekView = () => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00"
  ];

  // Fetch lessons from the database with class details
  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*, creche_classes (id, name, color)") // Fetch class details
        .eq("active", true);

      if (error) throw error;

      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch lessons",
      });
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Get lessons for a specific day and time slot
  const getLessonsForSlot = (day: string, time: string) => {
    return lessons.filter(
      (lesson) => lesson.day_of_week === day && lesson.start_time === time
    );
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lesson deleted successfully.",
      });

      // Update the local state to remove the deleted lesson
      setLessons((prevLessons) =>
        prevLessons.filter((lesson) => lesson.id !== lessonId)
      );
    } catch (error) {
      console.error("Error deleting lesson:", error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete lesson.",
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Weekly Lesson Schedule</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-3 ">Time</th>
            {daysOfWeek.map((day) => (
              <th key={day} className="border p-3 ">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time) => (
            <tr key={time}>
              <td className="border p-3 font-medium">{time}</td>
              {daysOfWeek.map((day) => {
                const lessonsForSlot = getLessonsForSlot(day, time);
                return (
                  <td key={`${day}-${time}`} className="border p-3">
                    {lessonsForSlot.length > 0 ? (
                      lessonsForSlot.map((lesson) => {
                        const classColor = lesson.creche_classes?.color || "#3b82f6";
                        return (
                          <div
                            key={lesson.id}
                            className="group p-2 rounded text-sm font-semibold cursor-pointer relative"
                            style={{ backgroundColor: classColor }}
                            onClick={() => handleLessonClick(lesson)} // Add click handler
                          >
                            {lesson.title}
                            <div className="absolute top-0 right-0 p-1 hidden group-hover:flex space-x-2">
                              {/* Edit Icon */}
                              <Edit
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLessonClick(lesson);
                                }}
                                className=" cursor-pointer"
                              />
                              {/* Delete Icon */}
                              <Trash2
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLesson(lesson.id);
                                }}
                                className=" cursor-pointer"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-400">-</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {selectedLesson && (
        <EditLessonDialog
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)} // Close the modal
          onSave={(updatedLesson) => {
            setLessons((prevLessons) =>
              prevLessons.map((lesson) =>
                lesson.id === updatedLesson.id ? updatedLesson : lesson
              )
            );
            setSelectedLesson(null); // Close modal after saving
          }}
        />
      )}
    </div>
  );
};

export default WeekView;
