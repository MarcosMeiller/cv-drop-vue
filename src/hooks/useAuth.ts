import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { UserProfile, UserRole } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
      } else if (data) {
        setUserProfile(data as UserProfile)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  const createUserProfile = async (role: UserRole, additionalData: any) => {
    if (!user) return

    try {
      // First create user profile record
      const userProfileData = {
        user_id: user.id,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: userProfileError } = await supabase
        .from('user_profiles')
        .insert([userProfileData])

      if (userProfileError) {
        console.error('Error creating user profile:', userProfileError)
        throw userProfileError
      }

      // Then create specific profile based on role
      let specificProfileData
      if (role === 'developer') {
        specificProfileData = {
          user_id: user.id,
          full_name: additionalData.full_name,
          email: additionalData.email,
          skills: additionalData.skills || [],
          github_url: additionalData.github_url,
          linkedin_url: additionalData.linkedin_url,
          bio: additionalData.bio,
          years_experience: additionalData.years_experience,
          location: additionalData.location,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
          .from('developer_profiles')
          .insert([specificProfileData])
          .select()
          .single()

        if (error) {
          console.error('Error creating developer profile:', error)
          throw error
        }

        // Set both user profile and specific profile
        setUserProfile({ ...userProfileData, id: data.id } as UserProfile)
        return data
      } else if (role === 'company') {
        specificProfileData = {
          user_id: user.id,
          company_name: additionalData.company_name,
          email: additionalData.email,
          sector: additionalData.sector,
          description: additionalData.description,
          contact_email: additionalData.contact_email,
          website_url: additionalData.website_url,
          location: additionalData.location,
          company_size: additionalData.company_size,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
          .from('company_profiles')
          .insert([specificProfileData])
          .select()
          .single()

        if (error) {
          console.error('Error creating company profile:', error)
          throw error
        }

        // Set both user profile and specific profile
        setUserProfile({ ...userProfileData, id: data.id } as UserProfile)
        return data
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  return {
    user,
    session,
    userProfile,
    loading,
    signOut,
    createUserProfile,
  }
}