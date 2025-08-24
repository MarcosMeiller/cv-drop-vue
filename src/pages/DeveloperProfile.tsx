import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileUpload } from '@/components/ui/file-upload'
import { X, Plus, Upload, Download, Github, Linkedin, MapPin, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  github_url: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  location: z.string().optional(),
  years_experience: z.coerce.number().min(0).optional(),
})

export default function DeveloperProfile() {
  const { userProfile, user } = useAuth()
  const { toast } = useToast()
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUploading, setCvUploading] = useState(false)
  const [cvProgress, setCvProgress] = useState(0)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      bio: '',
      github_url: '',
      linkedin_url: '',
      location: '',
      years_experience: 0,
    },
  })

  useEffect(() => {
    if (userProfile && userProfile.role === 'developer') {
      const profile = userProfile as any
      form.reset({
        full_name: profile.full_name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        location: profile.location || '',
        years_experience: profile.years_experience || 0,
      })
      setSkills(profile.skills || [])
    }
  }, [userProfile, form])

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

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

  const handleCvUpload = async (file: File) => {
    if (!user) return

    setCvFile(file)
    setCvUploading(true)
    setCvProgress(0)

    try {
      const fileName = `${user.id}/cv-${Date.now()}.pdf`
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setCvProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      await uploadFile(file, 'cvs', fileName)
      
      clearInterval(progressInterval)
      setCvProgress(100)

      const { data } = supabase.storage
        .from('cvs')
        .getPublicUrl(fileName)

      // Track file in database
      const { error: dbError } = await supabase
        .from('pdf_documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          document_type: 'cv'
        })

      if (dbError) throw dbError

      // Update profile with CV URL
      const { error } = await supabase
        .from('developer_profiles')
        .update({ cv_url: data.publicUrl })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'CV uploaded successfully!',
        description: 'Your CV is now available in your profile.',
      })
    } catch (error) {
      console.error('Error uploading CV:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload CV. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setCvUploading(false)
      setCvFile(null)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    setAvatarFile(file)
    setAvatarUploading(true)

    try {
      const fileName = `${user.id}/avatar-${Date.now()}.jpg`
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

      // Update profile with avatar URL
      const { error } = await supabase
        .from('developer_profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'Avatar uploaded successfully!',
        description: 'Your profile picture has been updated.',
      })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setAvatarUploading(false)
      setAvatarFile(null)
    }
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('developer_profiles')
        .update({
          ...values,
          skills,
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

  if (!userProfile || userProfile.role !== 'developer') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Access denied. Developer profile required.</p>
        </div>
      </div>
    )
  }

  const profile = userProfile as any

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Developer Profile</h1>
        <p className="text-muted-foreground">
          Manage your developer profile and showcase your skills
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Picture & CV Upload */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Profile Picture</CardTitle>
              <CardDescription>Upload your profile photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profile.full_name?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <FileUpload
                onFileSelect={handleAvatarUpload}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                maxSize={5 * 1024 * 1024} // 5MB
                isUploading={avatarUploading}
                className="text-center"
              />
            </CardContent>
          </Card>

          {/* CV Upload */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">CV Document</CardTitle>
              <CardDescription>Upload your CV in PDF format</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={handleCvUpload}
                accept={{ 'application/pdf': ['.pdf'] }}
                maxSize={10 * 1024 * 1024} // 10MB
                isUploading={cvUploading}
                uploadProgress={cvProgress}
                uploadedFile={profile.cv_url ? { name: 'CV.pdf', url: profile.cv_url } : null}
                onRemoveFile={() => {
                  // Handle CV removal if needed
                }}
              />
              
              {profile.cv_url && (
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={profile.cv_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Download Current CV
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>Update your personal and professional details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself and your experience..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormLabel>Skills</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} size="icon" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:bg-destructive/20 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
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
                      name="years_experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="number" 
                                placeholder="0" 
                                className="pl-10" 
                                {...field}
                              />
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
                      name="github_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="https://github.com/..." className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedin_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="https://linkedin.com/..." className="pl-10" {...field} />
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
    </div>
  )
}