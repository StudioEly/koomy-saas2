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
import AdminMembers from "@/pages/admin/Members";
import AdminNews from "@/pages/admin/News";
import AdminEvents from "@/pages/admin/Events";
import AdminMessages from "@/pages/admin/Messages";
import AdminAdmins from "@/pages/admin/Admins";
import AdminSections from "@/pages/admin/Sections";
import AdminEventDetails from "@/pages/admin/EventDetails";

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
      <Route path="/admin/members" component={AdminMembers} />
      <Route path="/admin/news" component={AdminNews} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/admin/events/:id" component={AdminEventDetails} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/admins" component={AdminAdmins} />
      <Route path="/admin/sections" component={AdminSections} />

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
