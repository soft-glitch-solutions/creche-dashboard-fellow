export type CrechePlan = "free" | "basic" | "pro";

export interface CrecheFeatures {
  staff_management: boolean;
  attendance_tracking: boolean;
  parent_communication: boolean;
  event_calendar: boolean;
  financial_tracking: boolean;
  reports_analytics: boolean;
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
}