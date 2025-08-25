import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { ProfileSetup } from './ProfileSetup'
import { useAuth } from '@/hooks/useAuth'
import { Code2, Building2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

// Registration form schema
const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const AuthPage = () => {
  const { theme } = useTheme()
  const { user, userProfile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [authMode, setAuthMode] = useState<'sign_in' | 'sign_up' | 'update_password'>('sign_in')
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [registrationLoading, setRegistrationLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const { toast } = useToast()

  const registrationForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    const isRecovery =
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery')
    if (isRecovery) setAuthMode('update_password')
  }, [location])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Redirect only after explicit sign-in
        navigate('/dashboard', { replace: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  const handleRegistration = async (values: z.infer<typeof registrationSchema>) => {
    setRegistrationLoading(true)
    try {
      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            full_name: `${values.firstName} ${values.lastName}`
          }
        }
      })

      if (error) throw error

      setRegistrationSuccess(true)
      toast({
        title: 'Account created successfully!',
        description: 'Redirecting to profile setup...',
      })

      // Show success state for better UX
      setTimeout(() => {
        setRegistrationSuccess(false)
        // Switch to sign in mode
        setAuthMode('sign_in')
        registrationForm.reset()
      }, 3000)
      
    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        title: 'Registration failed',
        description: error.message || 'Could not create account. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setRegistrationLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setResetLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}`,
      })
      if (error) throw error
      toast({ title: 'Email sent', description: 'Check your inbox for the reset link.' })
      setResetOpen(false)
    } catch (err) {
      console.error('Error sending reset email:', err)
      toast({ title: 'Reset failed', description: 'Could not send reset email.', variant: 'destructive' })
    } finally {
      setResetLoading(false)
    }
  }

  // If user is logged in but no profile, show profile setup
  if (user && !userProfile) {
    return <ProfileSetup />
  }

  return (
    <div className="h-screen bg-gradient-subtle flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-md space-y-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Code2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Mini Talento Tech
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm">
              Connect developers with companies
            </p>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex justify-center">
          <ThemeToggle />
        </div>

        {/* Auth Card */}
        <Card className="shadow-card border-0">
          <CardHeader className="space-y-4">
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sign_in">Sign In</TabsTrigger>
                <TabsTrigger value="sign_up">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl text-center">
                {authMode === 'sign_in' ? 'Welcome back' : 'Create account'}
              </CardTitle>
              <CardDescription className="text-center">
                {authMode === 'sign_in' 
                  ? 'Sign in to your account to continue' 
                  : 'Join the talent platform today'
                }
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            {authMode === 'sign_in' ? (
              <Auth
                providers={[]}
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: 'hsl(221 83% 53%)',
                        brandAccent: 'hsl(221 83% 65%)',
                      },
                    },
                  },
                  className: {
                    container: 'auth-container',
                    button: 'auth-button',
                    input: 'auth-input',
                  },
                }}
                view="sign_in"
                redirectTo={window.location.origin}
              />
            ) : registrationSuccess ? (
              <div className="text-center space-y-4 py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-green-800">Account Created Successfully!</h3>
                  <p className="text-green-600">Redirecting to profile setup...</p>
                </div>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : (
              <Form {...registrationForm}>
                <form onSubmit={registrationForm.handleSubmit(handleRegistration)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={registrationForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registrationForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registrationForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registrationForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registrationForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registrationLoading}
                  >
                    {registrationLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating account...
                      </div>
                    ) : (
                      'Create account'
                    )}
                  </Button>
                </form>
              </Form>
            )}
            
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setResetOpen(true)}
              >
                Forgot password?
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset password</DialogTitle>
              <DialogDescription>Enter your email to receive a reset link.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setResetOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={resetLoading}>
                  {resetLoading ? 'Sending...' : 'Send reset link'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-lg bg-card/50 border">
            <Code2 className="h-5 w-5 mx-auto mb-1 text-primary" />
            <h3 className="font-semibold text-xs sm:text-sm">For Developers</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Showcase your skills</p>
          </div>
          <div className="p-3 rounded-lg bg-card/50 border">
            <Building2 className="h-5 w-5 mx-auto mb-1 text-primary" />
            <h3 className="font-semibold text-xs sm:text-sm">For Companies</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Find top talent</p>
          </div>
        </div>
      </div>
    </div>
  )
}
