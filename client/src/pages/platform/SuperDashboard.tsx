import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { MOCK_COMMUNITIES, Community } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Settings, LayoutDashboard, BarChart } from "lucide-react";

export default function SuperAdminDashboard() {
  const [communities] = useState(MOCK_COMMUNITIES);

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenants / Communautés</h1>
            <p className="text-gray-500">Gérez l'ensemble des organisations hébergées sur Koomy.</p>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus size={18} /> Nouveau Client
          </Button>
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
               <CardTitle className="text-sm font-medium text-gray-500">Revenu Récurrent (ARR)</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-3xl font-bold">18,400 €</div>
               <p className="text-xs text-green-600 mt-1">+5% vs mois dernier</p>
             </CardContent>
           </Card>
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
      </main>
    </div>
  );
}
