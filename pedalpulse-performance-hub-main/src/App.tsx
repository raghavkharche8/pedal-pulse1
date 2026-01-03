import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ChallengeDirectory from "./pages/ChallengeDirectory";
import RepublicDayChallenge from "./pages/RepublicDayChallenge";
import FreeRegistration from "./pages/FreeRegistration";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
// Register page removed
import RepublicDayRegister from "./pages/RepublicDayRegister";
import { PublicLeaderboard } from "./pages/PublicLeaderboard";
import ThankYou from "./pages/ThankYou";
import PaidThankYou from "./pages/PaidThankYou";
import PremiumRegistration from "./pages/PremiumRegistration";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import ShippingPolicy from "./pages/ShippingPolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import ContactFab from "./components/ContactFab";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StravaCallback from "./pages/StravaCallback";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { Navigate, Outlet } from "react-router-dom";
import React, { Suspense } from 'react';
import { Loader2 } from "lucide-react";

// Lazy load admin pages to separate bundle and prevent main app crash if admin has errors
const AdminRoute = React.lazy(() => import("./components/AdminRoute").then(module => ({ default: module.AdminRoute })));
const AdminLayout = React.lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const PendingVerifications = React.lazy(() => import("./pages/admin/PendingVerifications"));
const ShippingManagement = React.lazy(() => import("./pages/admin/ShippingManagement"));
// Placeholders are small but let's consistency lazy load or keep static is fine. Keeping static for named imports is easier unless we change export.
// Actually, let's keep Placeholders static or move to lazy if needed. 
// For named exports via lazy:
const RegistrationList = React.lazy(() => import("./pages/admin/Placeholders").then(module => ({ default: module.RegistrationList })));
const AdminReports = React.lazy(() => import("./pages/admin/Placeholders").then(module => ({ default: module.AdminReports })));

const AdminLoading = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard/reset-password" element={<ResetPassword />} />
            <Route path="/auth/strava/callback" element={<StravaCallback />} />


            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <Suspense fallback={<AdminLoading />}>
                <ErrorBoundary>
                  <AdminRoute />
                </ErrorBoundary>
              </Suspense>
            }>
              <Route element={
                <Suspense fallback={<AdminLoading />}>
                  <ErrorBoundary>
                    <AdminLayout><Outlet /></AdminLayout>
                  </ErrorBoundary>
                </Suspense>
              }>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="verifications" element={<PendingVerifications />} />
                <Route path="registrations" element={<RegistrationList />} />
                <Route path="shipping" element={<ShippingManagement />} />
                <Route path="reports" element={<AdminReports />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            <Route path="/challenges" element={<ChallengeDirectory />} />
            <Route path="/challenges/republic-day-challenges-2026" element={
              <ErrorBoundary>
                <RepublicDayChallenge />
              </ErrorBoundary>
            } />
            <Route path="/challenge/:challengeName/leaderboard" element={
              <ErrorBoundary>
                <PublicLeaderboard />
              </ErrorBoundary>
            } />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/challenges/republic-day-challenges-2026/register" element={
              <ErrorBoundary>
                <RepublicDayRegister />
              </ErrorBoundary>
            } />
            <Route path="/challenges/republic-day-challenges-2026/free-registration" element={
              <ErrorBoundary>
                <FreeRegistration />
              </ErrorBoundary>
            } />
            <Route path="/challenges/republic-day-challenges-2026/premium-registration" element={
              <ErrorBoundary>
                <PremiumRegistration />
              </ErrorBoundary>
            } />
            <Route path="/challenges/republic-day-challenges-2026/thank-you" element={
              <ErrorBoundary>
                <PaidThankYou />
              </ErrorBoundary>
            } />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/cancellation-policy" element={<CancellationPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ContactFab />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

