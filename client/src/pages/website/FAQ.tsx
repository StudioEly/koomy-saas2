import { useTranslation } from "react-i18next";
import WebsiteLayout from "./Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function WebsiteFAQ() {
  const { t } = useTranslation();

  const faqItems = [
    { id: "f1", key: "resetPassword" },
    { id: "f2", key: "memberCard" },
    { id: "f3", key: "scanQr" },
    { id: "f4", key: "multipleCommunities" },
    { id: "f5", key: "isFree" },
  ];

  return (
    <WebsiteLayout>
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('faq.title')}</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="border border-slate-200 rounded-lg px-4 bg-white shadow-sm">
              <AccordionTrigger className="text-left text-slate-900 font-medium hover:no-underline hover:text-blue-600">
                {t(`faq.questions.${faq.key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                {t(`faq.questions.${faq.key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-2">{t('faq.needHelp.title')}</h3>
          <p className="text-blue-700 mb-6">{t('faq.needHelp.subtitle')}</p>
          <Link href="/website/contact">
            <Button className="bg-blue-600 hover:bg-blue-700">{t('faq.needHelp.contactSupport')}</Button>
          </Link>
        </div>
      </div>
    </WebsiteLayout>
  );
}
