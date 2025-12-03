import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Plus, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useTranslation } from "react-i18next";

interface PWAInstallCardProps {
  variant: "member" | "pro";
}

export default function PWAInstallCard({ variant }: PWAInstallCardProps) {
  const { t } = useTranslation();
  const { isInstallable, isIOS, isInstalled, promptInstall } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const config = variant === "member" 
    ? {
        title: t('pwa.member.title', 'Koomy - Membres'),
        description: t('pwa.member.description', 'Accédez à votre espace membre en 1 clic depuis votre téléphone.'),
        icon: "/icons/iconeapppublic.png",
        url: "/app",
        bgColor: "bg-sky-50",
        borderColor: "border-sky-200",
        buttonColor: "bg-sky-500 hover:bg-sky-600",
        textColor: "text-sky-900"
      }
    : {
        title: t('pwa.pro.title', 'Koomy - Pro'),
        description: t('pwa.pro.description', 'Gérez votre communauté et vos adhésions depuis votre mobile.'),
        icon: "/icons/icone-appPro-koomy.png",
        url: "/app-pro",
        bgColor: "bg-blue-900/10",
        borderColor: "border-blue-800/30",
        buttonColor: "bg-blue-700 hover:bg-blue-800",
        textColor: "text-blue-900"
      };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    window.location.href = config.url;
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <div className={`relative rounded-2xl p-6 ${config.bgColor} border ${config.borderColor} transition-all hover:shadow-lg`}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
            <img src={config.icon} alt={config.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold ${config.textColor}`}>{config.title}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{config.description}</p>
          </div>
        </div>
        <Button 
          onClick={handleInstall}
          className={`w-full mt-4 ${config.buttonColor} text-white font-semibold`}
          data-testid={`button-install-${variant}`}
        >
          <Download className="w-4 h-4 mr-2" />
          {t('pwa.install', 'Installer l\'application')}
        </Button>
      </div>

      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowIOSInstructions(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md mx-auto mb-4">
                <img src={config.icon} alt={config.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t('pwa.ios.title', 'Installer sur iOS')}
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                {t('pwa.ios.instructions', 'Pour installer Koomy sur votre iPhone ou iPad :')}
              </p>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {t('pwa.ios.step1.title', '1. Appuyez sur Partager')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t('pwa.ios.step1.desc', 'Dans Safari, appuyez sur l\'icône de partage en bas de l\'écran')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {t('pwa.ios.step2.title', '2. Sur l\'écran d\'accueil')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t('pwa.ios.step2.desc', 'Sélectionnez "Sur l\'écran d\'accueil" puis "Ajouter"')}
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setShowIOSInstructions(false);
                  window.open(config.url, '_blank');
                }}
                className={`w-full mt-6 ${config.buttonColor} text-white`}
              >
                {t('pwa.ios.openApp', 'Ouvrir l\'application')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
