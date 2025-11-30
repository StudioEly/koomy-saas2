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
import { Search, Plus, Filter, MoreVertical, Download } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function AdminMembers() {
  const [members, setMembers] = useState<User[]>(MOCK_MEMBERS.filter(u => u.role === "member"));
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filtered members
  const filteredMembers = members.filter(member => 
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Adhérents</h1>
            <p className="text-gray-500 text-sm">Gérez les inscriptions, cotisations et statuts des membres.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="gap-2">
              <Download size={16} /> Exporter
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus size={16} /> Ajouter un adhérent
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Nouvel Adhérent</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Nom</Label>
                    <Input id="lastname" placeholder="Dubois" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstname">Prénom</Label>
                    <Input id="firstname" placeholder="Thomas" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="exemple@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="06 12 34 56 78" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section Locale</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTIONS.map(section => (
                          <SelectItem key={section} value={section}>{section}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut Initial</Label>
                    <Select defaultValue="active">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-700">
                    Un email et un SMS seront automatiquement envoyés à l'adhérent avec ses identifiants de connexion provisoires.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                  <Button onClick={() => setIsCreateOpen(false)}>Créer l'adhérent</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Rechercher par nom, email, n°..." 
              className="pl-10 bg-gray-50 border-gray-200" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <SelectValue placeholder="Toutes sections" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sections</SelectItem>
              {SECTIONS.map(section => (
                <SelectItem key={section} value={section}>{section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Adhérent</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>N° Adhérent</TableHead>
                <TableHead>Date d'adhésion</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                            {member.firstName[0]}{member.lastName[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{member.section}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{member.memberId}</TableCell>
                  <TableCell className="text-sm text-gray-600">{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        member.status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                        member.status === "expired" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {member.status === "active" ? "Actif" : member.status === "expired" ? "Expiré" : "Suspendu"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical size={16} className="text-gray-400" />
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
