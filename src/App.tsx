
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FinanceProvider, AuthProvider } from "./contexts";
import { ThemeProvider } from "./contexts/theme/ThemeContext";
import { AppLayout } from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Upgrade from "./pages/Upgrade";
import Thanks from "./pages/Thanks";
import NotFound from "./pages/NotFound";

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
                  {/* Landing page pública */}
                  <Route path="/" element={<Landing />} />
                  
                  {/* Página de autenticação */}
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Área de aplicativo - sem proteção de rota */}
                  <Route path="/app" element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="upgrade" element={<Upgrade />} />
                    <Route path="thanks" element={<Thanks />} />
                  </Route>
                  
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
