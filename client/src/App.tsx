import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";

// Mobile Pages
import MobileLogin from "@/pages/mobile/Login";
import CommunityHub from "@/pages/mobile/CommunityHub";
import AddCard from "@/pages/mobile/AddCard";
import MobileHome from "@/pages/mobile/Home";
import MobileCard from "@/pages/mobile/Card";
import MobileNews from "@/pages/mobile/News";
import MobileMessages from "@/pages/mobile/Messages";
import MobileProfile from "@/pages/mobile/Profile";
import MobilePayment from "@/pages/mobile/Payment";

// Mobile Admin Pages
import MobileAdminHome from "@/pages/mobile/admin/Home";
import MobileAdminScanner from "@/pages/mobile/admin/Scanner";
import MobileAdminMessages from "@/pages/mobile/admin/Messages";
import MobileSupport from "@/pages/mobile/Support";

// Admin Pages (Web)
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminMembers from "@/pages/admin/Members";
import AdminMemberDetails from "@/pages/admin/MemberDetails";
import AdminNews from "@/pages/admin/News";
import AdminEvents from "@/pages/admin/Events";
import AdminEventDetails from "@/pages/admin/EventDetails";
import AdminMessages from "@/pages/admin/Messages";
import AdminAdmins from "@/pages/admin/Admins";
import AdminSections from "@/pages/admin/Sections";
import AdminSupport from "@/pages/admin/Support";
import AdminPayments from "@/pages/admin/Payments";

// Platform Pages
import SuperDashboard from "@/pages/platform/SuperDashboard";

// Website Pages
import WebsiteHome from "@/pages/website/Home";
import WebsiteFAQ from "@/pages/website/FAQ";
import WebsitePricing from "@/pages/website/Pricing";

function Router() {
  return (
    <Switch>
      {/* Landing / Default */}
      <Route path="/" component={Landing} />
      
      {/* Commercial Website */}
      <Route path="/website" component={WebsiteHome} />
      <Route path="/website/pricing" component={WebsitePricing} />
      <Route path="/website/faq" component={WebsiteFAQ} />
      <Route path="/website/signup">
        {/* Mock Signup redirecting to Admin Dashboard with toast */}
        {() => {
          window.location.href = "/admin/dashboard"; 
          return null; 
        }}
      </Route>
      <Route path="/website/download">
         {/* Mock Download redirecting to Mobile Login */}
        {() => {
          window.location.href = "/app/login"; 
          return null; 
        }}
      </Route>
      
      {/* Mobile Routes */}
      <Route path="/app/login" component={MobileLogin} />
      <Route path="/app/hub" component={CommunityHub} />
      <Route path="/app/add-card" component={AddCard} />
      
      {/* Dynamic Community Routes */}
      <Route path="/app/:communityId/home" component={MobileHome} />
      <Route path="/app/:communityId/card" component={MobileCard} />
      <Route path="/app/:communityId/news" component={MobileNews} />
      <Route path="/app/:communityId/messages" component={MobileMessages} />
      <Route path="/app/:communityId/profile" component={MobileProfile} />
      <Route path="/app/:communityId/payment" component={MobilePayment} />
      <Route path="/app/:communityId/support" component={MobileSupport} />

      {/* Mobile Admin Routes */}
      <Route path="/app/:communityId/admin" component={MobileAdminHome} />
      <Route path="/app/:communityId/admin/scanner" component={MobileAdminScanner} />
      <Route path="/app/:communityId/admin/messages" component={MobileAdminMessages} />

      {/* Admin Routes (Web) */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/members" component={AdminMembers} />
      <Route path="/admin/members/:id" component={AdminMemberDetails} />
      <Route path="/admin/news" component={AdminNews} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/admin/events/:id" component={AdminEventDetails} />
      <Route path="/admin/messages" component={AdminMessages} />
      <Route path="/admin/admins" component={AdminAdmins} />
      <Route path="/admin/sections" component={AdminSections} />
      <Route path="/admin/support" component={AdminSupport} />
      <Route path="/admin/payments" component={AdminPayments} />

      {/* Platform Super Admin */}
      <Route path="/platform/dashboard" component={SuperDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
