import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { MOCK_EVENTS, SECTIONS, Event } from "@/lib/mockData";
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
import { Plus, MapPin, Calendar, Users, QrCode, BarChart2 } from "lucide-react";
import { Link } from "wouter";

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [scope, setScope] = useState<"national" | "local">("national");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
            <p className="text-gray-500 text-sm">Planifiez des AG, formations et réunions. Suivi des présences par QR Code.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus size={16} /> Créer un événement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nouvel Événement</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'événement</Label>
                  <Input id="title" placeholder="Ex: Assemblée Générale 2025" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type / Portée</Label>
                    <Select 
                      value={scope} 
                      onValueChange={(v: "national" | "local") => setScope(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {scope === "local" && (
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
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

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="start">Début</Label>
                    <Input id="start" type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">Fin</Label>
                    <Input id="end" type="datetime-local" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input id="location" placeholder="Adresse ou Salle..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" placeholder="Programme, intervenants..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                <Button onClick={() => setIsCreateOpen(false)}>Créer l'événement</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex gap-2 items-center mb-2">
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                        {event.type}
                      </Badge>
                      {event.section && (
                        <span className="text-xs text-gray-500 font-medium">{event.section}</span>
                      )}
                    </div>
                    <CardTitle>{event.title}</CardTitle>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2 min-w-[60px]">
                    <div className="text-xs text-gray-500 uppercase font-bold">
                      {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {new Date(event.date).getDate()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                <div className="flex flex-col gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endDate ? new Date(event.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Fin indéterminée"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span>{event.participants} participants inscrits</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-gray-50 flex gap-3">
                 <Link href={`/admin/events/${event.id}`}>
                   <Button variant="outline" className="flex-1 gap-2">
                     <BarChart2 size={16} /> Stats & Présence
                   </Button>
                 </Link>
                 <Button className="flex-1 gap-2 bg-gray-800 hover:bg-gray-900">
                   <QrCode size={16} /> Scanner
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
