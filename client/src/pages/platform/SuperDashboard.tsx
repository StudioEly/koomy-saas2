import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MOCK_PLANS, Plan } from "@/lib/mockData";
import { MOCK_TICKETS } from "@/lib/mockSupportData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Users, Settings, MessageSquare, CheckCircle, Clock, AlertCircle, 
  TrendingUp, TrendingDown, Shield, CreditCard, BarChart3, LogOut, Gift, X, Sparkles,
  DollarSign, PiggyBank, Activity, Wallet, ArrowUpRight, ArrowDownRight,
  Building2, Calendar, Euro, Banknote, ChartPie, Target
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

type Community = {
  id: string;
  name: string;
  logo: string | null;
  memberCount: number | null;
  planId: string;
  fullAccessGrantedAt: string | null;
  fullAccessExpiresAt: string | null;
  fullAccessReason: string | null;
  fullAccessGrantedBy: string | null;
};

type PlatformMetrics = {
  mrr: number;
  arr: number;
  totalClients: number;
  activeClients: number;
  totalMembers: number;
  revenueByPlan: { planId: string; planName: string; planCode: string; count: number; mrr: number }[];
  volumeCollected: number;
  volumeCollectedThisMonth: number;
  paymentsCount: number;
  paymentsCountThisMonth: number;
  newClientsThisMonth: number;
  churnedClientsThisMonth: number;
  mrrGrowth: number;
};

type RevenueHistory = { month: string; revenue: number; payments: number }[];

type TopCommunity = {
  communityId: string;
  communityName: string;
  totalRevenue: number;
  memberCount: number;
  planName: string;
};

