import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, ArrowRight, Lock, UserPlus, LogIn, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL as API_URL } from "@/api/config";
import logo from "@assets/generated_images/modern_minimalist_union_logo_with_letter_u_or_abstract_knot_symbol_in_blue_and_red.png";
import bgImage from "@assets/generated_images/abstract_professional_blue_and_white_geometric_background_for_app_header.png";

export default function MobileLogin() {
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAccount } = useAuth();
  
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
      
      if (data.memberships.length === 0) {
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
      setLocation("/app/add-card");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden" data-testid="mobile-login-page">
      <div className="absolute top-0 left-0 w-full h-1/3 bg-primary overflow-hidden">
        <img src={bgImage} className="w-full h-full object-cover opacity-20 mix-blend-overlay" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 pt-16">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-3 rounded-2xl shadow-xl mb-4">
            <img src={logo} alt="Koomy Logo" className="w-14 h-14" />
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-md text-center">Koomy</h1>
          <p className="text-blue-100 text-center mt-1 text-sm font-medium">Vos communautés, dans votre poche.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 -mt-2 flex-1 flex flex-col max-h-[calc(100vh-180px)] overflow-hidden">
          <Tabs defaultValue="login" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" className="flex items-center gap-2" data-testid="tab-login">
                <LogIn size={16} /> Connexion
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2" data-testid="tab-register">
                <UserPlus size={16} /> Inscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="flex-1 overflow-y-auto">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <Input 
                    type="email" 
                    placeholder="votre.email@exemple.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-11 rounded-xl bg-gray-50 border-gray-200"
                    required
                    data-testid="input-login-email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200 pr-10"
                      required
                      data-testid="input-login-password"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-base font-bold shadow-lg shadow-primary/30 mt-2 group"
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
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register" className="flex-1 overflow-y-auto">
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Prénom</label>
                    <Input 
                      type="text" 
                      placeholder="Jean" 
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200"
                      data-testid="input-register-firstname"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Nom</label>
                    <Input 
                      type="text" 
                      placeholder="Dupont" 
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      className="h-11 rounded-xl bg-gray-50 border-gray-200"
                      data-testid="input-register-lastname"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email *</label>
                  <Input 
                    type="email" 
                    placeholder="votre.email@exemple.com" 
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="h-11 rounded-xl bg-gray-50 border-gray-200"
                    required
                    data-testid="input-register-email"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Mot de passe *</label>
                  <Input 
                    type="password" 
                    placeholder="Minimum 6 caractères"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="h-11 rounded-xl bg-gray-50 border-gray-200"
                    required
                    minLength={6}
                    data-testid="input-register-password"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Confirmer *</label>
                  <Input 
                    type="password" 
                    placeholder="Confirmez le mot de passe"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="h-11 rounded-xl bg-gray-50 border-gray-200"
                    required
                    data-testid="input-register-confirm"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-base font-bold shadow-lg shadow-green-600/30 mt-2 group"
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? "Création..." : (
                    <span className="flex items-center gap-2">
                      Créer mon compte <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                    </span>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center pt-2">
                  En créant un compte, vous acceptez nos conditions d'utilisation.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-3">
              <Ticket size={16} />
              <span className="text-sm">Vous avez un code d'adhésion ?</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-10 rounded-xl border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => setLocation("/app/add-card")}
              data-testid="button-add-card-guest"
            >
              Ajouter une carte avec un code
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <a href="/admin/dashboard" className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-1">
              <Lock size={10} /> Accès Administration
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
