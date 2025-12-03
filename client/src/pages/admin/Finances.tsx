import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, Users, TrendingUp, Wallet, Check, AlertTriangle, 
  Loader2, ExternalLink, Plus, Target, Calendar, X, 
  Euro, Share2, Link2, Building2, CheckCircle2, Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Plan, Community, Collection, Transaction } from "@shared/schema";

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
  membershipId: string | null;
  collectionId: string | null;
  stripePaymentIntentId: string | null;
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
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function AdminFinances() {
  const { currentMembership, currentCommunity } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId || currentCommunity?.id;
  
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionResponse | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [editingFee, setEditingFee] = useState(false);
  const [newFeeAmount, setNewFeeAmount] = useState("");
  
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

  const { data: currentPlan, isLoading: isLoadingPlan } = useQuery<Plan>({
    queryKey: [`/api/plans/${community?.planId}`],
    enabled: !!community?.planId
  });

  const userId = currentMembership?.userId;

  const { data: collectionsData, isLoading: isLoadingCollections } = useQuery<{ collections: CollectionResponse[] }>({
    queryKey: [`/api/communities/${communityId}/collections/all?userId=${userId}`],
    enabled: !!communityId && !!userId
  });

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery<{ transactions: TransactionResponse[] }>({
    queryKey: [`/api/communities/${communityId}/transactions?userId=${userId}`],
    enabled: !!communityId && !!userId
  });

  const { data: quota } = useQuery<{
    canAdd: boolean;
    current: number;
    max: number | null;
    planName: string;
  }>({
    queryKey: [`/api/communities/${communityId}/quota`],
    enabled: !!communityId
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

  const updateCommunityMutation = useMutation({
    mutationFn: async (data: { membershipFeeAmount?: number; membershipFeeEnabled?: boolean }) => {
      const res = await fetch(`/api/communities/${communityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}`] });
      toast.success("Cotisation mise à jour");
      setEditingFee(false);
      setNewFeeAmount("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
      toast.success("Collecte créée avec succès");
      setShowCreateCollection(false);
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

  const handleSaveFee = () => {
    const amountCents = Math.round(parseFloat(newFeeAmount) * 100);
    if (isNaN(amountCents) || amountCents < 0) {
      toast.error("Montant invalide");
      return;
    }
    updateCommunityMutation.mutate({ membershipFeeAmount: amountCents });
  };

  const handleToggleFeeEnabled = (enabled: boolean) => {
    if (enabled && !community?.paymentsEnabled) {
      toast.error("Vous devez d'abord configurer Stripe Connect");
      return;
    }
    updateCommunityMutation.mutate({ membershipFeeEnabled: enabled });
  };

  const handleCreateCollection = () => {
    const amountCents = Math.round(parseFloat(newCollection.amountCents) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      toast.error("Montant par participant invalide");
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

  const handleCloseCollection = (collection: CollectionResponse) => {
    setSelectedCollection(collection);
    setShowCloseConfirm(true);
  };

  const confirmCloseCollection = () => {
    if (selectedCollection) {
      closeCollectionMutation.mutate(selectedCollection.id);
    }
  };

  const getCollectionShareUrl = (collectionId: string) => {
    return `https://app.koomy.app/community/${communityId}/collection/${collectionId}`;
  };

  const copyShareLink = (collectionId: string) => {
    navigator.clipboard.writeText(getCollectionShareUrl(collectionId));
    toast.success("Lien copié dans le presse-papiers");
  };

  const isLoading = isLoadingCommunity || isLoadingPlan;
  const collections = collectionsData?.collections || [];
  const transactions = transactionsData?.transactions || [];
  const openCollections = collections.filter(c => c.status === "open");
  const closedCollections = collections.filter(c => c.status !== "open");

  const stripeConnected = !!community?.stripeConnectAccountId;
  const paymentsEnabled = community?.paymentsEnabled === true;

  const paidMembersCount = 0;
  const totalMembers = quota?.current || 0;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
            Finances & Collectes
          </h1>
          <p className="text-gray-500">
            Gérez les paiements en ligne, les cotisations et les collectes de votre communauté
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview" data-testid="tab-overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="collections" data-testid="tab-collections">Collectes</TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>Statut des paiements</CardTitle>
                      <CardDescription>Configuration Stripe Connect</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Stripe Connect</p>
                        <p className="text-sm text-gray-500">Recevoir des paiements en ligne</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {stripeConnected ? (
                        paymentsEnabled ? (
                          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Activé
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
                            <Clock size={12} /> En attente
                          </Badge>
                        )
                      ) : (
                        <Badge variant="secondary">Non configuré</Badge>
                      )}
                      <Button 
                        variant={stripeConnected ? "outline" : "default"}
                        size="sm"
                        onClick={handleConnectStripe}
                        disabled={isConnecting || connectStripeMutation.isPending}
                        data-testid="button-connect-stripe"
                      >
                        {(isConnecting || connectStripeMutation.isPending) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {stripeConnected ? "Gérer" : "Configurer"}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">Cotisation annuelle</h3>
                        <p className="text-sm text-gray-500">Montant demandé aux adhérents</p>
                      </div>
                      {editingFee ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={newFeeAmount}
                            onChange={(e) => setNewFeeAmount(e.target.value)}
                            className="w-24"
                            data-testid="input-fee-amount"
                          />
                          <span className="text-gray-500">€</span>
                          <Button size="sm" onClick={handleSaveFee} disabled={updateCommunityMutation.isPending}>
                            {updateCommunityMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauver"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingFee(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-gray-900" data-testid="text-fee-amount">
                            {community?.membershipFeeAmount 
                              ? formatAmount(community.membershipFeeAmount, community.currency || "EUR")
                              : "Non définie"}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingFee(true);
                              setNewFeeAmount(community?.membershipFeeAmount ? String(community.membershipFeeAmount / 100) : "");
                            }}
                            data-testid="button-edit-fee"
                          >
                            Modifier
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Paiement en ligne des cotisations</p>
                        <p className="text-sm text-gray-500">
                          {paymentsEnabled 
                            ? "Les adhérents peuvent payer leur cotisation via l'app"
                            : "Configurez Stripe Connect pour activer cette option"}
                        </p>
                      </div>
                      <Switch
                        checked={community?.membershipFeeEnabled || false}
                        onCheckedChange={handleToggleFeeEnabled}
                        disabled={!paymentsEnabled || updateCommunityMutation.isPending}
                        data-testid="switch-fee-enabled"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-sky-600" />
                    Résumé
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Plan actuel</span>
                    <Badge variant="secondary" data-testid="badge-plan">
                      {currentPlan?.name || "Free"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Membres</span>
                    <span className="font-medium" data-testid="text-members-count">
                      {totalMembers}{quota?.max ? ` / ${quota.max}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Collectes ouvertes</span>
                    <span className="font-medium" data-testid="text-open-collections">
                      {openCollections.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Transactions</span>
                    <span className="font-medium" data-testid="text-transactions-count">
                      {transactions.length}
                    </span>
                  </div>
                  {transactions.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Total encaissé</span>
                        <span className="font-bold text-emerald-600" data-testid="text-total-collected">
                          {formatAmount(
                            transactions
                              .filter(t => t.status === "succeeded")
                              .reduce((sum, t) => sum + t.amountToCommunity, 0),
                            community?.currency || "EUR"
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Collectes</h2>
                <p className="text-sm text-gray-500">
                  Organisez des collectes de fonds pour votre communauté
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateCollection(true)}
                disabled={!paymentsEnabled}
                data-testid="button-create-collection"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle collecte
              </Button>
            </div>

            {!paymentsEnabled && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Configuration requise</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Vous devez configurer Stripe Connect avant de pouvoir créer des collectes.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={handleConnectStripe}
                      >
                        Configurer Stripe Connect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {openCollections.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Collectes en cours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {openCollections.map(collection => (
                    <Card key={collection.id} data-testid={`card-collection-${collection.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{collection.title}</CardTitle>
                            {collection.description && (
                              <CardDescription className="mt-1">{collection.description}</CardDescription>
                            )}
                          </div>
                          <Badge className="bg-green-100 text-green-700">En cours</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Euro className="h-4 w-4 text-gray-400" />
                            <span>{formatAmount(collection.amountCents)}</span>
                            {collection.allowCustomAmount && (
                              <span className="text-gray-400">(libre)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{collection.participantsCount} participants</span>
                          </div>
                        </div>

                        {collection.targetAmountCents && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Progression</span>
                              <span className="font-medium">
                                {formatAmount(collection.collectedAmountCents)} / {formatAmount(collection.targetAmountCents)}
                              </span>
                            </div>
                            <Progress value={collection.percentComplete || 0} className="h-2" />
                          </div>
                        )}

                        {!collection.targetAmountCents && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Collecté</span>
                            <span className="font-medium text-emerald-600">
                              {formatAmount(collection.collectedAmountCents)}
                            </span>
                          </div>
                        )}

                        {collection.deadline && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Jusqu'au {formatDate(collection.deadline)}</span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t pt-4 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyShareLink(collection.id)}
                          data-testid={`button-share-${collection.id}`}
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          Copier le lien
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCloseCollection(collection)}
                          data-testid={`button-close-${collection.id}`}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Clore
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {closedCollections.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Collectes terminées</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Collecté</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Fermée le</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {closedCollections.map(collection => (
                      <TableRow key={collection.id}>
                        <TableCell className="font-medium">{collection.title}</TableCell>
                        <TableCell>
                          <Badge variant={collection.status === "closed" ? "secondary" : "destructive"}>
                            {collection.status === "closed" ? "Fermée" : "Annulée"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatAmount(collection.collectedAmountCents)}</TableCell>
                        <TableCell>{collection.participantsCount}</TableCell>
                        <TableCell>{collection.closedAt ? formatDate(collection.closedAt) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {collections.length === 0 && paymentsEnabled && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune collecte</h3>
                  <p className="text-gray-500 mb-4">
                    Créez votre première collecte pour commencer à recevoir des contributions.
                  </p>
                  <Button onClick={() => setShowCreateCollection(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une collecte
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Historique des transactions</h2>
              <p className="text-sm text-gray-500">
                Toutes les transactions de paiement de votre communauté
              </p>
            </div>

            {isLoadingTransactions ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction</h3>
                  <p className="text-gray-500">
                    Les transactions apparaîtront ici lorsque des paiements seront effectués.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Montant total</TableHead>
                      <TableHead className="text-right">Commission Koomy</TableHead>
                      <TableHead className="text-right">Reversé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(transaction => (
                      <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                        <TableCell className="font-medium">
                          {formatDateTime(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {transaction.type === "subscription" && "Abonnement"}
                            {transaction.type === "membership" && "Cotisation"}
                            {transaction.type === "collection" && "Collecte"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.status === "succeeded" ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 size={12} className="mr-1" />
                              Réussi
                            </Badge>
                          ) : transaction.status === "pending" ? (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <Clock size={12} className="mr-1" />
                              En attente
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              {transaction.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatAmount(transaction.amountTotalCents, transaction.currency)}
                        </TableCell>
                        <TableCell className="text-right text-gray-500">
                          {formatAmount(transaction.amountFeeKoomyCents, transaction.currency)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-emerald-600">
                          {formatAmount(transaction.amountToCommunity, transaction.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showCreateCollection} onOpenChange={setShowCreateCollection}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle collecte</DialogTitle>
            <DialogDescription>
              Créez une collecte pour recevoir des contributions de vos adhérents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la collecte *</Label>
              <Input
                id="title"
                placeholder="Ex: Pot de départ, Cagnotte Noël..."
                value={newCollection.title}
                onChange={(e) => setNewCollection(prev => ({ ...prev, title: e.target.value }))}
                data-testid="input-collection-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez l'objectif de cette collecte..."
                value={newCollection.description}
                onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                data-testid="input-collection-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Montant par participant (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.50"
                placeholder="10.00"
                value={newCollection.amountCents}
                onChange={(e) => setNewCollection(prev => ({ ...prev, amountCents: e.target.value }))}
                data-testid="input-collection-amount"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowCustom"
                checked={newCollection.allowCustomAmount}
                onCheckedChange={(checked) => setNewCollection(prev => ({ ...prev, allowCustomAmount: checked === true }))}
                data-testid="checkbox-allow-custom"
              />
              <Label htmlFor="allowCustom" className="text-sm">
                Permettre un montant libre
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Objectif (€)</Label>
              <Input
                id="target"
                type="number"
                step="0.01"
                min="0"
                placeholder="Optionnel"
                value={newCollection.targetAmountCents}
                onChange={(e) => setNewCollection(prev => ({ ...prev, targetAmountCents: e.target.value }))}
                data-testid="input-collection-target"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Date limite</Label>
              <Input
                id="deadline"
                type="date"
                value={newCollection.deadline}
                onChange={(e) => setNewCollection(prev => ({ ...prev, deadline: e.target.value }))}
                data-testid="input-collection-deadline"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCollection(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateCollection}
              disabled={!newCollection.title || !newCollection.amountCents || createCollectionMutation.isPending}
              data-testid="button-submit-collection"
            >
              {createCollectionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clore la collecte</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir clore la collecte "{selectedCollection?.title}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {selectedCollection && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Montant collecté</span>
                <span className="font-medium">{formatAmount(selectedCollection.collectedAmountCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Participants</span>
                <span className="font-medium">{selectedCollection.participantsCount}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseConfirm(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmCloseCollection}
              disabled={closeCollectionMutation.isPending}
            >
              {closeCollectionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clore la collecte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
