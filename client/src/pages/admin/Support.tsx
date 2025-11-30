import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { MOCK_FAQS, MOCK_TICKETS } from "@/lib/mockSupportData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquarePlus, Search, HelpCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminSupport() {
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Admin's own tickets (requests to platform)
  const adminTickets = MOCK_TICKETS.filter(t => t.userRole === "admin"); 
  const adminFaqs = MOCK_FAQS.filter(f => f.targetRole === "admin" || f.targetRole === "all");

  const handleSubmit = () => {
    toast({
      title: "Ticket créé",
      description: "Le support technique de la plateforme a été notifié.",
    });
    setIsTicketOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support & Aide</h1>
            <p className="text-gray-500 text-sm">Documentation et assistance technique pour les administrateurs.</p>
          </div>
          <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <MessageSquarePlus size={16} /> Contacter le Support Koomy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contacter le support technique</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-yellow-50 p-3 rounded border border-yellow-100 flex gap-2 items-start">
                   <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                   <p className="text-xs text-yellow-700">
                     Pour les demandes urgentes concernant un événement en cours, merci d'utiliser la ligne d'urgence fournie dans votre contrat.
                   </p>
                </div>
                <div className="space-y-2">
                  <Label>Sujet</Label>
                  <Input placeholder="Ex: Problème d'import CSV" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Détaillez votre problème..." className="h-32" value={message} onChange={e => setMessage(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit}>Envoyer la demande</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: FAQ */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle size={20} className="text-primary" /> Base de Connaissances
                </CardTitle>
                <CardDescription>Réponses aux questions fréquentes des administrateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input placeholder="Rechercher une réponse..." className="pl-9 bg-gray-50" />
                  </div>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {adminFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-gray-700">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: My Tickets */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mes Tickets</CardTitle>
                <CardDescription>Suivi de vos demandes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminTickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className={
                          ticket.status === "open" ? "bg-green-50 text-green-700 border-green-200" : 
                          ticket.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-gray-50 text-gray-600"
                        }>
                          {ticket.status === "open" ? "Ouvert" : ticket.status === "in_progress" ? "En cours" : "Fermé"}
                        </Badge>
                        <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{ticket.subject}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{ticket.message}</p>
                      {ticket.lastUpdate && (
                         <p className="text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                           Dernière màj: {new Date(ticket.lastUpdate).toLocaleString()}
                         </p>
                      )}
                    </div>
                  ))}
                  {adminTickets.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Aucun ticket en cours
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
