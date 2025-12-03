import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Settings as SettingsIcon, Users, ChevronRight, X, Plus, 
  Newspaper, Calendar, Wallet, MessageSquare, QrCode, UserCog, Trash2, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import MobileAdminLayout from "@/components/MobileAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL as API_URL } from "@/api/config";
import type { UserCommunityMembership, DelegatePermissions } from "@shared/schema";
import { extractPermissions } from "@shared/schema";

const PERMISSION_LABELS = {
  canManageArticles: { label: "Gérer les articles", icon: Newspaper },
  canManageEvents: { label: "Gérer les événements", icon: Calendar },
  canManageCollections: { label: "Gérer les collectes", icon: Wallet },
  canManageMessages: { label: "Répondre aux messages", icon: MessageSquare },
  canManageMembers: { label: "Gérer les membres", icon: Users },
  canScanPresence: { label: "Scanner les présences", icon: QrCode }
};

export default function MobileAdminSettings({ params }: { params: { communityId: string } }) {
  const communityId = params.communityId;
  const { user, currentCommunity, currentMembership, logout } = useAuth();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const permissions = useMemo<DelegatePermissions | undefined>(() => {
    if (currentMembership) {
      return extractPermissions(currentMembership as any);
    }
    return undefined;
  }, [currentMembership]);
  
  const [showDelegates, setShowDelegates] = useState(false);
  const [showAddDelegate, setShowAddDelegate] = useState(false);
  const [editingDelegate, setEditingDelegate] = useState<UserCommunityMembership | null>(null);
  const [newDelegateEmail, setNewDelegateEmail] = useState("");
  const [newDelegateName, setNewDelegateName] = useState("");

  const { data: memberships = [] } = useQuery<UserCommunityMembership[]>({
    queryKey: [`/api/communities/${communityId}/memberships`],
    enabled: !!communityId
  });

  const delegates = memberships.filter(m => m.role === "admin" || m.role === "delegate");
  const currentUserMembership = memberships.find(m => m.userId === user?.id);
  const isOwner = currentCommunity?.ownerId === user?.id;

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ id, permissions }: { id: string; permissions: Partial<DelegatePermissions> }) => {
      const response = await fetch(`${API_URL}/api/communities/${communityId}/memberships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissions)
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/memberships`] });
      toast.success("Permissions mises à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour des permissions")
  });

  const addDelegateMutation = useMutation({
    mutationFn: async (data: { email: string; displayName: string }) => {
      const response = await fetch(`${API_URL}/api/communities/${communityId}/delegates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          displayName: data.displayName,
          role: "delegate"
        })
      });
      if (!response.ok) throw new Error("Erreur lors de l'ajout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/memberships`] });
      toast.success("Délégué ajouté avec succès");
      setShowAddDelegate(false);
      setNewDelegateEmail("");
      setNewDelegateName("");
    },
    onError: () => toast.error("Erreur lors de l'ajout du délégué")
  });

  const removeDelegateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/api/communities/${communityId}/memberships/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/memberships`] });
      toast.success("Délégué supprimé");
      setEditingDelegate(null);
    },
    onError: () => toast.error("Erreur lors de la suppression")
  });

  const handlePermissionToggle = (delegateId: string, permission: keyof DelegatePermissions, currentValue: boolean) => {
    updatePermissionsMutation.mutate({
      id: delegateId,
      permissions: { [permission]: !currentValue }
    });
  };

  const handleLogout = () => {
    logout();
    setLocation("/app/admin/login");
  };

  if (editingDelegate) {
    const isEditingOwner = currentCommunity?.ownerId === editingDelegate.userId;
    
    return (
      <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Permissions du délégué</h2>
            <button onClick={() => setEditingDelegate(null)} className="text-gray-400 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-purple-500/20 text-purple-400">
                  {editingDelegate.displayName?.[0]?.toUpperCase() || "D"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-semibold">{editingDelegate.displayName || "Délégué"}</h3>
                <p className="text-gray-400 text-sm">{editingDelegate.email}</p>
              </div>
            </div>
          </div>

          {isEditingOwner ? (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-purple-300">
                <Shield size={16} />
                <span className="text-sm font-medium">Propriétaire de la communauté</span>
              </div>
              <p className="text-purple-300/70 text-xs mt-1">
                Le propriétaire a accès à toutes les fonctionnalités.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {(Object.keys(PERMISSION_LABELS) as Array<keyof typeof PERMISSION_LABELS>).map((key) => {
                const { label, icon: Icon } = PERMISSION_LABELS[key];
                const currentValue = editingDelegate[key] ?? true;
                
                return (
                  <div 
                    key={key}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-purple-400" />
                      <span className="text-white text-sm">{label}</span>
                    </div>
                    <Switch
                      checked={currentValue}
                      onCheckedChange={() => handlePermissionToggle(editingDelegate.id, key, currentValue)}
                      disabled={updatePermissionsMutation.isPending}
                      data-testid={`switch-permission-${key}`}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {!isEditingOwner && isOwner && (
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => {
                if (confirm("Supprimer ce délégué ?")) {
                  removeDelegateMutation.mutate(editingDelegate.id);
                }
              }}
              disabled={removeDelegateMutation.isPending}
              data-testid="button-remove-delegate"
            >
              <Trash2 size={18} className="mr-2" />
              Supprimer ce délégué
            </Button>
          )}
        </div>
      </MobileAdminLayout>
    );
  }

  if (showAddDelegate) {
    return (
      <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Ajouter un délégué</h2>
            <button onClick={() => setShowAddDelegate(false)} className="text-gray-400 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!newDelegateEmail || !newDelegateName) {
              toast.error("Veuillez remplir tous les champs");
              return;
            }
            addDelegateMutation.mutate({ email: newDelegateEmail, displayName: newDelegateName });
          }} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Nom *</label>
              <Input
                value={newDelegateName}
                onChange={(e) => setNewDelegateName(e.target.value)}
                placeholder="Nom du délégué"
                className="h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                data-testid="input-delegate-name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Email *</label>
              <Input
                type="email"
                value={newDelegateEmail}
                onChange={(e) => setNewDelegateEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                data-testid="input-delegate-email"
              />
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <p className="text-purple-300 text-xs">
                Le délégué recevra un email pour créer son compte et accéder à l'app Pro 
                avec les permissions que vous lui aurez attribuées.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold mt-4"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}
              disabled={addDelegateMutation.isPending}
              data-testid="button-add-delegate"
            >
              {addDelegateMutation.isPending ? "..." : "Ajouter le délégué"}
            </Button>
          </form>
        </div>
      </MobileAdminLayout>
    );
  }

  if (showDelegates) {
    return (
      <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Délégués</h2>
            <button onClick={() => setShowDelegates(false)} className="text-gray-400 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          {isOwner && (
            <Button
              onClick={() => setShowAddDelegate(true)}
              className="w-full h-12 rounded-xl font-semibold mb-6"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}
              data-testid="button-new-delegate"
            >
              <Plus size={18} className="mr-2" />
              Ajouter un délégué
            </Button>
          )}

          {delegates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto mb-3 text-gray-500" size={40} />
              <p className="text-gray-400 text-sm">Aucun délégué pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {delegates.map((delegate) => {
                const isDelegateOwner = currentCommunity?.ownerId === delegate.userId;
                return (
                  <div
                    key={delegate.id}
                    onClick={() => (isOwner || delegate.id === currentUserMembership?.id) && setEditingDelegate(delegate)}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
                    data-testid={`delegate-card-${delegate.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-purple-500/20 text-purple-400">
                          {delegate.displayName?.[0]?.toUpperCase() || "D"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{delegate.displayName || "Délégué"}</span>
                          {isDelegateOwner && (
                            <Badge className="bg-purple-500/20 text-purple-300 text-[9px]">Propriétaire</Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs">{delegate.email}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-500" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </MobileAdminLayout>
    );
  }

  return (
    <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
      <div className="p-4">
        <h2 className="text-lg font-bold text-white mb-6">Paramètres</h2>

        <div className="space-y-3">
          {isOwner && (
            <div
              onClick={() => setShowDelegates(true)}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer"
              data-testid="settings-delegates"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <UserCog size={20} className="text-purple-400" />
                </div>
                <div>
                  <span className="text-white font-medium text-sm">Gestion des délégués</span>
                  <p className="text-gray-400 text-xs">{delegates.length} délégué{delegates.length > 1 ? "s" : ""}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-500" />
            </div>
          )}

          <Link href={`/app/${communityId}/admin/scanner`}>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" data-testid="settings-scanner">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <QrCode size={20} className="text-blue-400" />
                </div>
                <span className="text-white font-medium text-sm">Scanner QR Code</span>
              </div>
              <ChevronRight size={18} className="text-gray-500" />
            </div>
          </Link>

          <Link href="/admin/dashboard">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" data-testid="settings-backoffice">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <SettingsIcon size={20} className="text-green-400" />
                </div>
                <div>
                  <span className="text-white font-medium text-sm">Accéder au Back-Office</span>
                  <p className="text-gray-400 text-xs">Paramètres avancés</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-500" />
            </div>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </MobileAdminLayout>
  );
}
