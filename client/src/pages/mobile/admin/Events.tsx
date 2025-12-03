import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Calendar, MapPin, QrCode, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import MobileAdminLayout from "@/components/MobileAdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL as API_URL } from "@/api/config";
import type { Event, DelegatePermissions } from "@shared/schema";
import { extractPermissions } from "@shared/schema";

const EVENT_TYPES = [
  { value: "reunion", label: "Réunion" },
  { value: "formation", label: "Formation" },
  { value: "conference", label: "Conférence" },
  { value: "atelier", label: "Atelier" },
  { value: "social", label: "Événement social" },
  { value: "autre", label: "Autre" }
];

export default function MobileAdminEvents({ params }: { params: { communityId: string } }) {
  const communityId = params.communityId;
  const [_, setLocation] = useLocation();
  const { currentCommunity, currentMembership } = useAuth();
  const queryClient = useQueryClient();

  const permissions = useMemo<DelegatePermissions | undefined>(() => {
    if (currentMembership) {
      return extractPermissions(currentMembership as any);
    }
    return undefined;
  }, [currentMembership]);

  useEffect(() => {
    if (permissions && !permissions.canManageEvents) {
      toast.error("Vous n'avez pas la permission de gérer les événements");
      setLocation(`/app/${communityId}/admin`);
    }
  }, [permissions, communityId, setLocation]);
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "reunion"
  });

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: [`/api/communities/${communityId}/events`],
    enabled: !!communityId
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const dateTime = new Date(`${data.date}T${data.time || "00:00"}`);
      const response = await fetch(`${API_URL}/api/communities/${communityId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          date: dateTime.toISOString(),
          location: data.location,
          type: data.type
        })
      });
      if (!response.ok) throw new Error("Erreur lors de la création");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/events`] });
      toast.success("Événement créé avec succès");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de la création de l'événement")
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const dateTime = new Date(`${data.date}T${data.time || "00:00"}`);
      const response = await fetch(`${API_URL}/api/communities/${communityId}/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          date: dateTime.toISOString(),
          location: data.location,
          type: data.type
        })
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/events`] });
      toast.success("Événement mis à jour avec succès");
      resetForm();
    },
    onError: () => toast.error("Erreur lors de la mise à jour de l'événement")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/api/communities/${communityId}/events/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/events`] });
      toast.success("Événement supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression")
  });

  const resetForm = () => {
    setShowEditor(false);
    setEditingEvent(null);
    setFormData({ title: "", description: "", date: "", time: "", location: "", type: "reunion" });
  };

  const handleEdit = (event: Event) => {
    const eventDate = new Date(event.date);
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: eventDate.toISOString().split("T")[0],
      time: eventDate.toTimeString().slice(0, 5),
      location: event.location,
      type: event.type
    });
    setShowEditor(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.date || !formData.location) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isUpcoming = (date: string) => new Date(date) >= new Date();
  const upcomingEvents = events.filter(e => isUpcoming(e.date.toString()));
  const pastEvents = events.filter(e => !isUpcoming(e.date.toString()));

  if (showEditor) {
    return (
      <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              {editingEvent ? "Modifier l'événement" : "Nouvel événement"}
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
                placeholder="Nom de l'événement"
                className="h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                data-testid="input-event-title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Type</label>
              <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                <SelectTrigger className="h-11 rounded-xl bg-white/10 border-white/20 text-white" data-testid="select-event-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {EVENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="text-white hover:bg-slate-700">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                  className="h-11 rounded-xl bg-white/10 border-white/20 text-white [color-scheme:dark]"
                  data-testid="input-event-date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Heure</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))}
                  className="h-11 rounded-xl bg-white/10 border-white/20 text-white [color-scheme:dark]"
                  data-testid="input-event-time"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Lieu *</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                placeholder="Adresse ou lieu"
                className="h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                data-testid="input-event-location"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Décrivez l'événement..."
                className="min-h-[100px] rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-500 resize-none"
                data-testid="input-event-description"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold mt-4"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-event"
            >
              {createMutation.isPending || updateMutation.isPending ? "..." : (editingEvent ? "Mettre à jour" : "Créer l'événement")}
            </Button>
          </form>
        </div>
      </MobileAdminLayout>
    );
  }

  return (
    <MobileAdminLayout communityId={communityId} communityName={currentCommunity?.name} permissions={permissions}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Événements</h2>
          <Button
            onClick={() => setShowEditor(true)}
            className="h-10 rounded-xl font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" }}
            data-testid="button-new-event"
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
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto mb-3 text-gray-500" size={40} />
            <p className="text-gray-400 text-sm">Aucun événement pour le moment</p>
            <p className="text-gray-500 text-xs mt-1">Créez votre premier événement</p>
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingEvents.length > 0 && (
              <div>
                <h3 className="text-purple-400 font-semibold text-xs uppercase tracking-wide mb-3">À venir</h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      communityId={communityId}
                      onEdit={handleEdit}
                      onDelete={(id) => {
                        if (confirm("Supprimer cet événement ?")) deleteMutation.mutate(id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {pastEvents.length > 0 && (
              <div>
                <h3 className="text-gray-500 font-semibold text-xs uppercase tracking-wide mb-3">Passés</h3>
                <div className="space-y-3 opacity-70">
                  {pastEvents.slice(0, 5).map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      communityId={communityId}
                      onEdit={handleEdit}
                      onDelete={(id) => {
                        if (confirm("Supprimer cet événement ?")) deleteMutation.mutate(id);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MobileAdminLayout>
  );
}

function EventCard({ 
  event, 
  communityId,
  onEdit, 
  onDelete 
}: { 
  event: Event; 
  communityId: string;
  onEdit: (e: Event) => void; 
  onDelete: (id: string) => void;
}) {
  const eventDate = new Date(event.date);
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4" data-testid={`event-card-${event.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="bg-purple-500/20 rounded-lg p-2 text-center min-w-[50px]">
            <div className="text-purple-400 text-xs font-medium uppercase">
              {eventDate.toLocaleDateString("fr-FR", { month: "short" })}
            </div>
            <div className="text-white text-lg font-bold">
              {eventDate.getDate()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm">{event.title}</h3>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
              <Clock size={12} />
              {eventDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
              <MapPin size={12} />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Link href={`/app/${communityId}/admin/scanner`}>
            <button className="p-2 text-purple-400 hover:text-purple-300 transition-colors" data-testid={`button-scan-event-${event.id}`}>
              <QrCode size={16} />
            </button>
          </Link>
          <button onClick={() => onEdit(event)} className="p-2 text-gray-400 hover:text-purple-400 transition-colors" data-testid={`button-edit-event-${event.id}`}>
            <Edit size={16} />
          </button>
          <button onClick={() => onDelete(event.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" data-testid={`button-delete-event-${event.id}`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
