
export type CrechePlan = 'free' | 'basic' | 'pro';

export interface CrecheFeatures {
  event_calendar: boolean;
  staff_management: boolean;
  reports_analytics: boolean;
  financial_tracking: boolean;
  attendance_tracking: boolean;
  parent_communication: boolean;
}

export interface CrecheServices {
  full_time_care: boolean;
  part_time_care: boolean;
  after_school_care: boolean;
  meals_provided: boolean;
  transportation: boolean;
  special_education: boolean;
}

export interface CrecheFacilities {
  teachers: boolean;
  classrooms: boolean;
  toilets: boolean;
  playground: boolean;
  kitchen: boolean;
  parking: boolean;
  teachers_count: number;
  classrooms_count: number;
  toilets_count: number;
  playground_count: number;
  kitchen_count: number;
  parking_count: number;
}

export interface Creche {
  id: string;
  name: string;
  address: string | null;
  phone_number: string | null;
  email: string | null;
  capacity: number | null;
  operating_hours: string | null;
  website_url: string | null;
  description: string | null;
  registered: boolean | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  whatsapp_number: string | null;
  telegram_number: string | null;
  created_at: string | null;
  updated_at: string | null;
  price: number | null;
  header_image: string | null;
  website: string | null;
  logo: string | null;
  latitude: number | null;
  longitude: number | null;
  monthly_price: number | null;
  weekly_price: number | null;
  plan: CrechePlan;
  features: CrecheFeatures;
  
  // Banking details
  bank_name?: string | null;
  account_holder?: string | null;
  account_number?: string | null;
  branch_code?: string | null;
  account_type?: string | null;
  
  // Additional properties
  services: CrecheServices;
  facilities: CrecheFacilities;
}
