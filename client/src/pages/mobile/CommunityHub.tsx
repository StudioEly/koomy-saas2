import { Link, useLocation } from "wouter";
import { Plus, ChevronRight, LogOut, Shield, Ticket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunities } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import koomyLogo from "@assets/ChatGPT Image 30 nov. 2025, 05_54_45_1764590118748.png";

export default function CommunityHub() {
  const [location, setLocation] = useLocation();
  const { account, user, selectMembership, selectCommunity, logout } = useAuth();
  const { data: allCommunities, isLoading } = useCommunities();

  const currentUser = account || user;
  
  if (!currentUser) {
    setLocation("/app/login");
    return null;
  }

  const memberships = account 
    ? account.memberships
    : (user?.memberships || []).map(m => {
        const community = allCommunities?.find(c => c.id === m.communityId);
        return { ...m, community };
      });

  const displayName = account 
    ? (account.firstName || account.email?.split('@')[0] || "Utilisateur")
    : (user?.firstName || "Utilisateur");

  const handleSelectCommunity = (membership: typeof memberships[0]) => {
    if (account) {
      selectMembership(membership.id);
    } else {
      selectCommunity(membership.communityId);
    }
    setLocation(`/app/${membership.communityId}/home`);
  };

  const handleLogout = () => {
    logout();
    setLocation("/app/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(180deg, #E8F4FF 0%, #F5FAFF 40%, #FFFFFF 100%)"
      }}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#44A8FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center" data-testid="community-hub-page" style={{
      background: "linear-gradient(180deg, #E8F4FF 0%, #F5FAFF 40%, #FFFFFF 100%)"
    }}>
      <div className="absolute top-0 left-0 w-full h-60 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full opacity-25" style={{
          background: "radial-gradient(circle, rgba(68, 168, 255, 0.4) 0%, transparent 70%)"
        }} />
        <div className="absolute top-10 right-0 w-40 h-40 rounded-full opacity-20" style={{
          background: "radial-gradient(circle, rgba(68, 168, 255, 0.5) 0%, transparent 70%)"
        }} />
      </div>

      <div className="w-full max-w-md min-h-screen relative flex flex-col">
        <div className="relative z-10 p-5 pt-8 pb-4 flex justify-between items-center">
          <img src={koomyLogo} alt="Koomy" className="h-14" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{
              background: "linear-gradient(135deg, #5AB8FF 0%, #44A8FF 100%)"
            }}>
              {displayName[0]?.toUpperCase() || "?"}
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors p-2"
              data-testid="button-logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="relative z-10 p-5 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Mes Cartes</h1>
            <p className="text-gray-500 text-sm">
              {memberships.length === 0 
                ? "Vous n'avez pas encore de carte d'adhésion."
                : "Retrouvez toutes vos cartes d'adhésion."
              }
            </p>
          </div>

          <div className="space-y-3">
            {memberships.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleSelectCommunity(item)}
                className="koomy-card koomy-card-hover p-4 flex items-center gap-4 cursor-pointer group"
                data-testid={`community-card-${item.communityId}`}
              >
                <div className="h-14 w-14 rounded-xl p-1 border border-gray-100 flex-shrink-0 overflow-hidden bg-white">
                  {item.community?.logo ? (
                    <img src={item.community.logo} alt={item.community?.name} className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="w-full h-full rounded-lg flex items-center justify-center" style={{
                      background: "linear-gradient(135deg, #E8F4FF 0%, #D6EBFF 100%)"
                    }}>
                      <span className="text-[#44A8FF] font-bold text-lg">
                        {item.community?.name?.[0] || "?"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 group-hover:text-[#44A8FF] transition-colors truncate">
                    {item.community?.name || "Communauté"}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {item.displayName || item.memberId}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {item.role === "admin" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-100 text-purple-600">
                        <Shield size={10} /> Admin
                      </span>
                    )}
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      item.status === "active" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-red-100 text-red-500"
                    }`}>
                      {item.status === "active" ? "Actif" : "Expiré"}
                    </span>
                    {!item.accountId && account && (
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-100 text-orange-500">
                        Non liée
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-[#44A8FF] flex-shrink-0 transition-colors" />
              </div>
            ))}

            <Button
              onClick={() => setLocation("/app/add-card")}
              variant="outline"
              className="w-full py-6 border-2 border-dashed border-[#44A8FF]/30 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-[#44A8FF] hover:border-[#44A8FF]/50 hover:bg-[#44A8FF]/5 transition-all group"
              data-testid="button-add-card"
            >
              <div className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-[#E8F4FF] flex items-center justify-center transition-colors">
                <Ticket className="text-gray-400 group-hover:text-[#44A8FF] transition-colors" size={18} />
              </div>
              <span className="font-semibold">Ajouter une carte</span>
            </Button>
          </div>
        </div>

        <div className="relative z-10 p-5 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
          <p className="text-xs text-center text-gray-400">
            Connecté en tant que <span className="font-semibold text-gray-500">
              {account ? account.email : user?.email}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
