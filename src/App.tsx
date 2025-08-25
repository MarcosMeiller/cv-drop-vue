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
import ListDevelopers from "./pages/ListDevelopers";
import ListCompanies from "./pages/ListCompanies";
import PublicDeveloperProfile from "./pages/PublicDeveloperProfile";
import PublicCompanyProfile from "./pages/PublicCompanyProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, userProfile, loading } = useAuth();

  console.log("AppRoutes - Auth state:", {
    user: !!user,
    userProfile: !!userProfile,
    loading,
  });

  if (loading) {
    console.log("AppRoutes - Loading state, showing loading screen");
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // If user is authenticated, show full app
  if (user && userProfile) {
    console.log("AppRoutes - User authenticated, rendering protected routes");
    return (
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="developer/profile" element={<DeveloperProfile />} />
          <Route path="company/profile" element={<CompanyProfile />} />
          <Route path="developers" element={<ListDevelopers />} />
          <Route path="companies" element={<ListCompanies key="companies-auth" />} />
          <Route path="developer/:id" element={<PublicDeveloperProfile />} />
          <Route path="company/:id" element={<PublicCompanyProfile />} />
          <Route path="public/developers" element={<ListDevelopers />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // If no user or no profile, show only login
  console.log("AppRoutes - No user or userProfile, redirecting to login");
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<AuthPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
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
