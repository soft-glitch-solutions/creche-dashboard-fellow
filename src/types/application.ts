
import { User } from "./user";

export type ApplicationLifecycleStage = 
  | "New"
  | "Contacted"
  | "Documents Pending"
  | "Interview Scheduled"
  | "Offer Made"
  | "Accepted"
  | "Rejected";

export const applicationStageOrder: ApplicationLifecycleStage[] = [
  "New",
  "Contacted",
  "Documents Pending",
  "Interview Scheduled",
  "Offer Made",
  "Accepted",
  "Rejected"
];

export interface ApplicationNote {
  id: string;
  application_id: string;
  user_id: string;
  note: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
    role?: {
      role_name: string;
    };
  };
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  uploaded_at: string;
  uploaded_by: string;
}
