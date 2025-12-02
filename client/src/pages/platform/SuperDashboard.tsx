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
  Building2, Calendar, Euro, Banknote, ChartPie, Target, AlertTriangle, MapPin,
  UserPlus, Crown, Headphones, Briefcase, UserCog
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, LineChart, Line
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

type AtRiskCommunity = {
  communityId: string;
  communityName: string;
  riskType: 'quota_limit' | 'low_activity' | 'late_payments' | 'inactive';
  riskLevel: 'high' | 'medium' | 'low';
  details: string;
  memberCount: number;
  planName: string;
};

type MemberGrowth = { month: string; totalMembers: number; newMembers: number }[];

type PlanUtilization = {
  planId: string;
  planName: string;
  maxMembers: number | null;
  totalMembersUsed: number;
  totalMembersAllowed: number;
  utilizationPercent: number;
  communityCount: number;
};

type RegistrationTimeline = { date: string; count: number; communityNames: string[] }[];

type GeographicDistribution = {
  country: string;
  count: number;
  totalMembers: number;
  cities: { city: string; count: number }[];
};

type PlatformUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  globalRole: string | null;
  createdAt: string;
};

const PLAN_COLORS: Record<string, string> = {
  'STARTER_FREE': '#94a3b8',
  'COMMUNAUTE_STANDARD': '#3b82f6',
  'COMMUNAUTE_PRO': '#8b5cf6',
  'ENTREPRISE_CUSTOM': '#f59e0b',
  'WHITE_LABEL': '#10b981'
};

