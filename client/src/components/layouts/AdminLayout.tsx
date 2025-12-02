import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Newspaper, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  Shield,
  MapPin,
  HelpCircle,
  CreditCard,
  Building2,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { COMMUNITY_TYPES } from "@shared/schema";
import koomyLogo from "@assets/koomy-logo.png";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout, currentCommunity } = useAuth();

  useEffect(() => {
    if (!user) {
      setLocation("/admin/login");
    }
  }, [user, setLocation]);

  const navItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/admin/dashboard" },
    { icon: Users, label: "Adhérents", path: "/admin/members" },
    { icon: MapPin, label: "Sections", path: "/admin/sections" },
    { icon: Shield, label: "Administrateurs", path: "/admin/admins" },
    { icon: CreditCard, label: "Paiements", path: "/admin/payments" },
    { icon: Newspaper, label: "Actualités", path: "/admin/news" },
    { icon: Calendar, label: "Événements", path: "/admin/events" },
    { icon: MessageSquare, label: "Messagerie", path: "/admin/messages" },
    { icon: HelpCircle, label: "Support", path: "/admin/support" },
    { icon: Receipt, label: "Facturation", path: "/admin/billing" },
    { icon: Settings, label: "Paramètres", path: "/admin/settings" },
  ];

  const getCommunityTypeLabel = () => {
    if (!currentCommunity) return "";
    if (currentCommunity.communityType === "other") {
      return currentCommunity.communityTypeOther || "Communauté";
    }
    const type = COMMUNITY_TYPES.find(t => t.value === currentCommunity.communityType);
    return type?.label || "Communauté";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-xl z-10 hidden md:flex">
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border/20">
          {currentCommunity?.logo ? (
            <img src={currentCommunity.logo} alt="Logo" className="h-9 w-9 rounded-lg bg-white p-1 object-contain" />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm leading-tight truncate" data-testid="text-sidebar-community-name">
              {currentCommunity?.name || "Koomy Admin"}
            </h1>
            <span className="text-xs opacity-70 truncate block" data-testid="text-sidebar-community-type">
              {getCommunityTypeLabel()}
            </span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <a className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                )}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border/20">
          <button 
            onClick={() => {
              logout();
              setLocation("/admin/login");
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header (visible on small screens) */}
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="font-semibold text-lg text-gray-800">
              {navItems.find(i => i.path === location)?.label || "Administration"}
            </h2>
            {currentCommunity && (
              <p className="text-xs text-gray-500">{currentCommunity.name}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
