// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qncegxufbkubiswvfdvk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuY2VneHVmYmt1Ymlzd3ZmZHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODU2MjcsImV4cCI6MjA5MTg2MTYyN30.M5pdDWedvNQdvETMnqXODO7kLvxncOIJqBHqN4hnM2Q'

export const supabase = createClient(supabaseUrl, supabaseKey)