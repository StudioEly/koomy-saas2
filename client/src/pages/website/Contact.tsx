import { useState } from "react";
import WebsiteLayout from "./Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const COUNTRY_CODES = [
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+32", country: "Belgique", flag: "🇧🇪" },
  { code: "+41", country: "Suisse", flag: "🇨🇭" },
  { code: "+352", country: "Luxembourg", flag: "🇱🇺" },
  { code: "+377", country: "Monaco", flag: "🇲🇨" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "+212", country: "Maroc", flag: "🇲🇦" },
  { code: "+216", country: "Tunisie", flag: "🇹🇳" },
  { code: "+213", country: "Algérie", flag: "🇩🇿" },
  { code: "+221", country: "Sénégal", flag: "🇸🇳" },
  { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
];

export default function WebsiteContact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    countryCode: "+33",
    phone: "",
    message: "",
    type: "info"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : null
        })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi");
      }

      setIsSubmitted(true);
      toast.success("Message envoyé avec succès !");
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <WebsiteLayout>
        <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Message envoyé !</h1>
            <p className="text-slate-600 mb-6">
              Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  email: "",
                  organization: "",
                  countryCode: "+33",
                  phone: "",
                  message: "",
                  type: "info"
                });
              }}
              variant="outline"
            >
              Envoyer un autre message
            </Button>
          </div>
        </div>
      </WebsiteLayout>
    );
  }

  return (
    <WebsiteLayout>
      <div className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Contactez-nous</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Une question ? Un projet ? Notre équipe est à votre écoute pour vous accompagner.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Dupont"
                      required
                      className="h-11"
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jean@exemple.com"
                      required
                      className="h-11"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Nom de l'organisation *</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Association, syndicat, club..."
                    required
                    className="h-11"
                    data-testid="input-organization"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                    >
                      <SelectTrigger className="w-[140px] h-11" data-testid="select-country-code">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.code}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      className="flex-1 h-11"
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type de demande</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="h-11" data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Demande d'informations</SelectItem>
                      <SelectItem value="demo">Demande de démonstration</SelectItem>
                      <SelectItem value="devis">Demande de devis</SelectItem>
                      <SelectItem value="partenariat">Partenariat</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Décrivez votre projet ou posez vos questions..."
                    required
                    rows={5}
                    className="resize-none"
                    data-testid="input-message"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
                  disabled={isSubmitting}
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    "Envoi en cours..."
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={18} />
                      Envoyer le message
                    </span>
                  )}
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  En soumettant ce formulaire, vous acceptez notre{" "}
                  <a href="/website/privacy" className="text-blue-600 hover:underline">
                    politique de confidentialité
                  </a>.
                </p>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Nos coordonnées</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <a href="mailto:contact@koomy.app" className="text-blue-600 hover:underline">
                      contact@koomy.app
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Téléphone</p>
                    <p className="text-slate-600">+33 1 23 45 67 89</p>
                    <p className="text-xs text-slate-500">Du lundi au vendredi, 9h-18h</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Adresse</p>
                    <p className="text-slate-600">
                      123 Avenue de la République<br />
                      75011 Paris, France
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h3 className="font-bold text-blue-900 mb-2">Besoin d'une réponse rapide ?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Consultez notre FAQ pour trouver les réponses aux questions les plus fréquentes.
              </p>
              <a href="/website/faq">
                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-100">
                  Voir la FAQ
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </WebsiteLayout>
  );
}
