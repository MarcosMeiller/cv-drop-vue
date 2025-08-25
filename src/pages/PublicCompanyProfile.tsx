import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  Mail,
  ExternalLink
} from 'lucide-react'
import { supabase, CompanyProfile } from '@/lib/supabase'
import { ImageModal } from '@/components/ui/image-modal'

export default function PublicCompanyProfile() {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCompany()
    }
  }, [id])

  const fetchCompany = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true)
        } else {
          console.error('Error fetching company:', error)
        }
      } else {
        setCompany(data)
      }
    } catch (error) {
      console.error('Error fetching company:', error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse">Loading company profile...</div>
        </div>
      </div>
    )
  }

  if (notFound || !company) {
    return <Navigate to="/companies" replace />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="outline" asChild>
        <Link to="/companies">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Link>
      </Button>

      {/* Company Header */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
              <AvatarImage src={company.logo_url} />
              <AvatarFallback className="text-2xl">
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <CardTitle className="text-3xl">
                {company.company_name}
              </CardTitle>
              
              <CardDescription className="text-lg">
                {company.sector}
              </CardDescription>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {company.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {company.location}
                  </div>
                )}
                
                {company.company_size && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {company.company_size} employees
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {company.contact_email}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {company.website_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      Visit Website
                    </a>
                  </Button>
                )}
                
                <Button size="sm">
                  <a href={`mailto:${company.contact_email}`} className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Company
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* About Section */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>About {company.company_name}</CardTitle>
              <CardDescription>
                Learn more about our company and culture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {company.description}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Industry</h4>
                  <p className="text-muted-foreground">{company.sector}</p>
                </div>
                
                {company.company_size && (
                  <div>
                    <h4 className="font-semibold mb-2">Company Size</h4>
                    <p className="text-muted-foreground">{company.company_size} employees</p>
                  </div>
                )}
                
                {company.location && (
                  <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <p className="text-muted-foreground">{company.location}</p>
                  </div>
                )}
                
                {company.website_url && (
                  <div>
                    <h4 className="font-semibold mb-2">Website</h4>
                    <a 
                      href={company.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Actions */}
        <div className="space-y-6">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{company.contact_email}</span>
                </div>
                
                {company.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company.location}</span>
                  </div>
                )}
                
                {company.website_url && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={company.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      {new URL(company.website_url).hostname}
                    </a>
                  </div>
                )}
              </div>
              
              <Button asChild className="w-full">
                <a href={`mailto:${company.contact_email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Company
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Company Stats */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {company.sector}
                </div>
                <div className="text-sm text-muted-foreground">
                  Industry Sector
                </div>
              </div>
              
              {company.company_size && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {company.company_size}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Team Size
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`mailto:${company.contact_email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
              
              {company.website_url && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" />
                    Visit Website
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={company.logo_url}
      />
    </div>
  )
}