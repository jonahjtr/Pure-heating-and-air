import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { SiteLayoutProvider } from "@/contexts/SiteLayoutContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/admin/Dashboard";
import Pages from "./pages/admin/Pages";
import PageEditor from "./pages/admin/PageEditor";
import Media from "./pages/admin/Media";
import ContentTypes from "./pages/admin/ContentTypes";
import ContentTypeEditor from "./pages/admin/ContentTypeEditor";
import ContentTypeItems from "./pages/admin/ContentTypeItems";
import ContentTypeItemEditor from "./pages/admin/ContentTypeItemEditor";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import Branding from "./pages/admin/Branding";
import SiteLayout from "./pages/admin/SiteLayout";
import GeneralSettings from "./pages/admin/GeneralSettings";
import PageBySlug from "./pages/PageBySlug";
import ContentItemBySlug from "./pages/ContentItemBySlug";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrandingProvider>
      <SiteLayoutProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pages"
                element={
                  <ProtectedRoute>
                    <Pages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/media"
                element={
                  <ProtectedRoute>
                    <Media />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pages/new"
                element={
                  <ProtectedRoute>
                    <PageEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pages/:id"
                element={
                  <ProtectedRoute>
                    <PageEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/content-types"
                element={
                  <ProtectedRoute>
                    <ContentTypes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/content-types/new"
                element={
                  <ProtectedRoute>
                    <ContentTypeEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/content-types/:id"
                element={
                  <ProtectedRoute>
                    <ContentTypeEditor />
                  </ProtectedRoute>
                }
              />
              {/* Content type items routes */}
              <Route
                path="/admin/content/:slug"
                element={
                  <ProtectedRoute>
                    <ContentTypeItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/content/:slug/new"
                element={
                  <ProtectedRoute>
                    <ContentTypeItemEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/content/:slug/:id"
                element={
                  <ProtectedRoute>
                    <ContentTypeItemEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings/branding"
                element={
                  <ProtectedRoute>
                    <Branding />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/site-layout"
                element={
                  <ProtectedRoute>
                    <SiteLayout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/general-settings"
                element={
                  <ProtectedRoute>
                    <GeneralSettings />
                  </ProtectedRoute>
                }
              />

              {/* Service subpages (e.g., /services/air-conditioning) */}
              <Route path="/services/:itemSlug" element={<ContentItemBySlug />} />
              {/* Content type item pages (e.g., /blogs/my-post) */}
              <Route path="/:typeSlug/:itemSlug" element={<ContentItemBySlug />} />
              {/* Public pages (must be below static routes like /auth and /admin) */}
              <Route path="/:slug" element={<PageBySlug />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </SiteLayoutProvider>
  </BrandingProvider>
</QueryClientProvider>
);

export default App;
