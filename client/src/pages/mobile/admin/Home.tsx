import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { QrCode, MessageSquare, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import type { Community } from "@shared/schema";

export default function MobileAdminHome({ params }: { params: { communityId: string } }) {
  const [_, setLocation] = useLocation();
  const communityId = params.communityId;
  const { user, currentCommunity, selectCommunity, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      setLocation("/app/admin/login");
      return;
    }
    if (currentCommunity?.id !== communityId) {
      selectCommunity(communityId);
    }
  }, [user, communityId, currentCommunity, selectCommunity, setLocation]);

  const { data: community } = useQuery<Community>({
    queryKey: [`/api/communities/${communityId}`],
    enabled: !!communityId
  });

  const { data: members = [] } = useQuery<any[]>({
    queryKey: [`/api/communities/${communityId}/memberships`],
    enabled: !!communityId
  });

  if (!user) {
    return null;
  }

  const displayName = currentCommunity?.name || community?.name || "Communauté";

  const handleLogout = () => {
    logout();
    setLocation("/app/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="mobile-admin-home-page">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        
        <header className="bg-gray-900 text-white px-4 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500 text-white border-0">Mode Admin</Badge>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors p-1"
                data-testid="button-admin-logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          <h1 className="text-xl font-bold">{displayName}</h1>
          <p className="text-sm text-gray-400">Connecté en tant que {user.firstName} {user.lastName}</p>

          <div className="grid grid-cols-3 gap-2 mt-6">
             <div className="bg-gray-800 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">{members.length}</div>
                <div className="text-[10px] text-gray-400 uppercase">Membres</div>
             </div>
             <div className="bg-gray-800 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">0</div>
                <div className="text-[10px] text-gray-400 uppercase">Messages</div>
             </div>
             <div className="bg-gray-800 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">--</div>
                <div className="text-[10px] text-gray-400 uppercase">Présence</div>
             </div>
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/app/${communityId}/admin/scanner`}>
              <div className="bg-purple-50 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer active:scale-95 transition-transform border border-purple-100">
                 <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                   <QrCode size={24} />
                 </div>
                 <span className="font-bold text-gray-900 text-sm">Scanner</span>
              </div>
            </Link>
            <Link href={`/app/${communityId}/admin/messages`}>
              <div className="bg-blue-50 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer active:scale-95 transition-transform border border-blue-100">
                 <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                   <MessageSquare size={24} />
                 </div>
                 <span className="font-bold text-gray-900 text-sm">Messages</span>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Membres récents</h3>
              <Badge variant="secondary" className="text-[10px]">{members.length} total</Badge>
            </div>
            <div className="divide-y divide-gray-100">
              {members.slice(0, 3).map((member: any) => (
                <div key={member.id} className="p-3 flex gap-3 hover:bg-gray-50 cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                      {member.displayName?.[0]?.toUpperCase() || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between mb-0.5">
                       <span className="font-bold text-xs">{member.displayName || "Membre"}</span>
                       <Badge className={`text-[9px] ${member.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                         {member.status === "active" ? "Actif" : "Inactif"}
                       </Badge>
                     </div>
                     <p className="text-xs text-gray-500 truncate">{member.memberId}</p>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div className="p-6 text-center text-gray-400 text-sm">
                  Aucun membre pour le moment
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Gérer votre communauté</p>
                <p className="text-xs text-white/80">Accédez au back-office complet</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="w-full mt-3 bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => setLocation("/admin/dashboard")}
              data-testid="button-go-backoffice"
            >
              Ouvrir le Back-Office
            </Button>
          </div>

        </main>
      </div>
    </div>
  );
}
