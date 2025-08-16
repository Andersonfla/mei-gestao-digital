
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FinanceProvider, AuthProvider } from "./contexts";
import { ThemeProvider } from "./contexts/theme/ThemeContext";
import { AppLayout } from "./components/layout/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import Thanks from "./pages/Thanks";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Support from "./pages/Support";
import { RequireAuth } from "./components/auth/RequireAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              <FinanceProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/suporte" element={<Support />} />
                  
                  {/* Protected routes */}
                  <Route element={<RequireAuth />}>
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/transacoes" element={<Transactions />} />
                      <Route path="/relatorios" element={<Reports />} />
                      <Route path="/configuracoes" element={<Settings />} />
                      <Route path="/upgrade" element={<Upgrade />} />
                      <Route path="/thanks" element={<Thanks />} />
                    </Route>
                  </Route>
                  
                  {/* Legacy routes - redirect to new structure */}
                  <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/transactions" element={<Navigate to="/transacoes" replace />} />
                  <Route path="/reports" element={<Navigate to="/relatorios" replace />} />
                  <Route path="/settings" element={<Navigate to="/configuracoes" replace />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </FinanceProvider>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
