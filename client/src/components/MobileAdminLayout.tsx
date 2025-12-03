import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, Newspaper, Calendar, Wallet, MessageSquare, Users, Settings, LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import type { DelegatePermissions } from "@shared/schema";

interface MobileAdminLayoutProps {
  children: ReactNode;
  communityId: string;
  communityName?: string;
  permissions?: DelegatePermissions;
}

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  permission?: keyof DelegatePermissions;
}

export default function MobileAdminLayout({ 
  children, 
  communityId, 
  communityName,
  permissions 
}: MobileAdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  
  const navItems: NavItem[] = [
    { icon: Home, label: "Accueil", path: `/app/${communityId}/admin` },
    { icon: Newspaper, label: "Articles", path: `/app/${communityId}/admin/articles`, permission: "canManageArticles" },
    { icon: Calendar, label: "Événements", path: `/app/${communityId}/admin/events`, permission: "canManageEvents" },
    { icon: Wallet, label: "Collectes", path: `/app/${communityId}/admin/collections`, permission: "canManageCollections" },
    { icon: MessageSquare, label: "Messages", path: `/app/${communityId}/admin/messages`, permission: "canManageMessages" },
    { icon: Users, label: "Membres", path: `/app/${communityId}/admin/members`, permission: "canManageMembers" },
    { icon: Settings, label: "Paramètres", path: `/app/${communityId}/admin/settings` }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    if (!permissions) return true;
    return permissions[item.permission];
  });

  const handleLogout = () => {
    logout();
    setLocation("/app/admin/login");
  };

  const isActive = (path: string) => {
    if (path === `/app/${communityId}/admin`) {
      return location === path;
    }
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)"
    }} data-testid="mobile-admin-layout">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-white/10 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-lg truncate">{communityName || "Ma communauté"}</h1>
            <p className="text-gray-400 text-xs truncate">
              {user ? `${user.firstName} ${user.lastName}` : "Administrateur"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
              Pro
            </Badge>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors p-2"
              data-testid="button-admin-logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-white/10 px-2 py-1 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {filteredNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <button 
                  className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                    active 
                      ? 'text-purple-400' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
          {filteredNavItems.length > 5 && (
            <Link href={filteredNavItems[5].path}>
              <button 
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                  isActive(filteredNavItems[5].path) || isActive(filteredNavItems[6]?.path || '')
                    ? 'text-purple-400' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                data-testid="nav-more"
              >
                <Settings size={20} />
                <span className="text-[10px] mt-1 font-medium">Plus</span>
              </button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
