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
import { X, Plus, Code2, Building2, Upload, FileText, Edit, Eye } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { DeveloperProfile, CompanyProfile, UserRole, supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import TalentDashboard from '@/components/dashboards/TalentDashboard'

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
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUploading, setCvUploading] = useState(false)
  const [existingProfile, setExistingProfile] = useState<DeveloperProfile | CompanyProfile | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
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

  useEffect(() => {
    if (user && selectedRole) {
      checkExistingProfile()
    }
  }, [user, selectedRole])

  const checkExistingProfile = async () => {
    if (!user) return

    try {
      const tableName = selectedRole === 'developer' ? 'developer_profiles' : 'company_profiles'
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data && !error) {
        setExistingProfile(data)
        
        // Pre-fill form with existing data
        if (selectedRole === 'developer') {
          const devProfile = data as DeveloperProfile
          developerForm.reset({
            full_name: devProfile.full_name || '',
            email: devProfile.email || '',
            bio: devProfile.bio || '',
            github_url: devProfile.github_url || '',
            linkedin_url: devProfile.linkedin_url || '',
            years_experience: devProfile.years_experience || undefined,
            location: devProfile.location || '',
          })
          setSkills(devProfile.skills || [])
        } else {
          const compProfile = data as CompanyProfile
          companyForm.reset({
            company_name: compProfile.company_name || '',
            email: compProfile.email || '',
            sector: compProfile.sector || '',
            description: compProfile.description || '',
            contact_email: compProfile.contact_email || '',
            website_url: compProfile.website_url || '',
            location: compProfile.location || '',
            company_size: compProfile.company_size || '',
          })
        }
      }
    } catch (error) {
      console.error('Error checking existing profile:', error)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleCvUpload = async (file: File) => {
    if (!user) return

    setCvUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/cv.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('cvs')
        .getPublicUrl(fileName)

      // Update developer profile with CV URL
      const { error: updateError } = await supabase
        .from('developer_profiles')
        .update({ cv_url: data.publicUrl })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      toast({
        title: 'CV subido exitosamente!',
        description: 'Tu CV ha sido actualizado.',
      })

      // Update existing profile state
      if (existingProfile) {
        setExistingProfile({ ...existingProfile, cv_url: data.publicUrl })
      }

      setCvFile(null)
    } catch (error) {
      console.error('Error uploading CV:', error)
      toast({
        title: 'Error al subir CV',
        description: 'Por favor intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setCvUploading(false)
    }
  }

  const onSubmitDeveloper = async (values: z.infer<typeof developerSchema>) => {
    if (!selectedRole) return

    setLoading(true)
    try {
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('developer_profiles')
          .update({
            ...values,
            skills,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user?.id)

        if (error) throw error

        toast({
          title: 'Perfil actualizado exitosamente!',
          description: 'Tus cambios han sido guardados.',
        })
        setExistingProfile({ ...existingProfile, ...values, skills })
        setShowEditForm(false)
      } else {
        // Create new profile
        await createUserProfile(selectedRole, {
          ...values,
          skills,
        })
        toast({
          title: 'Perfil creado exitosamente!',
          description: 'Bienvenido a Mini Talento Tech Platform.',
        })
      }
    } catch (error) {
      console.error('Error with profile:', error)
      toast({
        title: 'Error con el perfil',
        description: 'Por favor intenta de nuevo.',
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
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('company_profiles')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user?.id)

        if (error) throw error

        toast({
          title: 'Perfil actualizado exitosamente!',
          description: 'Tus cambios han sido guardados.',
        })
        setExistingProfile({ ...existingProfile, ...values })
        setShowEditForm(false)
      } else {
        // Create new profile
        await createUserProfile(selectedRole, values)
        toast({
          title: 'Perfil creado exitosamente!',
          description: 'Bienvenido a Mini Talento Tech Platform.',
        })
      }
    } catch (error) {
      console.error('Error with profile:', error)
      toast({
        title: 'Error con el perfil',
        description: 'Por favor intenta de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Show talent dashboard for companies with existing profiles
  if (selectedRole === 'company' && existingProfile && !showEditForm) {
    return <TalentDashboard />
  }

  // Show existing profile for developers
  if (selectedRole === 'developer' && existingProfile && !showEditForm) {
    const devProfile = existingProfile as DeveloperProfile
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-sm md:max-w-2xl shadow-card border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              Tu Perfil de Developer
              <Button onClick={() => setShowEditForm(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm md:text-base">Información Personal</h3>
                <p className="text-xs md:text-sm"><strong>Nombre:</strong> {devProfile.full_name}</p>
                <p className="text-xs md:text-sm truncate"><strong>Email:</strong> {devProfile.email}</p>
                {devProfile.location && (
                  <p className="text-xs md:text-sm"><strong>Ubicación:</strong> {devProfile.location}</p>
                )}
                {devProfile.years_experience && (
                  <p className="text-xs md:text-sm"><strong>Experiencia:</strong> {devProfile.years_experience} años</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-sm md:text-base">Enlaces</h3>
                {devProfile.github_url && (
                  <p className="text-xs md:text-sm">
                    <strong>GitHub:</strong> 
                    <a href={devProfile.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1 break-all">
                      Ver perfil
                    </a>
                  </p>
                )}
                {devProfile.linkedin_url && (
                  <p className="text-xs md:text-sm">
                    <strong>LinkedIn:</strong> 
                    <a href={devProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1 break-all">
                      Ver perfil
                    </a>
                  </p>
                )}
              </div>
            </div>

            {devProfile.bio && (
              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground">{devProfile.bio}</p>
              </div>
            )}

            {devProfile.skills && devProfile.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {devProfile.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold">Curriculum Vitae</h3>
              {devProfile.cv_url ? (
                <div className="flex items-center gap-4">
                  <Button variant="outline" asChild>
                    <a href={devProfile.cv_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver CV actual
                    </a>
                  </Button>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setCvFile(file)
                        }
                      }}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label htmlFor="cv-upload">
                      <Button variant="outline" asChild>
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Actualizar CV
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No has subido tu CV aún</p>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setCvFile(file)
                        }
                      }}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label htmlFor="cv-upload">
                      <Button variant="outline" asChild>
                        <span className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Subir CV
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              )}

              {cvFile && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Archivo seleccionado: {cvFile.name}</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleCvUpload(cvFile)}
                      disabled={cvUploading}
                      size="sm"
                    >
                      {cvUploading ? 'Subiendo...' : 'Confirmar subida'}
                    </Button>
                    <Button 
                      onClick={() => setCvFile(null)}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => setSelectedRole(null)}
              variant="outline"
              className="w-full"
            >
              Cambiar rol
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-sm md:max-w-md shadow-card border-0">
          <CardHeader className="text-center space-y-3 md:space-y-4">
            <CardTitle className="text-xl md:text-2xl">Elige tu Rol</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Selecciona cómo quieres usar la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <Button
              onClick={() => setSelectedRole('developer')}
              variant="outline"
              className="w-full h-16 md:h-20 flex flex-col gap-1 md:gap-2 hover:bg-primary/5 hover:border-primary"
            >
              <Code2 className="h-5 w-5 md:h-6 md:w-6" />
              <div>
                <div className="font-semibold text-sm md:text-base">Developer</div>
                <div className="text-xs text-muted-foreground">Muestra tus habilidades</div>
              </div>
            </Button>

            <Button
              onClick={() => setSelectedRole('company')}
              variant="outline"
              className="w-full h-16 md:h-20 flex flex-col gap-1 md:gap-2 hover:bg-primary/5 hover:border-primary"
            >
              <Building2 className="h-5 w-5 md:h-6 md:w-6" />
              <div>
                <div className="font-semibold text-sm md:text-base">Company</div>
                <div className="text-xs text-muted-foreground">Encuentra talento</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-sm md:max-w-lg shadow-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-2xl">
            {existingProfile ? 'Editar Perfil' : 'Completa tu Perfil'}
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            {selectedRole === 'developer' 
              ? 'Cuéntanos sobre tu experiencia como desarrollador'
              : 'Cuéntanos sobre tu empresa'
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
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre completo" {...field} />
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
                        <Input placeholder="tu.email@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Skills</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar una skill"
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
                      <FormLabel>Bio (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Cuéntanos sobre ti..." {...field} />
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
                        <FormLabel>GitHub URL (Opcional)</FormLabel>
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
                        <FormLabel>LinkedIn URL (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={developerForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ciudad, País" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={developerForm.control}
                  name="years_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Años de Experiencia (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (existingProfile) {
                        setShowEditForm(false)
                      } else {
                        setSelectedRole(null)
                      }
                    }}
                    className="flex-1"
                  >
                    {existingProfile ? 'Cancelar' : 'Atrás'}
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Guardando...' : existingProfile ? 'Guardar cambios' : 'Completar perfil'}
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
                      <FormLabel>Nombre de la Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de tu empresa" {...field} />
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
                      <FormLabel>Email de la Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="empresa@ejemplo.com" {...field} />
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
                        <Input placeholder="Tecnología, Finanzas, Salud..." {...field} />
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
                      <FormLabel>Descripción de la Empresa</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe tu empresa..." {...field} />
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
                      <FormLabel>Email de Contacto</FormLabel>
                      <FormControl>
                        <Input placeholder="contacto@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (existingProfile) {
                        setShowEditForm(false)
                      } else {
                        setSelectedRole(null)
                      }
                    }}
                    className="flex-1"
                  >
                    {existingProfile ? 'Cancelar' : 'Atrás'}
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Guardando...' : existingProfile ? 'Guardar cambios' : 'Completar perfil'}
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

export default ProfileSetup