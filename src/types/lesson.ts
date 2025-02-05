
export interface LessonType {
  id: string;
  name: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  title: string;
  class_id: string;
  lesson_type: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
}