const PLAN_COLORS: Record<string, string> = {
  'STARTER_FREE': '#94a3b8',
  'COMMUNAUTE_STANDARD': '#3b82f6',
  'COMMUNAUTE_PRO': '#8b5cf6',
  'ENTREPRISE_CUSTOM': '#f59e0b',
  'WHITE_LABEL': '#10b981'
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

export default function SuperAdminDashboard() {
  const [_, setLocation] = useLocation();
  const { user, logout, isPlatformAdmin, authReady } = useAuth();
  const queryClient = useQueryClient();
  const [tickets] = useState(MOCK_TICKETS);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  
  const [fullAccessModalOpen, setFullAccessModalOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [fullAccessReason, setFullAccessReason] = useState("");
  const [fullAccessDuration, setFullAccessDuration] = useState<string>("permanent");
  const [customDays, setCustomDays] = useState("30");

  // Fetch communities from API
  const { data: communities = [], isLoading: communitiesLoading } = useQuery<Community[]>({
    queryKey: ["communities"],
    queryFn: async () => {
      const response = await fetch("/api/communities");
      if (!response.ok) throw new Error("Failed to fetch communities");
      return response.json();
    }
  });

  // Fetch platform metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<PlatformMetrics>({
    queryKey: ["platform-metrics"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/metrics?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch revenue history
  const { data: revenueHistory = [] } = useQuery<RevenueHistory>({
    queryKey: ["revenue-history"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/revenue-history?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch revenue history");
      return response.json();
    },
    enabled: !!user?.id
  });

  // Fetch top communities
  const { data: topCommunities = [] } = useQuery<TopCommunity[]>({
    queryKey: ["top-communities"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/top-communities?userId=${user?.id}&limit=5`);
      if (!response.ok) throw new Error("Failed to fetch top communities");
      return response.json();
    },
    enabled: !!user?.id
  });

  // Grant full access mutation
  const grantFullAccessMutation = useMutation({
    mutationFn: async ({ communityId, reason, expiresAt }: { communityId: string; reason: string; expiresAt: string | null }) => {
      const response = await fetch(`/api/platform/communities/${communityId}/full-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grantedBy: user?.id, reason, expiresAt })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to grant full access");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      toast({ title: "Accès complet accordé", description: data.message });
      setFullAccessModalOpen(false);
      resetFullAccessForm();
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const revokeFullAccessMutation = useMutation({
    mutationFn: async (communityId: string) => {
      const response = await fetch(`/api/platform/communities/${communityId}/full-access?userId=${user?.id}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to revoke full access");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      toast({ title: "Accès complet révoqué", description: data.message });
      setFullAccessModalOpen(false);
      resetFullAccessForm();
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const resetFullAccessForm = () => {
    setSelectedCommunity(null);
    setFullAccessReason("");
    setFullAccessDuration("permanent");
    setCustomDays("30");
  };

  const hasActiveFullAccess = (community: Community): boolean => {
    if (!community.fullAccessGrantedAt) return false;
    if (!community.fullAccessExpiresAt) return true;
    return new Date() < new Date(community.fullAccessExpiresAt);
  };

  const handleGrantFullAccess = () => {
    if (!selectedCommunity || !fullAccessReason.trim()) return;
    let expiresAt: string | null = null;
    if (fullAccessDuration !== "permanent") {
      const days = fullAccessDuration === "custom" ? parseInt(customDays) : parseInt(fullAccessDuration);
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + days);
      expiresAt = expireDate.toISOString();
    }
    grantFullAccessMutation.mutate({ communityId: selectedCommunity.id, reason: fullAccessReason, expiresAt });
  };

  const handleRevokeFullAccess = () => {
    if (!selectedCommunity) return;
    revokeFullAccessMutation.mutate(selectedCommunity.id);
  };

  const openFullAccessModal = (community: Community) => {
    setFullAccessReason("");
    setFullAccessDuration("permanent");
    setCustomDays("30");
    setSelectedCommunity(community);
    setFullAccessModalOpen(true);
  };

  useEffect(() => {
    if (authReady && !isPlatformAdmin) {
      setLocation("/platform/login");
    }
  }, [authReady, isPlatformAdmin, setLocation]);

  if (!authReady || !isPlatformAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setLocation("/platform/login");
  };

  const handleCreateClient = () => {
    toast({ title: "Client Créé", description: `L'organisation "${newClientName}" a été ajoutée avec succès.` });
    setIsCreateClientOpen(false);
    setNewClientName("");
  };

  const handleCreateAdmin = (role: string) => {
    toast({ title: "Administrateur Ajouté", description: `Nouvel administrateur créé avec le rôle : ${role === 'super_admin' ? 'Super Admin (Full)' : 'Support Admin (Restreint)'}` });
  };

  const getPlanName = (planId: string) => MOCK_PLANS.find(p => p.id === planId)?.name || planId;

  // Prepare chart data
  const revenueChartData = revenueHistory.map(item => ({
    month: item.month.split('-')[1] + '/' + item.month.split('-')[0].slice(2),
    revenue: item.revenue,
    payments: item.payments
  }));

  const planDistributionData = metrics?.revenueByPlan.filter(p => p.count > 0).map(p => ({
    name: p.planName,
    value: p.count,
    mrr: p.mrr,
    color: PLAN_COLORS[p.planCode] || '#6b7280'
  })) || [];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-gray-900 text-white h-16 px-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="font-bold text-xl tracking-tight">Koomy <span className="text-blue-400 font-normal">Platform</span></div>
          <Badge className="bg-blue-500/20 text-blue-300 border-0">Super Owner</Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center font-bold border-2 border-blue-500">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors p-2" title="Déconnexion">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white p-1 border border-gray-200 rounded-lg w-full justify-start shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6">
              <BarChart3 className="mr-2 h-4 w-4" /> Tableau de Bord
            </TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6">
              <Euro className="mr-2 h-4 w-4" /> Finances
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6">
              <Building2 className="mr-2 h-4 w-4" /> Clients
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6">
              <Target className="mr-2 h-4 w-4" /> Plans
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6">
              <MessageSquare className="mr-2 h-4 w-4" /> Support
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB - Main Financial KPIs */}
          <TabsContent value="overview">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Financier</h1>
                <p className="text-gray-500">Vue globale de la performance de la plateforme</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Calendar className="mr-2 h-4 w-4" /> Décembre 2025</Button>
              </div>
            </div>
            
            {metricsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Primary KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="border-l-4 border-l-blue-500 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">MRR (Revenu Mensuel)</p>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Euro className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900" data-testid="text-mrr">
                        {formatCurrency(metrics?.mrr || 0)}
                      </div>
                      <div className="flex items-center mt-2">
                        {(metrics?.mrrGrowth || 0) >= 0 ? (
                          <Badge className="bg-green-100 text-green-700 border-0 gap-1">
                            <TrendingUp className="h-3 w-3" /> +{metrics?.mrrGrowth || 0}%
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-0 gap-1">
                            <TrendingDown className="h-3 w-3" /> {metrics?.mrrGrowth || 0}%
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 ml-2">vs mois dernier</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">ARR (Revenu Annuel)</p>
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Banknote className="h-4 w-4 text-purple-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900" data-testid="text-arr">
                        {formatCurrency(metrics?.arr || 0)}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Projection annuelle</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500 shadow-sm bg-gradient-to-br from-white to-green-50/30">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Volume Collecté</p>
                        <div className="p-2 bg-green-100 rounded-lg">
                          <PiggyBank className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900" data-testid="text-volume-collected">
                        {formatCurrency(metrics?.volumeCollected || 0)}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        dont {formatCurrency(metrics?.volumeCollectedThisMonth || 0)} ce mois
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Clients Actifs</p>
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Building2 className="h-4 w-4 text-amber-600" />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900" data-testid="text-active-clients">
                        {metrics?.activeClients || 0}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                          +{metrics?.newClientsThisMonth || 0} nouveau{(metrics?.newClientsThisMonth || 0) > 1 ? 'x' : ''}
                        </Badge>
                        {(metrics?.churnedClientsThisMonth || 0) > 0 && (
                          <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                            -{metrics?.churnedClientsThisMonth} churn
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Secondary KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics?.totalMembers || 0)}</p>
                          <p className="text-xs text-gray-500">Membres Totaux</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{metrics?.paymentsCount || 0}</p>
                          <p className="text-xs text-gray-500">Paiements Traités</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Activity className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{metrics?.paymentsCountThisMonth || 0}</p>
                          <p className="text-xs text-gray-500">Paiements Ce Mois</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Wallet className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {metrics?.totalMembers && metrics?.activeClients 
                              ? Math.round(metrics.totalMembers / metrics.activeClients)
                              : 0}
                          </p>
                          <p className="text-xs text-gray-500">Membres/Client Moy.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Chart */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Évolution du Volume Collecté
                      </CardTitle>
                      <CardDescription>Cotisations membres collectées par les communautés (12 derniers mois)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueChartData}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}€`} />
                            <Tooltip 
                              formatter={(value: number) => [formatCurrency(value), 'Revenus']}
                              labelStyle={{ color: '#374151' }}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="revenue" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorRevenue)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Plan Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ChartPie className="h-5 w-5 text-purple-500" />
                        Répartition par Plan
                      </CardTitle>
                      <CardDescription>Distribution des abonnements actifs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={planDistributionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {planDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number, name: string, props: any) => [
                                `${value} client${value > 1 ? 's' : ''} (${formatCurrency(props.payload.mrr)}/mois)`,
                                name
                              ]}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36}
                              formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue by Plan & Top Communities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Revenue by Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Euro className="h-5 w-5 text-green-500" />
                        MRR par Plan
                      </CardTitle>
                      <CardDescription>Contribution de chaque plan au revenu mensuel</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {metrics?.revenueByPlan.map((plan) => {
                          const percentage = metrics.mrr > 0 ? (plan.mrr / metrics.mrr) * 100 : 0;
                          return (
                            <div key={plan.planId} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: PLAN_COLORS[plan.planCode] || '#6b7280' }}
                                  />
                                  <span className="text-sm font-medium">{plan.planName}</span>
                                  <Badge variant="outline" className="text-xs">{plan.count} clients</Badge>
                                </div>
                                <span className="text-sm font-bold">{formatCurrency(plan.mrr)}</span>
                              </div>
                              <Progress 
                                value={percentage} 
                                className="h-2"
                                style={{ 
                                  background: '#e5e7eb',
                                  ['--progress-background' as any]: PLAN_COLORS[plan.planCode] || '#6b7280'
                                }}
                              />
                            </div>
                          );
                        })}
                        {(!metrics?.revenueByPlan || metrics.revenueByPlan.length === 0) && (
                          <p className="text-gray-500 text-sm text-center py-4">Aucun abonnement actif</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Communities by Revenue */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-amber-500" />
                        Top Communautés par Volume
                      </CardTitle>
                      <CardDescription>Classement par cotisations collectées</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {topCommunities.length > 0 ? topCommunities.map((community, index) => (
                          <div key={community.communityId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-300'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{community.communityName}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Users size={12} /> {community.memberCount} membres
                                <span className="text-gray-300">•</span>
                                <span>{community.planName}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{formatCurrency(community.totalRevenue)}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-gray-500 text-sm text-center py-4">Aucune donnée disponible</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* FINANCE TAB - Detailed Financial View */}
          <TabsContent value="finance">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analyse Financière</h1>
                <p className="text-gray-500">Détail complet des revenus et transactions</p>
              </div>
            </div>

            {metricsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Key Financial Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="pt-6">
                      <p className="text-blue-100 text-sm">Revenu Mensuel Récurrent</p>
                      <p className="text-4xl font-bold mt-2">{formatCurrency(metrics?.mrr || 0)}</p>
                      <p className="text-blue-200 text-sm mt-4">Abonnements Koomy actifs</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="pt-6">
                      <p className="text-green-100 text-sm">Volume Total Collecté</p>
                      <p className="text-4xl font-bold mt-2">{formatCurrency(metrics?.volumeCollected || 0)}</p>
                      <p className="text-green-200 text-sm mt-4">Cotisations membres via Koomy</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="pt-6">
                      <p className="text-purple-100 text-sm">Revenu Annuel Projeté</p>
                      <p className="text-4xl font-bold mt-2">{formatCurrency(metrics?.arr || 0)}</p>
                      <p className="text-purple-200 text-sm mt-4">MRR × 12 mois</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Bar Chart */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Historique des Transactions</CardTitle>
                    <CardDescription>Volume collecté par mois et nombre de paiements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}€`} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value: number, name: string) => [
                              name === 'revenue' ? formatCurrency(value) : value,
                              name === 'revenue' ? 'Revenus' : 'Paiements'
                            ]}
                          />
                          <Legend />
                          <Bar yAxisId="left" dataKey="revenue" name="Revenus" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="payments" name="Paiements" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Plan Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Détail par Plan d'Abonnement</CardTitle>
                    <CardDescription>Performance financière de chaque formule</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan</TableHead>
                          <TableHead className="text-center">Clients</TableHead>
                          <TableHead className="text-right">MRR</TableHead>
                          <TableHead className="text-right">ARR</TableHead>
                          <TableHead className="text-right">% du Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics?.revenueByPlan.map((plan) => {
                          const percentage = metrics.mrr > 0 ? ((plan.mrr / metrics.mrr) * 100).toFixed(1) : '0';
                          return (
                            <TableRow key={plan.planId}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: PLAN_COLORS[plan.planCode] || '#6b7280' }}
                                  />
                                  <span className="font-medium">{plan.planName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{plan.count}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(plan.mrr)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(plan.mrr * 12)}</TableCell>
                              <TableCell className="text-right">
                                <Badge className="bg-blue-100 text-blue-700 border-0">{percentage}%</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className="bg-gray-50 font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell className="text-center">{metrics?.activeClients || 0}</TableCell>
                          <TableCell className="text-right">{formatCurrency(metrics?.mrr || 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(metrics?.arr || 0)}</TableCell>
                          <TableCell className="text-right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* CLIENTS TAB */}
          <TabsContent value="clients">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tenants / Communautés</h1>
                <p className="text-gray-500">Gérez l'ensemble des organisations hébergées sur Koomy.</p>
              </div>
              
              <Dialog open={isCreateClientOpen} onOpenChange={setIsCreateClientOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    <Plus size={18} /> Nouveau Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle organisation</DialogTitle>
                    <DialogDescription>Configurez un nouvel espace tenant pour un client.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom de l'organisation</Label>
                      <Input id="name" placeholder="Ex: Association Sportive Paris" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="plan">Plan d'abonnement</Label>
                      <Select defaultValue="free">
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_PLANS.map(plan => (
                            <SelectItem key={plan.id} value={plan.id}>{plan.name} ({plan.maxMembers} membres)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                       <Label>Administrateur Principal</Label>
                       <Input placeholder="Email du premier admin" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateClient}>Créer l'organisation</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Clients Actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Utilisateurs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {communitiesLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : communities.map((comm) => (
                      <TableRow key={comm.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {comm.logo ? (
                              <img src={comm.logo} className="h-10 w-10 rounded-lg object-contain bg-gray-50 p-1 border" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                {comm.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                {comm.name}
                                {hasActiveFullAccess(comm) && (
                                  <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] px-1.5 py-0 gap-0.5 border-0">
                                    <Sparkles size={10} /> VIP
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{comm.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users size={14} /> {comm.memberCount ?? 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Actif</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 uppercase text-[10px] tracking-wider">
                            {getPlanName(comm.planId || 'free')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant={hasActiveFullAccess(comm) ? "default" : "outline"}
                              size="sm"
                              className={`h-8 text-xs ${hasActiveFullAccess(comm) ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-0' : ''}`}
                              onClick={() => openFullAccessModal(comm)}
                              data-testid={`button-full-access-${comm.id}`}
                            >
                              <Gift className="mr-1 h-3 w-3" />
                              {hasActiveFullAccess(comm) ? 'VIP' : 'Offrir'}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PLANS TAB */}
          <TabsContent value="plans">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Plans & Tarification</h1>
                <p className="text-gray-500">Configuration des offres d'abonnement SaaS.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {MOCK_PLANS.map((plan) => (
                <Card key={plan.id} className={`flex flex-col ${plan.isPopular ? 'border-2 border-blue-500 shadow-xl relative' : 'border-gray-200'}`}>
                  {plan.isPopular && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAIRE</div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>Jusqu'à {plan.maxMembers} membres</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-6">
                      <span className="text-3xl font-bold">{plan.priceMonthly}€</span>
                      <span className="text-gray-500 text-sm">/mois</span>
                      <div className="text-xs text-gray-400 mt-1">ou {plan.priceYearly}€ /an</div>
                    </div>
                    <ul className="space-y-3 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant={plan.isPopular ? "default" : "outline"} className="w-full">Modifier</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SUPPORT TAB */}
          <TabsContent value="support">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Tickets</h1>
                <p className="text-gray-500">Support centralisé pour tous les clients.</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Sujet</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Demandeur</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          {ticket.priority === 'high' ? (
                            <Badge variant="destructive" className="gap-1"><AlertCircle size={10}/> Haute</Badge>
                          ) : ticket.priority === 'medium' ? (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100 gap-1">Moyenne</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 gap-1">Basse</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{ticket.subject}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[300px]">{ticket.message}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700 font-medium">{ticket.communityName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{ticket.userName}</div>
                          <div className="text-[10px] uppercase text-gray-400 font-bold">{ticket.userRole}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            ticket.status === "open" ? "bg-green-50 text-green-700 border-green-200" : 
                            ticket.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-gray-50 text-gray-600"
                          }>
                            {ticket.status === "open" ? "Ouvert" : ticket.status === "in_progress" ? "En cours" : "Fermé"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">Gérer</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Full Access Modal */}
      <Dialog open={fullAccessModalOpen} onOpenChange={(open) => {
        setFullAccessModalOpen(open);
        if (!open) resetFullAccessForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" />
              {selectedCommunity && hasActiveFullAccess(selectedCommunity) ? "Gérer l'accès VIP" : "Offrir un accès complet gratuit"}
            </DialogTitle>
            <DialogDescription>
              {selectedCommunity?.name} - {selectedCommunity && hasActiveFullAccess(selectedCommunity) 
                ? "Cette communauté bénéficie actuellement d'un accès VIP."
                : "Accordez un accès illimité sans limite de membres."}
            </DialogDescription>
          </DialogHeader>

          {selectedCommunity && hasActiveFullAccess(selectedCommunity) ? (
            <div className="py-4 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-800">Accès VIP actif</p>
                    <p className="text-sm text-amber-700 mt-1"><strong>Raison:</strong> {selectedCommunity.fullAccessReason}</p>
                    <p className="text-sm text-amber-700">
                      <strong>Expire:</strong> {selectedCommunity.fullAccessExpiresAt 
                        ? new Date(selectedCommunity.fullAccessExpiresAt).toLocaleDateString('fr-FR')
                        : "Permanent"}
                    </p>
                    <p className="text-sm text-amber-700">
                      <strong>Accordé le:</strong> {selectedCommunity.fullAccessGrantedAt 
                        ? new Date(selectedCommunity.fullAccessGrantedAt).toLocaleDateString('fr-FR')
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Raison de l'offre</Label>
                <Textarea
                  id="reason"
                  placeholder="Ex: Partenariat, Beta testeur, Client VIP, Essai gratuit..."
                  value={fullAccessReason}
                  onChange={(e) => setFullAccessReason(e.target.value)}
                  className="min-h-[80px]"
                  data-testid="input-full-access-reason"
                />
              </div>
              <div className="space-y-2">
                <Label>Durée</Label>
                <Select value={fullAccessDuration} onValueChange={setFullAccessDuration}>
                  <SelectTrigger data-testid="select-full-access-duration">
                    <SelectValue placeholder="Sélectionner une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent (illimité)</SelectItem>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="60">60 jours</SelectItem>
                    <SelectItem value="90">90 jours (3 mois)</SelectItem>
                    <SelectItem value="180">180 jours (6 mois)</SelectItem>
                    <SelectItem value="365">365 jours (1 an)</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {fullAccessDuration === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customDays">Nombre de jours</Label>
                  <Input
                    id="customDays"
                    type="number"
                    min="1"
                    max="3650"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    data-testid="input-custom-days"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedCommunity && hasActiveFullAccess(selectedCommunity) ? (
              <>
                <Button variant="outline" onClick={() => setFullAccessModalOpen(false)}>Fermer</Button>
                <Button
                  variant="destructive"
                  onClick={handleRevokeFullAccess}
                  disabled={revokeFullAccessMutation.isPending}
                  data-testid="button-revoke-full-access"
                >
                  <X className="mr-2 h-4 w-4" />
                  {revokeFullAccessMutation.isPending ? "Révocation..." : "Révoquer l'accès"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setFullAccessModalOpen(false)}>Annuler</Button>
                <Button
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white"
                  onClick={handleGrantFullAccess}
                  disabled={!fullAccessReason.trim() || grantFullAccessMutation.isPending}
                  data-testid="button-grant-full-access"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  {grantFullAccessMutation.isPending ? "En cours..." : "Accorder l'accès"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
