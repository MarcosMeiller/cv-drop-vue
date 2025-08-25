import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Building2, 
  FileText, 
  Upload, 
  Users, 
  Eye,
  Github,
  Linkedin,
  Globe
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { userProfile } = useAuth()

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    )
  }

  const isDeveloper = userProfile.role === 'developer'
  const isCompany = userProfile.role === 'company'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Welcome back!
        </h1>
        <p className="text-muted-foreground">
          {isDeveloper && `Good to see you, ${(userProfile as any).full_name || 'Developer'}`}
          {isCompany && `Welcome, ${(userProfile as any).company_name || 'Company'}`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDeveloper && (userProfile as any).cv_url ? 'Complete' : 'Incomplete'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isDeveloper ? 'CV upload status' : 'Company profile'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isDeveloper ? 'Skills' : 'Sector'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDeveloper 
                ? (userProfile as any).skills?.length || 0
                : (userProfile as any).sector || 'Not set'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {isDeveloper ? 'Listed skills' : 'Business sector'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visibility</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Public</div>
            <p className="text-xs text-muted-foreground">Profile visibility</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isDeveloper ? 'Experience' : 'Employees'}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDeveloper 
                ? `${(userProfile as any).years_experience || 0}Y`
                : (userProfile as any).company_size || 'Not set'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {isDeveloper ? 'Years of experience' : 'Company size'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Actions
            </CardTitle>
            <CardDescription>
              Manage your {isDeveloper ? 'developer' : 'company'} profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link to={isDeveloper ? '/developer/profile' : '/company/profile'}>
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
            
            {isDeveloper && (
              <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Upload CV
              </Button>
            )}
            
            {isCompany && (
              <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              List {isDeveloper ? 'Companies' : 'Developers'}
            </CardTitle>
            <CardDescription>
              Discover {isDeveloper ? 'potential employers' : 'talented developers'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link to={isDeveloper ? '/companies' : '/developers'}>
                <Eye className="mr-2 h-4 w-4" />
                List {isDeveloper ? 'Companies' : 'Developers'}
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/public/developers">
                <Globe className="mr-2 h-4 w-4" />
                Public Directory
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Profile Summary</CardTitle>
          <CardDescription>
            Your current profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDeveloper && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(userProfile as any).skills?.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  )) || <span className="text-muted-foreground">No skills added yet</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {(userProfile as any).github_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={(userProfile as any).github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                
                {(userProfile as any).linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={(userProfile as any).linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {isCompany && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Company Details</h4>
                <p className="text-sm text-muted-foreground">
                  {(userProfile as any).description || 'No description provided'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sector:</span> {(userProfile as any).sector}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {(userProfile as any).location || 'Not specified'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}