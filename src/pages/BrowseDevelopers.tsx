import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Github, 
  Linkedin, 
  Download,
  Filter,
  Eye
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, DeveloperProfilePublic } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function BrowseDevelopers() {
  const [developers, setDevelopers] = useState<DeveloperProfilePublic[]>([])
  const [filteredDevelopers, setFilteredDevelopers] = useState<DeveloperProfilePublic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string>('')
  const [experienceFilter, setExperienceFilter] = useState<string>('')

  useEffect(() => {
    fetchDevelopers()
  }, [])

  useEffect(() => {
    filterDevelopers()
  }, [developers, searchTerm, selectedSkill, experienceFilter])

  const fetchDevelopers = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('developer_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDevelopers(data || [])
    } catch (error) {
      console.error('Error fetching developers:', error)
      setError('Failed to load developers. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const filterDevelopers = () => {
    let filtered = developers

    // Search by name or bio
    if (searchTerm) {
      filtered = filtered.filter(dev =>
        dev.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by skill
    if (selectedSkill) {
      filtered = filtered.filter(dev =>
        dev.skills?.some(skill => 
          skill.toLowerCase().includes(selectedSkill.toLowerCase())
        )
      )
    }

    // Filter by experience
    if (experienceFilter) {
      filtered = filtered.filter(dev => {
        const experience = dev.years_experience || 0
        switch (experienceFilter) {
          case 'junior': return experience <= 2
          case 'mid': return experience >= 3 && experience <= 5
          case 'senior': return experience >= 6
          default: return true
        }
      })
    }

    setFilteredDevelopers(filtered)
  }

  const getAllSkills = () => {
    const allSkills = developers.flatMap(dev => dev.skills || [])
    return [...new Set(allSkills)].sort()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="animate-pulse">Loading developers...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Browse Developers</h1>
          <p className="text-muted-foreground">Find talented developers for your team</p>
        </div>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">⚠️</div>
              <h2 className="text-xl font-semibold">Error loading developers</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchDevelopers} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (developers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Browse Developers</h1>
          <p className="text-muted-foreground">Find talented developers for your team</p>
        </div>
        
        <Card className="shadow-card border-0">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">👨‍💻</div>
              <h2 className="text-xl font-semibold">No developers found</h2>
              <p className="text-muted-foreground">There are currently no developer profiles available.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Browse Developers</h1>
        <p className="text-muted-foreground">
          Discover talented developers and their skills
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search developers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All skills</SelectItem>
                {getAllSkills().map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All levels</SelectItem>
                <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                <SelectItem value="senior">Senior (6+ years)</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setSelectedSkill('')
                setExperienceFilter('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found {filteredDevelopers.length} developers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDevelopers.map((developer) => (
            <Card key={developer.id} className="shadow-card border-0 hover:shadow-glow transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={developer.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {developer.full_name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {developer.full_name || 'Developer'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {developer.years_experience || 0} years experience
                    </CardDescription>
                    {developer.location && (
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {developer.location}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {developer.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {developer.bio}
                  </p>
                )}

                {developer.skills && developer.skills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {developer.skills.slice(0, 6).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {developer.skills.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{developer.skills.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {developer.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={developer.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  {developer.linkedin_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={developer.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  {developer.cv_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={developer.cv_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>

                <Button className="w-full" asChild>
                  <Link to={`/developer/${developer.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDevelopers.length === 0 && (
          <Card className="shadow-card border-0">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No developers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or clearing the filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}