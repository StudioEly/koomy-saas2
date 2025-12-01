import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Share2, CalendarPlus, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import type { Event } from "@shared/schema";

export default function MobileEventDetail({ params }: { params: { communityId: string; eventId: string } }) {
  const { communityId, eventId } = params;
  const { selectCommunity, currentMembership } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);

  if (currentMembership?.communityId !== communityId) {
    selectCommunity(communityId);
  }

  const { data: event, isLoading, isError } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="event-detail-loading">
        <div className="w-full max-w-md bg-white min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="event-detail-error">
        <div className="w-full max-w-md bg-white min-h-screen flex flex-col items-center justify-center p-6">
          <p className="text-gray-500 mb-4">Événement introuvable</p>
          <Link href={`/app/${communityId}/events`}>
            <Button variant="outline">Retour aux événements</Button>
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    }
  };

  const handleRegister = () => {
    setIsRegistered(true);
    toast.success("Inscription confirmée !", {
      description: "Vous recevrez un rappel avant l'événement"
    });
  };

  const addToCalendar = () => {
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const startDate = formatDateForCalendar(eventDate);
    const endDateStr = endDate 
      ? formatDateForCalendar(endDate)
      : formatDateForCalendar(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000));
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDateStr}`,
      location: event.location,
      details: event.description.replace(/\n/g, ' ')
    });
    
    const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="event-detail-page">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl">
        <div className={`relative h-48 ${isPast ? "bg-gray-200" : "bg-gradient-to-br from-primary to-blue-700"}`}>
          <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
            <Link href={`/app/${communityId}/events`}>
              <button 
                className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
                data-testid="button-back"
              >
                <ArrowLeft size={20} />
              </button>
            </Link>
            <button 
              onClick={handleShare}
              className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
              data-testid="button-share"
            >
              <Share2 size={20} />
            </button>
          </header>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-5xl font-bold mb-1" data-testid="text-event-day">
                {eventDate.getDate()}
              </div>
              <div className="text-lg font-medium opacity-90">
                {eventDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {isPast && (
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-gray-600 text-white border-0">Terminé</Badge>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight" data-testid="text-event-title">
              {event.title}
            </h1>
            <Badge 
              className={`whitespace-nowrap ${
                event.type === "AG" ? "bg-red-100 text-red-700 border-0" :
                event.type === "Formation" ? "bg-blue-100 text-blue-700 border-0" :
                "bg-gray-100 text-gray-700 border-0"
              }`}
            >
              {event.type}
            </Badge>
          </div>

          {event.section && (
            <Badge variant="outline" className="mb-4 text-green-700 border-green-200 bg-green-50">
              <MapPin size={12} className="mr-1" />
              Section: {event.section}
            </Badge>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Calendar size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900" data-testid="text-event-date">
                  {eventDate.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Clock size={14} />
                  {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  {endDate && ` - ${endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900" data-testid="text-event-location">
                  {event.location}
                </p>
                <button className="text-sm text-primary hover:underline mt-1">
                  Voir sur la carte
                </button>
              </div>
            </div>

            {(event.participants ?? 0) > 0 && (
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {event.participants} participants inscrits
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Places disponibles
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed" data-testid="text-event-description">
              {event.description}
            </p>
          </div>

          {!isPast && (
            <div className="space-y-3 pb-6">
              {isRegistered ? (
                <Button 
                  className="w-full h-12 rounded-xl bg-green-100 text-green-700 font-semibold cursor-default"
                  disabled
                  data-testid="button-registered"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Vous êtes inscrit(e)
                </Button>
              ) : (
                <Button 
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30"
                  onClick={handleRegister}
                  data-testid="button-register"
                >
                  S'inscrire à l'événement
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl"
                onClick={addToCalendar}
                data-testid="button-add-calendar"
              >
                <CalendarPlus size={18} className="mr-2" />
                Ajouter au calendrier
              </Button>
            </div>
          )}

          <Link href={`/app/${communityId}/events`}>
            <Button variant="ghost" className="w-full h-12 rounded-xl text-gray-500" data-testid="button-back-to-events">
              <ArrowLeft size={18} className="mr-2" />
              Retour aux événements
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
