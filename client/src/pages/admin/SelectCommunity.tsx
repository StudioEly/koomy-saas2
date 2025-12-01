import { useEffect } from "react";
import { useLocation } from "wouter";
import { Building2, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import koomyLogo from "@assets/ChatGPT Image 30 nov. 2025, 05_54_45_1764590118748.png";

export default function AdminSelectCommunity() {
  const [_, setLocation] = useLocation();
  const { user, selectCommunity, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      setLocation("/admin/login");
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  const memberships = user.memberships || [];

  const handleSelectCommunity = (communityId: string) => {
    selectCommunity(communityId);
    setTimeout(() => {
      setLocation("/admin/dashboard");
    }, 50);
  };

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8" data-testid="admin-select-community-page">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <img 
            src={koomyLogo} 
            alt="Koomy" 
            className="h-16 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bonjour, {user.firstName || "Administrateur"} !
          </h1>
          <p className="text-gray-500">
            Sélectionnez la communauté à administrer
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Vos communautés
            </CardTitle>
            <CardDescription>
              Vous avez accès à {memberships.length} communauté{memberships.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {memberships.map((membership: any) => (
              <button 
                key={membership.id}
                onClick={() => handleSelectCommunity(membership.communityId)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group text-left"
                data-testid={`admin-community-card-${membership.communityId}`}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-lg">
                    {membership.community?.name?.[0] || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {membership.community?.name || "Communauté"}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {membership.adminRole?.replace("_", " ") || "Administrateur"}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </button>
            ))}

            {memberships.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">Aucune communauté associée</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 gap-2"
            data-testid="button-admin-logout"
          >
            <LogOut size={18} />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}
