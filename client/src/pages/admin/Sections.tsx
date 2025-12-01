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
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Users, MoreVertical, Building2, Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Section, UserCommunityMembership } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminSections() {
  const { currentMembership } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId || "community_unsa";
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [newSection, setNewSection] = useState({
    name: "",
    region: ""
  });

  const { data: sections = [], isLoading } = useQuery<Section[]>({
    queryKey: [`/api/communities/${communityId}/sections`],
  });

  const { data: members = [] } = useQuery<UserCommunityMembership[]>({
    queryKey: [`/api/communities/${communityId}/members`],
  });

  const createSectionMutation = useMutation({
    mutationFn: async (data: { name: string; communityId: string; region?: string }) => {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create section");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/sections`] });
      toast.success("Section créée avec succès");
      setIsCreateOpen(false);
      setNewSection({ name: "", region: "" });
    },
    onError: () => {
      toast.error("Erreur lors de la création de la section");
    }
  });

  const handleCreate = () => {
    if (!newSection.name) {
      toast.error("Veuillez renseigner le nom de la section");
      return;
    }
    createSectionMutation.mutate({
      name: newSection.name,
      communityId,
      region: newSection.region || undefined
    });
  };

  const handleEdit = (section: Section) => {
    setSelectedSection(section);
    setNewSection({
      name: section.name,
      region: section.region || ""
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (section: Section) => {
    setSelectedSection(section);
    setIsDeleteOpen(true);
  };

  const getMemberCount = (sectionName: string) => {
    return members.filter(m => m.section === sectionName).length;
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Sections</h1>
            <p className="text-gray-500 text-sm">Gérez les sections locales et leur répartition géographique.</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200" data-testid="button-new-section">
                <Plus size={16} /> Créer une Section
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvelle Section Locale</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="section-name">Nom de la section *</Label>
                  <Input 
                    id="section-name"
                    placeholder="Ex: Section Normandie"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    data-testid="input-section-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section-region">Région / Département</Label>
                  <Input 
                    id="section-region"
                    placeholder="Ex: 76 - Seine-Maritime"
                    value={newSection.region}
                    onChange={(e) => setNewSection({ ...newSection, region: e.target.value })}
                    data-testid="input-section-region"
                  />
                </div>
                
                <div className="bg-purple-50 p-3 rounded-md border border-purple-100 flex gap-3 items-start">
                   <Building2 size={16} className="text-purple-600 mt-0.5" />
                   <p className="text-xs text-purple-700">
                     Cette section sera immédiatement disponible pour l'affectation des adhérents et des administrateurs locaux.
                   </p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700" 
                  onClick={handleCreate}
                  disabled={createSectionMutation.isPending}
                  data-testid="button-submit-section"
                >
                  {createSectionMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</>
                  ) : (
                    "Créer la section"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {sections.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">Aucune section pour le moment</p>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus size={16} className="mr-2" /> Créer une section
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Section</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Adhérents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id} data-testid={`row-section-${section.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <MapPin size={20} />
                        </div>
                        <div className="font-bold text-gray-900">{section.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{section.region || "Non définie"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                        <Users size={12} className="mr-1" /> {getMemberCount(section.name)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 text-gray-400" data-testid={`button-actions-section-${section.id}`}>
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(section)}>
                            <Edit size={14} className="mr-2" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteClick(section)}
                          >
                            <Trash2 size={14} className="mr-2" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de la section</Label>
              <Input 
                value={newSection.name}
                onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Région / Département</Label>
              <Input 
                value={newSection.region}
                onChange={(e) => setNewSection({ ...newSection, region: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-gray-600">
            Êtes-vous sûr de vouloir supprimer la section "{selectedSection?.name}" ? 
            {getMemberCount(selectedSection?.name || "") > 0 && (
              <span className="text-red-600 block mt-2">
                Attention: {getMemberCount(selectedSection?.name || "")} adhérent(s) sont encore affectés à cette section.
              </span>
            )}
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
