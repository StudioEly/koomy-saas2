import WebsiteLayout from "./Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Smartphone, Users, Shield, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import communityCollage from "@assets/Multicolor Vivid Summer Photo Collage A4 Document (1)_1764652857180.png";
import PWAInstallCard from "@/components/PWAInstallCard";

export default function WebsiteHome() {
  const { t } = useTranslation();
  
  return (
    <WebsiteLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {t('home.hero.title')} <span className="text-blue-600">{t('home.hero.titleHighlight')}</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/website/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-base shadow-xl shadow-blue-200/50">
                    {t('home.hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/website/download">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base border-slate-300 hover:bg-white hover:text-blue-600">
                    {t('home.hero.ctaSecondary')}
                  </Button>
                </Link>
              </div>
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" /> {t('home.hero.noCard')}</span>
                <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-500" /> {t('home.hero.easyCancel')}</span>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="lg:w-1/2 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full blur-3xl opacity-60"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src={communityCollage} 
                  alt="Koomy Communities" 
                  className="rounded-xl shadow-inner border border-slate-100"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-1000 delay-300">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase">{t('home.stats.newMembers')}</p>
                    <p className="text-xl font-bold text-slate-900">{t('home.stats.thisWeek')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('home.features.title')}</h2>
            <p className="text-lg text-slate-600">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: t('home.features.mobile.title'),
                desc: t('home.features.mobile.desc')
              },
              {
                icon: LayoutDashboard,
                title: t('home.features.dashboard.title'),
                desc: t('home.features.dashboard.desc')
              },
              {
                icon: Shield,
                title: t('home.features.tools.title'),
                desc: t('home.features.tools.desc')
              }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${communityCollage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-blue-800/80 to-purple-900/85" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4 text-white drop-shadow-lg">
              {t('home.mobile.title')}<br />
              <span className="text-blue-300">{t('home.mobile.titleHighlight')}</span>
            </h2>
            <p className="text-blue-100 text-lg drop-shadow">
              {t('pwa.subtitle', 'Installez nos applications sur votre téléphone en un clic. Pas besoin de store.')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PWAInstallCard variant="member" />
            <PWAInstallCard variant="pro" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('home.cta.title')}</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
            {t('home.cta.subtitle')}
          </p>
          <Link href="/website/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-10 text-lg font-bold shadow-xl">
              {t('home.cta.button')}
            </Button>
          </Link>
          <p className="mt-6 text-sm text-blue-200">
            {t('home.cta.alreadyMember')} <Link href="/app/login" className="underline hover:text-white">{t('home.cta.downloadApp')}</Link> {t('common.or')} <Link href="/admin/dashboard" className="underline hover:text-white">{t('home.cta.adminLogin')}</Link>
          </p>
        </div>
      </section>
    </WebsiteLayout>
  );
}
