import { User } from "./user";

export type ApplicationLifecycleStage = 
  | "New"
  | "Contacted"
  | "Documents Pending"
  | "Documents Received"
  | "Interview Scheduled"
  | "Interview Completed"
  | "Offer Made"
  | "Accepted"
  | "Rejected";

export const applicationStageOrder: ApplicationLifecycleStage[] = [
  "New",
  "Contacted",
  "Documents Pending",
  "Documents Received",
  "Interview Scheduled",
  "Interview Completed",
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
  user?: User;
}