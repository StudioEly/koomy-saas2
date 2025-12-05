import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, ArrowRight, UserPlus, LogIn, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useWhiteLabel } from "@/contexts/WhiteLabelContext";
import { toast } from "sonner";
import { API_BASE_URL as API_URL } from "@/api/config";
import koomyLogo from "@assets/ChatGPT Image 30 nov. 2025, 05_54_45_1764590118748.png";

function KoomyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#44A8FF]/70">
      <circle cx="7" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="17" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M11 12 L13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function MobileLogin() {
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAccount } = useAuth();
  const { isWhiteLabel, communityId: wlCommunityId, appName, logoUrl, brandColor } = useWhiteLabel();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/accounts/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }
      
      setAccount({
        ...data.account,
        memberships: data.memberships
      });
      
      toast.success("Connexion réussie!");
      
      if (isWhiteLabel && wlCommunityId) {
        setLocation(`/app/${wlCommunityId}/home`);
      } else if (data.memberships.length === 0) {
        setLocation("/app/add-card");
      } else if (data.memberships.length === 1) {
        setLocation(`/app/${data.memberships[0].communityId}/home`);
      } else {
        setLocation("/app/hub");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== registerConfirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (registerPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/accounts/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          firstName: registerFirstName || null,
          lastName: registerLastName || null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur d'inscription");
      }
      
      setAccount({
        ...data.account,
        memberships: data.memberships
      });
      
      toast.success("Compte créé avec succès!");
      
      if (isWhiteLabel && wlCommunityId) {
        setLocation(`/app/${wlCommunityId}/home`);
      } else {
        setLocation("/app/add-card");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const accentColor = isWhiteLabel && brandColor ? brandColor : "#44A8FF";
  const accentColorRgb = isWhiteLabel && brandColor 
    ? `${parseInt(brandColor.slice(1, 3), 16)}, ${parseInt(brandColor.slice(3, 5), 16)}, ${parseInt(brandColor.slice(5, 7), 16)}`
    : "68, 168, 255";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" data-testid="mobile-login-page" style={{
      background: isWhiteLabel 
        ? `linear-gradient(180deg, ${accentColor}15 0%, ${accentColor}08 40%, #FFFFFF 100%)`
        : "linear-gradient(180deg, #E8F4FF 0%, #F5FAFF 40%, #FFFFFF 100%)"
    }}>
      <div className="absolute top-0 left-0 w-full h-80 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-30" style={{
          background: `radial-gradient(circle, rgba(${accentColorRgb}, 0.3) 0%, transparent 70%)`
        }} />
        <div className="absolute -top-10 right-0 w-60 h-60 rounded-full opacity-20" style={{
          background: `radial-gradient(circle, rgba(${accentColorRgb}, 0.4) 0%, transparent 70%)`
        }} />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-10" style={{
          background: `radial-gradient(circle, rgba(${accentColorRgb}, 0.5) 0%, transparent 60%)`
        }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 pt-14 pb-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 blur-xl opacity-40" style={{
              background: `radial-gradient(circle, rgba(${accentColorRgb}, 0.6) 0%, transparent 70%)`
            }} />
            {isWhiteLabel && logoUrl ? (
              <img 
                src={logoUrl} 
                alt={appName || "App"} 
                className="relative w-24 h-24 object-contain drop-shadow-sm"
              />
            ) : (
              <img 
                src={koomyLogo} 
                alt="Koomy" 
                className="relative w-48 h-auto drop-shadow-sm"
              />
            )}
          </div>
          
          {isWhiteLabel ? (
            <h1 className="text-xl font-bold text-gray-800">{appName || "Bienvenue"}</h1>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <KoomyIcon />
              <p className="text-gray-500 text-sm font-medium tracking-wide">
                Vos communautés, une app.
              </p>
            </div>
          )}
        </div>

        <div className="koomy-card p-6 flex-1 flex flex-col max-h-[calc(100vh-220px)] overflow-hidden">
          <Tabs defaultValue="login" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-5 p-1 bg-gray-100/80 rounded-xl">
              <TabsTrigger 
                value="login" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold transition-all"
                style={{ color: 'inherit' }}
                data-testid="tab-login"
              >
                <LogIn size={16} /> Connexion
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold transition-all"
                style={{ color: 'inherit' }}
                data-testid="tab-register"
              >
                <UserPlus size={16} /> Inscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="flex-1 overflow-y-auto">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600">Email</label>
                  <Input 
                    type="email" 
                    placeholder="votre.email@exemple.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-12 rounded-xl text-gray-700 placeholder:text-gray-400"
                    style={{ 
                      backgroundColor: `${accentColor}08`, 
                      borderColor: `${accentColor}30`
                    }}
                    required
                    data-testid="input-login-email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600">Mot de passe</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-12 rounded-xl pr-11 text-gray-700"
                      style={{ 
                        backgroundColor: `${accentColor}08`, 
                        borderColor: `${accentColor}30`
                      }}
                      required
                      data-testid="input-login-password"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
                      style={{ '--hover-color': accentColor } as React.CSSProperties}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-bold mt-3 group transition-all"
                  style={{
                    background: isWhiteLabel 
                      ? accentColor 
                      : "linear-gradient(135deg, #5AB8FF 0%, #44A8FF 100%)",
                    boxShadow: `0 4px 14px -2px rgba(${accentColorRgb}, 0.4)`
                  }}
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? "Connexion..." : (
                    <span className="flex items-center gap-2">
                      Se connecter <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                    </span>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <a 
                    href="#" 
                    className="text-sm font-medium transition-colors"
                    style={{ color: accentColor }}
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register" className="flex-1 overflow-y-auto">
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-600">Prénom</label>
                    <Input 
                      type="text" 
                      placeholder="Jean" 
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                      className="h-11 rounded-xl bg-[#F5F9FF] border-[#E0EDFF] focus:border-[#44A8FF] focus:ring-[#44A8FF]/20 text-gray-700 placeholder:text-gray-400"
                      data-testid="input-register-firstname"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-600">Nom</label>
                    <Input 
                      type="text" 
                      placeholder="Dupont" 
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      className="h-11 rounded-xl bg-[#F5F9FF] border-[#E0EDFF] focus:border-[#44A8FF] focus:ring-[#44A8FF]/20 text-gray-700 placeholder:text-gray-400"
                      data-testid="input-register-lastname"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-600">Email *</label>
                  <Input 
                    type="email" 
                    placeholder="votre.email@exemple.com" 
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="h-11 rounded-xl bg-[#F5F9FF] border-[#E0EDFF] focus:border-[#44A8FF] focus:ring-[#44A8FF]/20 text-gray-700 placeholder:text-gray-400"
                    required
                    data-testid="input-register-email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-600">Mot de passe *</label>
                  <Input 
                    type="password" 
                    placeholder="Minimum 6 caractères"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="h-11 rounded-xl bg-[#F5F9FF] border-[#E0EDFF] focus:border-[#44A8FF] focus:ring-[#44A8FF]/20 text-gray-700 placeholder:text-gray-400"
                    required
                    minLength={6}
                    data-testid="input-register-password"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-600">Confirmer *</label>
                  <Input 
                    type="password" 
                    placeholder="Confirmez le mot de passe"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="h-11 rounded-xl bg-[#F5F9FF] border-[#E0EDFF] focus:border-[#44A8FF] focus:ring-[#44A8FF]/20 text-gray-700 placeholder:text-gray-400"
                    required
                    data-testid="input-register-confirm"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-bold mt-2 group transition-all"
                  style={{
                    background: "linear-gradient(135deg, #5AB8FF 0%, #44A8FF 100%)",
                    boxShadow: "0 4px 14px -2px rgba(68, 168, 255, 0.4)"
                  }}
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? "Création..." : (
                    <span className="flex items-center gap-2">
                      Créer mon compte <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                    </span>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center pt-2">
                  En créant un compte, vous acceptez nos conditions d'utilisation.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 pt-4 border-t border-gray-100/80">
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-3">
              <Ticket size={16} />
              <span className="text-sm">Vous avez un code d'adhésion ?</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl border-2 border-dashed border-[#44A8FF]/30 text-[#44A8FF] hover:bg-[#44A8FF]/5 hover:border-[#44A8FF]/50 font-semibold transition-all"
              onClick={() => setLocation("/app/add-card")}
              data-testid="button-add-card-guest"
            >
              Ajouter une carte avec un code
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
