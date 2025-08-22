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
import { useLocation } from 'react-router-dom'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
export const AuthPage = () => {
  const { theme } = useTheme()
  const { user, userProfile } = useAuth()
  const location = useLocation()
  const [authMode, setAuthMode] = useState<'sign_in' | 'sign_up' | 'update_password'>('sign_in')
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const isRecovery =
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery')
    if (isRecovery) setAuthMode('update_password')
  }, [location])

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
  // If user is logged in but no profile, show profile setup
  if (user && !userProfile) {
    return <ProfileSetup />
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Code2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Mini Talento Tech
            </h1>
            <p className="text-muted-foreground mt-2">
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
            <Auth
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
              view={authMode}
              providers={['google']}
              redirectTo={window.location.origin}
              onlyThirdPartyProviders={false}
            />
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

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-lg bg-card/50 border">
            <Code2 className="h-6 w-6 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">For Developers</h3>
            <p className="text-xs text-muted-foreground">Showcase your skills</p>
          </div>
          <div className="p-4 rounded-lg bg-card/50 border">
            <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">For Companies</h3>
            <p className="text-xs text-muted-foreground">Find top talent</p>
          </div>
        </div>
      </div>
    </div>
  )
}