import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WeekView from "./WeekView"; // Import the WeekView component
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

const WeekTable = () => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

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

  const handleSaveChanges = (updatedLesson: Lesson) => {
    setLessons((prevLessons) =>
      prevLessons.map((lesson) =>
        lesson.id === updatedLesson.id ? updatedLesson : lesson
      )
    );
    setSelectedLesson(null); // Close modal after saving
  };

  return (
    <div>
      <WeekView lessons={lessons} />
    </div>
  );
};

export default WeekTable;
