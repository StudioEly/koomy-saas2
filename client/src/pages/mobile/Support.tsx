import { useState } from "react";
import MobileLayout from "@/components/layouts/MobileLayout";
import { MOCK_FAQS, MOCK_TICKETS } from "@/lib/mockSupportData";
import { MOCK_USER } from "@/lib/mockData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquarePlus, ArrowLeft, HelpCircle, Mail } from "lucide-react";
import { Link } from "wouter";
import { toast } from "@/hooks/use-toast";

export default function MobileSupport({ params }: { params: { communityId: string } }) {
  const { communityId } = params;
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const myTickets = MOCK_TICKETS.filter(t => t.userId === MOCK_USER.id && t.communityId === communityId);
  const faqs = MOCK_FAQS.filter(f => f.targetRole === "member" || f.targetRole === "all");

  const handleSubmit = () => {
    toast({
      title: "Ticket créé",
      description: "Votre demande a bien été envoyée au support.",
    });
    setIsTicketOpen(false);
    setSubject("");
    setMessage("");
  };

  return (
    <MobileLayout communityId={communityId}>
      <div className="p-6 pt-8 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/app/${communityId}/profile`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Aide & Support</h1>
        </div>

        {/* Contact Card */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-blue-900">Besoin d'aide ?</h3>
            <p className="text-xs text-blue-700 mt-1">Notre équipe est là pour vous.</p>
          </div>
          <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200">
                <MessageSquarePlus size={16} className="mr-2" /> Contacter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvelle demande</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Sujet</Label>
                  <Input placeholder="Ex: Problème de connexion" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea placeholder="Décrivez votre problème..." className="h-32" value={message} onChange={e => setMessage(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit}>Envoyer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* My Tickets */}
        {myTickets.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail size={18} className="text-gray-500" /> Mes demandes récentes
            </h2>
            <div className="space-y-3">
              {myTickets.map(ticket => (
                <div key={ticket.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={
                      ticket.status === "open" ? "bg-green-50 text-green-700 border-green-200" : 
                      ticket.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-gray-50 text-gray-600"
                    }>
                      {ticket.status === "open" ? "Ouvert" : ticket.status === "in_progress" ? "En cours" : "Fermé"}
                    </Badge>
                    <span className="text-[10px] text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 mb-1">{ticket.subject}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{ticket.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div>
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle size={18} className="text-gray-500" /> Questions fréquentes
          </h2>
          <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.id} value={faq.id} className={`px-4 ${index === faqs.length - 1 ? 'border-0' : ''}`}>
                <AccordionTrigger className="text-sm font-medium text-gray-700 hover:no-underline text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-500 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </MobileLayout>
  );
}
