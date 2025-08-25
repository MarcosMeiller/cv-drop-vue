import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  Github, 
  Linkedin, 
  MapPin, 
  Calendar, 
  Download,
  Mail
} from 'lucide-react'
import { supabase, DeveloperProfilePublic } from '@/lib/supabase'
import { ImageModal } from '@/components/ui/image-modal'

export default function PublicDeveloperProfile() {
  const { id } = useParams<{ id: string }>()
  const [developer, setDeveloper] = useState<DeveloperProfilePublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id) {
      fetchDeveloper()
    }
  }, [id])

  const fetchDeveloper = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('developer_profiles_public')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true)
        } else {
          console.error('Error fetching developer:', error)
        }
      } else {
        setDeveloper(data)
      }
    } catch (error) {
      console.error('Error fetching developer:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (notFound || !developer) {
    return <Navigate to="/developers" replace />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="outline" asChild>
        <Link to="/developers">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Developers
        </Link>
      </Button>

      {/* Profile Header */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
              <AvatarImage src={developer.avatar_url} />
              <AvatarFallback className="text-2xl">
                {developer.full_name?.charAt(0) || 'D'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <CardTitle className="text-3xl">
                {developer.full_name || 'Developer'}
              </CardTitle>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {developer.years_experience || 0} years experience
                </div>
                
                {developer.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {developer.location}
                  </div>
                )}
                
                {/* Email removed for privacy */}
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {developer.github_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={developer.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                
                {developer.linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={developer.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                
                {developer.cv_url && (
                  <Button size="sm">
                    <a href={developer.cv_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      Download CV
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* About Section */}
        <div className="md:col-span-2 space-y-6">
          {developer.bio && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {developer.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {developer.skills && developer.skills.length > 0 && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Skills & Technologies</CardTitle>
                <CardDescription>
                  Technical skills and expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {developer.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact & Actions */}
        <div className="space-y-6">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Professional Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {developer.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{developer.location}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Connect through social profiles or download CV for contact details
              </p>
            </CardContent>
          </Card>

          {/* Experience Card */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {developer.years_experience || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Years of Experience
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {(developer.cv_url || developer.github_url || developer.linkedin_url) && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {developer.cv_url && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={developer.cv_url} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      View CV
                    </a>
                  </Button>
                )}
                
                {developer.github_url && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={developer.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      View GitHub
                    </a>
                  </Button>
                )}
                
                {developer.linkedin_url && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={developer.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-2 h-4 w-4" />
                      View LinkedIn
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={developer?.avatar_url || ''}
      />
    </div>
  )
}