import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Users, 
  RefreshCw,
  Eye,
  Home,
  Building2
} from 'lucide-react'
import { supabase, DeveloperProfilePublic } from '@/lib/supabase'
import { Link } from 'react-router-dom'

export default function ListDevelopers() {
  const [developers, setDevelopers] = useState<DeveloperProfilePublic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDevelopers()
  }, [])

  const fetchDevelopers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('developer_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching developers:', error)
        return
      }

      setDevelopers(data || [])
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDevelopers = developers.filter(developer =>
    developer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    developer.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading developers...</p>
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
        <span className="text-foreground">Developers</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Developers</h1>
          <p className="text-muted-foreground">List of all developers</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/companies">
              <Building2 className="h-4 w-4 mr-2" />
              View Companies
            </Link>
          </Button>
          <Button onClick={fetchDevelopers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search developers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Developers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Developers ({filteredDevelopers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDevelopers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Developer</th>
                    <th className="text-left p-3 font-medium">Skills</th>
                    <th className="text-left p-3 font-medium">Experience</th>
                    <th className="text-left p-3 font-medium">Location</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevelopers.map((developer) => (
                    <tr key={developer.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{developer.full_name}</div>
                          {developer.bio && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {developer.bio}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {developer.skills?.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-secondary rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                          {developer.skills && developer.skills.length > 3 && (
                            <span className="px-2 py-1 bg-muted rounded-full text-xs">
                              +{developer.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {developer.years_experience ? `${developer.years_experience} years` : 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {developer.location || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button size="sm" asChild>
                          <Link to={`/developer/${developer.id}`}>
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
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {developers.length === 0 ? 'No developers available' : 'No developers found'}
              </h3>
              <p className="text-muted-foreground">
                {developers.length === 0 
                  ? 'There are currently no developers in the database.'
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
