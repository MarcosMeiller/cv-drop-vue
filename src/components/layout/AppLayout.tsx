import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { ImageModal } from '@/components/ui/image-modal'

export const AppLayout = () => {
  const { user, userProfile, signOut } = useAuth()
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        {user && userProfile && <AppSidebar />}
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              {user && userProfile && <SidebarTrigger />}
              <h1 className="text-lg md:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent truncate">
                Mini Talento Tech
              </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              
              {user && userProfile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                      <Avatar 
                        className="h-8 w-8 md:h-10 md:w-10 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const imageUrl = userProfile.role === 'developer' 
                            ? (userProfile as any).avatar_url 
                            : (userProfile as any).logo_url;
                          if (imageUrl) {
                            setSelectedImageUrl(imageUrl);
                            setIsImageModalOpen(true);
                          }
                        }}
                      >
                        <AvatarImage src={userProfile.role === 'developer' ? (userProfile as any).avatar_url : (userProfile as any).logo_url} />
                        <AvatarFallback className="text-xs md:text-sm">
                          {userProfile.role === 'developer' 
                            ? (userProfile as any).full_name?.charAt(0) || user.email?.charAt(0) 
                            : (userProfile as any).company_name?.charAt(0) || user.email?.charAt(0)
                          }
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userProfile.role === 'developer' 
                            ? (userProfile as any).full_name || 'Developer'
                            : (userProfile as any).company_name || 'Company'
                          }
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = userProfile.role === 'developer' ? '/developer/profile' : '/company/profile'}>
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImageUrl || ''}
        altText="Profile Image"
      />
    </SidebarProvider>
  )
}