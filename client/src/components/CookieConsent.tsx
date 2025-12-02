import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, Cookie, Shield, ChartBar, Target, Settings } from "lucide-react";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

const COOKIE_CONSENT_KEY = "koomy_cookie_consent";
const COOKIE_PREFERENCES_KEY = "koomy_cookie_preferences";

type CookieConsentContextType = {
  showBanner: () => void;
  preferences: CookiePreferences;
};

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    return { 
      showBanner: () => {}, 
      preferences: { necessary: true, analytics: false, marketing: false, functional: false } 
    };
  }
  return context;
}

export function getStoredCookiePreferences(): CookiePreferences {
  const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (savedPrefs) {
    return JSON.parse(savedPrefs);
  }
  return { necessary: true, analytics: false, marketing: false, functional: false };
}

export default function CookieConsent() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    }
  }, []);

  useEffect(() => {
    const handleOpenCookieSettings = () => {
      setIsVisible(true);
      setShowSettings(true);
    };
    
    window.addEventListener('openCookieSettings', handleOpenCookieSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenCookieSettings);
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const rejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none" data-testid="cookie-consent-container">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={() => {}} />
      
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
        <div className="bg-white shadow-2xl border-t border-gray-200 p-6 md:p-8 animate-in slide-in-from-bottom-10 duration-500">
          <div className="max-w-6xl mx-auto">
            {!showSettings ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-100 rounded-xl shrink-0">
                    <Cookie className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("cookies.title", "🍪 Nous respectons votre vie privée")}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {t("cookies.description", "Ce site utilise des cookies pour améliorer votre expérience. Certains cookies sont essentiels au fonctionnement du site, d'autres nous aident à comprendre comment vous l'utilisez.")}
                    </p>
                    <button 
                      onClick={() => setShowSettings(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1"
                      data-testid="button-cookie-settings"
                    >
                      <Settings className="h-4 w-4" />
                      {t("cookies.customize", "Personnaliser mes choix")}
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={rejectAll}
                    className="w-full sm:w-auto"
                    data-testid="button-reject-cookies"
                  >
                    {t("cookies.rejectAll", "Tout refuser")}
                  </Button>
                  <Button 
                    onClick={acceptAll}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    data-testid="button-accept-cookies"
                  >
                    {t("cookies.acceptAll", "Tout accepter")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    {t("cookies.settingsTitle", "Paramètres des cookies")}
                  </h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    data-testid="button-close-settings"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {t("cookies.necessary.title", "Cookies essentiels")}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {t("cookies.necessary.desc", "Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.")}
                        </p>
                      </div>
                    </div>
                    <Switch checked={true} disabled className="opacity-50" />
                  </div>

                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ChartBar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {t("cookies.analytics.title", "Cookies analytiques")}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {t("cookies.analytics.desc", "Nous aident à comprendre comment vous utilisez le site pour l'améliorer.")}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => setPreferences(p => ({ ...p, analytics: checked }))}
                      data-testid="switch-analytics"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {t("cookies.marketing.title", "Cookies marketing")}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {t("cookies.marketing.desc", "Utilisés pour afficher des publicités pertinentes et mesurer leur efficacité.")}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => setPreferences(p => ({ ...p, marketing: checked }))}
                      data-testid="switch-marketing"
                    />
                  </div>

                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Cookie className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {t("cookies.functional.title", "Cookies fonctionnels")}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {t("cookies.functional.desc", "Permettent des fonctionnalités personnalisées comme la langue et les préférences.")}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences.functional}
                      onCheckedChange={(checked) => setPreferences(p => ({ ...p, functional: checked }))}
                      data-testid="switch-functional"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={rejectAll}
                    className="w-full sm:w-auto"
                  >
                    {t("cookies.rejectAll", "Tout refuser")}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={acceptAll}
                    className="w-full sm:w-auto"
                  >
                    {t("cookies.acceptAll", "Tout accepter")}
                  </Button>
                  <Button 
                    onClick={saveCustom}
                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700"
                    data-testid="button-save-preferences"
                  >
                    {t("cookies.savePreferences", "Enregistrer mes préférences")}
                  </Button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  {t("cookies.moreInfo", "Pour en savoir plus, consultez notre")} {" "}
                  <a href="/website/privacy" className="text-blue-500 hover:underline">
                    {t("cookies.privacyPolicy", "politique de confidentialité")}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent('openCookieSettings'));
}
