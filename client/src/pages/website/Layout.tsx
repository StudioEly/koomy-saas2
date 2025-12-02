import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Menu, X, Eye, EyeOff, ArrowRight, LogIn, Globe } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLogin } from "@/hooks/useApi";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import ChatWidget from "@/components/ChatWidget";
import koomyLogo from "@assets/ChatGPT Image 30 nov. 2025, 05_54_45_1764590118748.png";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useLocation();
  const { setUser } = useAuth();
  const loginMutation = useLogin();
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language;
  const toggleLanguage = () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { label: t('nav.features'), path: "/website" },
    { label: t('nav.pricing'), path: "/website/pricing" },
    { label: t('nav.faq'), path: "/website/faq" },
    { label: t('nav.contact'), path: "/website/contact" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      
      setUser({
        ...result.user,
        memberships: result.memberships
      });
      
      setIsLoginOpen(false);
      setEmail("");
      setPassword("");
      toast.success(t('login.success'));
      
      // Check if user is admin of any community
      const adminMembership = result.memberships.find(m => m.role === "admin");
      if (adminMembership) {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/app/hub");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('login.error'));
    }
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/website" className="flex items-center gap-2">
            <img src={koomyLogo} alt="Koomy" style={{ height: '168px', marginTop: '-76px', marginBottom: '-76px' }} />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location === item.path ? "text-blue-600" : "text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
              data-testid="button-language-toggle"
            >
              <Globe size={16} />
              {currentLang.toUpperCase()}
            </button>
            <Button 
              variant="ghost" 
              className="text-slate-700 hover:text-blue-600 hover:bg-blue-50"
              onClick={openLoginModal}
              data-testid="button-open-login"
            >
              <LogIn size={18} className="mr-2" />
              {t('nav.login')}
            </Button>
            <Link href="/website/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                {t('login.createClub')}
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 p-4 shadow-lg animate-in slide-in-from-top-5">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className="text-base font-medium text-slate-700 py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="border-slate-100 my-2" />
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-base font-medium text-slate-700 py-2"
              >
                <Globe size={18} />
                {currentLang === 'fr' ? 'English' : 'Français'}
              </button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={openLoginModal}
              >
                <LogIn size={18} className="mr-2" />
                {t('nav.login')}
              </Button>
              <Link href="/website/signup">
                <Button className="w-full bg-blue-600 text-white" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.signup')}
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200">
                K
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">{t('login.title')}</DialogTitle>
            <p className="text-center text-slate-500 text-sm mt-2">
              {t('login.subtitle')}
            </p>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{t('login.email')}</label>
              <Input 
                type="email" 
                placeholder={t('login.emailPlaceholder')} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
                data-testid="modal-input-email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{t('login.password')}</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  required
                  data-testid="modal-input-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <a href="#" className="text-xs font-medium text-blue-600 hover:underline">
                  {t('login.forgotPassword')}
                </a>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
              disabled={loginMutation.isPending}
              data-testid="modal-button-login"
            >
              {loginMutation.isPending ? t('login.loading') : (
                <span className="flex items-center gap-2">
                  {t('login.submit')} <ArrowRight size={18} />
                </span>
              )}
            </Button>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-700">
                <strong>{t('login.demo')}</strong> {t('login.demoHint')}
              </p>
            </div>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-sm text-slate-500">
              {t('login.noAccount')}{" "}
              <Link 
                href="/website/signup"
                className="text-blue-600 font-medium hover:underline"
                onClick={() => setIsLoginOpen(false)}
              >
                {t('login.createAccount')}
              </Link>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <main className="flex-1">
        {children}
      </main>

      <ChatWidget />

      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <img src={koomyLogo} alt="Koomy" className="h-16" />
              </div>
              <p className="text-sm text-slate-400">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/website" className="hover:text-white">{t('footer.features')}</Link></li>
                <li><Link href="/website/pricing" className="hover:text-white">{t('footer.pricing')}</Link></li>
                <li><Link href="/website/demo" className="hover:text-white">{t('footer.demo')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.resources')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/website/faq" className="hover:text-white">{t('footer.faq')}</Link></li>
                <li><Link href="/website/support" className="hover:text-white">{t('footer.support')}</Link></li>
                <li><Link href="/website/blog" className="hover:text-white">{t('footer.blog')}</Link></li>
                <li><Link href="/website/contact" className="hover:text-white">{t('nav.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/website/privacy" className="hover:text-white">{t('footer.privacy')}</Link></li>
                <li><Link href="/website/terms" className="hover:text-white">{t('footer.terms')}</Link></li>
                <li><Link href="/website/legal" className="hover:text-white">{t('footer.cookies')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© 2025 Koomy. {t('footer.allRights')}</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">LinkedIn</a>
              <a href="#" className="hover:text-white">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
