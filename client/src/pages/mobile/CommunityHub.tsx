import { Link, useLocation } from "wouter";
import { Plus, ChevronRight, LogOut, Shield, Ticket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunities } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import koomyLogo from "@assets/Koomy-communitieslogo_1764495780161.png";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="community-hub-page">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        
        <div className="bg-white p-6 pt-12 pb-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <img src={koomyLogo} alt="Koomy" className="h-10" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold">
              {displayName[0]?.toUpperCase() || "?"}
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors"
              data-testid="button-logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Cartes</h1>
            <p className="text-gray-500 text-sm">
              {memberships.length === 0 
                ? "Vous n'avez pas encore de carte d'adhésion."
                : "Retrouvez toutes vos cartes d'adhésion."
              }
            </p>
          </div>

          <div className="space-y-4">
            {memberships.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleSelectCommunity(item)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group active:scale-98"
                data-testid={`community-card-${item.communityId}`}
              >
                <div className="h-16 w-16 rounded-xl bg-gray-50 p-1 border border-gray-100 flex-shrink-0 overflow-hidden">
                  {item.community?.logo ? (
                    <img src={item.community.logo} alt={item.community?.name} className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-xl">
                        {item.community?.name?.[0] || "?"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                    {item.community?.name || "Communauté"}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {item.displayName || item.memberId}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {item.role === "admin" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                        <Shield size={10} /> Admin
                      </span>
                    )}
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${
                      item.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {item.status === "active" ? "Actif" : "Expiré"}
                    </span>
                    {!item.accountId && account && (
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700">
                        Non liée
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-primary flex-shrink-0" />
              </div>
            ))}

            <Button
              onClick={() => setLocation("/app/add-card")}
              variant="outline"
              className="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:text-primary hover:border-primary hover:bg-blue-50/50 transition-all group"
              data-testid="button-add-card"
            >
              <div className="h-8 w-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center">
                <Ticket className="text-gray-500 group-hover:text-primary" size={18} />
              </div>
              <span className="font-medium">Ajouter une carte</span>
            </Button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-center text-gray-400">
            Connecté en tant que <span className="font-medium text-gray-600">
              {account ? account.email : user?.email}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
