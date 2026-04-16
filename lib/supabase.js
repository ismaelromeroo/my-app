// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qncegxufbkubiswvfdvk.supabase.co'
const supabaseKey = 'sb_publishable_ZBBdB-LWFlAU6a6k9uEREA_uUcGQg_m'

export const supabase = createClient(supabaseUrl, supabaseKey)