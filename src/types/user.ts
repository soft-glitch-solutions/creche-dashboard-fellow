export interface UserRole {
  id: string;
  role_name: string;
}

export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  id_number?: string;
  profile_picture_url?: string;
  bio?: string;
  role: UserRole;
  latitude?: string;
  longitude?: string;
  suburb?: string;
  price?: string;
}