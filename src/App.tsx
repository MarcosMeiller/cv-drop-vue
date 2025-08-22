import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthPage } from "@/components/auth/AuthPage";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import DeveloperProfile from "./pages/DeveloperProfile";
import CompanyProfile from "./pages/CompanyProfile";
import BrowseDevelopers from "./pages/BrowseDevelopers";
import BrowseCompanies from "./pages/BrowseCompanies";
import PublicDeveloperProfile from "./pages/PublicDeveloperProfile";
import PublicCompanyProfile from "./pages/PublicCompanyProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="developer/profile" element={<DeveloperProfile />} />
        <Route path="company/profile" element={<CompanyProfile />} />
        <Route path="developers" element={<BrowseDevelopers />} />
        <Route path="companies" element={<BrowseCompanies />} />
        <Route path="developer/:id" element={<PublicDeveloperProfile />} />
        <Route path="company/:id" element={<PublicCompanyProfile />} />
        <Route path="public/developers" element={<BrowseDevelopers />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
