import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Globe, MapPin, Calendar, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ImageUpload from "@/components/ImageUpload";
import type { NewsArticle, Section } from "@shared/schema";

export default function AdminNews() {
  const { currentMembership } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId || "community_unsa";
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  
  const [newNews, setNewNews] = useState({
    title: "",
    summary: "",
    content: "",
    category: "National",
    scope: "national" as "national" | "local",
    section: "",
    image: "",
    status: "published" as "draft" | "published"
  });

  const { data: news = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: [`/api/communities/${communityId}/news`],
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: [`/api/communities/${communityId}/sections`],
  });

  const createNewsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          communityId,
          author: "Admin"
        })
      });
      if (!res.ok) throw new Error("Failed to create news");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/news`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/dashboard`] });
      toast.success("Actualité créée avec succès");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'actualité");
    }
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update news");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/news`] });
      toast.success("Actualité mise à jour");
      setIsEditOpen(false);
      setSelectedNews(null);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    }
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/news/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete news");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/news`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/dashboard`] });
      toast.success("Actualité supprimée");
      setIsDeleteOpen(false);
      setSelectedNews(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    }
  });

  const resetForm = () => {
    setNewNews({
      title: "",
      summary: "",
      content: "",
      category: "National",
      scope: "national",
      section: "",
      image: "",
      status: "published"
    });
  };

  const handleCreate = () => {
    if (!newNews.title || !newNews.summary || !newNews.content) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    createNewsMutation.mutate({
      title: newNews.title,
      summary: newNews.summary,
      content: newNews.content,
      category: newNews.category,
      scope: newNews.scope,
      section: newNews.scope === "local" ? newNews.section : null,
      image: newNews.image || null,
      status: newNews.status
    });
  };

  const handleEdit = (article: NewsArticle) => {
    setSelectedNews(article);
    setNewNews({
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      scope: article.scope || "national",
      section: article.section || "",
      image: article.image || "",
      status: article.status || "published"
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedNews) return;
    updateNewsMutation.mutate({
      id: selectedNews.id,
      data: {
        title: newNews.title,
        summary: newNews.summary,
        content: newNews.content,
        category: newNews.category,
        scope: newNews.scope,
        section: newNews.scope === "local" ? newNews.section : null,
        image: newNews.image || null,
        status: newNews.status
      }
    });
  };

  const handlePreview = (article: NewsArticle) => {
    setSelectedNews(article);
    setIsPreviewOpen(true);
  };

  const handleDeleteClick = (article: NewsArticle) => {
    setSelectedNews(article);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedNews) {
      deleteNewsMutation.mutate(selectedNews.id);
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
            <h1 className="text-2xl font-bold text-gray-900">Actualités</h1>
            <p className="text-gray-500 text-sm">Gérez la communication et les informations diffusées aux adhérents.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90" data-testid="button-new-news">
                <Plus size={16} /> Nouvelle actualité
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Créer une actualité</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Portée de la publication</Label>
                    <Select 
                      value={newNews.scope} 
                      onValueChange={(v: "national" | "local") => setNewNews({ ...newNews, scope: v })}
                    >
                      <SelectTrigger data-testid="select-news-scope">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">Nationale (Tout le monde)</SelectItem>
                        <SelectItem value="local">Locale (Section spécifique)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newNews.scope === "local" && (
                    <div className="space-y-2">
                      <Label>Section cible</Label>
                      <Select 
                        value={newNews.section}
                        onValueChange={(v) => setNewNews({ ...newNews, section: v })}
                      >
                        <SelectTrigger data-testid="select-news-section">
                          <SelectValue placeholder="Choisir la section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map(section => (
                            <SelectItem key={section.id} value={section.name}>{section.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input 
                    id="title" 
                    placeholder="Titre de l'actualité..."
                    value={newNews.title}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                    data-testid="input-news-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Résumé (affiché dans la liste) *</Label>
                  <Textarea 
                    id="summary" 
                    placeholder="Court résumé..." 
                    className="h-20"
                    value={newNews.summary}
                    onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
                    data-testid="input-news-summary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu complet *</Label>
                  <Textarea 
                    id="content" 
                    placeholder="Contenu détaillé de l'actualité..." 
                    className="h-48"
                    value={newNews.content}
                    onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                    data-testid="input-news-content"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select 
                    value={newNews.category}
                    onValueChange={(v) => setNewNews({ ...newNews, category: v })}
                  >
                    <SelectTrigger data-testid="select-news-category">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="National">National</SelectItem>
                      <SelectItem value="Local">Local</SelectItem>
                      <SelectItem value="Legal">Juridique</SelectItem>
                      <SelectItem value="Events">Événement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ImageUpload
                  value={newNews.image}
                  onChange={(url) => setNewNews({ ...newNews, image: url })}
                  label="Image de couverture (aperçu dans la liste)"
                  folder="news"
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => { setNewNews({ ...newNews, status: "draft" }); handleCreate(); }}
                  disabled={createNewsMutation.isPending}
                >
                  Enregistrer en brouillon
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={createNewsMutation.isPending}
                  data-testid="button-submit-news"
                >
                  {createNewsMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publication...</>
                  ) : (
                    "Publier"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">Aucune actualité pour le moment</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} className="mr-2" /> Créer une actualité
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Card key={item.id} className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow" data-testid={`card-news-${item.id}`}>
                <div className="h-48 overflow-hidden relative bg-gray-100">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Globe size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className={`
                      ${item.scope === "national" ? "bg-primary" : "bg-green-600"} 
                      text-white border-0 shadow-sm
                    `}>
                      {item.scope === "national" ? <Globe size={10} className="mr-1" /> : <MapPin size={10} className="mr-1" />}
                      {item.scope === "national" ? "National" : "Local"}
                    </Badge>
                    {item.status === "draft" && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-0">Brouillon</Badge>}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs font-normal text-gray-500 border-gray-200">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {new Date(item.publishedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                  {item.scope === "local" && item.section && (
                    <CardDescription className="text-green-700 font-medium text-xs mt-1">
                      📍 {item.section}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-500 line-clamp-3">{item.summary}</p>
                </CardContent>
                <CardFooter className="pt-2 border-t bg-gray-50 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-primary"
                    onClick={() => handlePreview(item)}
                    data-testid={`button-preview-news-${item.id}`}
                  >
                    <Eye size={16} className="mr-2" /> Aperçu
                  </Button>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-500 hover:text-blue-600"
                      onClick={() => handleEdit(item)}
                      data-testid={`button-edit-news-${item.id}`}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      onClick={() => handleDeleteClick(item)}
                      data-testid={`button-delete-news-${item.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Aperçu de l'actualité</DialogTitle>
          </DialogHeader>
          {selectedNews && (
            <div className="py-4">
              {selectedNews.image && (
                <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              )}
              <h2 className="text-xl font-bold mb-2">{selectedNews.title}</h2>
              <p className="text-gray-500 text-sm mb-4">{selectedNews.summary}</p>
              <div className="prose prose-sm max-w-none">
                <p>{selectedNews.content}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Modifier l'actualité</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre</Label>
              <Input 
                id="edit-title" 
                value={newNews.title}
                onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-summary">Résumé</Label>
              <Textarea 
                id="edit-summary" 
                className="h-20"
                value={newNews.summary}
                onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Contenu</Label>
              <Textarea 
                id="edit-content" 
                className="h-48"
                value={newNews.content}
                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
              />
            </div>

            <ImageUpload
              value={newNews.image}
              onChange={(url) => setNewNews({ ...newNews, image: url })}
              label="Image de couverture"
              folder="news"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={updateNewsMutation.isPending}>
              {updateNewsMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mise à jour...</>
              ) : (
                "Enregistrer"
              )}
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
            Êtes-vous sûr de vouloir supprimer l'actualité "{selectedNews?.title}" ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteNewsMutation.isPending}
            >
              {deleteNewsMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suppression...</>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
