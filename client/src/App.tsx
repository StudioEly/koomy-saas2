import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import MobileContainer from "@/components/MobileContainer";
import FaviconManager from "@/components/FaviconManager";
import ManifestManager from "@/components/ManifestManager";

// Mobile Pages
import MobileLogin from "@/pages/mobile/Login";
import CommunityHub from "@/pages/mobile/CommunityHub";
import AddCard from "@/pages/mobile/AddCard";
import MobileHome from "@/pages/mobile/Home";
import MobileCard from "@/pages/mobile/Card";
import MobileNews from "@/pages/mobile/News";
import MobileNewsDetail from "@/pages/mobile/NewsDetail";
import MobileEvents from "@/pages/mobile/Events";
import MobileEventDetail from "@/pages/mobile/EventDetail";
import MobileMessages from "@/pages/mobile/Messages";
import MobileProfile from "@/pages/mobile/Profile";
import MobilePayment from "@/pages/mobile/Payment";

// Mobile Admin Pages
import MobileAdminLogin from "@/pages/mobile/admin/Login";
import MobileAdminRegister from "@/pages/mobile/admin/Register";
import MobileAdminSelectCommunity from "@/pages/mobile/admin/SelectCommunity";
import MobileAdminHome from "@/pages/mobile/admin/Home";
import MobileAdminScanner from "@/pages/mobile/admin/Scanner";
import MobileAdminMessages from "@/pages/mobile/admin/Messages";
import MobileAdminArticles from "@/pages/mobile/admin/Articles";
import MobileAdminEvents from "@/pages/mobile/admin/Events";
import MobileAdminCollections from "@/pages/mobile/admin/Collections";
import MobileAdminMembers from "@/pages/mobile/admin/Members";
import MobileAdminSettings from "@/pages/mobile/admin/Settings";
import MobileSupport from "@/pages/mobile/Support";

// Wrapper for mobile pages to force mobile layout
const withMobileContainer = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <MobileContainer>
      <Component {...props} />
    </MobileContainer>
  );
};

// Admin Pages (Web)
import AdminLogin from "@/pages/admin/Login";
import AdminRegister from "@/pages/admin/Register";
import AdminSelectCommunity from "@/pages/admin/SelectCommunity";
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
import AdminSettings from "@/pages/admin/Settings";
import AdminBilling from "@/pages/admin/Billing";

// Platform Pages
import PlatformLogin from "@/pages/platform/Login";
import SuperDashboard from "@/pages/platform/SuperDashboard";

// Website Pages
import WebsiteHome from "@/pages/website/Home";
import WebsiteFAQ from "@/pages/website/FAQ";
import WebsitePricing from "@/pages/website/Pricing";
import WebsiteContact from "@/pages/website/Contact";
import WebsiteDemo from "@/pages/website/Demo";
import WebsiteTerms from "@/pages/website/Terms";
import WebsiteLegal from "@/pages/website/Legal";
import WebsitePrivacy from "@/pages/website/Privacy";
import WebsiteSupport from "@/pages/website/Support";
import WebsiteBlog from "@/pages/website/Blog";

function DomainAwareRoot() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  
  if (hostname === "koomy.app") {
    return <WebsiteHome />;
  }
  if (hostname === "app.koomy.app") {
    return <MobileContainer><MobileLogin /></MobileContainer>;
  }
  if (hostname === "app-pro.koomy.app") {
    return <MobileContainer><MobileAdminLogin /></MobileContainer>;
  }
  if (hostname === "backoffice.koomy.app") {
    return <AdminLogin />;
  }
  if (hostname === "lorpesikoomyadmin.koomy.app") {
    return <PlatformLogin />;
  }
  
  return <Landing />;
}

function Router() {
  return (
    <Switch>
      {/* Landing / Default - Domain aware routing */}
      <Route path="/" component={DomainAwareRoot} />
      
      {/* Commercial Website */}
      <Route path="/website" component={WebsiteHome} />
      <Route path="/website/pricing" component={WebsitePricing} />
      <Route path="/website/faq" component={WebsiteFAQ} />
      <Route path="/website/contact" component={WebsiteContact} />
      <Route path="/website/demo" component={WebsiteDemo} />
      <Route path="/website/terms" component={WebsiteTerms} />
      <Route path="/website/legal" component={WebsiteLegal} />
      <Route path="/website/privacy" component={WebsitePrivacy} />
      <Route path="/website/support" component={WebsiteSupport} />
      <Route path="/website/blog" component={WebsiteBlog} />
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
      
      {/* Mobile Routes - wrapped in MobileContainer for phone-sized display */}
      <Route path="/app/login" component={withMobileContainer(MobileLogin)} />
      <Route path="/app/hub" component={withMobileContainer(CommunityHub)} />
      <Route path="/app/add-card" component={withMobileContainer(AddCard)} />
      
      {/* Dynamic Community Routes */}
      <Route path="/app/:communityId/home" component={withMobileContainer(MobileHome)} />
      <Route path="/app/:communityId/card" component={withMobileContainer(MobileCard)} />
      <Route path="/app/:communityId/news" component={withMobileContainer(MobileNews)} />
      <Route path="/app/:communityId/news/:articleId" component={withMobileContainer(MobileNewsDetail)} />
      <Route path="/app/:communityId/events" component={withMobileContainer(MobileEvents)} />
      <Route path="/app/:communityId/events/:eventId" component={withMobileContainer(MobileEventDetail)} />
      <Route path="/app/:communityId/messages" component={withMobileContainer(MobileMessages)} />
      <Route path="/app/:communityId/profile" component={withMobileContainer(MobileProfile)} />
      <Route path="/app/:communityId/payment" component={withMobileContainer(MobilePayment)} />
      <Route path="/app/:communityId/support" component={withMobileContainer(MobileSupport)} />

      {/* Mobile Admin Routes - wrapped in MobileContainer for phone-sized display */}
      <Route path="/app/admin/login" component={withMobileContainer(MobileAdminLogin)} />
      <Route path="/app/admin/register" component={withMobileContainer(MobileAdminRegister)} />
      <Route path="/app/admin/select-community" component={withMobileContainer(MobileAdminSelectCommunity)} />
      <Route path="/app/:communityId/admin" component={withMobileContainer(MobileAdminHome)} />
      <Route path="/app/:communityId/admin/scanner" component={withMobileContainer(MobileAdminScanner)} />
      <Route path="/app/:communityId/admin/messages" component={withMobileContainer(MobileAdminMessages)} />
      <Route path="/app/:communityId/admin/articles" component={withMobileContainer(MobileAdminArticles)} />
      <Route path="/app/:communityId/admin/events" component={withMobileContainer(MobileAdminEvents)} />
      <Route path="/app/:communityId/admin/collections" component={withMobileContainer(MobileAdminCollections)} />
      <Route path="/app/:communityId/admin/members" component={withMobileContainer(MobileAdminMembers)} />
      <Route path="/app/:communityId/admin/settings" component={withMobileContainer(MobileAdminSettings)} />

      {/* Admin Routes (Web) */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/register" component={AdminRegister} />
      <Route path="/admin/select-community" component={AdminSelectCommunity} />
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
      <Route path="/admin/billing" component={AdminBilling} />
      <Route path="/admin/settings" component={AdminSettings} />

      {/* Platform Super Admin */}
      <Route path="/platform/login" component={PlatformLogin} />
      <Route path="/platform/dashboard" component={SuperDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FaviconManager />
        <ManifestManager />
        <Toaster />
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
