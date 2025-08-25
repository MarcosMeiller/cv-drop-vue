import { NavLink, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { 
  Home, 
  User, 
  Users, 
  Building2, 
  FileText, 
  Search 
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export const AppSidebar = () => {
  const { state } = useSidebar()
  const location = useLocation()
  const { userProfile } = useAuth()
  
  const currentPath = location.pathname
  const collapsed = state === 'collapsed'

  const isActive = (path: string) => currentPath === path

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-sidebar-accent text-sidebar-primary font-medium' : 'hover:bg-sidebar-accent/50'

  const developerItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'My Profile', url: '/developer/profile', icon: User },
    { title: 'List Companies', url: '/companies', icon: Building2 },
  ]

  const companyItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Company Profile', url: '/company/profile', icon: Building2 },
    { title: 'List Developers', url: '/developers', icon: Users },
  ]

  const publicItems = [
    { title: 'List Developers', url: '/public/developers', icon: Search },
  ]

  const items = userProfile?.role === 'developer' ? developerItems : 
                userProfile?.role === 'company' ? companyItems : 
                publicItems

  return (
    <Sidebar
      className={collapsed ? 'w-14' : 'w-64'}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}