const ROLE_INFO: Record<string, { label: string; color: string; icon: any; description: string }> = {
  'platform_super_admin': { 
    label: 'Super Owner', 
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Crown,
    description: 'Accès complet à toutes les fonctionnalités'
  },
  'platform_support': { 
    label: 'Support Technique', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Headphones,
    description: 'Gestion des tickets et assistance clients'
  },
  'platform_commercial': { 
    label: 'Commercial', 
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: Briefcase,
    description: 'Gestion des prospects et contacts commerciaux'
  }
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
  
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserRole, setNewUserRole] = useState("");

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

  // Analytics queries
  const { data: atRiskCommunities = [] } = useQuery<AtRiskCommunity[]>({
    queryKey: ["at-risk-communities"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/analytics/at-risk?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch at-risk communities");
      return response.json();
    },
    enabled: !!user?.id
  });

  const { data: memberGrowth = [] } = useQuery<MemberGrowth>({
    queryKey: ["member-growth"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/analytics/member-growth?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch member growth");
      return response.json();
    },
    enabled: !!user?.id
  });

  const { data: planUtilization = [] } = useQuery<PlanUtilization[]>({
    queryKey: ["plan-utilization"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/analytics/plan-utilization?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch plan utilization");
      return response.json();
    },
    enabled: !!user?.id
  });

  const { data: registrationTimeline = [] } = useQuery<RegistrationTimeline>({
    queryKey: ["registration-timeline"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/analytics/registrations?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch registrations");
      return response.json();
    },
    enabled: !!user?.id
  });

  const { data: geographicDistribution = [] } = useQuery<GeographicDistribution[]>({
    queryKey: ["geographic-distribution"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/analytics/geographic?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch geographic distribution");
      return response.json();
    },
    enabled: !!user?.id
  });

  const { data: topByMembers = [] } = useQuery<TopCommunity[]>({
    queryKey: ["top-by-members"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/analytics/top-by-members?userId=${user?.id}&limit=10`);
      if (!response.ok) throw new Error("Failed to fetch top by members");
      return response.json();
    },
    enabled: !!user?.id
  });

  // Platform users
  const { data: platformUsers = [], isLoading: usersLoading } = useQuery<PlatformUser[]>({
    queryKey: ["platform-users"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/users?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch platform users");
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

  // Create platform user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string; firstName: string; lastName: string; globalRole: string }) => {
      const response = await fetch(`/api/platform/users?userId=${user?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-users"] });
      toast({ title: "Utilisateur créé", description: "Le nouvel utilisateur a été ajouté avec succès." });
      setIsCreateUserOpen(false);
      resetUserForm();
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId: targetUserId, globalRole }: { userId: string; globalRole: string }) => {
      const response = await fetch(`/api/platform/users/${targetUserId}/role?userId=${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ globalRole })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user role");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-users"] });
      toast({ title: "Rôle mis à jour" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Demote user mutation
  const demoteUserMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const response = await fetch(`/api/platform/users/${targetUserId}/role?userId=${user?.id}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to demote user");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["platform-users"] });
      toast({ title: "Utilisateur retiré", description: data.message });
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

  const resetUserForm = () => {
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserFirstName("");
    setNewUserLastName("");
    setNewUserRole("");
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

  const handleCreateUser = () => {
    if (!newUserEmail || !newUserPassword || !newUserRole) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }
    createUserMutation.mutate({
      email: newUserEmail,
      password: newUserPassword,
      firstName: newUserFirstName,
      lastName: newUserLastName,
      globalRole: newUserRole
    });
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

  const memberGrowthChartData = memberGrowth.map(item => ({
    month: item.month.split('-')[1] + '/' + item.month.split('-')[0].slice(2),
    total: item.totalMembers,
    new: item.newMembers
  }));

  const registrationChartData = registrationTimeline.slice(-14).map(item => ({
    date: item.date.split('-').slice(1).join('/'),
    count: item.count
  }));

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
          <TabsList className="bg-white p-1 border border-gray-200 rounded-lg w-full justify-start shadow-sm flex-wrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-4">
              <BarChart3 className="mr-2 h-4 w-4" /> Tableau de Bord
            </TabsTrigger>
            <TabsTrigger value="finances" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-4">
              <Wallet className="mr-2 h-4 w-4" /> Finances
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-4">
              <Activity className="mr-2 h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-4">
              <Building2 className="mr-2 h-4 w-4" /> Clients
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-4">
              <UserCog className="mr-2 h-4 w-4" /> Équipe
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-4">
              <Target className="mr-2 h-4 w-4" /> Plans
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-4">
              <MessageSquare className="mr-2 h-4 w-4" /> Support
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Financier</h1>
                <p className="text-gray-500">Vue globale de la performance de la plateforme</p>
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
                        <div className="p-2 bg-blue-100 rounded-lg"><Euro className="h-4 w-4 text-blue-600" /></div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900" data-testid="text-mrr">{formatCurrency(metrics?.mrr || 0)}</div>
                      <div className="flex items-center mt-2">
                        {(metrics?.mrrGrowth || 0) >= 0 ? (
                          <Badge className="bg-green-100 text-green-700 border-0 gap-1"><TrendingUp className="h-3 w-3" /> +{metrics?.mrrGrowth || 0}%</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-0 gap-1"><TrendingDown className="h-3 w-3" /> {metrics?.mrrGrowth || 0}%</Badge>
                        )}
                        <span className="text-xs text-gray-500 ml-2">vs mois dernier</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">ARR (Revenu Annuel)</p>
                        <div className="p-2 bg-purple-100 rounded-lg"><Banknote className="h-4 w-4 text-purple-600" /></div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{formatCurrency(metrics?.arr || 0)}</div>
                      <p className="text-xs text-gray-500 mt-2">Projection annuelle</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500 shadow-sm bg-gradient-to-br from-white to-green-50/30">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Volume Collecté</p>
                        <div className="p-2 bg-green-100 rounded-lg"><PiggyBank className="h-4 w-4 text-green-600" /></div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{formatCurrency(metrics?.volumeCollected || 0)}</div>
                      <p className="text-xs text-gray-500 mt-2">dont {formatCurrency(metrics?.volumeCollectedThisMonth || 0)} ce mois</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Clients Actifs</p>
                        <div className="p-2 bg-amber-100 rounded-lg"><Building2 className="h-4 w-4 text-amber-600" /></div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{metrics?.activeClients || 0}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">+{metrics?.newClientsThisMonth || 0} nouveau{(metrics?.newClientsThisMonth || 0) > 1 ? 'x' : ''}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500" />Évolution du Volume Collecté</CardTitle>
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
                            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenus']} />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><ChartPie className="h-5 w-5 text-purple-500" />Répartition par Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={planDistributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                              {planDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip formatter={(value: number, name: string, props: any) => [`${value} client${value > 1 ? 's' : ''}`, name]} />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Communities */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-amber-500" />Top Communautés par Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {topCommunities.length > 0 ? topCommunities.map((community, index) => (
                        <div key={community.communityId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>{index + 1}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{community.communityName}</p>
                            <p className="text-sm text-green-600 font-bold">{formatCurrency(community.totalRevenue)}</p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-sm col-span-5 text-center py-4">Aucune donnée disponible</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* FINANCES TAB */}
          <TabsContent value="finances">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Détails Financiers</h1>
                <p className="text-gray-500">Analyse détaillée des revenus et paiements de la plateforme</p>
              </div>
            </div>

            {metricsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                {/* Secondary Financial KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Nombre de Paiements</p>
                        <div className="p-2 bg-indigo-100 rounded-lg"><CreditCard className="h-4 w-4 text-indigo-600" /></div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{formatNumber(metrics?.paymentsCount || 0)}</div>
                      <p className="text-xs text-gray-500 mt-2">dont {formatNumber(metrics?.paymentsCountThisMonth || 0)} ce mois</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Total Membres</p>
                        <div className="p-2 bg-cyan-100 rounded-lg"><Users className="h-4 w-4 text-cyan-600" /></div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{formatNumber(metrics?.totalMembers || 0)}</div>
                      <p className="text-xs text-gray-500 mt-2">sur l'ensemble des communautés</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Nouveaux Clients</p>
                        <div className="p-2 bg-emerald-100 rounded-lg"><ArrowUpRight className="h-4 w-4 text-emerald-600" /></div>
                      </div>
                      <div className="text-3xl font-bold text-emerald-600">+{metrics?.newClientsThisMonth || 0}</div>
                      <p className="text-xs text-gray-500 mt-2">ce mois-ci</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Clients Perdus</p>
                        <div className="p-2 bg-red-100 rounded-lg"><ArrowDownRight className="h-4 w-4 text-red-600" /></div>
                      </div>
                      <div className="text-3xl font-bold text-red-600">-{metrics?.churnedClientsThisMonth || 0}</div>
                      <p className="text-xs text-gray-500 mt-2">ce mois-ci (churn)</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Breakdown by Plan */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Euro className="h-5 w-5 text-blue-500" />Répartition des Revenus par Plan</CardTitle>
                    <CardDescription>Détail du MRR par formule d'abonnement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan</TableHead>
                          <TableHead className="text-center">Clients</TableHead>
                          <TableHead className="text-right">MRR</TableHead>
                          <TableHead className="text-right">% du Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics?.revenueByPlan.map((plan) => {
                          const percentage = metrics.mrr > 0 ? (plan.mrr / metrics.mrr) * 100 : 0;
                          return (
                            <TableRow key={plan.planId}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[plan.planCode] || '#6b7280' }} />
                                  <span className="font-medium">{plan.planName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{plan.count}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-bold text-green-600">{formatCurrency(plan.mrr)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Progress value={percentage} className="w-16 h-2" />
                                  <span className="text-sm text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow className="bg-gray-50 font-bold">
                          <TableCell>TOTAL</TableCell>
                          <TableCell className="text-center">{metrics?.activeClients || 0}</TableCell>
                          <TableCell className="text-right text-green-700">{formatCurrency(metrics?.mrr || 0)}</TableCell>
                          <TableCell className="text-right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Revenue Evolution Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500" />Évolution Mensuelle des Revenus</CardTitle>
                      <CardDescription>Historique des 12 derniers mois</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueChartData}>
                            <defs>
                              <linearGradient id="colorRevenueFinance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}€`} />
                            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenus']} />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenueFinance)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-purple-500" />Nombre de Paiements Mensuels</CardTitle>
                      <CardDescription>Volume de transactions par mois</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => [value, 'Paiements']} />
                            <Bar dataKey="payments" name="Paiements" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg"><Euro className="h-6 w-6" /></div>
                        <div>
                          <p className="text-sm text-blue-100">Revenu Mensuel Récurrent</p>
                          <p className="text-2xl font-bold">{formatCurrency(metrics?.mrr || 0)}</p>
                        </div>
                      </div>
                      <div className="text-xs text-blue-200">Base pour les projections annuelles</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg"><Banknote className="h-6 w-6" /></div>
                        <div>
                          <p className="text-sm text-purple-100">Revenu Annuel Récurrent</p>
                          <p className="text-2xl font-bold">{formatCurrency(metrics?.arr || 0)}</p>
                        </div>
                      </div>
                      <div className="text-xs text-purple-200">MRR × 12 mois</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-lg"><PiggyBank className="h-6 w-6" /></div>
                        <div>
                          <p className="text-sm text-emerald-100">Volume Total Collecté</p>
                          <p className="text-2xl font-bold">{formatCurrency(metrics?.volumeCollected || 0)}</p>
                        </div>
                      </div>
                      <div className="text-xs text-emerald-200">Depuis le lancement</div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Communautés</h1>
                <p className="text-gray-500">Analyse détaillée des communautés et de leur croissance</p>
              </div>
            </div>

            {/* Member Growth Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" />Croissance des Membres</CardTitle>
                  <CardDescription>Évolution globale de la base membres Koomy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={memberGrowthChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="total" name="Total Membres" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="new" name="Nouveaux" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-green-500" />Nouvelles Inscriptions</CardTitle>
                  <CardDescription>Timeline des créations de communautés (14 derniers jours)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={registrationChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Inscriptions" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Plan Utilization */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-purple-500" />Taux d'Utilisation par Plan</CardTitle>
                <CardDescription>Pourcentage des membres autorisés utilisés par plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planUtilization.filter(p => p.communityCount > 0).map((plan) => (
                    <div key={plan.planId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[plan.planName.toUpperCase().replace(/ /g, '_')] || '#6b7280' }} />
                          <span className="text-sm font-medium">{plan.planName}</span>
                          <Badge variant="outline" className="text-xs">{plan.communityCount} communautés</Badge>
                        </div>
                        <span className="text-sm">
                          {plan.totalMembersUsed} / {plan.totalMembersAllowed || '∞'} membres
                          <span className="ml-2 font-bold text-blue-600">({plan.utilizationPercent}%)</span>
                        </span>
                      </div>
                      <Progress value={plan.utilizationPercent} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* At Risk Communities & Geographic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" />Communautés à Risque</CardTitle>
                  <CardDescription>Faible activité, paiements en retard, quota limite</CardDescription>
                </CardHeader>
                <CardContent>
                  {atRiskCommunities.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {atRiskCommunities.map((community) => (
                        <div key={community.communityId} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: community.riskLevel === 'high' ? '#ef4444' : community.riskLevel === 'medium' ? '#f59e0b' : '#6b7280' }}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{community.communityName}</p>
                              <Badge className={`text-xs ${community.riskLevel === 'high' ? 'bg-red-100 text-red-700' : community.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                                {community.riskLevel === 'high' ? 'Critique' : community.riskLevel === 'medium' ? 'Attention' : 'Info'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{community.details}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Users size={12} /> {community.memberCount}</span>
                              <span>{community.planName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>Aucune communauté à risque</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-500" />Répartition Géographique</CardTitle>
                  <CardDescription>Distribution des communautés par pays</CardDescription>
                </CardHeader>
                <CardContent>
                  {geographicDistribution.length > 0 ? (
                    <div className="space-y-4">
                      {geographicDistribution.slice(0, 5).map((country, index) => (
                        <div key={country.country} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">{index + 1}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{country.country}</span>
                              <span className="text-sm text-gray-500">{country.count} communautés</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <Users size={12} /> {formatNumber(country.totalMembers)} membres
                              {country.cities.length > 0 && (
                                <span className="text-gray-400">• Top: {country.cities.slice(0, 2).map(c => c.city).join(', ')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-500">Aucune donnée géographique</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Communities by Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500" />Top Communautés par Membres</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rang</TableHead>
                      <TableHead>Communauté</TableHead>
                      <TableHead>Membres</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Pays</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topByMembers.map((community, index) => (
                      <TableRow key={community.communityId}>
                        <TableCell>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>{index + 1}</div>
                        </TableCell>
                        <TableCell className="font-medium">{community.communityName}</TableCell>
                        <TableCell><Badge variant="outline">{community.memberCount}</Badge></TableCell>
                        <TableCell>{community.planName}</TableCell>
                        <TableCell className="text-gray-500">{(community as any).country || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"><Plus size={18} /> Nouveau Client</Button>
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
                        <SelectTrigger><SelectValue placeholder="Sélectionner un plan" /></SelectTrigger>
                        <SelectContent>
                          {MOCK_PLANS.map(plan => (<SelectItem key={plan.id} value={plan.id}>{plan.name} ({plan.maxMembers} membres)</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter><Button onClick={handleCreateClient}>Créer l'organisation</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader><CardTitle>Clients Actifs</CardTitle></CardHeader>
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
                      <TableRow><TableCell colSpan={5} className="text-center py-8"><div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
                    ) : communities.map((comm) => (
                      <TableRow key={comm.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {comm.logo ? (<img src={comm.logo} className="h-10 w-10 rounded-lg object-contain bg-gray-50 p-1 border" />) : (<div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">{comm.name.charAt(0)}</div>)}
                            <div>
                              <div className="font-bold flex items-center gap-2">
                                {comm.name}
                                {hasActiveFullAccess(comm) && (<Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[9px] px-1.5 py-0 gap-0.5 border-0"><Sparkles size={10} /> VIP</Badge>)}
                              </div>
                              <div className="text-xs text-gray-500">{comm.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><div className="flex items-center gap-1 text-gray-600"><Users size={14} /> {comm.memberCount ?? 0}</div></TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Actif</Badge></TableCell>
                        <TableCell><Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 uppercase text-[10px] tracking-wider">{getPlanName(comm.planId || 'free')}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant={hasActiveFullAccess(comm) ? "default" : "outline"} size="sm" className={`h-8 text-xs ${hasActiveFullAccess(comm) ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-0' : ''}`} onClick={() => openFullAccessModal(comm)} data-testid={`button-full-access-${comm.id}`}><Gift className="mr-1 h-3 w-3" />{hasActiveFullAccess(comm) ? 'VIP' : 'Offrir'}</Button>
                            <Button variant="ghost" size="sm"><Settings size={16} /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion de l'Équipe</h1>
                <p className="text-gray-500">Gérez les utilisateurs et les rôles de la plateforme Koomy.</p>
              </div>
              
              <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"><UserPlus size={18} /> Nouvel Utilisateur</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter un utilisateur plateforme</DialogTitle>
                    <DialogDescription>Créez un nouvel accès pour un membre de l'équipe.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input id="firstName" placeholder="Jean" value={newUserFirstName} onChange={(e) => setNewUserFirstName(e.target.value)} data-testid="input-user-firstname" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input id="lastName" placeholder="Dupont" value={newUserLastName} onChange={(e) => setNewUserLastName(e.target.value)} data-testid="input-user-lastname" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="jean@koomy.app" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} data-testid="input-user-email" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Mot de passe *</Label>
                      <Input id="password" type="password" placeholder="••••••••" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} data-testid="input-user-password" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Rôle *</Label>
                      <Select value={newUserRole} onValueChange={setNewUserRole}>
                        <SelectTrigger data-testid="select-user-role"><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_INFO).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <info.icon size={14} />
                                <div>
                                  <div className="font-medium">{info.label}</div>
                                  <div className="text-xs text-gray-500">{info.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>Annuler</Button>
                    <Button onClick={handleCreateUser} disabled={createUserMutation.isPending} data-testid="button-create-user">{createUserMutation.isPending ? "Création..." : "Créer l'utilisateur"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {Object.entries(ROLE_INFO).map(([key, info]) => {
                const count = platformUsers.filter(u => u.globalRole === key).length;
                return (
                  <Card key={key} className="border-l-4" style={{ borderLeftColor: key === 'platform_super_admin' ? '#8b5cf6' : key === 'platform_support' ? '#3b82f6' : '#10b981' }}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${key === 'platform_super_admin' ? 'bg-purple-100' : key === 'platform_support' ? 'bg-blue-100' : 'bg-green-100'}`}>
                          <info.icon className={`h-5 w-5 ${key === 'platform_super_admin' ? 'text-purple-600' : key === 'platform_support' ? 'text-blue-600' : 'text-green-600'}`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{count}</p>
                          <p className="text-sm text-gray-500">{info.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader><CardTitle>Utilisateurs Plateforme</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Date d'ajout</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8"><div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
                    ) : platformUsers.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Aucun utilisateur plateforme</TableCell></TableRow>
                    ) : platformUsers.map((platformUser) => {
                      const roleInfo = ROLE_INFO[platformUser.globalRole || ''];
                      return (
                        <TableRow key={platformUser.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {(platformUser.firstName?.[0] || platformUser.email[0]).toUpperCase()}
                                {platformUser.lastName?.[0]?.toUpperCase() || ''}
                              </div>
                              <div>
                                <div className="font-medium">{platformUser.firstName} {platformUser.lastName}</div>
                                <div className="text-xs text-gray-500">{platformUser.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{platformUser.email}</TableCell>
                          <TableCell>
                            {roleInfo ? (
                              <Badge className={`${roleInfo.color} border gap-1`}>
                                <roleInfo.icon size={12} />
                                {roleInfo.label}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Inconnu</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-500">{new Date(platformUser.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Select value={platformUser.globalRole || ''} onValueChange={(newRole) => updateUserRoleMutation.mutate({ userId: platformUser.id, globalRole: newRole })}>
                                <SelectTrigger className="w-[180px] h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.entries(ROLE_INFO).map(([key, info]) => (
                                    <SelectItem key={key} value={key}><div className="flex items-center gap-2"><info.icon size={12} />{info.label}</div></SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {platformUser.id !== user?.id && (
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => demoteUserMutation.mutate(platformUser.id)} disabled={demoteUserMutation.isPending}>
                                  <X size={16} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                  {plan.isPopular && (<div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAIRE</div>)}
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
                      {plan.features.map((feature, i) => (<li key={i} className="flex items-start gap-2 text-gray-600"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><span>{feature}</span></li>))}
                    </ul>
                  </CardContent>
                  <CardFooter><Button variant={plan.isPopular ? "default" : "outline"} className="w-full">Modifier</Button></CardFooter>
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
                          {ticket.priority === 'high' ? (<Badge variant="destructive" className="gap-1"><AlertCircle size={10}/> Haute</Badge>) : ticket.priority === 'medium' ? (<Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100 gap-1">Moyenne</Badge>) : (<Badge variant="outline" className="text-gray-500 gap-1">Basse</Badge>)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{ticket.subject}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[300px]">{ticket.message}</div>
                        </TableCell>
                        <TableCell><div className="text-sm text-gray-700 font-medium">{ticket.communityName}</div></TableCell>
                        <TableCell>
                          <div className="text-sm">{ticket.userName}</div>
                          <div className="text-[10px] uppercase text-gray-400 font-bold">{ticket.userRole}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={ticket.status === "open" ? "bg-green-50 text-green-700 border-green-200" : ticket.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600"}>
                            {ticket.status === "open" ? "Ouvert" : ticket.status === "in_progress" ? "En cours" : "Fermé"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right"><Button size="sm" variant="outline">Gérer</Button></TableCell>
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
      <Dialog open={fullAccessModalOpen} onOpenChange={(open) => { setFullAccessModalOpen(open); if (!open) resetFullAccessForm(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-amber-500" />{selectedCommunity && hasActiveFullAccess(selectedCommunity) ? "Gérer l'accès VIP" : "Offrir un accès complet gratuit"}</DialogTitle>
            <DialogDescription>{selectedCommunity?.name} - {selectedCommunity && hasActiveFullAccess(selectedCommunity) ? "Cette communauté bénéficie actuellement d'un accès VIP." : "Accordez un accès illimité sans limite de membres."}</DialogDescription>
          </DialogHeader>

          {selectedCommunity && hasActiveFullAccess(selectedCommunity) ? (
            <div className="py-4 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-800">Accès VIP actif</p>
                    <p className="text-sm text-amber-700 mt-1"><strong>Raison:</strong> {selectedCommunity.fullAccessReason}</p>
                    <p className="text-sm text-amber-700"><strong>Expire:</strong> {selectedCommunity.fullAccessExpiresAt ? new Date(selectedCommunity.fullAccessExpiresAt).toLocaleDateString('fr-FR') : "Permanent"}</p>
                    <p className="text-sm text-amber-700"><strong>Accordé le:</strong> {selectedCommunity.fullAccessGrantedAt ? new Date(selectedCommunity.fullAccessGrantedAt).toLocaleDateString('fr-FR') : "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Raison de l'offre</Label>
                <Textarea id="reason" placeholder="Ex: Partenariat, Beta testeur, Client VIP, Essai gratuit..." value={fullAccessReason} onChange={(e) => setFullAccessReason(e.target.value)} className="min-h-[80px]" data-testid="input-full-access-reason" />
              </div>
              <div className="space-y-2">
                <Label>Durée</Label>
                <Select value={fullAccessDuration} onValueChange={setFullAccessDuration}>
                  <SelectTrigger data-testid="select-full-access-duration"><SelectValue placeholder="Sélectionner une durée" /></SelectTrigger>
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
                  <Input id="customDays" type="number" min="1" max="3650" value={customDays} onChange={(e) => setCustomDays(e.target.value)} data-testid="input-custom-days" />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedCommunity && hasActiveFullAccess(selectedCommunity) ? (
              <>
                <Button variant="outline" onClick={() => setFullAccessModalOpen(false)}>Fermer</Button>
                <Button variant="destructive" onClick={handleRevokeFullAccess} disabled={revokeFullAccessMutation.isPending} data-testid="button-revoke-full-access"><X className="mr-2 h-4 w-4" />{revokeFullAccessMutation.isPending ? "Révocation..." : "Révoquer l'accès"}</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setFullAccessModalOpen(false)}>Annuler</Button>
                <Button className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white" onClick={handleGrantFullAccess} disabled={!fullAccessReason.trim() || grantFullAccessMutation.isPending} data-testid="button-grant-full-access"><Gift className="mr-2 h-4 w-4" />{grantFullAccessMutation.isPending ? "En cours..." : "Accorder l'accès"}</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
