export interface Role {
  id: string;
  role_name: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  id_number: string | null;
  profile_picture_url: string | null;
  bio: string | null;
  role: Role;
  latitude: string | null;
  longitude: string | null;
  suburb: string | null;
  price: string | null;
}