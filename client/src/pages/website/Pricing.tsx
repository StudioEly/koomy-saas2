import WebsiteLayout from "./Layout";
import { MOCK_PLANS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function WebsitePricing() {
  return (
    <WebsiteLayout>
      <div className="bg-slate-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Des tarifs simples et transparents
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            Choisissez le plan adapté à la taille de votre communauté. 
            Commencez gratuitement, évoluez quand vous êtes prêt.
          </p>
          
          {/* Toggle Monthly/Yearly (Mock visual only) */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className="text-slate-600 font-medium">Mensuel</span>
            <div className="w-14 h-8 bg-blue-600 rounded-full relative cursor-pointer p-1">
              <div className="w-6 h-6 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
            </div>
            <span className="text-slate-900 font-bold">Annuel <span className="text-green-600 text-xs font-normal bg-green-100 px-2 py-0.5 rounded-full ml-1">-20%</span></span>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_PLANS.map((plan) => (
              <Card key={plan.id} className={`flex flex-col relative border-2 transition-all hover:shadow-xl ${plan.isPopular ? 'border-blue-500 shadow-lg scale-105 z-10' : 'border-slate-200 hover:border-blue-300'}`}>
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                    Le plus populaire
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-500 mt-1">
                    Jusqu'à <span className="font-bold text-slate-700">{plan.maxMembers} membres</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-slate-900">{plan.priceMonthly}€</span>
                      <span className="text-slate-500 font-medium">/mois</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                      {plan.priceMonthly === 0 ? "Gratuit à vie" : `Facturé ${plan.priceYearly}€ par an`}
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Link href="/website/signup">
                    <Button 
                      variant={plan.isPopular ? "default" : "outline"} 
                      className={`w-full h-12 font-bold ${plan.isPopular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200' : 'border-slate-300 text-slate-700 hover:border-blue-600 hover:text-blue-600'}`}
                    >
                      {plan.priceMonthly === 0 ? "Créer un compte gratuit" : "Commencer l'essai"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Questions fréquentes sur les tarifs</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="border border-slate-200 rounded-lg px-4 bg-white">
            <AccordionTrigger className="text-slate-900 hover:text-blue-600 font-medium">Puis-je changer de plan à tout moment ?</AccordionTrigger>
            <AccordionContent className="text-slate-600">
              Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre tableau de bord administrateur. Les changements de facturation sont appliqués au prorata.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border border-slate-200 rounded-lg px-4 bg-white">
            <AccordionTrigger className="text-slate-900 hover:text-blue-600 font-medium">Y a-t-il des frais cachés ?</AccordionTrigger>
            <AccordionContent className="text-slate-600">
              Non, aucun frais caché. Le prix affiché est le prix que vous payez. Les frais de transaction pour les paiements par carte bancaire de vos membres sont standard (1.4% + 0.25€).
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border border-slate-200 rounded-lg px-4 bg-white">
            <AccordionTrigger className="text-slate-900 hover:text-blue-600 font-medium">Comment fonctionne l'essai gratuit ?</AccordionTrigger>
            <AccordionContent className="text-slate-600">
              Vous bénéficiez de 14 jours d'essai complet sur les plans Growth et Scale, sans carte bancaire requise. À la fin de l'essai, vous pouvez choisir de souscrire ou de revenir au plan gratuit.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border border-slate-200 rounded-lg px-4 bg-white">
            <AccordionTrigger className="text-slate-900 hover:text-blue-600 font-medium">Proposez-vous des tarifs pour les grandes fédérations ?</AccordionTrigger>
            <AccordionContent className="text-slate-600">
              Oui, le plan Enterprise est conçu pour les grandes structures. Contactez notre équipe commerciale pour une offre sur mesure incluant le déploiement multi-sites et la marque blanche.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-16 text-center bg-slate-900 rounded-2xl p-10 text-white">
           <HelpCircle size={48} className="mx-auto text-blue-400 mb-4" />
           <h3 className="text-2xl font-bold mb-4">Encore des questions ?</h3>
           <p className="text-slate-300 mb-8 max-w-lg mx-auto">
             Notre équipe est là pour vous aider à choisir la meilleure solution pour votre communauté.
           </p>
           <div className="flex justify-center gap-4">
             <Button className="bg-blue-600 hover:bg-blue-700">Contacter les ventes</Button>
             <Link href="/website/faq">
               <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 hover:text-white">Consulter la FAQ</Button>
             </Link>
           </div>
        </div>
      </div>
    </WebsiteLayout>
  );
}
