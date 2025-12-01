import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Newspaper, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Section } from "@shared/schema";

interface DashboardData {
  stats: {
    totalMembers: number;
    membersThisMonth: number;
    memberGrowth: number;
    totalNews: number;
    newsThisWeek: number;
    totalEvents: number;
    upcomingEvents: number;
    openTickets: number;
  };
  monthlyData: { name: string; adherents: number }[];
  recentNews: any[];
  upcomingEvents: any[];
}

export default function AdminDashboard() {
  const { currentMembership } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId || "community_unsa";
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    displayName: "",
    email: "",
    section: ""
  });

  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: [`/api/communities/${communityId}/dashboard`],
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: [`/api/communities/${communityId}/sections`],
  });

  const createMemberMutation = useMutation({
    mutationFn: async (data: { displayName: string; communityId: string; section?: string }) => {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          role: "member",
          status: "active",
          contributionStatus: "pending"
        })
      });
      if (!res.ok) throw new Error("Failed to create member");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/dashboard`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/members`] });
      toast.success("Adhérent créé avec succès", {
        description: `Code de réclamation: ${data.claimCode}`
      });
      setIsCreateOpen(false);
      setNewMember({ displayName: "", email: "", section: "" });
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'adhérent");
    }
  });

  const handleCreateMember = () => {
    if (!newMember.displayName) {
      toast.error("Veuillez renseigner le nom de l'adhérent");
      return;
    }
    createMemberMutation.mutate({
      displayName: newMember.displayName,
      communityId,
      section: newMember.section || undefined
    });
  };

  const handleDownloadReport = () => {
    if (!dashboard) return;
    
    const reportData = {
      date: new Date().toLocaleDateString('fr-FR'),
      stats: dashboard.stats,
      monthlyData: dashboard.monthlyData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-mensuel-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Rapport téléchargé");
  };

  const stats = dashboard?.stats;
  const monthlyData = dashboard?.monthlyData || [];

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
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900" data-testid="text-dashboard-title">Tableau de bord</h1>
          <div className="flex gap-2">
             <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-primary/30 hover:bg-primary/90 gap-2" data-testid="button-new-member">
                    <Plus size={16} /> Nouvel Adhérent
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Ajout Rapide Adhérent</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="dash-name">Nom complet</Label>
                      <Input 
                        id="dash-name" 
                        placeholder="Thomas Dubois" 
                        value={newMember.displayName}
                        onChange={(e) => setNewMember({ ...newMember, displayName: e.target.value })}
                        data-testid="input-member-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dash-email">Email (optionnel)</Label>
                      <Input 
                        id="dash-email" 
                        type="email" 
                        placeholder="exemple@email.com"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        data-testid="input-member-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dash-section">Section Locale</Label>
                      <Select 
                        value={newMember.section} 
                        onValueChange={(v) => setNewMember({ ...newMember, section: v })}
                      >
                        <SelectTrigger data-testid="select-member-section">
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map(section => (
                            <SelectItem key={section.id} value={section.name}>{section.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-blue-700">
                      Un code de réclamation sera généré. L'adhérent pourra l'utiliser pour associer son compte Koomy.
                    </p>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleCreateMember} 
                      disabled={createMemberMutation.isPending}
                      data-testid="button-submit-member"
                    >
                      {createMemberMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</>
                      ) : (
                        "Créer l'adhérent"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
             </Dialog>
             <Button 
               variant="outline"
               onClick={handleDownloadReport}
               className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50"
               data-testid="button-monthly-report"
             >
               Rapport Mensuel
             </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Adhérents</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-members">
                {stats?.totalMembers?.toLocaleString() || 0}
              </div>
              <p className={`text-xs flex items-center mt-1 ${(stats?.memberGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(stats?.memberGrowth || 0) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {stats?.memberGrowth ? `${stats.memberGrowth > 0 ? '+' : ''}${stats.memberGrowth}%` : '0%'} ce mois
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Actualités</CardTitle>
              <Newspaper className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-news">
                {stats?.totalNews || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                +{stats?.newsThisWeek || 0} cette semaine
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Événements</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-events">
                {stats?.totalEvents || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.upcomingEvents || 0} à venir
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Tickets ouverts</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-open-tickets">
                {stats?.openTickets || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Demandes en attente
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 shadow-sm">
            <CardHeader>
              <CardTitle>Évolution des Adhésions</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                    <Bar dataKey="adherents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3 shadow-sm">
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard?.recentNews?.length ? (
                  dashboard.recentNews.map((news, i) => (
                    <div key={news.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{news.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(news.publishedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Aucune actualité récente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
