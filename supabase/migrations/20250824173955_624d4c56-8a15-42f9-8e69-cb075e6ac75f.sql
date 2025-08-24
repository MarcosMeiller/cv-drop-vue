-- Drop the previous view and recreate it as a regular view (not security definer)
DROP VIEW IF EXISTS public.developer_profiles_public;

-- Create a regular view for developer profiles without sensitive information
CREATE VIEW public.developer_profiles_public AS
SELECT 
    id,
    user_id,
    full_name,
    skills,
    github_url,
    linkedin_url,
    bio,
    avatar_url,
    cv_url,
    years_experience,
    location,
    created_at,
    updated_at
FROM public.developer_profiles;

-- Enable RLS on the view
ALTER VIEW public.developer_profiles_public SET (security_barrier = true);

-- Grant access to the public view
GRANT SELECT ON public.developer_profiles_public TO anon, authenticated;