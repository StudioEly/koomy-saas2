import { useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import koomyLogo from "@assets/ChatGPT Image 30 nov. 2025, 05_54_45_1764590118748.png";

export default function MobileAdminSelectCommunity() {
  const [_, setLocation] = useLocation();
  const { user, selectCommunity, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      setLocation("/app/admin/login");
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  const memberships = user.memberships || [];

  const handleSelectCommunity = (communityId: string) => {
    selectCommunity(communityId);
    setTimeout(() => {
      setLocation(`/app/${communityId}/admin`);
    }, 50);
  };

  const handleLogout = () => {
    logout();
    setLocation("/app/admin/login");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" data-testid="admin-select-community-page" style={{
      background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
    }}>
      <div className="absolute top-0 left-0 w-full h-80 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20" style={{
          background: "radial-gradient(circle, rgba(138, 43, 226, 0.4) 0%, transparent 70%)"
        }} />
        <div className="absolute -top-10 right-0 w-60 h-60 rounded-full opacity-15" style={{
          background: "radial-gradient(circle, rgba(68, 168, 255, 0.4) 0%, transparent 70%)"
        }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 pt-10 pb-6">
        <div className="flex justify-between items-center mb-8">
          <img 
            src={koomyLogo} 
            alt="Koomy" 
            className="h-10 drop-shadow-lg"
          />
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 transition-colors p-2"
            data-testid="button-admin-logout"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Shield size={18} className="text-purple-400" />
          <span className="text-purple-300 text-sm font-bold uppercase tracking-wider">
            Espace Administrateur
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Bonjour, {user.firstName || "Admin"}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Sélectionnez une communauté à gérer
        </p>

        <div className="space-y-3">
          {memberships.map((membership: any) => (
            <div 
              key={membership.id}
              onClick={() => handleSelectCommunity(membership.communityId)}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 cursor-pointer hover:bg-white/15 transition-all group"
              data-testid={`admin-community-card-${membership.communityId}`}
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-300 font-bold text-lg">
                    {membership.community?.name?.[0] || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">
                    {membership.community?.name || "Communauté"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {membership.adminRole || "Administrateur"}
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          ))}

          {memberships.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Aucune communauté associée</p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6">
          <Button 
            variant="outline" 
            className="w-full h-11 rounded-xl border-2 border-gray-600 text-gray-300 hover:bg-white/5 hover:border-gray-500 font-semibold transition-all"
            onClick={() => setLocation("/app/login")}
            data-testid="button-member-login"
          >
            Accéder à l'espace membre
          </Button>
        </div>
      </div>
    </div>
  );
}
