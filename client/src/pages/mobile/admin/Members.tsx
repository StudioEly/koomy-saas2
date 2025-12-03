import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, User, QrCode, UserX, UserCheck, X, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useLocation } from "wouter";
import MobileAdminLayout from "@/components/MobileAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL as API_URL } from "@/api/config";
import type { UserCommunityMembership, DelegatePermissions } from "@shared/schema";
import { extractPermissions } from "@shared/schema";
import QRCode from "react-qr-code";

export default function MobileAdminMembers({ params }: { params: { communityId: string } }) {
  const communityId = params.communityId;
  const [_, setLocation] = useLocation();
  const { currentCommunity, currentMembership } = useAuth();
  const queryClient = useQueryClient();

  const permissions = useMemo<DelegatePermissions | undefined>(() => {
    if (currentMembership) {
      return extractPermissions(currentMembership as any);
    }
    return undefined;
  }, [currentMembership]);

  useEffect(() => {
    if (permissions && !permissions.canManageMembers) {
      toast.error("Vous n'avez pas la permission de gérer les membres");
      setLocation(`/app/${communityId}/admin`);
    }
  }, [permissions, communityId, setLocation]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingMember, setViewingMember] = useState<UserCommunityMembership | null>(null);
  const [showQR, setShowQR] = useState(false);

  const { data: members = [], isLoading } = useQuery<UserCommunityMembership[]>({
    queryKey: [`/api/communities/${communityId}/memberships`],
    enabled: !!communityId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`${API_URL}/api/communities/${communityId}/memberships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/memberships`] });
      toast.success("Statut du membre mis à jour");
      setViewingMember(null);
    },
    onError: () => toast.error("Erreur lors de la mise à jour")
  });

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members.filter(m => m.role === "member");
    const query = searchQuery.toLowerCase();
    return members.filter(m => 
      m.role === "member" && (
        m.displayName?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.memberId?.toLowerCase().includes(query)
      )
    );
  }, [members, searchQuery]);

  const activeMembers = filteredMembers.filter(m => m.status === "active");
  const inactiveMembers = filteredMembers.filter(m => m.status !== "active");

  if (viewingMember) {
    return (
      <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Détails du membre</h2>
            <button onClick={() => { setViewingMember(null); setShowQR(false); }} className="text-gray-400 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xl">
                  {viewingMember.displayName?.[0]?.toUpperCase() || "M"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-bold text-lg">{viewingMember.displayName || "Membre"}</h3>
                <p className="text-gray-400 text-sm">{viewingMember.memberId}</p>
                <Badge className={`mt-1 text-[10px] ${
                  viewingMember.status === "active" 
                    ? "bg-green-500/20 text-green-300" 
                    : "bg-red-500/20 text-red-300"
                }`}>
                  {viewingMember.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>

            {viewingMember.email && (
              <div className="flex items-center gap-3 text-gray-300 mb-3">
                <Mail size={16} className="text-gray-500" />
                <span className="text-sm">{viewingMember.email}</span>
              </div>
            )}

            {viewingMember.phone && (
              <div className="flex items-center gap-3 text-gray-300 mb-3">
                <Phone size={16} className="text-gray-500" />
                <a href={`tel:${viewingMember.phone}`} className="text-sm text-purple-400 hover:underline">
                  {viewingMember.phone}
                </a>
              </div>
            )}

            {viewingMember.section && (
              <div className="flex items-center gap-3 text-gray-300 mb-3">
                <User size={16} className="text-gray-500" />
                <span className="text-sm">Section: {viewingMember.section}</span>
              </div>
            )}

            <div className="border-t border-white/10 pt-4 mt-4">
              <p className="text-gray-400 text-xs mb-2">Cotisation</p>
              <Badge className={`text-xs ${
                viewingMember.contributionStatus === "up_to_date" 
                  ? "bg-green-500/20 text-green-300" 
                  : viewingMember.contributionStatus === "pending"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-red-500/20 text-red-300"
              }`}>
                {viewingMember.contributionStatus === "up_to_date" ? "À jour" : 
                 viewingMember.contributionStatus === "pending" ? "En attente" : "En retard"}
              </Badge>
            </div>
          </div>

          {showQR ? (
            <div className="bg-white rounded-2xl p-6 text-center mb-6">
              <QRCode value={viewingMember.memberId} size={180} className="mx-auto" />
              <p className="text-gray-600 text-sm mt-4">{viewingMember.memberId}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowQR(false)}
              >
                Masquer le QR
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-600 text-gray-300 hover:bg-white/5 mb-4"
              onClick={() => setShowQR(true)}
              data-testid="button-show-qr"
            >
              <QrCode size={18} className="mr-2" />
              Voir le QR Code
            </Button>
          )}

          <div className="flex gap-3">
            {viewingMember.status === "active" ? (
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => updateStatusMutation.mutate({ id: viewingMember.id, status: "suspended" })}
                disabled={updateStatusMutation.isPending}
                data-testid="button-suspend-member"
              >
                <UserX size={18} className="mr-2" />
                Suspendre
              </Button>
            ) : (
              <Button
                className="flex-1 h-12 rounded-xl font-bold"
                style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" }}
                onClick={() => updateStatusMutation.mutate({ id: viewingMember.id, status: "active" })}
                disabled={updateStatusMutation.isPending}
                data-testid="button-reactivate-member"
              >
                <UserCheck size={18} className="mr-2" />
                Réactiver
              </Button>
            )}
          </div>
        </div>
      </MobileAdminLayout>
    );
  }

  return (
    <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Membres</h2>
          <Badge className="bg-purple-500/20 text-purple-300 text-xs">
            {members.filter(m => m.role === "member").length} total
          </Badge>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un membre..."
            className="h-11 pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500"
            data-testid="input-search-members"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto mb-3 text-gray-500" size={40} />
            <p className="text-gray-400 text-sm">
              {searchQuery ? "Aucun membre trouvé" : "Aucun membre pour le moment"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeMembers.length > 0 && (
              <div>
                <h3 className="text-green-400 font-semibold text-xs uppercase tracking-wide mb-3">
                  Actifs ({activeMembers.length})
                </h3>
                <div className="space-y-2">
                  {activeMembers.map((member) => (
                    <MemberCard key={member.id} member={member} onClick={() => setViewingMember(member)} />
                  ))}
                </div>
              </div>
            )}

            {inactiveMembers.length > 0 && (
              <div>
                <h3 className="text-red-400 font-semibold text-xs uppercase tracking-wide mb-3">
                  Inactifs ({inactiveMembers.length})
                </h3>
                <div className="space-y-2 opacity-70">
                  {inactiveMembers.map((member) => (
                    <MemberCard key={member.id} member={member} onClick={() => setViewingMember(member)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileAdminLayout>
  );
}

function MemberCard({ member, onClick }: { member: UserCommunityMembership; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer"
      data-testid={`member-card-${member.id}`}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-purple-500/20 text-purple-400 text-sm">
          {member.displayName?.[0]?.toUpperCase() || "M"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-sm truncate">{member.displayName || "Membre"}</span>
          <Badge className={`text-[9px] ${
            member.contributionStatus === "up_to_date" 
              ? "bg-green-500/20 text-green-300" 
              : "bg-yellow-500/20 text-yellow-300"
          }`}>
            {member.contributionStatus === "up_to_date" ? "À jour" : "En attente"}
          </Badge>
        </div>
        <p className="text-gray-400 text-xs truncate">{member.memberId}</p>
      </div>
    </div>
  );
}
