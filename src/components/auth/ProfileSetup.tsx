import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Code2, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

const developerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional(),
  github_url: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  location: z.string().optional(),
  years_experience: z.number().min(0).optional(),
})

const companySchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  sector: z.string().min(2, 'Sector is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  contact_email: z.string().email('Invalid contact email'),
  website_url: z.string().url('Invalid website URL').optional().or(z.literal('')),
  location: z.string().optional(),
  company_size: z.string().optional(),
})

export const ProfileSetup = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, createUserProfile } = useAuth()
  const { toast } = useToast()

  const developerForm = useForm<z.infer<typeof developerSchema>>({
    resolver: zodResolver(developerSchema),
    defaultValues: {
      email: user?.email || '',
    },
  })

  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      email: user?.email || '',
      contact_email: user?.email || '',
    },
  })

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const onSubmitDeveloper = async (values: z.infer<typeof developerSchema>) => {
    if (!selectedRole) return

    setLoading(true)
    try {
      await createUserProfile(selectedRole, {
        ...values,
        skills,
      })
      toast({
        title: 'Profile created successfully!',
        description: 'Welcome to Mini Talento Tech Platform.',
      })
    } catch (error) {
      toast({
        title: 'Error creating profile',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmitCompany = async (values: z.infer<typeof companySchema>) => {
    if (!selectedRole) return

    setLoading(true)
    try {
      await createUserProfile(selectedRole, values)
      toast({
        title: 'Profile created successfully!',
        description: 'Welcome to Mini Talento Tech Platform.',
      })
    } catch (error) {
      toast({
        title: 'Error creating profile',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card border-0">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl">Choose Your Role</CardTitle>
            <CardDescription>
              Select how you'd like to use the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setSelectedRole('developer')}
              variant="outline"
              className="w-full h-20 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary"
            >
              <Code2 className="h-6 w-6" />
              <div>
                <div className="font-semibold">Developer</div>
                <div className="text-xs text-muted-foreground">Showcase your skills</div>
              </div>
            </Button>

            <Button
              onClick={() => setSelectedRole('company')}
              variant="outline"
              className="w-full h-20 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary"
            >
              <Building2 className="h-6 w-6" />
              <div>
                <div className="font-semibold">Company</div>
                <div className="text-xs text-muted-foreground">Find top talent</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            {selectedRole === 'developer' 
              ? 'Tell us about your development experience'
              : 'Tell us about your company'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedRole === 'developer' ? (
            <Form {...developerForm}>
              <form onSubmit={developerForm.handleSubmit(onSubmitDeveloper)} className="space-y-4">
                <FormField
                  control={developerForm.control}
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
                  control={developerForm.control}
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

                <div className="space-y-2">
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
                  <div className="flex flex-wrap gap-2 mt-2">
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

                <FormField
                  control={developerForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about yourself..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={developerForm.control}
                    name="github_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={developerForm.control}
                    name="linkedin_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedRole(null)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Complete Profile'}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...companyForm}>
              <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-4">
                <FormField
                  control={companyForm.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={companyForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Email</FormLabel>
                      <FormControl>
                        <Input placeholder="company@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={companyForm.control}
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
                  control={companyForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your company..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={companyForm.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedRole(null)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Complete Profile'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}