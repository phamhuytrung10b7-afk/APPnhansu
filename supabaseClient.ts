import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nvxsakijhtaqbtfgwmpj.supabase.co';
const supabaseAnonKey = 'sb_publishable_EqsoIU1a5F6jxnBbK1XCKQ_MCymIh93';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
