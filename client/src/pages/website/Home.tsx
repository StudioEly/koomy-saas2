import WebsiteLayout from "./Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Smartphone, Users, Shield, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import communityCollage from "@assets/Multicolor Vivid Summer Photo Collage A4 Document (1)_1764652857180.png";

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
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                {t('home.mobile.title')}<br />
                <span className="text-blue-400">{t('home.mobile.titleHighlight')}</span>
              </h2>
              <p className="text-slate-300 text-lg">
                {t('home.mobile.subtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-slate-100 transition-colors">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" alt="Apple" className="w-6 h-6 invert" />
                  <div>
                    <div className="text-[10px] uppercase leading-none">{t('home.mobile.appStore')}</div>
                    <div className="text-base leading-none mt-0.5">App Store</div>
                  </div>
                </button>
                <button className="bg-transparent border border-slate-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-colors">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg" alt="Android" className="w-6 h-6" />
                  <div>
                    <div className="text-[10px] uppercase leading-none">{t('home.mobile.playStore')}</div>
                    <div className="text-base leading-none mt-0.5">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
               {/* Mockup of phone */}
               <div className="relative w-[280px] h-[560px] bg-slate-800 rounded-[3rem] border-8 border-slate-700 shadow-2xl overflow-hidden">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-700 rounded-b-2xl z-20"></div>
                 <img 
                   src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80" 
                   alt="App Interface" 
                   className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
                 />
               </div>
            </div>
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
