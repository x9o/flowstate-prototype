import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MonitoringProvider } from "@/contexts/MonitoringContext";
import { ListsProvider } from "@/contexts/ListsContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { RecentTasksProvider } from "@/contexts/RecentTasksContext";
import { NotificationProvider } from "@/components/ui/notification";
import Lists from "./pages/Lists";
import PageTransition from "./components/PageTransition";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <MonitoringProvider>
        <ListsProvider>
          <SidebarProvider>
            <RecentTasksProvider>
              <NotificationProvider>
                <TooltipProvider>
                <Toaster />
                <Sonner />
                <HashRouter>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<PageTransition><Index /></PageTransition>} />
                      <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
                      <Route path="/lists" element={<PageTransition><Lists /></PageTransition>} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                    </Routes>
                  </AppLayout>
                </HashRouter>
                </TooltipProvider>
              </NotificationProvider>
            </RecentTasksProvider>
          </SidebarProvider>
        </ListsProvider>
      </MonitoringProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
