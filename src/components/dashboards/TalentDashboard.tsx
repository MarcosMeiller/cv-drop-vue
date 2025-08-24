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
  Mail,
  Filter,
  Eye,
  Users
} from 'lucide-react'
import { supabase, DeveloperProfilePublic } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link } from 'react-router-dom'

export default function TalentDashboard() {
  const [developers, setDevelopers] = useState<DeveloperProfilePublic[]>([])
  const [filteredDevelopers, setFilteredDevelopers] = useState<DeveloperProfilePublic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState('all')
  const [experienceFilter, setExperienceFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  useEffect(() => {
    fetchDevelopers()
  }, [])

  useEffect(() => {
    filterDevelopers()
  }, [developers, searchTerm, skillFilter, experienceFilter, locationFilter])

  const fetchDevelopers = async () => {
    try {
      const { data, error } = await supabase
        .from('developer_profiles_public')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDevelopers(data || [])
    } catch (error) {
      console.error('Error fetching developers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDevelopers = () => {
    let filtered = developers

    // Search by name or bio (email removed for privacy)
    if (searchTerm) {
      filtered = filtered.filter(developer =>
        developer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        developer.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by skills
    if (skillFilter && skillFilter !== 'all') {
      filtered = filtered.filter(developer =>
        developer.skills?.some(skill => 
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      )
    }

    // Filter by experience
    if (experienceFilter && experienceFilter !== 'all') {
      filtered = filtered.filter(developer => {
        const experience = developer.years_experience || 0
        switch (experienceFilter) {
          case '0-2': return experience >= 0 && experience <= 2
          case '3-5': return experience >= 3 && experience <= 5
          case '6-10': return experience >= 6 && experience <= 10
          case '10+': return experience > 10
          default: return true
        }
      })
    }

    // Filter by location
    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(developer =>
        developer.location?.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    setFilteredDevelopers(filtered)
  }

  const getAllSkills = () => {
    const allSkills = developers.flatMap(dev => dev.skills || [])
    return [...new Set(allSkills)].sort()
  }

  const getAllLocations = () => {
    const allLocations = developers
      .map(dev => dev.location)
      .filter(Boolean)
    return [...new Set(allLocations)].sort()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse">Cargando talentos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard de Talentos</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Descubre y conecta con desarrolladores talentosos
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar desarrolladores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las skills</SelectItem>
                {getAllSkills().map(skill => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experiencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda experiencia</SelectItem>
                <SelectItem value="0-2">0-2 años</SelectItem>
                <SelectItem value="3-5">3-5 años</SelectItem>
                <SelectItem value="6-10">6-10 años</SelectItem>
                <SelectItem value="10+">10+ años</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                {getAllLocations().map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setSkillFilter('all')
                setExperienceFilter('all')
                setLocationFilter('all')
              }}
              className="sm:col-span-2 lg:col-span-1"
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            {filteredDevelopers.length} desarrolladores encontrados
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDevelopers.map((developer) => (
            <Card key={developer.id} className="shadow-card border-0 hover:shadow-glow transition-shadow">
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <Avatar className="h-12 w-12 md:h-16 md:w-16 flex-shrink-0">
                    <AvatarImage src={developer.avatar_url} />
                    <AvatarFallback className="text-sm md:text-lg">
                      {developer.full_name?.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg truncate">
                      {developer.full_name || 'Developer'}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs md:text-sm truncate">
                      {/* Email removed for privacy */}
                    </CardDescription>
                    <div className="flex items-center gap-1 md:gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                      <Calendar className="h-3 w-3" />
                      <span>{developer.years_experience || 0} años exp.</span>
                      {developer.location && (
                        <>
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-20 md:max-w-none">{developer.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 md:space-y-4">
                {developer.bio && (
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                    {developer.bio}
                  </p>
                )}

                {developer.skills && developer.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {developer.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {developer.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{developer.skills.length - 2} más
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-1 md:gap-2 flex-wrap">
                  {developer.github_url && (
                    <Button variant="outline" size="sm" asChild className="p-2">
                      <a href={developer.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-3 w-3 md:h-4 md:w-4" />
                      </a>
                    </Button>
                  )}
                  
                  {developer.linkedin_url && (
                    <Button variant="outline" size="sm" asChild className="p-2">
                      <a href={developer.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-3 w-3 md:h-4 md:w-4" />
                      </a>
                    </Button>
                  )}

                  {developer.cv_url && (
                    <Button variant="outline" size="sm" asChild className="p-2">
                      <a href={developer.cv_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3 md:h-4 md:w-4" />
                      </a>
                    </Button>
                  )}

                  {/* Email contact button removed for privacy */}
                </div>

                <Button className="w-full text-xs md:text-sm" size="sm" asChild>
                  <Link to={`/developer/${developer.id}`}>
                    <Eye className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                    Ver Perfil Completo
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
              <h3 className="text-lg font-semibold mb-2">No se encontraron desarrolladores</h3>
              <p className="text-muted-foreground">
                Intenta ajustar tus criterios de búsqueda o limpia los filtros
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}