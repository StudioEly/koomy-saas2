import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CreditCard, Users, TrendingUp, Crown, Check, ArrowRight, 
  Loader2, AlertTriangle, Building2, Star, Zap, Shield
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Plan, Community } from "@shared/schema";

function formatPrice(amount: number | null, period: "monthly" | "yearly" = "monthly"): string {
  if (amount === null) return "Sur devis";
  const euros = amount / 100;
  return `${euros.toFixed(2).replace(".", ",")}€/${period === "yearly" ? "an" : "mois"}`;
}

function getPlanIcon(planCode: string | null) {
  switch (planCode) {
    case "STARTER_FREE":
      return <Building2 className="h-6 w-6" />;
    case "COMMUNAUTE_STANDARD":
      return <Star className="h-6 w-6" />;
    case "COMMUNAUTE_PRO":
      return <Zap className="h-6 w-6" />;
    case "ENTREPRISE_CUSTOM":
      return <Crown className="h-6 w-6" />;
    case "WHITE_LABEL":
      return <Shield className="h-6 w-6" />;
    default:
      return <Building2 className="h-6 w-6" />;
  }
}

export default function AdminBilling() {
  const { currentMembership, currentCommunity } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId;
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);

  const { data: community, isLoading: isLoadingCommunity } = useQuery<Community>({
    queryKey: [`/api/communities/${communityId}`],
    enabled: !!communityId
  });

  const { data: currentPlan, isLoading: isLoadingPlan } = useQuery<Plan>({
    queryKey: [`/api/plans/${community?.planId}`],
    enabled: !!community?.planId
  });

  const { data: allPlans, isLoading: isLoadingPlans } = useQuery<Plan[]>({
    queryKey: ["/api/plans", { public: "true" }],
    queryFn: async () => {
      const res = await fetch("/api/plans?public=true");
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    }
  });

  const { data: quota, isLoading: isLoadingQuota } = useQuery<{
    canAdd: boolean;
    current: number;
    max: number | null;
    planName: string;
  }>({
    queryKey: [`/api/communities/${communityId}/quota`],
    enabled: !!communityId
  });

  const changePlanMutation = useMutation({
    mutationFn: async (newPlanId: string) => {
      const res = await fetch(`/api/communities/${communityId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: newPlanId })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors du changement de plan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/quota`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plans/${community?.planId}`] });
      toast.success("Plan mis à jour avec succès");
      setShowUpgradeDialog(false);
      setShowDowngradeDialog(false);
      setSelectedPlan(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handlePlanClick = (plan: Plan) => {
    if (!currentPlan || plan.id === currentPlan.id) return;
    
    setSelectedPlan(plan);
    
    const currentSortOrder = currentPlan.sortOrder || 0;
    const newSortOrder = plan.sortOrder || 0;
    
    if (newSortOrder > currentSortOrder) {
      setShowUpgradeDialog(true);
    } else {
      setShowDowngradeDialog(true);
    }
  };

  const handleConfirmChange = () => {
    if (selectedPlan) {
      changePlanMutation.mutate(selectedPlan.id);
    }
  };

  const isLoading = isLoadingCommunity || isLoadingPlan || isLoadingPlans || isLoadingQuota;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const usagePercent = quota?.max 
    ? Math.min(100, Math.round((quota.current / quota.max) * 100))
    : 0;

  const isNearLimit = quota?.max && quota.current >= quota.max * 0.9;
  const isAtLimit = quota?.max && quota.current >= quota.max;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
            Facturation & Abonnement
          </h1>
          <p className="text-gray-500">
            Gérez votre abonnement et suivez l'utilisation de votre plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                    {getPlanIcon(currentPlan?.code || null)}
                  </div>
                  <div>
                    <CardTitle>Plan actuel</CardTitle>
                    <CardDescription>{currentPlan?.name || "Aucun plan"}</CardDescription>
                  </div>
                </div>
                {currentPlan?.isPopular && (
                  <Badge className="bg-sky-500 text-white">Populaire</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">{currentPlan?.description}</p>
                <div className="text-2xl font-bold text-gray-900">
                  {currentPlan?.priceMonthly !== null 
                    ? formatPrice(currentPlan?.priceMonthly || 0)
                    : "Gratuit"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Utilisation des membres</span>
                  <span className="font-medium">
                    {quota?.current || 0} / {quota?.max || "∞"} membres
                  </span>
                </div>
                <Progress 
                  value={quota?.max ? usagePercent : 0} 
                  className={`h-2 ${isAtLimit ? "bg-red-100" : isNearLimit ? "bg-amber-100" : ""}`}
                />
                {isAtLimit && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    Limite atteinte. Passez à un plan supérieur pour ajouter plus de membres.
                  </div>
                )}
                {isNearLimit && !isAtLimit && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    Vous approchez de votre limite de membres.
                  </div>
                )}
              </div>

              {currentPlan?.features && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Fonctionnalités incluses</h4>
                  <ul className="space-y-2">
                    {(currentPlan.features as string[]).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Résumé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium">{currentPlan?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Membres actifs</span>
                <span className="font-medium">{quota?.current || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-500">Limite</span>
                <span className="font-medium">{quota?.max || "Illimité"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Coût mensuel</span>
                <span className="font-bold text-lg">
                  {currentPlan?.priceMonthly !== null 
                    ? formatPrice(currentPlan?.priceMonthly || 0)
                    : "Gratuit"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Changer de plan
            </CardTitle>
            <CardDescription>
              Passez à un plan supérieur pour débloquer plus de fonctionnalités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {allPlans?.map((plan) => {
                const isCurrent = plan.id === currentPlan?.id;
                const isUpgrade = (plan.sortOrder || 0) > (currentPlan?.sortOrder || 0);
                const canDowngrade = !plan.maxMembers || (quota?.current || 0) <= plan.maxMembers;
                
                return (
                  <Card 
                    key={plan.id}
                    className={`relative cursor-pointer transition-all hover:shadow-md ${
                      isCurrent 
                        ? "border-2 border-sky-500 bg-sky-50" 
                        : plan.isCustom || plan.isWhiteLabel
                          ? "border-dashed"
                          : ""
                    }`}
                    onClick={() => !isCurrent && handlePlanClick(plan)}
                    data-testid={`plan-card-${plan.id}`}
                  >
                    {plan.isPopular && !isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-sky-500 text-white text-xs">Populaire</Badge>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-green-500 text-white text-xs">Actuel</Badge>
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCurrent ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                          {getPlanIcon(plan.code)}
                        </div>
                      </div>
                      <CardTitle className="text-sm font-semibold">{plan.name}</CardTitle>
                      <div className="text-lg font-bold">
                        {plan.priceMonthly !== null && plan.priceMonthly > 0
                          ? formatPrice(plan.priceMonthly)
                          : plan.priceMonthly === 0 
                            ? "Gratuit"
                            : "Sur devis"}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-500 mb-2">
                        {plan.maxMembers ? `Jusqu'à ${plan.maxMembers} membres` : "Membres illimités"}
                      </p>
                      {!isCurrent && (
                        <Button 
                          size="sm" 
                          variant={isUpgrade ? "default" : "outline"}
                          className="w-full mt-2"
                          disabled={!canDowngrade && !isUpgrade}
                          data-testid={`button-select-plan-${plan.id}`}
                        >
                          {plan.isCustom || plan.isWhiteLabel ? (
                            "Nous contacter"
                          ) : isUpgrade ? (
                            <>Passer au plan <ArrowRight className="h-4 w-4 ml-1" /></>
                          ) : canDowngrade ? (
                            "Rétrograder"
                          ) : (
                            "Limite dépassée"
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Passer au plan {selectedPlan?.name}</DialogTitle>
              <DialogDescription>
                Vous êtes sur le point de mettre à niveau votre abonnement vers le plan {selectedPlan?.name}.
                {selectedPlan?.priceMonthly && selectedPlan.priceMonthly > 0 && (
                  <span className="block mt-2 font-semibold">
                    Nouveau tarif : {formatPrice(selectedPlan.priceMonthly)}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedPlan?.features && (
                <div>
                  <h4 className="font-medium mb-2">Nouvelles fonctionnalités :</h4>
                  <ul className="space-y-1">
                    {(selectedPlan.features as string[]).slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleConfirmChange}
                disabled={changePlanMutation.isPending}
                data-testid="button-confirm-upgrade"
              >
                {changePlanMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirmer la mise à niveau
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rétrograder vers {selectedPlan?.name}</DialogTitle>
              <DialogDescription>
                Attention : En rétrogradant votre plan, vous perdrez l'accès à certaines fonctionnalités.
                {selectedPlan?.maxMembers && quota && quota.current > selectedPlan.maxMembers && (
                  <span className="block mt-2 text-red-600 font-semibold">
                    Impossible : Vous avez {quota.current} membres, mais ce plan est limité à {selectedPlan.maxMembers} membres.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDowngradeDialog(false)}>
                Annuler
              </Button>
              <Button 
                variant="destructive"
                onClick={handleConfirmChange}
                disabled={changePlanMutation.isPending || (selectedPlan?.maxMembers !== null && quota && quota.current > (selectedPlan?.maxMembers || 0))}
                data-testid="button-confirm-downgrade"
              >
                {changePlanMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirmer la rétrogradation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
