import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Wallet, Users, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation } from "wouter";
import MobileAdminLayout from "@/components/MobileAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL as API_URL } from "@/api/config";
import type { MembershipFee, PaymentRequest, DelegatePermissions } from "@shared/schema";
import { extractPermissions } from "@shared/schema";

export default function MobileAdminCollections({ params }: { params: { communityId: string } }) {
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
    if (permissions && !permissions.canManageCollections) {
      toast.error("Vous n'avez pas la permission de gérer les collectes");
      setLocation(`/app/${communityId}/admin`);
    }
  }, [permissions, communityId, setLocation]);
  
  const [showEditor, setShowEditor] = useState(false);
  const [viewingFee, setViewingFee] = useState<MembershipFee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    period: "one_time"
  });

  const { data: fees = [], isLoading: loadingFees } = useQuery<MembershipFee[]>({
    queryKey: [`/api/communities/${communityId}/fees`],
    enabled: !!communityId
  });

  const { data: paymentRequests = [] } = useQuery<PaymentRequest[]>({
    queryKey: [`/api/communities/${communityId}/payment-requests`],
    enabled: !!communityId
  });

  const { data: members = [] } = useQuery<any[]>({
    queryKey: [`/api/communities/${communityId}/memberships`],
    enabled: !!communityId
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`${API_URL}/api/communities/${communityId}/fees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          amount: Math.round(parseFloat(data.amount) * 100),
          period: data.period,
          currency: "EUR"
        })
      });
      if (!response.ok) throw new Error("Erreur lors de la création");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/fees`] });
      toast.success("Collecte créée avec succès");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de la création de la collecte")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/api/communities/${communityId}/fees/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/fees`] });
      toast.success("Collecte supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression")
  });

  const resetForm = () => {
    setShowEditor(false);
    setFormData({ name: "", description: "", amount: "", period: "one_time" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    createMutation.mutate(formData);
  };

  const getPaymentStats = (feeId: string) => {
    const requests = paymentRequests.filter(pr => pr.feeId === feeId);
    const paid = requests.filter(pr => pr.status === "paid").length;
    const pending = requests.filter(pr => pr.status === "pending").length;
    const total = requests.reduce((sum, pr) => pr.status === "paid" ? sum + pr.amount : sum, 0);
    return { paid, pending, total, totalRequests: requests.length };
  };

  if (viewingFee) {
    const stats = getPaymentStats(viewingFee.id);
    const requests = paymentRequests.filter(pr => pr.feeId === viewingFee.id);
    
    return (
      <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">{viewingFee.name}</h2>
            <button onClick={() => setViewingFee(null)} className="text-gray-400 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <div className="text-green-400 text-2xl font-bold">{stats.paid}</div>
              <div className="text-green-400/70 text-xs">Payé</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
              <div className="text-yellow-400 text-2xl font-bold">{stats.pending}</div>
              <div className="text-yellow-400/70 text-xs">En attente</div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
            <div className="text-purple-400 text-xs mb-1">Total collecté</div>
            <div className="text-white text-2xl font-bold">{(stats.total / 100).toFixed(2)} €</div>
          </div>

          <h3 className="text-white font-semibold text-sm mb-3">Détail des paiements</h3>
          
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto mb-2 text-gray-500" size={32} />
              <p className="text-gray-400 text-sm">Aucune demande envoyée</p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((request) => {
                const member = members.find(m => m.id === request.membershipId);
                return (
                  <div 
                    key={request.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">{member?.displayName || "Membre"}</div>
                      <div className="text-gray-400 text-xs">{(request.amount / 100).toFixed(2)} €</div>
                    </div>
                    <Badge className={`text-[10px] ${
                      request.status === "paid" 
                        ? "bg-green-500/20 text-green-300" 
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}>
                      {request.status === "paid" ? "Payé" : "En attente"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </MobileAdminLayout>
    );
  }

  if (showEditor) {
    return (
      <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Nouvelle collecte</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Titre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Cotisation 2025"
                className="h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                data-testid="input-collection-name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Montant (€) *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                placeholder="50.00"
                className="h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                data-testid="input-collection-amount"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Décrivez cette collecte..."
                className="min-h-[80px] rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500 resize-none"
                data-testid="input-collection-description"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold mt-4"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}
              disabled={createMutation.isPending}
              data-testid="button-create-collection"
            >
              {createMutation.isPending ? "..." : "Créer la collecte"}
            </Button>
          </form>
        </div>
      </MobileAdminLayout>
    );
  }

  return (
    <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Collectes</h2>
          <Button
            onClick={() => setShowEditor(true)}
            className="h-10 rounded-xl font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}
            data-testid="button-new-collection"
          >
            <Plus size={16} className="mr-1" />
            Nouveau
          </Button>
        </div>

        {loadingFees ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : fees.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="mx-auto mb-3 text-gray-500" size={40} />
            <p className="text-gray-400 text-sm">Aucune collecte pour le moment</p>
            <p className="text-gray-500 text-xs mt-1">Créez votre première collecte</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fees.map((fee) => {
              const stats = getPaymentStats(fee.id);
              return (
                <div
                  key={fee.id}
                  onClick={() => setViewingFee(fee)}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  data-testid={`collection-card-${fee.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm">{fee.name}</h3>
                        <Badge className={fee.isActive ? "bg-green-500/20 text-green-300 text-[9px]" : "bg-gray-500/20 text-gray-400 text-[9px]"}>
                          {fee.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-purple-400 font-bold text-lg">{(fee.amount / 100).toFixed(2)} €</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-green-400 text-xs">
                          <Check size={12} />
                          {stats.paid} payé{stats.paid > 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                          <Clock size={12} />
                          {stats.pending} en attente
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Supprimer cette collecte ?")) {
                          deleteMutation.mutate(fee.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      data-testid={`button-delete-collection-${fee.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileAdminLayout>
  );
}
