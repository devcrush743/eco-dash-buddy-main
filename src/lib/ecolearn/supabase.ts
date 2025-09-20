import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      bins: {
        Row: {
          id: string;
          qr_code: string;
          type: 'dry' | 'wet' | 'hazardous';
          location_lat: number;
          location_lng: number;
          location_address: string;
          fill_level: number;
          last_emptied: string;
          status: 'active' | 'maintenance' | 'full' | 'damaged';
          sensor_id: string;
          capacity: number;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          qr_code: string;
          type: 'dry' | 'wet' | 'hazardous';
          location_lat: number;
          location_lng: number;
          location_address: string;
          fill_level?: number;
          last_emptied?: string;
          status?: 'active' | 'maintenance' | 'full' | 'damaged';
          sensor_id: string;
          capacity: number;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          qr_code?: string;
          type?: 'dry' | 'wet' | 'hazardous';
          location_lat?: number;
          location_lng?: number;
          location_address?: string;
          fill_level?: number;
          last_emptied?: string;
          status?: 'active' | 'maintenance' | 'full' | 'damaged';
          sensor_id?: string;
          capacity?: number;
          last_updated?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          plate_number: string;
          type: 'compactor' | 'tipper' | 'hazmat';
          current_location_lat: number;
          current_location_lng: number;
          status: 'active' | 'maintenance' | 'idle' | 'collecting';
          driver: string;
          route: string | null;
          capacity: number;
          current_load: number;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          plate_number: string;
          type: 'compactor' | 'tipper' | 'hazmat';
          current_location_lat: number;
          current_location_lng: number;
          status?: 'active' | 'maintenance' | 'idle' | 'collecting';
          driver: string;
          route?: string | null;
          capacity: number;
          current_load?: number;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          plate_number?: string;
          type?: 'compactor' | 'tipper' | 'hazmat';
          current_location_lat?: number;
          current_location_lng?: number;
          status?: 'active' | 'maintenance' | 'idle' | 'collecting';
          driver?: string;
          route?: string | null;
          capacity?: number;
          current_load?: number;
          last_updated?: string;
        };
      };
      green_champions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          role: 'coordinator' | 'inspector' | 'educator' | 'reporter';
          committee: string | null;
          ward: string;
          zone: string;
          status: 'active' | 'inactive' | 'suspended';
          join_date: string;
          term_end_date: string;
          total_activities: number;
          completed_tasks: number;
          pending_tasks: number;
          compliance_score: number;
          last_active: string;
          certification_level: 'bronze' | 'silver' | 'gold' | 'platinum';
          specializations: string[];
          languages: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          role: 'coordinator' | 'inspector' | 'educator' | 'reporter';
          committee?: string | null;
          ward: string;
          zone: string;
          status?: 'active' | 'inactive' | 'suspended';
          join_date?: string;
          term_end_date?: string;
          total_activities?: number;
          completed_tasks?: number;
          pending_tasks?: number;
          compliance_score?: number;
          last_active?: string;
          certification_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
          specializations?: string[];
          languages?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          role?: 'coordinator' | 'inspector' | 'educator' | 'reporter';
          committee?: string | null;
          ward?: string;
          zone?: string;
          status?: 'active' | 'inactive' | 'suspended';
          join_date?: string;
          term_end_date?: string;
          total_activities?: number;
          completed_tasks?: number;
          pending_tasks?: number;
          compliance_score?: number;
          last_active?: string;
          certification_level?: 'bronze' | 'silver' | 'gold' | 'platinum';
          specializations?: string[];
          languages?: string[];
        };
      };
    };
  };
}