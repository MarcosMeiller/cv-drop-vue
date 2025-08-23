import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  MapPin, 
  Building2, 
  Globe,
  Mail,
  Users,
  Filter,
  Eye
} from 'lucide-react'
import { supabase, CompanyProfile } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link } from 'react-router-dom'

export default function BrowseCompanies() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [sizeFilter, setSizeFilter] = useState<string>('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    filterCompanies()
  }, [companies, searchTerm, selectedSector, sizeFilter])

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCompanies = () => {
    let filtered = companies

    // Search by name, sector, or description
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by sector
    if (selectedSector) {
      filtered = filtered.filter(company =>
        company.sector?.toLowerCase().includes(selectedSector.toLowerCase())
      )
    }

    // Filter by company size
    if (sizeFilter) {
      filtered = filtered.filter(company =>
        company.company_size?.toLowerCase().includes(sizeFilter.toLowerCase())
      )
    }

    setFilteredCompanies(filtered)
  }

  const getAllSectors = () => {
    const allSectors = companies.map(company => company.sector).filter(Boolean)
    return [...new Set(allSectors)].sort()
  }

  const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse">Loading companies...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Browse Companies</h1>
        <p className="text-muted-foreground">
          Discover companies and potential opportunities
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
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sectors</SelectItem>
                {getAllSectors().map(sector => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sizes</SelectItem>
                {companySizes.map(size => (
                  <SelectItem key={size} value={size}>
                    {size} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setSelectedSector('')
                setSizeFilter('')
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
            Found {filteredCompanies.length} companies
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="shadow-card border-0 hover:shadow-glow transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={company.logo_url} />
                    <AvatarFallback className="text-lg">
                      <Building2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {company.company_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {company.sector}
                    </CardDescription>
                    {company.location && (
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {company.location}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {company.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {company.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {company.company_size && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{company.company_size}</span>
                    </div>
                  )}
                  {company.website_url && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <a 
                        href={company.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline truncate"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {company.website_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  {company.contact_email && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${company.contact_email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>

                <Button className="w-full" asChild>
                  <Link to={`/company/${company.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Company
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <Card className="shadow-card border-0">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No companies found</h3>
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