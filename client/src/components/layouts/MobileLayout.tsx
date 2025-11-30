import { Link, useLocation } from "wouter";
import { Home, CreditCard, Mail, Newspaper, User, ArrowLeft, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_COMMUNITIES, MOCK_USER } from "@/lib/mockData";
import koomyLogo from "@assets/Koomy-communitieslogo_1764495780161.png";

export default function MobileLayout({ 
  children, 
  communityId 
}: { 
  children: React.ReactNode,
  communityId?: string 
}) {
  const [location] = useLocation();
  
  // Find current community context
  const community = communityId ? MOCK_COMMUNITIES.find(c => c.id === communityId) : null;
  const membership = communityId ? MOCK_USER.communities.find(c => c.communityId === communityId) : null;
  const isAdmin = membership?.role === "admin";

  const navItems = [
    { icon: Home, label: "Accueil", path: `/app/${communityId}/home` },
    { icon: CreditCard, label: "Carte", path: `/app/${communityId}/card` },
    { icon: Mail, label: "Messages", path: `/app/${communityId}/messages` },
    { icon: Newspaper, label: "Actus", path: `/app/${communityId}/news` },
    { icon: User, label: "Compte", path: `/app/${communityId}/profile` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-screen shadow-2xl relative flex flex-col">
        
        {/* Dynamic Header for Community App */}
        {community && (
          <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-3">
              <Link href="/app/hub" className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
                  <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <img src={community.logo} alt={community.name} className="h-8 w-8 object-contain rounded" />
                <div>
                   <h1 className="font-bold text-sm leading-none text-gray-900">{community.name}</h1>
                   <span className="text-[10px] text-gray-500 font-medium">Koomy App</span>
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <Link href={`/app/${communityId}/admin`} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-purple-100 transition-colors">
                  <Shield size={12} fill="currentColor" /> Admin
              </Link>
            )}
          </header>
        )}

        {/* Content Area - Scrollable */}
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {children}
        </main>

        {/* Bottom Navigation */}
        {communityId && (
          <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 pb-safe pt-2 px-2 z-50">
            <div className="flex justify-around items-center h-16">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path} className={cn(
                      "flex flex-col items-center justify-center w-16 h-full transition-all duration-200",
                      isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}>
                      <item.icon 
                        className={cn(
                          "h-6 w-6 mb-1 transition-transform duration-200",
                          isActive ? "scale-110 stroke-[2.5px]" : "stroke-2"
                        )} 
                      />
                      <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
