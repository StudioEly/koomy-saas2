import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { MOCK_MEMBERS, SECTIONS, User } from "@/lib/mockData";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Trash2, Lock } from "lucide-react";

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<User[]>(MOCK_MEMBERS.filter(u => u.role === "admin" || u.role === "super_admin"));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "super_admin">("admin");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Administrateurs</h1>
            <p className="text-gray-500 text-sm">Créez et gérez les comptes administrateurs nationaux et locaux.</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gray-900 hover:bg-black text-white">
                <Plus size={16} /> Créer un administrateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvel Administrateur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input placeholder="Nom" />
                  </div>
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input placeholder="Prénom" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email (Sera l'identifiant de connexion)</Label>
                  <Input type="email" placeholder="admin@unsa.org" />
                </div>

                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select 
                    value={newAdminRole} 
                    onValueChange={(v: "admin" | "super_admin") => setNewAdminRole(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-purple-600" /> 
                          <span className="font-bold">Super Admin (National)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-blue-600" /> 
                          <span>Admin Local</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {newAdminRole === "super_admin" 
                      ? "A accès à toutes les sections et toutes les fonctionnalités." 
                      : "Gère uniquement les adhérents et contenus de sa section."}
                  </p>
                </div>

                {newAdminRole === "admin" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Affectation Section</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir la section..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTIONS.map(section => (
                          <SelectItem key={section} value={section}>{section}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 flex gap-3 items-start">
                   <Lock size={16} className="text-yellow-600 mt-0.5" />
                   <p className="text-xs text-yellow-700">
                     L'administrateur recevra un email sécurisé pour définir son mot de passe. L'accès est protégé par 2FA par défaut.
                   </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button onClick={() => setIsCreateOpen(false)}>Créer le compte</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Administrateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Périmètre</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                        {admin.firstName[0]}{admin.lastName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{admin.firstName} {admin.lastName}</div>
                        <div className="text-xs text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {admin.role === "super_admin" ? (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">Super Admin</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Admin Local</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {admin.section === "National" ? (
                      <span className="font-semibold text-gray-900">Global (National)</span>
                    ) : (
                      admin.section
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{new Date(admin.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
