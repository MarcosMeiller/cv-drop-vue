import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wzfxdckkhopjrxxnrqkq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZnhkY2traG9wanJ4eG5ycWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NjI2MTksImV4cCI6MjA1MDQzODYxOX0.SfZnKInhUnQ6i80bJZ6Q9Jf5Nap26uLJMXzJ5VGvhPE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'developer' | 'company'

export interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface DeveloperProfile extends UserProfile {
  full_name: string
  email: string
  skills: string[]
  github_url?: string
  linkedin_url?: string
  bio?: string
  avatar_url?: string
  cv_url?: string
  years_experience?: number
  location?: string
}

export interface CompanyProfile extends UserProfile {
  company_name: string
  email: string
  sector: string
  description: string
  contact_email: string
  logo_url?: string
  website_url?: string
  location?: string
  company_size?: string
}