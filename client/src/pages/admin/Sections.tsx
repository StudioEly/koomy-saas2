import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { SECTIONS as MOCK_SECTIONS } from "@/lib/mockData";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Users, MoreVertical, Building2 } from "lucide-react";

export default function AdminSections() {
  const [sections, setSections] = useState(MOCK_SECTIONS.map((name, i) => ({
    id: i.toString(),
    name,
    memberCount: Math.floor(Math.random() * 500) + 50,
    adminCount: Math.floor(Math.random() * 3) + 1,
    region: "France"
  })));
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200">
                <Plus size={16} /> Créer une Section
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvelle Section Locale</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nom de la section</Label>
                  <Input placeholder="Ex: Section Normandie" />
                </div>
                <div className="space-y-2">
                  <Label>Région / Département</Label>
                  <Input placeholder="Ex: 76 - Seine-Maritime" />
                </div>
                <div className="space-y-2">
                  <Label>Adresse du siège local (Optionnel)</Label>
                  <Input placeholder="Adresse..." />
                </div>
                
                <div className="bg-purple-50 p-3 rounded-md border border-purple-100 flex gap-3 items-start">
                   <Building2 size={16} className="text-purple-600 mt-0.5" />
                   <p className="text-xs text-purple-700">
                     Cette section sera immédiatement disponible pour l'affectation des adhérents et des administrateurs locaux.
                   </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsCreateOpen(false)}>Créer la section</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Section</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Adhérents</TableHead>
                <TableHead>Admins Locaux</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <MapPin size={20} />
                      </div>
                      <div className="font-bold text-gray-900">{section.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{section.region}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                      <Users size={12} className="mr-1" /> {section.memberCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{section.adminCount} admins</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 text-gray-400">
                      <MoreVertical size={16} />
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
