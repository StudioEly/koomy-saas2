import { useState } from "react";
import { MOCK_COMMUNITIES } from "@/lib/mockData";
import { MOCK_TICKETS } from "@/lib/mockSupportData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Settings, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function SuperAdminDashboard() {
  const [communities] = useState(MOCK_COMMUNITIES);
  const [tickets] = useState(MOCK_TICKETS);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Super Admin Top Bar */}
      <header className="bg-gray-900 text-white h-16 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="font-bold text-xl tracking-tight">Koomy <span className="text-blue-400 font-normal">Platform</span></div>
          <Badge className="bg-blue-500/20 text-blue-300 border-0">Super Owner</Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">admin@koomy.app</span>
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">KO</div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white p-1 border border-gray-200 rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">Clients</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">Support & Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
             <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
                <p className="text-gray-500">Vue globale de l'activité de la plateforme.</p>
              </div>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-6 mb-8">
               <Card>
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-medium text-gray-500">Total Communautés</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold">12</div>
                   <p className="text-xs text-green-600 mt-1">+2 ce mois</p>
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-medium text-gray-500">Total Utilisateurs</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold">4,250</div>
                   <p className="text-xs text-green-600 mt-1">+12% vs mois dernier</p>
                 </CardContent>
               </Card>
               <Card>
                 <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-medium text-gray-500">Tickets Ouverts</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="text-3xl font-bold">{tickets.filter(t => t.status === 'open').length}</div>
                   <p className="text-xs text-orange-600 mt-1">Nécessitent attention</p>
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
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus size={18} /> Nouveau Client
              </Button>
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
                          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Enterprise</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Settings size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
