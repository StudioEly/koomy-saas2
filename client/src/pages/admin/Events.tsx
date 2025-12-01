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
import { Plus, MapPin, Calendar, Users, QrCode, BarChart2, Loader2, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Event, Section } from "@shared/schema";
import QRCode from "react-qr-code";

export default function AdminEvents() {
  const { currentMembership } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId || "community_unsa";
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    location: "",
    type: "Réunion",
    scope: "national" as "national" | "local",
    section: ""
  });

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: [`/api/communities/${communityId}/events`],
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: [`/api/communities/${communityId}/sections`],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          communityId
        })
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/events`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/dashboard`] });
      toast.success("Événement créé avec succès");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'événement");
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/events`] });
      toast.success("Événement mis à jour");
      setIsEditOpen(false);
      setSelectedEvent(null);
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/events`] });
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/dashboard`] });
      toast.success("Événement supprimé");
      setIsDeleteOpen(false);
      setSelectedEvent(null);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    }
  });

  const resetForm = () => {
    setNewEvent({
      title: "",
      description: "",
      date: "",
      endDate: "",
      location: "",
      type: "Réunion",
      scope: "national",
      section: ""
    });
  };

  const handleCreate = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    createEventMutation.mutate({
      title: newEvent.title,
      description: newEvent.description,
      date: new Date(newEvent.date).toISOString(),
      endDate: newEvent.endDate ? new Date(newEvent.endDate).toISOString() : null,
      location: newEvent.location,
      type: newEvent.type,
      scope: newEvent.scope,
      section: newEvent.scope === "local" ? newEvent.section : null
    });
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
      location: event.location,
      type: event.type,
      scope: event.scope || "national",
      section: event.section || ""
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedEvent) return;
    updateEventMutation.mutate({
      id: selectedEvent.id,
      data: {
        title: newEvent.title,
        description: newEvent.description,
        date: new Date(newEvent.date).toISOString(),
        endDate: newEvent.endDate ? new Date(newEvent.endDate).toISOString() : null,
        location: newEvent.location,
        type: newEvent.type,
        scope: newEvent.scope,
        section: newEvent.scope === "local" ? newEvent.section : null
      }
    });
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteOpen(true);
  };

  const handleShowQR = (event: Event) => {
    setSelectedEvent(event);
    setIsQROpen(true);
  };

  const confirmDelete = () => {
    if (selectedEvent) {
      deleteEventMutation.mutate(selectedEvent.id);
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
            <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
            <p className="text-gray-500 text-sm">Planifiez des AG, formations et réunions. Suivi des présences par QR Code.</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90" data-testid="button-new-event">
                <Plus size={16} /> Créer un événement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nouvel Événement</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'événement *</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Assemblée Générale 2025"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    data-testid="input-event-title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type / Portée</Label>
                    <Select 
                      value={newEvent.scope} 
                      onValueChange={(v: "national" | "local") => setNewEvent({ ...newEvent, scope: v })}
                    >
                      <SelectTrigger data-testid="select-event-scope">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newEvent.scope === "local" && (
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Select
                        value={newEvent.section}
                        onValueChange={(v) => setNewEvent({ ...newEvent, section: v })}
                      >
                        <SelectTrigger data-testid="select-event-section">
                          <SelectValue placeholder="Choisir..." />
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

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label htmlFor="start">Début *</Label>
                    <Input 
                      id="start" 
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      data-testid="input-event-start"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">Fin</Label>
                    <Input 
                      id="end" 
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      data-testid="input-event-end"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lieu *</Label>
                  <Input 
                    id="location" 
                    placeholder="Adresse ou Salle..."
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    data-testid="input-event-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea 
                    id="desc" 
                    placeholder="Programme, intervenants..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    data-testid="input-event-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreate}
                  disabled={createEventMutation.isPending}
                  data-testid="button-submit-event"
                >
                  {createEventMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</>
                  ) : (
                    "Créer l'événement"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">Aucun événement pour le moment</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} className="mr-2" /> Créer un événement
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="shadow-sm hover:shadow-md transition-all border-l-4 border-l-primary" data-testid={`card-event-${event.id}`}>
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
                      <span>{new Date(event.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} - {event.endDate ? new Date(event.endDate).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : "Fin indéterminée"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span>{event.participants || 0} participants inscrits</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t bg-gray-50 flex gap-2 flex-wrap">
                   <Link href={`/admin/events/${event.id}`}>
                     <Button variant="outline" size="sm" className="gap-2" data-testid={`button-stats-event-${event.id}`}>
                       <BarChart2 size={16} /> Stats
                     </Button>
                   </Link>
                   <Button 
                     size="sm" 
                     className="gap-2 bg-gray-800 hover:bg-gray-900"
                     onClick={() => handleShowQR(event)}
                     data-testid={`button-qr-event-${event.id}`}
                   >
                     <QrCode size={16} /> QR Code
                   </Button>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8 ml-auto"
                     onClick={() => handleEdit(event)}
                     data-testid={`button-edit-event-${event.id}`}
                   >
                     <Edit size={16} />
                   </Button>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8 text-red-500 hover:text-red-700"
                     onClick={() => handleDeleteClick(event)}
                     data-testid={`button-delete-event-${event.id}`}
                   >
                     <Trash2 size={16} />
                   </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>QR Code de l'événement</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <QRCode 
                  value={`${window.location.origin}/app/${communityId}/events/${selectedEvent.id}/checkin`}
                  size={200}
                />
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                {selectedEvent.title}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Scannez ce code pour valider la présence
              </p>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
            <Button onClick={() => {
              const canvas = document.querySelector('svg');
              if (canvas) {
                const svgData = new XMLSerializer().serializeToString(canvas);
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `qr-${selectedEvent?.id}.svg`;
                a.click();
                URL.revokeObjectURL(url);
              }
            }}>
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre</Label>
              <Input 
                id="edit-title" 
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start">Début</Label>
                <Input 
                  id="edit-start" 
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end">Fin</Label>
                <Input 
                  id="edit-end" 
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Lieu</Label>
              <Input 
                id="edit-location" 
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea 
                id="edit-desc" 
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={updateEventMutation.isPending}>
              {updateEventMutation.isPending ? (
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
            Êtes-vous sûr de vouloir supprimer l'événement "{selectedEvent?.title}" ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? (
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
