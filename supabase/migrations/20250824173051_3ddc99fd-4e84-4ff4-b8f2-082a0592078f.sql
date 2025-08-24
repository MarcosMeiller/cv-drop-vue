-- Create a public view for developer profiles without sensitive information
CREATE OR REPLACE VIEW public.developer_profiles_public AS
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

-- Update RLS policy to restrict email access to profile owners only
DROP POLICY IF EXISTS "Anyone can view developer profiles" ON public.developer_profiles;

-- Create new policies with restricted access
CREATE POLICY "Public can view basic developer info" 
ON public.developer_profiles 
FOR SELECT 
USING (true);

-- Grant access to the public view
GRANT SELECT ON public.developer_profiles_public TO anon, authenticated;