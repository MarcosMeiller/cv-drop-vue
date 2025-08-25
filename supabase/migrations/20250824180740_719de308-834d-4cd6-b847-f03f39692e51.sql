-- Create table for profile images metadata
CREATE TABLE public.profile_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  bucket_name TEXT NOT NULL DEFAULT 'avatars',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for PDF documents metadata
CREATE TABLE public.pdf_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT DEFAULT 'application/pdf',
  bucket_name TEXT NOT NULL DEFAULT 'cvs',
  document_type TEXT DEFAULT 'cv', -- cv, resume, portfolio, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a public view for company profiles without sensitive information
CREATE OR REPLACE VIEW public.company_profiles_public AS
SELECT 
    id,
    company_name,
    sector,
    description,
    logo_url,
    website_url,
    location,
    company_size,
    created_at,
    updated_at
FROM public.company_profiles;

-- Grant access to the public view
GRANT SELECT ON public.company_profiles_public TO anon, authenticated;

-- Enable Row Level Security
ALTER TABLE public.profile_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_images
CREATE POLICY "Users can view their own profile images" 
ON public.profile_images 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile images" 
ON public.profile_images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile images" 
ON public.profile_images 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile images" 
ON public.profile_images 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for pdf_documents
CREATE POLICY "Users can view their own pdf documents" 
ON public.pdf_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pdf documents" 
ON public.pdf_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pdf documents" 
ON public.pdf_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pdf documents" 
ON public.pdf_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profile_images_updated_at
BEFORE UPDATE ON public.profile_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pdf_documents_updated_at
BEFORE UPDATE ON public.pdf_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();