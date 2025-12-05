import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MOCK_PLANS, Plan } from "@/lib/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  UserPlus, Crown, Headphones, Briefcase, UserCog, Mail, FileText, Send, Eye, RefreshCw, Globe
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, LineChart, Line
} from "recharts";

type BrandConfig = {
  appName?: string;
  brandColor?: string;
  logoUrl?: string;
  appIconUrl?: string;
  emailFromName?: string;
  emailFromAddress?: string;
  replyTo?: string;
  showPoweredBy?: boolean;
};

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
  // White Label fields
  whiteLabel?: boolean;
  whiteLabelTier?: "basic" | "standard" | "premium" | null;
  billingMode?: "self_service" | "manual_contract";
  setupFeeAmountCents?: number | null;
  setupFeeCurrency?: string;
  setupFeeInvoiceRef?: string | null;
  maintenanceAmountYearCents?: number | null;
  maintenanceCurrency?: string;
  maintenanceNextBillingDate?: string | null;
  maintenanceStatus?: "active" | "pending" | "late" | "stopped" | null;
  internalNotes?: string | null;
  brandConfig?: BrandConfig | null;
  customDomain?: string | null;
  // White Label contract member quotas
  whiteLabelIncludedMembers?: number | null;
  whiteLabelMaxMembersSoftLimit?: number | null;
  whiteLabelAdditionalFeePerMemberCents?: number | null;
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

type PlatformTicket = {
  id: string;
  userId: string;
  communityId: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string | null;
  createdAt: string;
  lastUpdate: string;
  userName: string;
  communityName: string;
  assignedUserName: string | null;
  responseCount: number;
};

type TicketResponse = {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
};

type TicketWithDetails = PlatformTicket & {
  responses: TicketResponse[];
  user: { id: string; firstName: string; lastName: string; email: string } | null;
  community: { id: string; name: string } | null;
  assignedUser: { id: string; firstName: string; lastName: string } | null;
};

type EmailTemplate = {
  id: string;
  type: string;
  subject: string;
  html: string;
  updatedAt: string;
  label: string;
  variables: string[];
};

type EmailLog = {
  id: string;
  to: string;
  type: string;
  sentAt: string;
  success: boolean;
  errorMessage: string | null;
};

