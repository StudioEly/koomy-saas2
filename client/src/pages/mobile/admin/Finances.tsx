import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Wallet, CreditCard, Users, Plus, Check, X, 
  Clock, Target, Euro, Share2, Link2, AlertTriangle,
  ChevronRight, CheckCircle2, ExternalLink, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useLocation } from "wouter";
import MobileAdminLayout from "@/components/MobileAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import type { Community, Plan, DelegatePermissions } from "@shared/schema";
import { extractPermissions } from "@shared/schema";

interface CollectionResponse {
  id: string;
  title: string;
  description: string | null;
  amountCents: number;
  allowCustomAmount: boolean;
  targetAmountCents: number | null;
  collectedAmountCents: number;
  participantsCount: number;
  percentComplete: number | null;
  deadline: string | null;
  status: string;
  createdAt: string;
  closedAt: string | null;
}

interface TransactionResponse {
  id: string;
  type: string;
  status: string;
  amountTotalCents: number;
  amountFeeKoomyCents: number;
  amountToCommunity: number;
  currency: string;
  createdAt: string;
}

function formatAmount(cents: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency 
  }).format(cents / 100);
}

function formatDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
}

export default function MobileAdminFinances({ params }: { params: { communityId: string } }) {
  const communityId = params.communityId;
  const [_, setLocation] = useLocation();
  const { user, currentCommunity, currentMembership, selectCommunity } = useAuth();
  const queryClient = useQueryClient();

  const permissions = useMemo<DelegatePermissions | undefined>(() => {
    if (currentMembership) {
      return extractPermissions(currentMembership as any);
    }
    return undefined;
  }, [currentMembership]);

  useEffect(() => {
    if (!user) {
      setLocation("/app/admin/login");
      return;
    }
    if (currentCommunity?.id !== communityId) {
      selectCommunity(communityId);
    }
  }, [user, communityId, currentCommunity, selectCommunity, setLocation]);

  const [activeTab, setActiveTab] = useState<"overview" | "collections" | "create">("overview");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionResponse | null>(null);
  
  const [newCollection, setNewCollection] = useState({
    title: "",
    description: "",
    amountCents: "",
    allowCustomAmount: false,
    targetAmountCents: "",
    deadline: ""
  });

  const { data: community, isLoading: isLoadingCommunity } = useQuery<Community>({
    queryKey: [`/api/communities/${communityId}`],
    enabled: !!communityId
  });

  const { data: currentPlan } = useQuery<Plan>({
    queryKey: [`/api/plans/${community?.planId}`],
    enabled: !!community?.planId
  });

  const userId = currentMembership?.userId;

  const { data: collectionsData } = useQuery<{ collections: CollectionResponse[] }>({
    queryKey: [`/api/communities/${communityId}/collections/all?userId=${userId}`],
    enabled: !!communityId && !!userId
  });

  const { data: transactionsData } = useQuery<{ transactions: TransactionResponse[] }>({
    queryKey: [`/api/communities/${communityId}/transactions?userId=${userId}`],
    enabled: !!communityId && !!userId
  });

  const connectStripeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/payments/connect-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la connexion à Stripe");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setIsConnecting(false);
    }
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          userId: currentMembership?.userId,
          ...data
        })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la création");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/collections/all`] });
      toast.success("Collecte créée");
      setActiveTab("collections");
      setNewCollection({ title: "", description: "", amountCents: "", allowCustomAmount: false, targetAmountCents: "", deadline: "" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const closeCollectionMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      const res = await fetch(`/api/collections/${collectionId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentMembership?.userId })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la fermeture");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/collections/all`] });
      toast.success("Collecte fermée");
      setShowCloseConfirm(false);
      setSelectedCollection(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleConnectStripe = () => {
    setIsConnecting(true);
    connectStripeMutation.mutate();
  };

  const handleCreateCollection = () => {
    const amountCents = Math.round(parseFloat(newCollection.amountCents) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast.error("Montant invalide");
      return;
    }

    const targetCents = newCollection.targetAmountCents 
      ? Math.round(parseFloat(newCollection.targetAmountCents) * 100) 
      : null;

    createCollectionMutation.mutate({
      title: newCollection.title,
      description: newCollection.description || null,
      amountCents,
      allowCustomAmount: newCollection.allowCustomAmount,
      targetAmountCents: targetCents,
      deadline: newCollection.deadline || null
    });
  };

  const copyShareLink = (collectionId: string) => {
    const url = `https://app.koomy.app/community/${communityId}/collection/${collectionId}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié");
  };

  const collections = collectionsData?.collections || [];
  const transactions = transactionsData?.transactions || [];
  const openCollections = collections.filter(c => c.status === "open");

  const stripeConnected = !!community?.stripeConnectAccountId;
  const paymentsEnabled = community?.paymentsEnabled === true;

  const totalCollected = transactions
    .filter(t => t.status === "succeeded")
    .reduce((sum, t) => sum + t.amountToCommunity, 0);

  if (!user) return null;

  return (
    <MobileAdminLayout 
      communityId={communityId} 
      communityName={currentCommunity?.name || community?.name}
      permissions={permissions}
    >
      <div className="p-4 space-y-6" data-testid="mobile-admin-finances-page">
        <div className="flex items-center gap-3">
          {[
            { key: "overview", label: "Résumé" },
            { key: "collections", label: "Collectes" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.key 
                  ? "bg-purple-500 text-white" 
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
              data-testid={`tab-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-purple-200 text-sm">Total encaissé</p>
                  <p className="text-white text-2xl font-bold" data-testid="text-total-collected">
                    {formatAmount(totalCollected, community?.currency || "EUR")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-purple-200 text-xs">Collectes ouvertes</p>
                  <p className="text-white text-xl font-semibold">{openCollections.length}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-purple-200 text-xs">Transactions</p>
                  <p className="text-white text-xl font-semibold">{transactions.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <span className="text-white font-medium">Stripe Connect</span>
                </div>
                {stripeConnected ? (
                  paymentsEnabled ? (
                    <Badge className="bg-green-500/20 text-green-300">
                      <CheckCircle2 size={12} className="mr-1" /> Activé
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-300">
                      <Clock size={12} className="mr-1" /> En attente
                    </Badge>
                  )
                ) : (
                  <Badge className="bg-gray-500/20 text-gray-300">Non configuré</Badge>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4">
                {paymentsEnabled 
                  ? "Vous pouvez recevoir des paiements en ligne"
                  : "Configurez Stripe pour recevoir des paiements"}
              </p>
              <Button 
                className="w-full"
                variant={stripeConnected ? "outline" : "default"}
                onClick={handleConnectStripe}
                disabled={isConnecting || connectStripeMutation.isPending}
                data-testid="button-connect-stripe"
              >
                {(isConnecting || connectStripeMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {stripeConnected ? "Gérer Stripe" : "Configurer Stripe"}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Plan actuel</span>
                <Badge variant="secondary">{currentPlan?.name || "Free"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Cotisation annuelle</span>
                <span className="text-white font-medium">
                  {community?.membershipFeeAmount 
                    ? formatAmount(community.membershipFeeAmount, community.currency || "EUR")
                    : "Non définie"}
                </span>
              </div>
            </div>

            {transactions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-sm">Dernières transactions</h3>
                {transactions.slice(0, 5).map(tx => (
                  <div 
                    key={tx.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between"
                    data-testid={`transaction-${tx.id}`}
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {tx.type === "membership" && "Cotisation"}
                        {tx.type === "collection" && "Collecte"}
                        {tx.type === "subscription" && "Abonnement"}
                      </p>
                      <p className="text-gray-400 text-xs">{formatDate(tx.createdAt)}</p>
                    </div>
                    <span className="text-green-400 font-semibold">
                      +{formatAmount(tx.amountToCommunity, tx.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "collections" && (
          <div className="space-y-4">
            {!paymentsEnabled && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-medium text-sm">Configuration requise</p>
                    <p className="text-yellow-200/70 text-xs mt-1">
                      Configurez Stripe Connect pour créer des collectes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              className="w-full"
              onClick={() => setActiveTab("create")}
              disabled={!paymentsEnabled}
              data-testid="button-new-collection"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle collecte
            </Button>

            {openCollections.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-sm">En cours</h3>
                {openCollections.map(collection => (
                  <div 
                    key={collection.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                    data-testid={`collection-${collection.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{collection.title}</h4>
                        {collection.description && (
                          <p className="text-gray-400 text-xs mt-1">{collection.description}</p>
                        )}
                      </div>
                      <Badge className="bg-green-500/20 text-green-300">Ouverte</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1 text-gray-300">
                        <Euro className="h-4 w-4 text-gray-500" />
                        {formatAmount(collection.amountCents)}
                      </div>
                      <div className="flex items-center gap-1 text-gray-300">
                        <Users className="h-4 w-4 text-gray-500" />
                        {collection.participantsCount}
                      </div>
                    </div>

                    {collection.targetAmountCents ? (
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Progression</span>
                          <span className="text-white">
                            {formatAmount(collection.collectedAmountCents)} / {formatAmount(collection.targetAmountCents)}
                          </span>
                        </div>
                        <Progress value={collection.percentComplete || 0} className="h-2" />
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-400">Collecté</span>
                        <span className="text-green-400 font-medium">
                          {formatAmount(collection.collectedAmountCents)}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        onClick={() => copyShareLink(collection.id)}
                        data-testid={`share-${collection.id}`}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Partager
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedCollection(collection);
                          setShowCloseConfirm(true);
                        }}
                        data-testid={`close-${collection.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {collections.filter(c => c.status !== "open").length > 0 && (
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-sm">Terminées</h3>
                {collections.filter(c => c.status !== "open").map(collection => (
                  <div 
                    key={collection.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{collection.title}</p>
                      <p className="text-gray-400 text-xs">
                        {formatAmount(collection.collectedAmountCents)} · {collection.participantsCount} participants
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {collection.status === "closed" ? "Fermée" : "Annulée"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {collections.length === 0 && paymentsEnabled && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Aucune collecte</p>
                <p className="text-gray-400 text-sm">Créez votre première collecte</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Nouvelle collecte</h2>
              <button 
                onClick={() => setActiveTab("collections")}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Titre *</Label>
                <Input
                  placeholder="Ex: Pot de départ..."
                  value={newCollection.title}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Textarea
                  placeholder="Décrivez l'objectif..."
                  value={newCollection.description}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="input-description"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Montant par participant (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.50"
                  placeholder="10.00"
                  value={newCollection.amountCents}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, amountCents: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="input-amount"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowCustom"
                  checked={newCollection.allowCustomAmount}
                  onCheckedChange={(checked) => setNewCollection(prev => ({ ...prev, allowCustomAmount: checked === true }))}
                  data-testid="checkbox-custom"
                />
                <Label htmlFor="allowCustom" className="text-gray-300 text-sm">
                  Permettre un montant libre
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Objectif (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Optionnel"
                  value={newCollection.targetAmountCents}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, targetAmountCents: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="input-target"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Date limite</Label>
                <Input
                  type="date"
                  value={newCollection.deadline}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, deadline: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                  data-testid="input-deadline"
                />
              </div>

              <Button 
                className="w-full mt-4"
                onClick={handleCreateCollection}
                disabled={!newCollection.title || !newCollection.amountCents || createCollectionMutation.isPending}
                data-testid="button-create"
              >
                {createCollectionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer la collecte
              </Button>
            </div>
          </div>
        )}
      </div>

      {showCloseConfirm && selectedCollection && (
        <div className="fixed inset-0 bg-black/80 flex items-end z-50">
          <div className="bg-gray-900 w-full rounded-t-3xl p-6 space-y-4">
            <h3 className="text-white font-semibold text-lg">Clore la collecte ?</h3>
            <p className="text-gray-400 text-sm">
              "{selectedCollection.title}" - Cette action est irréversible.
            </p>
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Collecté</span>
                <span className="text-white font-medium">{formatAmount(selectedCollection.collectedAmountCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Participants</span>
                <span className="text-white font-medium">{selectedCollection.participantsCount}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowCloseConfirm(false);
                  setSelectedCollection(null);
                }}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive"
                className="flex-1"
                onClick={() => closeCollectionMutation.mutate(selectedCollection.id)}
                disabled={closeCollectionMutation.isPending}
              >
                {closeCollectionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Clore
              </Button>
            </div>
          </div>
        </div>
      )}
    </MobileAdminLayout>
  );
}
