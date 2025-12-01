import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import MobileLayout from "@/components/layouts/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Event } from "@shared/schema";

export default function MobileEvents({ params }: { params: { communityId: string } }) {
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const { communityId } = params;
  const { selectCommunity, currentMembership } = useAuth();

  if (currentMembership?.communityId !== communityId) {
    selectCommunity(communityId);
  }

  const { data: eventsList = [], isLoading } = useQuery<Event[]>({
    queryKey: [`/api/communities/${communityId}/events`],
    enabled: !!communityId
  });

  const now = new Date();
  const upcomingEvents = eventsList.filter(e => new Date(e.date) >= now);
  const pastEvents = eventsList.filter(e => new Date(e.date) < now);
  const filteredEvents = filter === "upcoming" ? upcomingEvents : pastEvents;

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    };
  };

  return (
    <MobileLayout communityId={communityId}>
      <div className="p-6 pb-20" data-testid="mobile-events-page">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Événements</h1>
        <p className="text-gray-500 text-sm mb-6">Réunions, formations et assemblées</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("upcoming")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              filter === "upcoming"
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
            data-testid="button-filter-upcoming"
          >
            À venir ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
              filter === "past"
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
            data-testid="button-filter-past"
          >
            Passés ({pastEvents.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const dateInfo = formatDate(event.date);
              const isPast = new Date(event.date) < now;
              
              return (
                <Link 
                  key={event.id} 
                  href={`/app/${communityId}/events/${event.id}`}
                >
                  <Card 
                    className={`overflow-hidden border-0 shadow-md rounded-2xl cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] ${
                      isPast ? "opacity-70" : ""
                    }`}
                    data-testid={`card-event-${event.id}`}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className={`w-20 flex-shrink-0 flex flex-col items-center justify-center py-4 ${
                          isPast ? "bg-gray-100" : "bg-primary/10"
                        }`}>
                          <span className={`text-xs font-bold ${isPast ? "text-gray-500" : "text-primary"}`}>
                            {dateInfo.month}
                          </span>
                          <span className={`text-2xl font-bold ${isPast ? "text-gray-600" : "text-primary"}`}>
                            {dateInfo.day}
                          </span>
                        </div>
                        
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 leading-tight" data-testid={`text-event-title-${event.id}`}>
                              {event.title}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className={`text-[10px] whitespace-nowrap ${
                                event.type === "AG" ? "bg-red-100 text-red-700" :
                                event.type === "Formation" ? "bg-blue-100 text-blue-700" :
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {event.type}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1.5 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-gray-400" />
                              <span>{dateInfo.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="truncate">{event.location}</span>
                            </div>
                            {(event.participants ?? 0) > 0 && (
                              <div className="flex items-center gap-2">
                                <Users size={14} className="text-gray-400" />
                                <span>{event.participants} participants</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              {filter === "upcoming" ? "Aucun événement à venir" : "Aucun événement passé"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === "upcoming" ? "Les prochains événements apparaîtront ici" : ""}
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
