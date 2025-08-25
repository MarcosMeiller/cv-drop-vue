import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileUpload } from '@/components/ui/file-upload'
import { Building2, Globe, Mail, MapPin, Users, Upload, Download, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { ImageModal } from '@/components/ui/image-modal'

const schema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  sector: z.string().min(2, 'Sector is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  contact_email: z.string().email('Invalid contact email'),
  website_url: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z.string().optional(),
  company_size: z.string().optional(),
})

export default function CompanyProfile() {
  const { userProfile, user, refreshUserProfile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: '',
      email: '',
      sector: '',
      description: '',
      contact_email: '',
      website_url: '',
      location: '',
      company_size: '',
    },
  })

  useEffect(() => {
    if (userProfile && userProfile.role === 'company') {
      const profile = userProfile as any
      form.reset({
        company_name: profile.company_name || '',
        email: profile.email || '',
        sector: profile.sector || '',
        description: profile.description || '',
        contact_email: profile.contact_email || '',
        website_url: profile.website_url || '',
        location: profile.location || '',
        company_size: profile.company_size || '',
      })
    }
  }, [userProfile, form])

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) throw error
    return data
  }

  const handleLogoUpload = async (file: File) => {
    if (!user) return

    setLogoFile(file)
    setLogoUploading(true)

    try {
      const fileName = `${user.id}/logo-${Date.now()}.jpg`
      await uploadFile(file, 'avatars', fileName)

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Track image in database
      const { error: dbError } = await supabase
        .from('profile_images')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type
        })

      if (dbError) throw dbError

      // Update profile with logo URL
      const { error } = await supabase
        .from('company_profiles')
        .update({ logo_url: data.publicUrl })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'Logo uploaded successfully!',
        description: 'Your company logo has been updated.',
      })
      refreshUserProfile()
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload logo. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLogoUploading(false)
      setLogoFile(null)
    }
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('company_profiles')
        .update({
          ...values,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'Profile updated successfully!',
        description: 'Your changes have been saved.',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!userProfile || userProfile.role !== 'company') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Access denied. Company profile required.</p>
        </div>
      </div>
    )
  }

  const profile = userProfile as any

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground">
          Manage your company profile to attract top developers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Company Logo */}
        <div className="space-y-6">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Company Logo</CardTitle>
              <CardDescription>Upload your company logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
                  <AvatarImage src={profile.logo_url} />
                  <AvatarFallback className="text-lg">
                    <Building2 className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <FileUpload
                onFileSelect={handleLogoUpload}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                maxSize={5 * 1024 * 1024} // 5MB
                isUploading={logoUploading}
                className="text-center"
              />
            </CardContent>
          </Card>
        </div>

        {/* Company Information Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
              <CardDescription>Update your company details and information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Your company name" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="company@example.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <FormControl>
                          <Input placeholder="Technology, Finance, Healthcare..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your company, culture, and values..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="contact@company.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="https://company.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="City, Country" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="1-10, 11-50, 51-200..." className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={profile.logo_url}
      />
    </div>
  )
}