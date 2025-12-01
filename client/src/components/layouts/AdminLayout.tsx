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
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@assets/generated_images/modern_minimalist_union_logo_with_letter_u_or_abstract_knot_symbol_in_blue_and_red.png";

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
    { icon: Settings, label: "Paramètres", path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-xl z-10 hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-sidebar-border/20">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded bg-white p-1" />
          <div>
            <h1 className="font-bold text-lg leading-none">KOMY Admin</h1>
            <span className="text-xs opacity-70">Back-office UNSA</span>
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
