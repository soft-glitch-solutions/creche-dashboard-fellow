import { User } from "./user";

export type ApplicationNote = {
  id: string;
  application_id: string;
  user_id: string;
  note: string;
  created_at: string;
  user?: User;
};

export type ApplicationLifecycleStage = 
  | "New"
  | "Contact Made"
  | "Documents Requested"
  | "Documents Received"
  | "Interview Scheduled"
  | "Interview Completed"
  | "Offer Made"
  | "Accepted"
  | "Rejected";

export const applicationStageOrder: ApplicationLifecycleStage[] = [
  "New",
  "Contact Made",
  "Documents Requested",
  "Documents Received",
  "Interview Scheduled",
  "Interview Completed",
  "Offer Made",
  "Accepted",
  "Rejected"
];