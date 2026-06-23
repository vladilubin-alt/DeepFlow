import { createClient } from '@supabase/supabase-js';
import Config from 'react-native-config';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = Config.SUPABASE_URL;
const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
