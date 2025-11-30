import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { MOCK_NEWS, SECTIONS, NewsItem } from "@/lib/mockData";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Globe, MapPin, Calendar, Edit, Trash2, Eye } from "lucide-react";

export default function AdminNews() {
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [scope, setScope] = useState<"national" | "local">("national");

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
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus size={16} /> Nouvelle actualité
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Créer une actualité</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Portée de la publication</Label>
                    <Select 
                      value={scope} 
                      onValueChange={(v: "national" | "local") => setScope(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">Nationale (Tout le monde)</SelectItem>
                        <SelectItem value="local">Locale (Section spécifique)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {scope === "local" && (
                    <div className="space-y-2">
                      <Label>Section cible</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir la section" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTIONS.map(section => (
                            <SelectItem key={section} value={section}>{section}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input id="title" placeholder="Titre de l'actualité..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Résumé (affiché dans la liste)</Label>
                  <Textarea id="summary" placeholder="Court résumé..." className="h-20" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu complet</Label>
                  <div className="h-64 border rounded-md bg-gray-50 p-4 flex items-center justify-center text-gray-400">
                    Éditeur de texte riche (WYSIWYG)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" placeholder="https://..." />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Enregistrer en brouillon</Button>
                <Button onClick={() => setIsCreateOpen(false)}>Publier</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 overflow-hidden relative">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
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
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                {item.scope === "local" && (
                  <CardDescription className="text-green-700 font-medium text-xs mt-1">
                    📍 {item.section}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-gray-500 line-clamp-3">{item.summary}</p>
              </CardContent>
              <CardFooter className="pt-2 border-t bg-gray-50 flex justify-between">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-primary">
                  <Eye size={16} className="mr-2" /> Aperçu
                </Button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
