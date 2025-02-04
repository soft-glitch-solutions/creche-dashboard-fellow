
export interface Student {
  id: string;
  name: string;
  class: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone_number: string | null;
  disabilities_allergies: string | null;
  address: string | null;
  dob: string | null;
  age: number | null;
  creche_id: string | null;
  user_id: string | null;
  parent_whatsapp: string | null;
  fees_owed: number | null;
  fees_paid: number | null;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  uploaded_at: string;
  uploaded_by: string;
}
