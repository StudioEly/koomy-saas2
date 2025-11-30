import WebsiteLayout from "./Layout";
import { MOCK_FAQS } from "@/lib/mockSupportData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function WebsiteFAQ() {
  return (
    <WebsiteLayout>
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Foire Aux Questions</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Retrouvez les réponses aux questions les plus fréquentes sur Koomy.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {MOCK_FAQS.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border border-slate-200 rounded-lg px-4 bg-white shadow-sm">
              <AccordionTrigger className="text-left text-slate-900 font-medium hover:no-underline hover:text-blue-600">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
          <AccordionItem value="pricing-q" className="border border-slate-200 rounded-lg px-4 bg-white shadow-sm">
            <AccordionTrigger className="text-left text-slate-900 font-medium hover:no-underline hover:text-blue-600">
              Est-ce que Koomy est gratuit ?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600">
              Nous proposons un plan gratuit pour les petites communautés (moins de 100 membres). Pour les besoins plus importants, nos plans payants offrent des fonctionnalités avancées. Consultez notre page Tarifs pour plus de détails.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-16 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-2">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-blue-700 mb-6">Notre équipe support est disponible pour vous aider.</p>
          <Button className="bg-blue-600 hover:bg-blue-700">Contacter le Support</Button>
        </div>
      </div>
    </WebsiteLayout>
  );
}
