import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import WebsiteLayout from "./Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, HelpCircle, Loader2, Building2, Star, Zap, Crown, Shield } from "lucide-react";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Plan } from "@shared/schema";

function formatPrice(amount: number | null, period: "monthly" | "yearly" = "monthly"): string {
  if (amount === null || amount === undefined) return "";
  const euros = amount / 100;
  if (euros === 0) return "0€";
  return `${euros.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}€`;
}

function getPlanIcon(planCode: string | null) {
  switch (planCode) {
    case "STARTER_FREE":
      return <Building2 className="h-8 w-8" />;
    case "COMMUNAUTE_STANDARD":
      return <Star className="h-8 w-8" />;
    case "COMMUNAUTE_PRO":
      return <Zap className="h-8 w-8" />;
    case "ENTREPRISE_CUSTOM":
      return <Crown className="h-8 w-8" />;
    case "WHITE_LABEL":
      return <Shield className="h-8 w-8" />;
    default:
      return <Building2 className="h-8 w-8" />;
  }
}

export default function WebsitePricing() {
  const { t } = useTranslation();
  const [isYearly, setIsYearly] = useState(true);

  const { data: plans, isLoading, error } = useQuery<Plan[]>({
    queryKey: ["/api/plans", { public: "true" }],
    queryFn: async () => {
      const res = await fetch("/api/plans?public=true");
      if (!res.ok) throw new Error("Failed to fetch plans");
      return res.json();
    }
  });

  const displayPlans = plans?.filter(plan => !plan.isWhiteLabel) || [];
  const whiteLabelPlan = plans?.find(plan => plan.isWhiteLabel);

  return (
    <WebsiteLayout>
      <div className="bg-gradient-to-b from-sky-50 to-white py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight font-nunito">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            {t('pricing.subtitle')}
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`font-medium transition-colors ${!isYearly ? "text-slate-900" : "text-slate-500"}`}>
              {t('pricing.monthly')}
            </span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`w-14 h-8 rounded-full relative cursor-pointer p-1 transition-colors ${isYearly ? "bg-sky-500" : "bg-slate-300"}`}
              data-testid="toggle-billing-period"
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm transition-all ${isYearly ? "right-1" : "left-1"}`}></div>
            </button>
            <span className={`font-medium transition-colors ${isYearly ? "text-slate-900" : "text-slate-500"}`}>
              {t('pricing.yearly')} 
              <span className="text-green-600 text-xs font-normal bg-green-100 px-2 py-0.5 rounded-full ml-2">
                {t('pricing.twoMonthsFree')}
              </span>
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">
              {t('pricing.loadingError')}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayPlans.map((plan) => {
                  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
                  const monthlyEquivalent = isYearly && plan.priceYearly 
                    ? Math.round(plan.priceYearly / 12) 
                    : plan.priceMonthly;
                  
                  return (
                    <Card 
                      key={plan.id} 
                      className={`flex flex-col relative border-2 transition-all hover:shadow-xl ${
                        plan.isPopular 
                          ? 'border-sky-500 shadow-lg scale-105 z-10 bg-white' 
                          : plan.isCustom 
                            ? 'border-dashed border-slate-300 bg-slate-50/50'
                            : 'border-slate-200 hover:border-sky-300 bg-white'
                      }`}
                      data-testid={`plan-card-${plan.id}`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-md">
                          {t('pricing.mostPopular')}
                        </div>
                      )}
                      <CardHeader className="pb-4 text-center">
                        <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                          {getPlanIcon(plan.code)}
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
                        <CardDescription className="text-slate-500 mt-1">
                          {plan.maxMembers 
                            ? <>{t('pricing.upTo')} <span className="font-bold text-slate-700">{plan.maxMembers.toLocaleString('fr-FR')} {t('pricing.members')}</span></>
                            : <span className="font-bold text-slate-700">{t('pricing.unlimitedMembers')}</span>
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="mb-6 pb-6 border-b border-slate-100 text-center">
                          {plan.isCustom ? (
                            <>
                              <div className="text-4xl font-extrabold text-slate-900">{t('pricing.onQuote')}</div>
                              <p className="text-sm text-slate-400 mt-2">
                                {t('pricing.customPricing')}
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="flex items-baseline gap-1 justify-center">
                                <span className="text-4xl font-extrabold text-slate-900">
                                  {formatPrice(monthlyEquivalent)}
                                </span>
                                <span className="text-slate-500 font-medium">{t('pricing.perMonth')}</span>
                              </div>
                              <p className="text-sm text-slate-400 mt-2">
                                {price === 0 || price === null
                                  ? t('pricing.freeForever')
                                  : isYearly 
                                    ? t('pricing.billedYearly', { price: formatPrice(plan.priceYearly) })
                                    : t('pricing.billedMonthly')
                                }
                              </p>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                        <ul className="space-y-3">
                          {(plan.features as string[] || []).map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                              <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="pt-4">
                        <Link href={plan.isCustom ? "/website/contact" : "/admin/register"} className="w-full">
                          <Button 
                            variant={plan.isPopular ? "default" : "outline"} 
                            className={`w-full h-12 font-bold ${
                              plan.isPopular 
                                ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-200' 
                                : 'border-slate-300 text-slate-700 hover:border-sky-500 hover:text-sky-600'
                            }`}
                            data-testid={`button-choose-plan-${plan.id}`}
                          >
                            {plan.isCustom 
                              ? t('pricing.contactUs')
                              : price === 0 || price === null
                                ? t('pricing.createFreeAccount')
                                : t('pricing.startFreeTrial')
                            }
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>

              {whiteLabelPlan && (
                <div className="mt-16">
                  <Card className="border-2 border-dashed border-sky-300 bg-gradient-to-r from-sky-50 to-indigo-50" data-testid="plan-card-whitelabel">
                    <div className="p-8 flex flex-col lg:flex-row items-center gap-8">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white">
                          <Shield className="h-10 w-10" />
                        </div>
                      </div>
                      <div className="flex-1 text-center lg:text-left">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{whiteLabelPlan.name}</h3>
                        <p className="text-slate-600 mb-4">{whiteLabelPlan.description}</p>
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                          {(whiteLabelPlan.features as string[] || []).slice(0, 4).map((feature, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-sm bg-white px-3 py-1 rounded-full border border-sky-200 text-sky-700">
                              <CheckCircle className="h-4 w-4" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-center">
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          {t('pricing.startingFrom')} {formatPrice(whiteLabelPlan.priceYearly)}{t('pricing.perYear')}
                        </div>
                        <p className="text-sm text-slate-500 mb-4">{t('pricing.setupIncluded')}</p>
                        <Link href="/website/contact">
                          <Button className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white px-8">
                            {t('pricing.requestDemo')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">{t('pricing.faq.title')}</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="border border-slate-200 rounded-lg px-4 bg-white">
            <AccordionTrigger className="text-slate-900 hover:text-sky-600 font-medium">
              {t('pricing.faq.changePlan.question')}
            </AccordionTrigger>
            <AccordionContent className="text-slate-600">
              {t('pricing.faq.changePlan.answer')}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border border-slate-200 rounded-lg px-4 bg-white">
            <AccordionTrigger className="text-slate-900 hover:text-sky-600 font-medium">
              {t('pricing.faq.hiddenFees.question')}
            </AccordionTrigger>
            <AccordionContent className="text-slate-600">
              {t('pricing.faq.hiddenFees.answer')}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border border-slate-200 rounded-lg px-4 bg-white">
            <AccordionTrigger className="text-slate-900 hover:text-sky-600 font-medium">
              {t('pricing.faq.freeTrial.question')}
            </AccordionTrigger>
            <AccordionContent className="text-slate-600">
              {t('pricing.faq.freeTrial.answer')}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border border-slate-200 rounded-lg px-4 bg-white">
            <AccordionTrigger className="text-slate-900 hover:text-sky-600 font-medium">
              {t('pricing.faq.memberLimit.question')}
            </AccordionTrigger>
            <AccordionContent className="text-slate-600">
              {t('pricing.faq.memberLimit.answer')}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5" className="border border-slate-200 rounded-lg px-4 bg-white">
            <AccordionTrigger className="text-slate-900 hover:text-sky-600 font-medium">
              {t('pricing.faq.federation.question')}
            </AccordionTrigger>
            <AccordionContent className="text-slate-600">
              {t('pricing.faq.federation.answer')}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-16 text-center bg-slate-900 rounded-2xl p-10 text-white">
          <HelpCircle size={48} className="mx-auto text-sky-400 mb-4" />
          <h3 className="text-2xl font-bold mb-4">{t('pricing.moreQuestions.title')}</h3>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            {t('pricing.moreQuestions.subtitle')}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/website/contact">
              <Button className="bg-sky-500 hover:bg-sky-600">{t('pricing.moreQuestions.contactSales')}</Button>
            </Link>
            <Link href="/website/faq">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 hover:text-white">
                {t('pricing.moreQuestions.viewFaq')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </WebsiteLayout>
  );
}
