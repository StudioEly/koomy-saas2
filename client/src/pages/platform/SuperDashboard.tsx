import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { MOCK_COMMUNITIES, MOCK_PLANS, Plan } from "@/lib/mockData";
import { MOCK_TICKETS } from "@/lib/mockSupportData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Users, Settings, MessageSquare, CheckCircle, Clock, AlertCircle, TrendingUp, Shield, CreditCard, BarChart3, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function SuperAdminDashboard() {
  const [_, setLocation] = useLocation();
  const { user, logout, isPlatformAdmin, authReady } = useAuth();
  const [communities, setCommunities] = useState(MOCK_COMMUNITIES);
  const [tickets] = useState(MOCK_TICKETS);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");

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

  // Mock creation handler
  const handleCreateClient = () => {
    toast({
      title: "Client Créé",
      description: `L'organisation "${newClientName}" a été ajoutée avec succès.`,
    });
    setIsCreateClientOpen(false);
    setNewClientName("");
  };

  // Mock Admin Creation
  const handleCreateAdmin = (role: string) => {
    toast({
      title: "Administrateur Ajouté",
      description: `Nouvel administrateur créé avec le rôle : ${role === 'super_admin' ? 'Super Admin (Full)' : 'Support Admin (Restreint)'}`,
    });
  };

  const getPlanName = (planId: string) => MOCK_PLANS.find(p => p.id === planId)?.name || planId;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Super Admin Top Bar */}
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
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 transition-colors p-2"
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white p-1 border border-gray-200 rounded-lg w-full justify-start shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6">Clients & Tenants</TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6">Plans & Offres</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 px-6">Support & Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
             <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
                <p className="text-gray-500">Vue globale de l'activité de la plateforme.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Clock className="mr-2 h-4 w-4" /> Derniers 30 jours</Button>
              </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               <Card className="border-l-4 border-l-blue-500 shadow-sm">
                 <CardContent className="pt-6">
                   <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-gray-500">MRR (Revenu Mensuel)</p>
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                   </div>
                   <div className="text-3xl font-bold text-gray-900">1,840 €</div>
                   <p className="text-xs text-green-600 mt-1 flex items-center font-medium"><TrendingUp className="h-3 w-3 mr-1"/> +12.5% ce mois</p>
                 </CardContent>
               </Card>
               <Card className="border-l-4 border-l-purple-500 shadow-sm">
                 <CardContent className="pt-6">
                   <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-gray-500">Clients Actifs</p>
                      <Users className="h-4 w-4 text-purple-500" />
                   </div>
                   <div className="text-3xl font-bold text-gray-900">12</div>
                   <p className="text-xs text-green-600 mt-1 flex items-center font-medium"><TrendingUp className="h-3 w-3 mr-1"/> +2 nouveaux</p>
                 </CardContent>
               </Card>
               <Card className="border-l-4 border-l-green-500 shadow-sm">
                 <CardContent className="pt-6">
                   <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-gray-500">Utilisateurs Totaux</p>
                      <Users className="h-4 w-4 text-green-500" />
                   </div>
                   <div className="text-3xl font-bold text-gray-900">4,250</div>
                   <p className="text-xs text-green-600 mt-1 flex items-center font-medium"><TrendingUp className="h-3 w-3 mr-1"/> +340 ce mois</p>
                 </CardContent>
               </Card>
               <Card className="border-l-4 border-l-orange-500 shadow-sm">
                 <CardContent className="pt-6">
                   <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-gray-500">Tickets Ouverts</p>
                      <MessageSquare className="h-4 w-4 text-orange-500" />
                   </div>
                   <div className="text-3xl font-bold text-gray-900">{tickets.filter(t => t.status === 'open').length}</div>
                   <p className="text-xs text-orange-600 mt-1 font-medium">Action requise</p>
                 </CardContent>
               </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activité Récente</CardTitle>
                  <CardDescription>Dernières actions sur la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 pb-3 border-b border-gray-100 last:border-0">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Settings size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Nouveau client créé: "Club Sportif Lyon"</p>
                          <p className="text-xs text-gray-500">Il y a 2 heures par Super Admin</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                 <CardHeader>
                   <CardTitle>Répartition des Plans</CardTitle>
                   <CardDescription>Distribution des abonnements actifs</CardDescription>
                 </CardHeader>
                 <CardContent className="flex justify-center items-center h-[200px]">
                    <div className="text-center text-gray-400 italic">Graphique de répartition ici</div>
                 </CardContent>
              </Card>
            </div>
          </TabsContent>

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

            {/* Tenants List */}
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
                    {communities.map((comm) => (
                      <TableRow key={comm.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={comm.logo} className="h-10 w-10 rounded-lg object-contain bg-gray-50 p-1 border" />
                            <div>
                              <div className="font-bold">{comm.name}</div>
                              <div className="text-xs text-gray-500">{comm.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users size={14} /> {comm.memberCount}
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 text-xs">
                                  <Shield className="mr-1 h-3 w-3" /> Admin
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Gérer les Administrateurs - {comm.name}</DialogTitle>
                                  <DialogDescription>Ajouter un nouvel administrateur pour cette organisation.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                  <div className="space-y-2">
                                    <Label>Email de l'utilisateur</Label>
                                    <Input placeholder="admin@client.com" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Rôle & Permissions</Label>
                                    <Select onValueChange={handleCreateAdmin}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un rôle" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="super_admin">
                                          <div className="font-medium">Super Admin (Full Access)</div>
                                          <div className="text-xs text-gray-500">Accès complet, y compris facturation et suppression</div>
                                        </SelectItem>
                                        <SelectItem value="support_admin">
                                          <div className="font-medium">Support Admin (Restreint)</div>
                                          <div className="text-xs text-gray-500">Gestion utilisateurs et tickets uniquement. Pas de suppressions.</div>
                                        </SelectItem>
                                        <SelectItem value="content_admin">
                                          <div className="font-medium">Content Admin</div>
                                          <div className="text-xs text-gray-500">Publication de news et événements uniquement.</div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button onClick={() => (document.querySelector('button[data-state="closed"]') as HTMLElement)?.click()}>Ajouter</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
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
                    <Button variant={plan.isPopular ? "default" : "outline"} className="w-full">
                      Modifier
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

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
    </div>
  );
}
