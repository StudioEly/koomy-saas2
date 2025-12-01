import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Trash2, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { UserCommunityMembership, Section, User } from "@shared/schema";

interface MemberWithUser extends UserCommunityMembership {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  } | null;
}

export default function AdminAdmins() {
  const { currentMembership } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId || "community_unsa";
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<MemberWithUser | null>(null);
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "super_admin">("admin");
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    section: ""
  });

  const { data: members = [], isLoading } = useQuery<MemberWithUser[]>({
    queryKey: [`/api/communities/${communityId}/members`],
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: [`/api/communities/${communityId}/sections`],
  });

  const admins = members.filter(m => m.role === "admin" || m.role === "super_admin");

  const createAdminMutation = useMutation({
    mutationFn: async (data: { displayName: string; communityId: string; role: string; section?: string }) => {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          status: "active",
          contributionStatus: "up_to_date"
        })
      });
      if (!res.ok) throw new Error("Failed to create admin");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/members`] });
      toast.success("Administrateur créé avec succès", {
        description: `Code de réclamation: ${data.claimCode}`
      });
      setIsCreateOpen(false);
      setNewAdmin({ firstName: "", lastName: "", email: "", section: "" });
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'administrateur");
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await fetch(`/api/memberships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/members`] });
      toast.success("Rôle supprimé");
      setIsDeleteOpen(false);
      setSelectedAdmin(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    }
  });

  const handleCreate = () => {
    if (!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    createAdminMutation.mutate({
      displayName: `${newAdmin.firstName} ${newAdmin.lastName}`,
      communityId,
      role: newAdminRole,
      section: newAdminRole === "admin" ? newAdmin.section : undefined
    });
  };

  const handleDeleteClick = (admin: MemberWithUser) => {
    setSelectedAdmin(admin);
    setIsDeleteOpen(true);
  };

  const confirmRemoveAdmin = () => {
    if (selectedAdmin) {
      updateRoleMutation.mutate({ id: selectedAdmin.id, role: "member" });
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Administrateurs</h1>
            <p className="text-gray-500 text-sm">Créez et gérez les comptes administrateurs nationaux et locaux.</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gray-900 hover:bg-black text-white" data-testid="button-new-admin">
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
                    <Label>Nom *</Label>
                    <Input 
                      placeholder="Nom"
                      value={newAdmin.lastName}
                      onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                      data-testid="input-admin-lastname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prénom *</Label>
                    <Input 
                      placeholder="Prénom"
                      value={newAdmin.firstName}
                      onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                      data-testid="input-admin-firstname"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email (Sera l'identifiant de connexion) *</Label>
                  <Input 
                    type="email" 
                    placeholder="admin@organisation.org"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    data-testid="input-admin-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select 
                    value={newAdminRole} 
                    onValueChange={(v: "admin" | "super_admin") => setNewAdminRole(v)}
                  >
                    <SelectTrigger data-testid="select-admin-role">
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
                    <Select
                      value={newAdmin.section}
                      onValueChange={(v) => setNewAdmin({ ...newAdmin, section: v })}
                    >
                      <SelectTrigger data-testid="select-admin-section">
                        <SelectValue placeholder="Choisir la section..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map(section => (
                          <SelectItem key={section.id} value={section.name}>{section.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 flex gap-3 items-start">
                   <Lock size={16} className="text-yellow-600 mt-0.5" />
                   <p className="text-xs text-yellow-700">
                     Un code de réclamation sera généré. L'administrateur devra l'utiliser pour associer son compte Koomy.
                   </p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreate}
                  disabled={createAdminMutation.isPending}
                  data-testid="button-submit-admin"
                >
                  {createAdminMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</>
                  ) : (
                    "Créer le compte"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {admins.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">Aucun administrateur pour le moment</p>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-gray-900 hover:bg-black">
                <Plus size={16} className="mr-2" /> Créer un administrateur
              </Button>
            </div>
          ) : (
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
                  <TableRow key={admin.id} data-testid={`row-admin-${admin.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                          {(admin.displayName || `${admin.user?.firstName || ''} ${admin.user?.lastName || ''}`).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {admin.displayName || `${admin.user?.firstName || ''} ${admin.user?.lastName || ''}`}
                          </div>
                          <div className="text-xs text-gray-500">{admin.user?.email || admin.claimCode || 'Non réclamé'}</div>
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
                      {admin.role === "super_admin" ? (
                        <span className="font-semibold text-gray-900">Global (National)</span>
                      ) : (
                        admin.section || "Non défini"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(admin.joinDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(admin)}
                        data-testid={`button-delete-admin-${admin.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer les droits d'administration</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-gray-600">
            Êtes-vous sûr de vouloir retirer les droits d'administration de "{selectedAdmin?.displayName || `${selectedAdmin?.user?.firstName} ${selectedAdmin?.user?.lastName}`}" ? 
            Cette personne restera membre mais n'aura plus accès au back-office.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmRemoveAdmin}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Retrait...</>
              ) : (
                "Retirer les droits"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
