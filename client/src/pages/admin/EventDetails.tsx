import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { MOCK_EVENTS, Event } from "@/lib/mockData";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Calendar, Users, QrCode, BarChart3, CheckCircle2 } from "lucide-react";

// Mock Attendance Data
const MOCK_ATTENDANCE = [
  { id: 1, name: "Thomas Dubois", time: "08:45", status: "present", memberId: "UNSA-2024-8892" },
  { id: 2, name: "Sarah Martin", time: "09:02", status: "late", memberId: "UNSA-2023-4421" },
  { id: 3, name: "Jean Dupont", time: "08:55", status: "present", memberId: "UNSA-2022-1123" },
  { id: 4, name: "Marie Curie", time: "-", status: "absent", memberId: "UNSA-2024-9999" },
];

export default function AdminEventDetails({ params }: { params: { id: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.id) || MOCK_EVENTS[0];
  const isPast = new Date(event.date) < new Date();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                {event.type}
              </Badge>
              {isPast ? (
                <Badge className="bg-gray-500 hover:bg-gray-600 text-white border-0">Terminé</Badge>
              ) : (
                <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">À venir</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <MapPin size={16} /> {event.location}
            </p>
          </div>
          <div className="text-right">
             <p className="text-sm text-gray-500 uppercase font-bold mb-1">Date</p>
             <p className="text-xl font-bold text-gray-900">
               {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
             </p>
             <p className="text-sm text-gray-500">
               {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endDate ? new Date(event.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
             </p>
          </div>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="attendance">Présence & Badges</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Taux de Présence</CardTitle>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-green-600 mt-1">+2% vs dernier événement</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Participants</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{event.participants}</div>
                  <p className="text-xs text-gray-500 mt-1">Sur 180 inscrits</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Heure Moyenne d'arrivée</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">08:52</div>
                  <p className="text-xs text-gray-500 mt-1">Début à 09:00</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="animate-in fade-in slide-in-from-bottom-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Liste d'Émargement</CardTitle>
                    <CardDescription>Suivi des entrées par scan QR Code</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <QrCode size={16} /> Ouvrir le Scanner
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adhérent</TableHead>
                      <TableHead>N° Adhérent</TableHead>
                      <TableHead>Heure de scan</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_ATTENDANCE.map((attendee) => (
                      <TableRow key={attendee.id}>
                        <TableCell className="font-medium">{attendee.name}</TableCell>
                        <TableCell className="font-mono text-xs text-gray-500">{attendee.memberId}</TableCell>
                        <TableCell>
                          {attendee.time !== "-" ? (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock size={14} className="text-gray-400" /> {attendee.time}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attendee.status === "present" && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                              <CheckCircle2 size={12} /> Présent
                            </Badge>
                          )}
                          {attendee.status === "late" && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
                              <Clock size={12} /> En retard
                            </Badge>
                          )}
                          {attendee.status === "absent" && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Absent
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
