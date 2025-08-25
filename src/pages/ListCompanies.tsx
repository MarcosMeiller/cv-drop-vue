import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Building2, 
  RefreshCw,
  Eye,
  Home,
  Users
} from 'lucide-react'
import { supabase, CompanyProfile } from '@/lib/supabase'
import { Link } from 'react-router-dom'

export default function ListCompanies() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching companies:', error)
        return
      }

      setCompanies(data || [])
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company =>
    company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground">Companies</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">List of all companies</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/developers">
              <Users className="h-4 w-4 mr-2" />
              View Developers
            </Link>
          </Button>
          <Button onClick={fetchCompanies} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Companies ({filteredCompanies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Company</th>
                    <th className="text-left p-3 font-medium">Sector</th>
                    <th className="text-left p-3 font-medium">Contact</th>
                    <th className="text-left p-3 font-medium">Location</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{company.company_name}</div>
                          {company.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {company.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-secondary rounded-full text-xs">
                          {company.sector || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{company.contact_email || company.email}</div>
                          {company.website_url && (
                            <a 
                              href={company.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs"
                            >
                              Website
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {company.location || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button size="sm" asChild>
                          <Link to={`/company/${company.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {companies.length === 0 ? 'No companies available' : 'No companies found'}
              </h3>
              <p className="text-muted-foreground">
                {companies.length === 0 
                  ? 'There are currently no companies in the database.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