type PaymentAnalytics = {
  totalVolume: number;
  totalVolumeThisMonth: number;
  failedPayments: { count: number; amount: number };
  pendingPayments: { count: number; amount: number };
  completedPayments: { count: number; amount: number };
  refundedPayments: { count: number; amount: number };
  failureRate: number;
  averagePaymentAmount: number;
  paymentsByMethod: { method: string; count: number; amount: number }[];
  monthlyForecast: { month: string; expectedRevenue: number }[];
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
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  
  // Ticket management state
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketResponse, setTicketResponse] = useState("");
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  
  const [fullAccessModalOpen, setFullAccessModalOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [fullAccessReason, setFullAccessReason] = useState("");
  const [fullAccessDuration, setFullAccessDuration] = useState<string>("permanent");
  const [customDays, setCustomDays] = useState("30");
  
  // White Label modal state
  const [isWhiteLabelOpen, setIsWhiteLabelOpen] = useState(false);
  const [wlCommunity, setWlCommunity] = useState<Community | null>(null);
  const [wlWhiteLabel, setWlWhiteLabel] = useState(false);
  const [wlTier, setWlTier] = useState<"basic" | "standard" | "premium">("basic");
  const [wlBillingMode, setWlBillingMode] = useState<"self_service" | "manual_contract">("self_service");
  const [wlSetupFee, setWlSetupFee] = useState("");
  const [wlSetupFeeCurrency, setWlSetupFeeCurrency] = useState("EUR");
  const [wlSetupFeeInvoiceRef, setWlSetupFeeInvoiceRef] = useState("");
  const [wlMaintenanceFee, setWlMaintenanceFee] = useState("");
  const [wlMaintenanceCurrency, setWlMaintenanceCurrency] = useState("EUR");
  const [wlMaintenanceNextDate, setWlMaintenanceNextDate] = useState("");
  const [wlMaintenanceStatus, setWlMaintenanceStatus] = useState<"active" | "pending" | "late" | "stopped">("active");
  const [wlInternalNotes, setWlInternalNotes] = useState("");
  const [wlAppName, setWlAppName] = useState("");
  const [wlBrandColor, setWlBrandColor] = useState("");
  const [wlLogoUrl, setWlLogoUrl] = useState("");
  const [wlAppIconUrl, setWlAppIconUrl] = useState("");
  const [wlEmailFromName, setWlEmailFromName] = useState("");
  const [wlEmailFromAddress, setWlEmailFromAddress] = useState("");
  const [wlReplyTo, setWlReplyTo] = useState("");
  const [wlShowPoweredBy, setWlShowPoweredBy] = useState(true);
  const [wlCustomDomain, setWlCustomDomain] = useState("");
  // White Label contract member quotas
  const [wlIncludedMembers, setWlIncludedMembers] = useState("");
  const [wlSoftLimit, setWlSoftLimit] = useState("");
  const [wlAdditionalFeePerMember, setWlAdditionalFeePerMember] = useState("");
  
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserRole, setNewUserRole] = useState("");
  
  // Email template state
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editingSubject, setEditingSubject] = useState("");
  const [editingHtml, setEditingHtml] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [showTestModal, setShowTestModal] = useState(false);

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

  // Tickets
  const { data: tickets = [], isLoading: ticketsLoading, refetch: refetchTickets } = useQuery<PlatformTicket[]>({
    queryKey: ["platform-tickets"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/tickets?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
    enabled: !!user?.id
  });

  // Payment analytics
  const { data: paymentAnalytics } = useQuery<PaymentAnalytics>({
    queryKey: ["payment-analytics"],
    queryFn: async () => {
      const response = await fetch(`/api/platform/payments/analytics?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch payment analytics");
      return response.json();
    },
    enabled: !!user?.id
  });
  
  // Email templates
  const { data: emailTemplates = [], refetch: refetchTemplates } = useQuery<EmailTemplate[]>({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const response = await fetch("/api/owner/email-templates");
      if (!response.ok) throw new Error("Failed to fetch email templates");
      return response.json();
    }
  });
  
  // Email logs
  const { data: emailLogs = [] } = useQuery<EmailLog[]>({
    queryKey: ["email-logs"],
    queryFn: async () => {
      const response = await fetch("/api/owner/email-logs?limit=50");
      if (!response.ok) throw new Error("Failed to fetch email logs");
      return response.json();
    }
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

  // White Label mutation
  const updateWhiteLabelMutation = useMutation({
    mutationFn: async (data: {
      communityId: string;
      whiteLabel: boolean;
      whiteLabelTier: "basic" | "standard" | "premium" | null;
      billingMode: "self_service" | "manual_contract";
      setupFeeAmountCents: number | null;
      setupFeeCurrency: string;
      setupFeeInvoiceRef: string | null;
      maintenanceAmountYearCents: number | null;
      maintenanceCurrency: string;
      maintenanceNextBillingDate: string | null;
      maintenanceStatus: "active" | "pending" | "late" | "stopped" | null;
      internalNotes: string | null;
      brandConfig: BrandConfig | null;
      customDomain: string | null;
      whiteLabelIncludedMembers: number | null;
      whiteLabelMaxMembersSoftLimit: number | null;
      whiteLabelAdditionalFeePerMemberCents: number | null;
    }) => {
      const response = await fetch(`/api/platform/communities/${data.communityId}/white-label?userId=${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update white label settings");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      toast({ title: "Paramètres White Label", description: data.message });
      setIsWhiteLabelOpen(false);
      resetWhiteLabelForm();
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

  // Email template mutations
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ type, subject, html }: { type: string; subject: string; html: string }) => {
      const response = await fetch(`/api/owner/email-templates/${type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, html })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update template");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast({ title: "Template mis à jour", description: "Les modifications ont été enregistrées." });
      setSelectedTemplate(null);
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const testEmailMutation = useMutation({
    mutationFn: async ({ type, email, variables }: { type: string; email: string; variables: Record<string, string> }) => {
      const response = await fetch("/api/owner/email-templates/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, email, variables })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send test email");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Email envoyé", description: data.message });
      setShowTestModal(false);
      setTestEmail("");
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Ticket mutations
  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, assignedTo }: { ticketId: string; assignedTo: string }) => {
      const response = await fetch(`/api/platform/tickets/${ticketId}/assign?userId=${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo })
      });
      if (!response.ok) throw new Error("Failed to assign ticket");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-tickets"] });
      toast({ title: "Ticket assigné" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'assigner le ticket", variant: "destructive" });
    }
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const response = await fetch(`/api/platform/tickets/${ticketId}/status?userId=${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Failed to update ticket status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-tickets"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
    }
  });

  const addTicketResponseMutation = useMutation({
    mutationFn: async ({ ticketId, message, isInternal }: { ticketId: string; message: string; isInternal: boolean }) => {
      const response = await fetch(`/api/platform/tickets/${ticketId}/responses?userId=${user?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, isInternal })
      });
      if (!response.ok) throw new Error("Failed to add response");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-tickets"] });
      setTicketResponse("");
      toast({ title: "Réponse envoyée" });
      // Refresh selected ticket
      if (selectedTicket) {
        fetchTicketDetails(selectedTicket.id);
      }
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'envoyer la réponse", variant: "destructive" });
    }
  });

  // Fetch ticket details
  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/platform/tickets/${ticketId}?userId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch ticket details");
      const ticket = await response.json();
      setSelectedTicket(ticket);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les détails du ticket", variant: "destructive" });
    }
  };

  const openTicketModal = (ticket: PlatformTicket) => {
    fetchTicketDetails(ticket.id);
    setTicketModalOpen(true);
  };

  const filteredTickets = tickets.filter(t => ticketFilter === 'all' || t.status === ticketFilter);

  const resetFullAccessForm = () => {
    setSelectedCommunity(null);
    setFullAccessReason("");
    setFullAccessDuration("permanent");
    setCustomDays("30");
  };

  const resetWhiteLabelForm = () => {
    setWlCommunity(null);
    setWlWhiteLabel(false);
    setWlTier("basic");
    setWlBillingMode("self_service");
    setWlSetupFee("");
    setWlSetupFeeCurrency("EUR");
    setWlSetupFeeInvoiceRef("");
    setWlMaintenanceFee("");
    setWlMaintenanceCurrency("EUR");
    setWlMaintenanceNextDate("");
    setWlMaintenanceStatus("active");
    setWlInternalNotes("");
    setWlAppName("");
    setWlBrandColor("");
    setWlLogoUrl("");
    setWlAppIconUrl("");
    setWlEmailFromName("");
    setWlEmailFromAddress("");
    setWlReplyTo("");
    setWlShowPoweredBy(true);
    setWlCustomDomain("");
  };

  const openWhiteLabelModal = (community: Community) => {
    setWlCommunity(community);
    setWlWhiteLabel(community.whiteLabel || false);
    setWlTier(community.whiteLabelTier || "basic");
    setWlBillingMode(community.billingMode || "self_service");
    setWlSetupFee(community.setupFeeAmountCents ? String(community.setupFeeAmountCents / 100) : "");
    setWlSetupFeeCurrency(community.setupFeeCurrency || "EUR");
    setWlSetupFeeInvoiceRef(community.setupFeeInvoiceRef || "");
    setWlMaintenanceFee(community.maintenanceAmountYearCents ? String(community.maintenanceAmountYearCents / 100) : "");
    setWlMaintenanceCurrency(community.maintenanceCurrency || "EUR");
    setWlMaintenanceNextDate(community.maintenanceNextBillingDate ? community.maintenanceNextBillingDate.split("T")[0] : "");
    setWlMaintenanceStatus(community.maintenanceStatus || "active");
    setWlInternalNotes(community.internalNotes || "");
    setWlAppName(community.brandConfig?.appName || "");
    setWlBrandColor(community.brandConfig?.brandColor || "");
    setWlLogoUrl(community.brandConfig?.logoUrl || "");
    setWlAppIconUrl(community.brandConfig?.appIconUrl || "");
    setWlEmailFromName(community.brandConfig?.emailFromName || "");
    setWlEmailFromAddress(community.brandConfig?.emailFromAddress || "");
    setWlReplyTo(community.brandConfig?.replyTo || "");
    setWlShowPoweredBy(community.brandConfig?.showPoweredBy ?? true);
    setWlCustomDomain(community.customDomain || "");
    // Member quotas
    setWlIncludedMembers(community.whiteLabelIncludedMembers ? String(community.whiteLabelIncludedMembers) : "");
    setWlSoftLimit(community.whiteLabelMaxMembersSoftLimit ? String(community.whiteLabelMaxMembersSoftLimit) : "");
    setWlAdditionalFeePerMember(community.whiteLabelAdditionalFeePerMemberCents ? String(community.whiteLabelAdditionalFeePerMemberCents / 100) : "");
    setIsWhiteLabelOpen(true);
  };

  const handleSaveWhiteLabel = () => {
    if (!wlCommunity) return;
    
    const setupFeeAmountCents = wlSetupFee ? Math.round(parseFloat(wlSetupFee) * 100) : null;
    const maintenanceAmountYearCents = wlMaintenanceFee ? Math.round(parseFloat(wlMaintenanceFee) * 100) : null;
    const whiteLabelIncludedMembers = wlIncludedMembers ? parseInt(wlIncludedMembers) : null;
    const whiteLabelMaxMembersSoftLimit = wlSoftLimit ? parseInt(wlSoftLimit) : null;
    const whiteLabelAdditionalFeePerMemberCents = wlAdditionalFeePerMember ? Math.round(parseFloat(wlAdditionalFeePerMember) * 100) : null;
    
    updateWhiteLabelMutation.mutate({
      communityId: wlCommunity.id,
      whiteLabel: wlWhiteLabel,
      whiteLabelTier: wlWhiteLabel ? wlTier : null,
      billingMode: wlBillingMode,
      setupFeeAmountCents,
      setupFeeCurrency: wlSetupFeeCurrency,
      setupFeeInvoiceRef: wlSetupFeeInvoiceRef || null,
      maintenanceAmountYearCents,
      maintenanceCurrency: wlMaintenanceCurrency,
      maintenanceNextBillingDate: wlMaintenanceNextDate || null,
      maintenanceStatus: wlBillingMode === "manual_contract" ? wlMaintenanceStatus : null,
      internalNotes: wlInternalNotes || null,
      brandConfig: wlWhiteLabel ? {
        appName: wlAppName || undefined,
        brandColor: wlBrandColor || undefined,
        logoUrl: wlLogoUrl || undefined,
        appIconUrl: wlAppIconUrl || undefined,
        emailFromName: wlEmailFromName || undefined,
        emailFromAddress: wlEmailFromAddress || undefined,
        replyTo: wlReplyTo || undefined,
        showPoweredBy: wlShowPoweredBy
      } : null,
      customDomain: wlWhiteLabel && wlTier === "premium" && wlCustomDomain ? wlCustomDomain : null,
      whiteLabelIncludedMembers,
      whiteLabelMaxMembersSoftLimit,
      whiteLabelAdditionalFeePerMemberCents
    });
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
            <TabsTrigger value="emails" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-4">
              <Mail className="mr-2 h-4 w-4" /> Templates Email
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

                {/* Payment Tracking Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 mb-6">
                  <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Volume de Transactions</p>
                        <div className="p-2 bg-emerald-100 rounded-lg"><Activity className="h-4 w-4 text-emerald-600" /></div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(paymentAnalytics?.totalVolume || 0)}</div>
                      <p className="text-xs text-gray-500 mt-2">Ce mois: {formatCurrency(paymentAnalytics?.totalVolumeThisMonth || 0)}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Paiements Échoués</p>
                        <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="h-4 w-4 text-red-600" /></div>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{paymentAnalytics?.failedPayments?.count || 0}</div>
                      <p className="text-xs text-gray-500 mt-2">Total: {formatCurrency(paymentAnalytics?.failedPayments?.amount || 0)}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Factures en Attente</p>
                        <div className="p-2 bg-orange-100 rounded-lg"><Clock className="h-4 w-4 text-orange-600" /></div>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">{paymentAnalytics?.pendingPayments?.count || 0}</div>
                      <p className="text-xs text-gray-500 mt-2">Montant: {formatCurrency(paymentAnalytics?.pendingPayments?.amount || 0)}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500">Prévision Cash Flow</p>
                        <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="h-4 w-4 text-blue-600" /></div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(paymentAnalytics?.monthlyForecast?.[0]?.expectedRevenue || (metrics?.mrr || 0))}</div>
                      <p className="text-xs text-gray-500 mt-2">Projection prochain mois</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                {comm.whiteLabel && (<Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[9px] px-1.5 py-0 gap-0.5 border-0"><Crown size={10} /> WL</Badge>)}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                {comm.id.slice(0, 8)}...
                                {comm.billingMode === "manual_contract" && <span className="text-purple-600 font-medium">Contrat</span>}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><div className="flex items-center gap-1 text-gray-600"><Users size={14} /> {comm.memberCount ?? 0}</div></TableCell>
                        <TableCell><Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Actif</Badge></TableCell>
                        <TableCell><Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 uppercase text-[10px] tracking-wider">{getPlanName(comm.planId || 'free')}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant={hasActiveFullAccess(comm) ? "default" : "outline"} size="sm" className={`h-8 text-xs ${hasActiveFullAccess(comm) ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white border-0' : ''}`} onClick={() => openFullAccessModal(comm)} data-testid={`button-full-access-${comm.id}`}><Gift className="mr-1 h-3 w-3" />{hasActiveFullAccess(comm) ? 'VIP' : 'Offrir'}</Button>
                            <Button variant={comm.whiteLabel ? "default" : "ghost"} size="sm" className={comm.whiteLabel ? "h-8 text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0" : ""} onClick={() => openWhiteLabelModal(comm)} data-testid={`button-white-label-${comm.id}`}><Settings size={16} /></Button>
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
              <div className="flex items-center gap-2">
                <Select value={ticketFilter} onValueChange={(v) => setTicketFilter(v as any)}>
                  <SelectTrigger className="w-40" data-testid="select-ticket-filter">
                    <SelectValue placeholder="Filtrer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous ({tickets.length})</SelectItem>
                    <SelectItem value="open">Ouverts ({tickets.filter(t => t.status === 'open').length})</SelectItem>
                    <SelectItem value="in_progress">En cours ({tickets.filter(t => t.status === 'in_progress').length})</SelectItem>
                    <SelectItem value="resolved">Résolus ({tickets.filter(t => t.status === 'resolved').length})</SelectItem>
                    <SelectItem value="closed">Fermés ({tickets.filter(t => t.status === 'closed').length})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ticket Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Ouverts</p>
                      <p className="text-2xl font-bold text-green-800">{tickets.filter(t => t.status === 'open').length}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">En cours</p>
                      <p className="text-2xl font-bold text-blue-800">{tickets.filter(t => t.status === 'in_progress').length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700">Résolus</p>
                      <p className="text-2xl font-bold text-purple-800">{tickets.filter(t => t.status === 'resolved').length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">Total</p>
                      <p className="text-2xl font-bold text-gray-800">{tickets.length}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {ticketsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun ticket {ticketFilter !== 'all' ? `avec le statut "${ticketFilter}"` : ''}</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-24">Priorité</TableHead>
                        <TableHead>Sujet</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Demandeur</TableHead>
                        <TableHead>Assigné à</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Réponses</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openTicketModal(ticket)}>
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
                            <div className="text-xs text-gray-500 truncate max-w-[250px]">{ticket.message}</div>
                          </TableCell>
                          <TableCell><div className="text-sm text-gray-700 font-medium">{ticket.communityName}</div></TableCell>
                          <TableCell>
                            <div className="text-sm">{ticket.userName}</div>
                          </TableCell>
                          <TableCell>
                            {ticket.assignedUserName ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{ticket.assignedUserName}</Badge>
                            ) : (
                              <span className="text-xs text-gray-400">Non assigné</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              ticket.status === "open" ? "bg-green-50 text-green-700 border-green-200" : 
                              ticket.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200" : 
                              ticket.status === "resolved" ? "bg-purple-50 text-purple-700 border-purple-200" :
                              "bg-gray-50 text-gray-600"
                            }>
                              {ticket.status === "open" ? "Ouvert" : ticket.status === "in_progress" ? "En cours" : ticket.status === "resolved" ? "Résolu" : "Fermé"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{ticket.responseCount}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openTicketModal(ticket); }} data-testid={`button-manage-ticket-${ticket.id}`}>
                              Gérer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* EMAIL TEMPLATES TAB */}
          <TabsContent value="emails">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Templates Email</h1>
                <p className="text-gray-500">Personnalisez les emails envoyés par Koomy.</p>
              </div>
              <Button variant="outline" onClick={() => refetchTemplates()} className="gap-2">
                <RefreshCw size={16} /> Actualiser
              </Button>
            </div>

            {/* Warning Banner */}
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Attention</p>
                    <p className="text-sm text-amber-700">Les emails modifiés affectent toutes les communautés utilisant Koomy.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Templates List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Liste des Templates ({emailTemplates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {emailTemplates.map((template) => (
                      <div 
                        key={template.id} 
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedTemplate?.id === template.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setEditingSubject(template.subject);
                          setEditingHtml(template.html);
                        }}
                        data-testid={`template-item-${template.type}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{template.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{template.type}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {template.variables.length} variables
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(template.updatedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Template Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-500" />
                    {selectedTemplate ? 'Modifier le Template' : 'Sélectionnez un Template'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTemplate ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Type</Label>
                        <Input value={selectedTemplate.label} disabled className="bg-gray-50" />
                      </div>
                      
                      <div>
                        <Label>Variables disponibles</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedTemplate.variables.map((v) => (
                            <Badge key={v} variant="outline" className="font-mono text-xs bg-purple-50 text-purple-700 border-purple-200">
                              {`{{${v}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Objet de l'email</Label>
                        <Input 
                          value={editingSubject} 
                          onChange={(e) => setEditingSubject(e.target.value)}
                          placeholder="Objet de l'email"
                          data-testid="input-template-subject"
                        />
                      </div>
                      
                      <div>
                        <Label>Contenu HTML</Label>
                        <Textarea 
                          value={editingHtml} 
                          onChange={(e) => setEditingHtml(e.target.value)}
                          className="font-mono text-xs min-h-[200px]"
                          placeholder="Contenu HTML de l'email"
                          data-testid="textarea-template-html"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={() => updateTemplateMutation.mutate({ 
                            type: selectedTemplate.type, 
                            subject: editingSubject, 
                            html: editingHtml 
                          })}
                          disabled={updateTemplateMutation.isPending}
                          data-testid="button-save-template"
                        >
                          {updateTemplateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => setShowTestModal(true)}
                          data-testid="button-test-template"
                        >
                          <Send size={16} /> Tester
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setSelectedTemplate(null)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Sélectionnez un template dans la liste pour le modifier</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Email Logs Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Historique des Envois ({emailLogs.length} derniers)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {emailLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Aucun email envoyé pour le moment</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Destinataire</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Erreur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailLogs.slice(0, 20).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">{log.to}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{log.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {log.success ? (
                              <Badge className="bg-green-100 text-green-700 border-0">
                                <CheckCircle size={12} className="mr-1" /> Envoyé
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <X size={12} className="mr-1" /> Échec
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(log.sentAt).toLocaleString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-sm text-red-500">
                            {log.errorMessage || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Test Email Modal */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un email de test</DialogTitle>
            <DialogDescription>
              L'email sera envoyé avec des variables de démonstration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Email de destination</Label>
              <Input 
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="votre@email.com"
                data-testid="input-test-email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestModal(false)}>Annuler</Button>
            <Button 
              onClick={() => {
                if (selectedTemplate && testEmail) {
                  const testVariables: Record<string, string> = {};
                  selectedTemplate.variables.forEach(v => {
                    testVariables[v] = `[TEST_${v.toUpperCase()}]`;
                  });
                  testEmailMutation.mutate({ 
                    type: selectedTemplate.type, 
                    email: testEmail, 
                    variables: testVariables 
                  });
                }
              }}
              disabled={!testEmail || testEmailMutation.isPending}
              data-testid="button-confirm-test-email"
            >
              {testEmailMutation.isPending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Modal */}
      <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Ticket #{selectedTicket?.id?.slice(0, 8)}
            </DialogTitle>
            <DialogDescription>{selectedTicket?.subject}</DialogDescription>
          </DialogHeader>

          {selectedTicket ? (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Statut</p>
                  <Select 
                    value={selectedTicket.status} 
                    onValueChange={(v) => updateTicketStatusMutation.mutate({ ticketId: selectedTicket.id, status: v })}
                  >
                    <SelectTrigger className="h-8 text-xs" data-testid="select-ticket-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Ouvert</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="resolved">Résolu</SelectItem>
                      <SelectItem value="closed">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priorité</p>
                  <Badge className={
                    selectedTicket.priority === 'high' ? 'bg-red-100 text-red-700' :
                    selectedTicket.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {selectedTicket.priority === 'high' ? 'Haute' : selectedTicket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="text-sm font-medium">{selectedTicket.community?.name || selectedTicket.communityName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assigné à</p>
                  <Select
                    value={selectedTicket.assignedTo || ""}
                    onValueChange={(v) => v && assignTicketMutation.mutate({ ticketId: selectedTicket.id, assignedTo: v })}
                  >
                    <SelectTrigger className="h-8 text-xs" data-testid="select-ticket-assign">
                      <SelectValue placeholder="Non assigné" />
                    </SelectTrigger>
                    <SelectContent>
                      {platformUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Original Message */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedTicket.user ? `${selectedTicket.user.firstName} ${selectedTicket.user.lastName}` : selectedTicket.userName}</p>
                    <p className="text-xs text-gray-500">{new Date(selectedTicket.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{selectedTicket.message}</p>
              </div>

              {/* Responses */}
              <div className="flex-1 overflow-auto mb-4">
                <ScrollArea className="h-[200px] pr-4">
                  {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTicket.responses.map((response) => (
                        <div key={response.id} className={`p-3 rounded-lg ${response.isInternal ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${response.isInternal ? 'bg-yellow-100' : 'bg-green-100'}`}>
                              <Headphones className={`h-3 w-3 ${response.isInternal ? 'text-yellow-600' : 'text-green-600'}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium">Agent Support</p>
                              <p className="text-xs text-gray-500">{new Date(response.createdAt).toLocaleString('fr-FR')}</p>
                            </div>
                            {response.isInternal && <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">Note interne</Badge>}
                          </div>
                          <p className="text-sm text-gray-700">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 text-sm py-8">Aucune réponse pour le moment</p>
                  )}
                </ScrollArea>
              </div>

              {/* Response Form */}
              <div className="border-t pt-4">
                <Textarea
                  placeholder="Écrire une réponse..."
                  value={ticketResponse}
                  onChange={(e) => setTicketResponse(e.target.value)}
                  className="min-h-[80px] mb-3"
                  data-testid="input-ticket-response"
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="internal" className="rounded" />
                    <label htmlFor="internal" className="text-xs text-gray-500">Note interne (non visible par le client)</label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setTicketModalOpen(false)}>Fermer</Button>
                    <Button 
                      onClick={() => addTicketResponseMutation.mutate({ 
                        ticketId: selectedTicket.id, 
                        message: ticketResponse, 
                        isInternal: (document.getElementById('internal') as HTMLInputElement)?.checked || false
                      })}
                      disabled={!ticketResponse.trim() || addTicketResponseMutation.isPending}
                      data-testid="button-send-response"
                    >
                      {addTicketResponseMutation.isPending ? "Envoi..." : "Envoyer"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>

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

      {/* White Label Settings Modal */}
      <Dialog open={isWhiteLabelOpen} onOpenChange={(open) => { setIsWhiteLabelOpen(open); if (!open) resetWhiteLabelForm(); }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-500" />
              Configuration White Label
            </DialogTitle>
            <DialogDescription>
              {wlCommunity?.name} - Configurez les paramètres de marque blanche et facturation
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="billing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="billing" data-testid="tab-billing">Mode Facturation</TabsTrigger>
              <TabsTrigger value="contract" data-testid="tab-contract">Contrat & Tarifs</TabsTrigger>
              <TabsTrigger value="branding" data-testid="tab-branding">Branding</TabsTrigger>
            </TabsList>

            {/* Billing Mode Tab */}
            <TabsContent value="billing" className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">White Label activé</p>
                  <p className="text-sm text-gray-500">Activer les fonctionnalités de marque blanche pour cette communauté</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={wlWhiteLabel ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWlWhiteLabel(!wlWhiteLabel)}
                    className={wlWhiteLabel ? "bg-purple-600 hover:bg-purple-700" : ""}
                    data-testid="toggle-white-label"
                  >
                    {wlWhiteLabel ? "Activé" : "Désactivé"}
                  </Button>
                </div>
              </div>

              {wlWhiteLabel && (
                <>
                  <div className="space-y-2">
                    <Label>Tier White Label</Label>
                    <Select value={wlTier} onValueChange={(v) => setWlTier(v as "basic" | "standard" | "premium")}>
                      <SelectTrigger data-testid="select-wl-tier"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - Personnalisation logos et couleurs</SelectItem>
                        <SelectItem value="standard">Standard - Emails personnalisés inclus</SelectItem>
                        <SelectItem value="premium">Premium - Domaine personnalisé + support dédié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mode de facturation</Label>
                    <Select value={wlBillingMode} onValueChange={(v) => setWlBillingMode(v as "self_service" | "manual_contract")}>
                      <SelectTrigger data-testid="select-billing-mode"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self_service">Self-service (Stripe automatique)</SelectItem>
                        <SelectItem value="manual_contract">Contrat manuel (facturation hors Stripe)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      {wlBillingMode === "manual_contract" 
                        ? "La facturation est gérée manuellement par l'équipe Koomy" 
                        : "Le client gère son abonnement via Stripe"}
                    </p>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Notes internes (non visibles par le client)</Label>
                <Textarea
                  placeholder="Notes pour l'équipe interne..."
                  value={wlInternalNotes}
                  onChange={(e) => setWlInternalNotes(e.target.value)}
                  className="min-h-[100px]"
                  data-testid="input-internal-notes"
                />
              </div>
            </TabsContent>

            {/* Contract Tab */}
            <TabsContent value="contract" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frais de setup</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={wlSetupFee}
                      onChange={(e) => setWlSetupFee(e.target.value)}
                      className="flex-1"
                      data-testid="input-setup-fee"
                    />
                    <Select value={wlSetupFeeCurrency} onValueChange={setWlSetupFeeCurrency}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="CHF">CHF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Réf. facture setup</Label>
                  <Input
                    placeholder="INV-2024-001"
                    value={wlSetupFeeInvoiceRef}
                    onChange={(e) => setWlSetupFeeInvoiceRef(e.target.value)}
                    data-testid="input-setup-invoice-ref"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Maintenance annuelle</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={wlMaintenanceFee}
                      onChange={(e) => setWlMaintenanceFee(e.target.value)}
                      className="flex-1"
                      data-testid="input-maintenance-fee"
                    />
                    <Select value={wlMaintenanceCurrency} onValueChange={setWlMaintenanceCurrency}>
                      <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="CHF">CHF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Prochaine échéance</Label>
                  <Input
                    type="date"
                    value={wlMaintenanceNextDate}
                    onChange={(e) => setWlMaintenanceNextDate(e.target.value)}
                    data-testid="input-maintenance-next-date"
                  />
                </div>
              </div>

              {wlBillingMode === "manual_contract" && (
                <div className="space-y-2">
                  <Label>Statut maintenance</Label>
                  <Select value={wlMaintenanceStatus} onValueChange={(v) => setWlMaintenanceStatus(v as "active" | "pending" | "late" | "stopped")}>
                    <SelectTrigger data-testid="select-maintenance-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif - Paiement à jour</SelectItem>
                      <SelectItem value="pending">En attente - Facture émise</SelectItem>
                      <SelectItem value="late">En retard - Paiement attendu</SelectItem>
                      <SelectItem value="stopped">Arrêté - Contrat suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Member Quota Section - White Label Contract */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Quota membres (contrat WL)
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  Ces quotas sont indépendants du plan technique. Ils définissent les termes commerciaux du contrat White Label.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Membres inclus</Label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={wlIncludedMembers}
                      onChange={(e) => setWlIncludedMembers(e.target.value)}
                      data-testid="input-wl-included-members"
                    />
                    <p className="text-xs text-gray-400">Quota contractuel</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil d'alerte</Label>
                    <Input
                      type="number"
                      placeholder="600"
                      value={wlSoftLimit}
                      onChange={(e) => setWlSoftLimit(e.target.value)}
                      data-testid="input-wl-soft-limit"
                    />
                    <p className="text-xs text-gray-400">Alerte interne (ex: 120%)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Supplément/membre (€)</Label>
                    <Input
                      type="number"
                      placeholder="0.50"
                      step="0.01"
                      value={wlAdditionalFeePerMember}
                      onChange={(e) => setWlAdditionalFeePerMember(e.target.value)}
                      data-testid="input-wl-additional-fee"
                    />
                    <p className="text-xs text-gray-400">Au-delà du quota</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-medium mb-2">Résumé contrat</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Setup:</span>
                  <span className="font-medium">{wlSetupFee ? `${wlSetupFee} ${wlSetupFeeCurrency}` : "-"}</span>
                  <span className="text-gray-500">Maintenance/an:</span>
                  <span className="font-medium">{wlMaintenanceFee ? `${wlMaintenanceFee} ${wlMaintenanceCurrency}` : "-"}</span>
                  <span className="text-gray-500">Mode:</span>
                  <span className="font-medium">{wlBillingMode === "manual_contract" ? "Contrat manuel" : "Self-service"}</span>
                  <span className="text-gray-500">Quota membres WL:</span>
                  <span className="font-medium">{wlIncludedMembers ? `${wlIncludedMembers} membres` : "-"}</span>
                  {wlAdditionalFeePerMember && (
                    <>
                      <span className="text-gray-500">Supplément/membre:</span>
                      <span className="font-medium">{wlAdditionalFeePerMember} €</span>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-4 pt-4">
              {!wlWhiteLabel ? (
                <div className="text-center py-8 text-gray-500">
                  <Crown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Activez le mode White Label pour configurer le branding</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom de l'application</Label>
                      <Input
                        placeholder="MonApp"
                        value={wlAppName}
                        onChange={(e) => setWlAppName(e.target.value)}
                        data-testid="input-app-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Couleur principale</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={wlBrandColor || "#6366f1"}
                          onChange={(e) => setWlBrandColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          placeholder="#6366f1"
                          value={wlBrandColor}
                          onChange={(e) => setWlBrandColor(e.target.value)}
                          className="flex-1"
                          data-testid="input-brand-color"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>URL du logo</Label>
                      <Input
                        placeholder="https://..."
                        value={wlLogoUrl}
                        onChange={(e) => setWlLogoUrl(e.target.value)}
                        data-testid="input-logo-url"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL de l'icône app</Label>
                      <Input
                        placeholder="https://..."
                        value={wlAppIconUrl}
                        onChange={(e) => setWlAppIconUrl(e.target.value)}
                        data-testid="input-app-icon-url"
                      />
                    </div>
                  </div>

                  {wlTier === "premium" && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Domaine personnalisé
                      </h4>
                      <div className="space-y-2">
                        <Label>Sous-domaine Koomy</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="monorganisation"
                            value={wlCustomDomain}
                            onChange={(e) => setWlCustomDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className="flex-1"
                            data-testid="input-custom-domain"
                          />
                          <span className="text-gray-500 font-medium">.koomy.app</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          L'app sera accessible via: <span className="font-mono">{wlCustomDomain || "monorganisation"}.koomy.app</span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Personnalisation emails</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom expéditeur</Label>
                        <Input
                          placeholder="MonApp"
                          value={wlEmailFromName}
                          onChange={(e) => setWlEmailFromName(e.target.value)}
                          data-testid="input-email-from-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email expéditeur</Label>
                        <Input
                          type="email"
                          placeholder="noreply@monapp.com"
                          value={wlEmailFromAddress}
                          onChange={(e) => setWlEmailFromAddress(e.target.value)}
                          data-testid="input-email-from-address"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label>Reply-to</Label>
                      <Input
                        type="email"
                        placeholder="support@monapp.com"
                        value={wlReplyTo}
                        onChange={(e) => setWlReplyTo(e.target.value)}
                        data-testid="input-reply-to"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border mt-4">
                    <div>
                      <p className="font-medium">Afficher "Powered by Koomy"</p>
                      <p className="text-sm text-gray-500">Ajoute une mention discrète dans les emails et l'app</p>
                    </div>
                    <Button
                      variant={wlShowPoweredBy ? "outline" : "default"}
                      size="sm"
                      onClick={() => setWlShowPoweredBy(!wlShowPoweredBy)}
                      className={!wlShowPoweredBy ? "bg-purple-600 hover:bg-purple-700" : ""}
                      data-testid="toggle-powered-by"
                    >
                      {wlShowPoweredBy ? "Visible" : "Masqué"}
                    </Button>
                  </div>

                  {wlAppName && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mt-4">
                      <h4 className="font-medium mb-2">Aperçu</h4>
                      <div className="flex items-center gap-3">
                        {wlLogoUrl ? (
                          <img src={wlLogoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-contain border" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: wlBrandColor || '#6366f1' }}>
                            {wlAppName.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-lg" style={{ color: wlBrandColor || '#6366f1' }}>{wlAppName}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsWhiteLabelOpen(false)}>Annuler</Button>
            <Button
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
              onClick={handleSaveWhiteLabel}
              disabled={updateWhiteLabelMutation.isPending}
              data-testid="button-save-white-label"
            >
              <Crown className="mr-2 h-4 w-4" />
              {updateWhiteLabelMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
