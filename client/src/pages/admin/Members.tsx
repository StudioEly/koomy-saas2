import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Link } from "wouter";
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
import { Search, Plus, Filter, Download, Upload, Eye, AlertCircle, CheckCircle2, Clock, Loader2, Copy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { UserCommunityMembership, Section } from "@shared/schema";

interface MemberWithDetails extends UserCommunityMembership {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  } | null;
}

export default function AdminMembers() {
  const { currentMembership } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId || "community_unsa";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    displayName: "",
    email: "",
    phone: "",
    section: "",
    status: "active" as "active" | "suspended"
  });

  const { data: members = [], isLoading } = useQuery<MemberWithDetails[]>({
    queryKey: [`/api/communities/${communityId}/members`],
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: [`/api/communities/${communityId}/sections`],
  });

  const createMemberMutation = useMutation({
    mutationFn: async (data: { displayName: string; communityId: string; email?: string; phone?: string; section?: string; status?: string }) => {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          role: "member",
          contributionStatus: "pending"
        })
      });
      if (!res.ok) throw new Error("Failed to create member");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/members`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/dashboard`] });
      toast.success("Adhérent créé avec succès", {
        description: `Code de réclamation: ${data.claimCode}`,
        action: {
          label: "Copier",
          onClick: () => {
            navigator.clipboard.writeText(data.claimCode);
            toast.success("Code copié");
          }
        }
      });
      setIsCreateOpen(false);
      setNewMember({ displayName: "", email: "", phone: "", section: "", status: "active" });
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'adhérent");
    }
  });

  const filteredMembers = members.filter(member => {
    const name = member.displayName || `${member.user?.firstName || ''} ${member.user?.lastName || ''}`;
    const email = member.user?.email || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.claimCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = sectionFilter === "all" || member.section === sectionFilter;
    return matchesSearch && matchesSection;
  });

  const handleCreateMember = () => {
    if (!newMember.displayName) {
      toast.error("Veuillez renseigner le nom de l'adhérent");
      return;
    }
    createMemberMutation.mutate({
      displayName: newMember.displayName,
      communityId,
      email: newMember.email || undefined,
      phone: newMember.phone || undefined,
      section: newMember.section || undefined,
      status: newMember.status
    });
  };

  const handleImport = () => {
    setIsImportOpen(false);
    toast.info("Fonctionnalité d'import en cours de développement");
  };

  const handleExport = () => {
    const csvContent = [
      ["Nom", "Email", "Section", "Code", "Statut", "Cotisation"].join(","),
      ...filteredMembers.map(m => [
        m.displayName || `${m.user?.firstName || ''} ${m.user?.lastName || ''}`,
        m.user?.email || '',
        m.section || '',
        m.claimCode || '',
        m.status || '',
        m.contributionStatus || ''
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adherents-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Export téléchargé");
  };

  const copyClaimCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié dans le presse-papier");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Adhérents</h1>
            <p className="text-gray-500 text-sm">Gérez les inscriptions, cotisations et statuts des membres.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-import-members">
                  <Upload size={16} /> Importer (CSV)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importer des adhérents</DialogTitle>
                </DialogHeader>
                <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Upload className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-sm font-medium text-gray-900">Cliquez pour sélectionner un fichier</p>
                  <p className="text-xs text-gray-500 mt-1">CSV, XLS, XLSX (Max 5MB)</p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={handleImport}>Lancer l'import</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="gap-2" onClick={handleExport} data-testid="button-export-members">
              <Download size={16} /> Exporter
            </Button>
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90" data-testid="button-add-member">
                  <Plus size={16} /> Ajouter un adhérent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Nouvel Adhérent</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="displayName">Nom complet *</Label>
                    <Input 
                      id="displayName" 
                      placeholder="Thomas Dubois"
                      value={newMember.displayName}
                      onChange={(e) => setNewMember({ ...newMember, displayName: e.target.value })}
                      data-testid="input-member-displayname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optionnel)</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="exemple@email.com"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      data-testid="input-member-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
                    <Input 
                      id="phone" 
                      placeholder="06 12 34 56 78"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                      data-testid="input-member-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section Locale</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut Initial</Label>
                    <Select 
                      value={newMember.status}
                      onValueChange={(v: "active" | "suspended") => setNewMember({ ...newMember, status: v })}
                    >
                      <SelectTrigger data-testid="select-member-status">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    Un code de réclamation sera généré. L'adhérent pourra l'utiliser pour associer son compte Koomy à sa carte membre.
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
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Rechercher par nom, email, code..." 
              className="pl-10 bg-gray-50 border-gray-200" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-members"
            />
          </div>
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-section-filter">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <SelectValue placeholder="Toutes sections" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sections</SelectItem>
              {sections.map(section => (
                <SelectItem key={section.id} value={section.name}>{section.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Adhérent</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Code réclamation</TableHead>
                  <TableHead>Cotisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun adhérent trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} className="cursor-pointer hover:bg-gray-50/80 group transition-colors" data-testid={`row-member-${member.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden">
                            {member.user?.avatar ? (
                              <img src={member.user.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                                {(member.displayName || `${member.user?.firstName || ''} ${member.user?.lastName || ''}`).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                              {member.displayName || `${member.user?.firstName || ''} ${member.user?.lastName || ''}`}
                            </div>
                            <div className="text-xs text-gray-500">{member.user?.email || 'Non réclamé'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{member.section || '-'}</TableCell>
                      <TableCell>
                        {member.claimCode ? (
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{member.claimCode}</code>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); copyClaimCode(member.claimCode!); }}
                            >
                              <Copy size={12} />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                         {member.contributionStatus === "up_to_date" && (
                           <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 font-normal">
                             <CheckCircle2 size={10} /> À jour
                           </Badge>
                         )}
                         {member.contributionStatus === "pending" && (
                           <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 font-normal">
                             <Clock size={10} /> En attente
                           </Badge>
                         )}
                         {member.contributionStatus === "expired" && (
                           <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 font-normal">
                             <AlertCircle size={10} /> Expirée
                           </Badge>
                         )}
                         {member.contributionStatus === "late" && (
                           <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1 font-normal">
                             <Clock size={10} /> En retard
                           </Badge>
                         )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            member.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                            member.status === "expired" ? "bg-red-50 text-red-700 border-red-200" :
                            member.status === "suspended" ? "bg-gray-50 text-gray-600 border-gray-200" :
                            "bg-gray-50 text-gray-600 border-gray-200"
                          }
                        >
                          {member.status === "active" ? "Actif" : 
                           member.status === "expired" ? "Expiré" : 
                           member.status === "suspended" ? "Suspendu" : member.status || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/members/${member.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-view-member-${member.id}`}>
                            <Eye size={16} className="text-gray-400 hover:text-primary" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
