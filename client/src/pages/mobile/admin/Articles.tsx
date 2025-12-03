import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Image, X, Newspaper, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "wouter";
import MobileAdminLayout from "@/components/MobileAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL as API_URL } from "@/api/config";
import type { NewsArticle, DelegatePermissions } from "@shared/schema";
import { extractPermissions } from "@shared/schema";

const CATEGORIES = [
  { value: "actualite", label: "Actualité" },
  { value: "annonce", label: "Annonce" },
  { value: "evenement", label: "Événement" },
  { value: "info", label: "Information" }
];

export default function MobileAdminArticles({ params }: { params: { communityId: string } }) {
  const communityId = params.communityId;
  const [_, setLocation] = useLocation();
  const { user, currentCommunity, currentMembership } = useAuth();
  const queryClient = useQueryClient();

  const permissions = useMemo<DelegatePermissions | undefined>(() => {
    if (currentMembership) {
      return extractPermissions(currentMembership as any);
    }
    return undefined;
  }, [currentMembership]);

  useEffect(() => {
    if (permissions && !permissions.canManageArticles) {
      toast.error("Vous n'avez pas la permission de gérer les articles");
      setLocation(`/app/${communityId}/admin`);
    }
  }, [permissions, communityId, setLocation]);
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "actualite",
    status: "draft" as "draft" | "published"
  });

  const { data: articles = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: [`/api/communities/${communityId}/news`],
    enabled: !!communityId
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`${API_URL}/api/communities/${communityId}/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          author: `${user?.firstName} ${user?.lastName}`
        })
      });
      if (!response.ok) throw new Error("Erreur lors de la création");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/news`] });
      toast.success("Article créé avec succès");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de la création de l'article")
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await fetch(`${API_URL}/api/communities/${communityId}/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/news`] });
      toast.success("Article mis à jour avec succès");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de la mise à jour de l'article")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/api/communities/${communityId}/news/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/news`] });
      toast.success("Article supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression")
  });

  const resetForm = () => {
    setShowEditor(false);
    setEditingArticle(null);
    setFormData({ title: "", summary: "", content: "", category: "actualite", status: "draft" });
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      status: article.status || "draft"
    });
    setShowEditor(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary || !formData.content) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (showEditor) {
    return (
      <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              {editingArticle ? "Modifier l'article" : "Nouvel article"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="Titre de l'article"
                className="h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                data-testid="input-article-title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Catégorie</label>
              <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                <SelectTrigger className="h-11 rounded-xl bg-white/10 border-white/20 text-white" data-testid="select-article-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value} className="text-white hover:bg-slate-700">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Résumé *</label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData(p => ({ ...p, summary: e.target.value }))}
                placeholder="Résumé court de l'article..."
                className="min-h-[60px] rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500 resize-none"
                data-testid="input-article-summary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Contenu *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                placeholder="Contenu complet de l'article..."
                className="min-h-[150px] rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500 resize-none"
                data-testid="input-article-content"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl border-gray-600 text-gray-300 hover:bg-white/5"
                onClick={() => {
                  setFormData(p => ({ ...p, status: "draft" }));
                  handleSubmit(new Event('submit') as unknown as React.FormEvent);
                }}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-draft"
              >
                Brouillon
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
                }}
                onClick={() => setFormData(p => ({ ...p, status: "published" }))}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-publish-article"
              >
                {createMutation.isPending || updateMutation.isPending ? "..." : "Publier"}
              </Button>
            </div>
          </form>
        </div>
      </MobileAdminLayout>
    );
  }

  return (
    <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Articles</h2>
          <Button
            onClick={() => setShowEditor(true)}
            className="h-10 rounded-xl font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}
            data-testid="button-new-article"
          >
            <Plus size={16} className="mr-1" />
            Nouveau
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="mx-auto mb-3 text-gray-500" size={40} />
            <p className="text-gray-400 text-sm">Aucun article pour le moment</p>
            <p className="text-gray-500 text-xs mt-1">Créez votre premier article</p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                data-testid={`article-card-${article.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-sm truncate">{article.title}</h3>
                      <Badge className={`text-[9px] ${article.status === "published" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                        {article.status === "published" ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2">{article.summary}</p>
                    <p className="text-gray-500 text-[10px] mt-2">
                      {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                      data-testid={`button-edit-article-${article.id}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Supprimer cet article ?")) {
                          deleteMutation.mutate(article.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      data-testid={`button-delete-article-${article.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileAdminLayout>
  );
}
