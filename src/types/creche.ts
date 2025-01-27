export type CrechePlan = 'free' | 'basic' | 'premium';

export interface CrecheFeatures {
  event_calendar: boolean;
  staff_management: boolean;
  reports_analytics: boolean;
  financial_tracking: boolean;
  attendance_tracking: boolean;
  parent_communication: boolean;
  [key: string]: boolean;
}

export interface Creche {
  id: string;
  name: string;
  address?: string;
  phone_number?: string;
  email?: string;
  capacity?: number;
  operating_hours?: string;
  website_url?: string;
  description?: string;
  registered?: boolean;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
  telegram_number?: string;
  created_at?: string;
  updated_at?: string;
  price?: number;
  header_image?: string;
  website?: string;
  logo?: string;
  latitude?: number;
  longitude?: number;
  monthly_price?: number;
  weekly_price?: number;
  plan: CrechePlan;
  features: CrecheFeatures;
}