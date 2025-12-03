import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowRight, ArrowLeft, Eye, EyeOff, Building2, User, Mail, Phone, Lock, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL as API_URL } from "@/api/config";
import koomyLogo from "@assets/ChatGPT Image 30 nov. 2025, 05_54_45_1764590118748.png";
import { COMMUNITY_TYPES } from "@shared/schema";

export default function MobileAdminRegister() {
  const [_, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { setUser, selectCommunity } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    communityName: "",
    communityType: "",
    communityTypeOther: ""
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.communityName || !formData.communityType) {
      toast.error("Veuillez remplir le nom et le type de votre communauté");
      return false;
    }
    if (formData.communityType === "other" && !formData.communityTypeOther) {
      toast.error("Veuillez préciser le type de votre communauté");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          password: formData.password,
          communityName: formData.communityName,
          communityType: formData.communityType,
          communityTypeOther: formData.communityTypeOther || null
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }
      
      const userWithMemberships = {
        ...data.user,
        memberships: data.memberships
      };
      setUser(userWithMemberships);
      
      if (data.memberships.length > 0) {
        selectCommunity(data.memberships[0].communityId);
        toast.success("Compte créé avec succès! Bienvenue sur Koomy.");
        setTimeout(() => {
          setLocation(`/app/${data.memberships[0].communityId}/admin`);
        }, 100);
      } else {
        toast.success("Compte créé avec succès!");
        setTimeout(() => {
          setLocation("/app/admin/select-community");
        }, 100);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
        step >= 1 ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'
      }`}>
        {step > 1 ? <Check size={14} /> : "1"}
      </div>
      <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-purple-500' : 'bg-white/10'}`} />
      <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
        step >= 2 ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'
      }`}>
        2
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" data-testid="mobile-admin-register-page" style={{
      background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
    }}>
      <div className="absolute top-0 left-0 w-full h-80 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20" style={{
          background: "radial-gradient(circle, rgba(138, 43, 226, 0.4) 0%, transparent 70%)"
        }} />
        <div className="absolute -top-10 right-0 w-60 h-60 rounded-full opacity-15" style={{
          background: "radial-gradient(circle, rgba(68, 168, 255, 0.4) 0%, transparent 70%)"
        }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 pt-8 pb-6">
        <div className="flex flex-col items-center mb-6">
          <img 
            src={koomyLogo} 
            alt="Koomy" 
            className="w-32 h-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-xl font-bold text-white text-center">
            Créez votre espace Koomy
          </h1>
          <p className="text-gray-400 text-sm text-center mt-1">
            {step === 1 ? "Vos informations personnelles" : "Identité de votre communauté"}
          </p>
        </div>

        <StepIndicator />

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-5 border border-white/20 shadow-2xl flex-1 overflow-y-auto">
          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Prénom *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      type="text"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className="h-11 pl-10 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 text-white placeholder:text-gray-500 text-sm"
                      required
                      data-testid="input-register-firstname"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Nom *</label>
                  <Input 
                    type="text"
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className="h-11 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 text-white placeholder:text-gray-500 text-sm"
                    required
                    data-testid="input-register-lastname"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="email"
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="h-11 pl-10 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 text-white placeholder:text-gray-500 text-sm"
                    required
                    data-testid="input-register-email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="h-11 pl-10 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 text-white placeholder:text-gray-500 text-sm"
                    data-testid="input-register-phone"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="h-11 pl-10 pr-10 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 text-white placeholder:text-gray-500 text-sm"
                    required
                    data-testid="input-register-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Confirmer le mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    className="h-11 pl-10 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 text-white placeholder:text-gray-500 text-sm"
                    required
                    data-testid="input-register-confirm-password"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-12 rounded-xl text-base font-bold mt-4 group"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                  boxShadow: "0 4px 14px -2px rgba(139, 92, 246, 0.5)"
                }}
                data-testid="button-register-next"
              >
                <span className="flex items-center gap-2">
                  Continuer <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </span>
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Nom de votre communauté *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="text"
                    placeholder="Ex: Club de Tennis de Lyon"
                    value={formData.communityName}
                    onChange={(e) => updateField("communityName", e.target.value)}
                    className="h-11 pl-10 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 text-white placeholder:text-gray-500 text-sm"
                    required
                    data-testid="input-register-community-name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Type de communauté *</label>
                <Select 
                  value={formData.communityType} 
                  onValueChange={(value) => updateField("communityType", value)}
                >
                  <SelectTrigger 
                    className="h-11 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 text-white text-sm [&>span]:text-gray-400 data-[state=open]:border-purple-400"
                    data-testid="select-register-community-type"
                  >
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {COMMUNITY_TYPES.map(type => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.communityType === "other" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Précisez le type *</label>
                  <Input 
                    type="text"
                    placeholder="Ex: Collectif d'artistes"
                    value={formData.communityTypeOther}
                    onChange={(e) => updateField("communityTypeOther", e.target.value)}
                    className="h-11 rounded-xl bg-white/10 border-white/20 focus:border-purple-400 text-white placeholder:text-gray-500 text-sm"
                    data-testid="input-register-community-type-other"
                  />
                </div>
              )}

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mt-4">
                <p className="text-purple-300 text-xs leading-relaxed">
                  Vous pourrez personnaliser davantage votre communauté (logo, description, cotisations...) 
                  depuis le tableau de bord après la création.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 rounded-xl border-2 border-gray-600 text-gray-300 hover:bg-white/5 font-semibold"
                  data-testid="button-register-back"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Retour
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 h-12 rounded-xl text-base font-bold group"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                    boxShadow: "0 4px 14px -2px rgba(139, 92, 246, 0.5)"
                  }}
                  disabled={isLoading}
                  data-testid="button-register-submit"
                >
                  {isLoading ? "Création..." : (
                    <span className="flex items-center gap-2">
                      Créer <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={() => setLocation("/app/admin/login")}
            className="text-sm font-medium text-gray-400 hover:text-purple-400 transition-colors"
            data-testid="link-back-to-login"
          >
            Déjà un compte ? <span className="underline">Se connecter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
