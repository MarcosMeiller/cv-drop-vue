import { supabase } from '@/integrations/supabase/client'

export { supabase }

export type UserRole = 'developer' | 'company'

export interface UserProfile {
  id: string
  user_id: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface DeveloperProfile {
  id: string
  user_id: string
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
  created_at: string
  updated_at: string
}

export interface DeveloperProfilePublic {
  id: string
  user_id: string
  full_name: string
  skills: string[]
  github_url?: string
  linkedin_url?: string
  bio?: string
  avatar_url?: string
  cv_url?: string
  years_experience?: number
  location?: string
  created_at: string
  updated_at: string
}

export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  email: string
  sector: string
  description: string
  contact_email: string
  logo_url?: string
  website_url?: string
  location?: string
  company_size?: string
  created_at: string
  updated_at: string
}