import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquarePlus, Search, HelpCircle, AlertCircle, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Faq, SupportTicket } from "@shared/schema";

export default function AdminSupport() {
  const { currentMembership } = useAuth();
  const queryClient = useQueryClient();
  const communityId = currentMembership?.communityId || "community_unsa";
  
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  const { data: faqs = [], isLoading: faqsLoading } = useQuery<Faq[]>({
    queryKey: [`/api/communities/${communityId}/faqs`],
  });

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<SupportTicket[]>({
    queryKey: [`/api/communities/${communityId}/tickets`],
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          subject: data.subject,
          message: data.message,
          priority: "medium",
          status: "open"
        })
      });
      if (!res.ok) throw new Error("Failed to create ticket");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/tickets`] });
      toast.success("Ticket créé", { description: "Le support a été notifié." });
      setIsTicketOpen(false);
      setSubject("");
      setMessage("");
    },
    onError: () => {
      toast.error("Erreur lors de la création du ticket");
    }
  });

  const createFaqMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string }) => {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          question: data.question,
          answer: data.answer,
          category: "general"
        })
      });
      if (!res.ok) throw new Error("Failed to create FAQ");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/faqs`] });
      toast.success("FAQ ajoutée");
      setIsFaqOpen(false);
      setNewFaq({ question: "", answer: "" });
    },
    onError: () => {
      toast.error("Erreur lors de la création de la FAQ");
    }
  });

  const handleSubmitTicket = () => {
    if (!subject || !message) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    createTicketMutation.mutate({ subject, message });
  };

  const handleSubmitFaq = () => {
    if (!newFaq.question || !newFaq.answer) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    createFaqMutation.mutate(newFaq);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminTickets = tickets;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support & Aide</h1>
            <p className="text-gray-500 text-sm">Documentation, FAQ et assistance pour les administrateurs et adhérents.</p>
          </div>
          <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-new-ticket">
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
                  <Input 
                    placeholder="Ex: Problème d'import CSV" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    data-testid="input-ticket-subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Détaillez votre problème..." 
                    className="h-32" 
                    value={message} 
                    onChange={e => setMessage(e.target.value)}
                    data-testid="input-ticket-message"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button 
                  onClick={handleSubmitTicket}
                  disabled={createTicketMutation.isPending}
                  data-testid="button-submit-ticket"
                >
                  {createTicketMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi...</>
                  ) : (
                    "Envoyer la demande"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle size={20} className="text-primary" /> Base de Connaissances
                  </CardTitle>
                  <CardDescription>FAQ pour les administrateurs et adhérents</CardDescription>
                </div>
                <Dialog open={isFaqOpen} onOpenChange={setIsFaqOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" data-testid="button-new-faq">
                      <Plus size={14} /> Ajouter FAQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouvelle Question Fréquente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Input 
                          placeholder="Comment faire pour...?" 
                          value={newFaq.question}
                          onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                          data-testid="input-faq-question"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Réponse</Label>
                        <Textarea 
                          placeholder="Voici la réponse..." 
                          className="h-32"
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                          data-testid="input-faq-answer"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                      </DialogClose>
                      <Button 
                        onClick={handleSubmitFaq}
                        disabled={createFaqMutation.isPending}
                        data-testid="button-submit-faq"
                      >
                        {createFaqMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ajout...</>
                        ) : (
                          "Ajouter"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input 
                      placeholder="Rechercher une réponse..." 
                      className="pl-9 bg-gray-50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search-faq"
                    />
                  </div>
                </div>
                {faqsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredFaqs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucune FAQ trouvée</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} data-testid={`faq-item-${faq.id}`}>
                        <AccordionTrigger className="text-gray-700 text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mes Tickets</CardTitle>
                <CardDescription>Suivi de vos demandes</CardDescription>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : adminTickets.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Aucun ticket en cours
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" data-testid={`ticket-${ticket.id}`}>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className={
                            ticket.status === "open" ? "bg-green-50 text-green-700 border-green-200" : 
                            ticket.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-gray-50 text-gray-600"
                          }>
                            {ticket.status === "open" ? "Ouvert" : ticket.status === "in_progress" ? "En cours" : "Fermé"}
                          </Badge>
                          <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900">{ticket.subject}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ticket.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="pt-6">
                <h3 className="font-bold text-blue-900 mb-2">Besoin d'aide ?</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Notre équipe est disponible du lundi au vendredi de 9h à 18h.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => setIsTicketOpen(true)}
                >
                  Ouvrir un ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
