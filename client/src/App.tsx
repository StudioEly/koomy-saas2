import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";

// Mobile Pages
import MobileLogin from "@/pages/mobile/Login";
import MobileHome from "@/pages/mobile/Home";
import MobileCard from "@/pages/mobile/Card";
import MobileNews from "@/pages/mobile/News";
import MobileMessages from "@/pages/mobile/Messages";
import MobileProfile from "@/pages/mobile/Profile";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";

function Router() {
  return (
    <Switch>
      {/* Landing / Default */}
      <Route path="/" component={MobileLogin} />
      
      {/* Mobile Routes */}
      <Route path="/app/login" component={MobileLogin} />
      <Route path="/app/home" component={MobileHome} />
      <Route path="/app/card" component={MobileCard} />
      <Route path="/app/news" component={MobileNews} />
      <Route path="/app/messages" component={MobileMessages} />
      <Route path="/app/profile" component={MobileProfile} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      {/* Placeholder for other admin routes to redirect to dashboard for now */}
      <Route path="/admin/members"><Redirect to="/admin/dashboard" /></Route>
      <Route path="/admin/news"><Redirect to="/admin/dashboard" /></Route>
      <Route path="/admin/events"><Redirect to="/admin/dashboard" /></Route>
      <Route path="/admin/messages"><Redirect to="/admin/dashboard" /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
