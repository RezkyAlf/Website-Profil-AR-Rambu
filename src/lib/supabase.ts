import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ApkRelease = {
  id: string;
  version: string;
  file_name: string;
  file_url: string;
  file_size: number;
  is_active: boolean;
  created_at: string;
};

export type MarkerRecord = {
  id: string;
  name: string;
  category: string;
  image_path: string | null;
  created_at: string;
};
