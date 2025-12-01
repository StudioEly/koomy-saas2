import { useState } from "react";
import { useLocation } from "wouter";
import { Ticket, Check, ArrowLeft, CreditCard, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL as API_URL } from "@/api/config";
import logo from "@assets/generated_images/modern_minimalist_union_logo_with_letter_u_or_abstract_knot_symbol_in_blue_and_red.png";

interface VerifiedCard {
  valid: boolean;
  displayName: string | null;
  communityName: string | null;
  memberId: string;
}

export default function AddCard() {
  const [_, setLocation] = useLocation();
  const { account, refreshMemberships } = useAuth();
  const [claimCode, setClaimCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [verifiedCard, setVerifiedCard] = useState<VerifiedCard | null>(null);

  const formatClaimCode = (value: string): string => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length <= 4) return cleaned;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatClaimCode(e.target.value);
    setClaimCode(formatted);
    setVerifiedCard(null);
  };

  const handleVerify = async () => {
    if (claimCode.replace('-', '').length !== 8) {
      toast.error("Le code doit contenir 8 caractères");
      return;
    }

    setIsVerifying(true);
    setVerifiedCard(null);

    try {
      const response = await fetch(`${API_URL}/api/memberships/verify/${claimCode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Code invalide");
      }

      setVerifiedCard(data);
      toast.success("Code vérifié !");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de vérification");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClaim = async () => {
    if (!account) {
      toast.error("Vous devez être connecté pour ajouter une carte");
      setLocation("/app/login");
      return;
    }

    setIsClaiming(true);

    try {
      const response = await fetch(`${API_URL}/api/memberships/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimCode: claimCode.replace('-', ''),
          accountId: account.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'activation");
      }

      await refreshMemberships();
      
      toast.success("Carte ajoutée avec succès !");
      setLocation(`/app/${data.membership.communityId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur d'activation");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex flex-col" data-testid="add-card-page">
      <div className="px-4 pt-6 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(account ? "/app/hub" : "/app/login")}
          className="text-gray-600 hover:text-gray-800 -ml-2"
          data-testid="button-back"
        >
          <ArrowLeft size={18} className="mr-1" />
          Retour
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pb-8">
        <div className="bg-white p-4 rounded-2xl shadow-lg mb-6">
          <Ticket className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Ajouter une carte
        </h1>
        <p className="text-gray-600 text-center mb-8 max-w-xs">
          Entrez le code d'activation fourni par votre organisation pour lier votre carte d'adhérent.
        </p>

        <div className="w-full max-w-sm space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Code d'activation</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="XXXX-XXXX"
                value={claimCode}
                onChange={handleCodeChange}
                className="h-14 text-center text-2xl font-mono tracking-widest rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-primary uppercase"
                maxLength={9}
                data-testid="input-claim-code"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Le code se trouve sur votre invitation ou email d'adhésion
            </p>
          </div>

          {!verifiedCard && (
            <Button
              onClick={handleVerify}
              disabled={claimCode.replace('-', '').length !== 8 || isVerifying}
              className="w-full h-12 rounded-xl"
              variant="outline"
              data-testid="button-verify"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Vérification...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search size={18} />
                  Vérifier le code
                </span>
              )}
            </Button>
          )}

          {verifiedCard && (
            <div className="space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800">Code valide !</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="text-gray-500">Communauté:</span>{" "}
                        <strong>{verifiedCard.communityName || "N/A"}</strong>
                      </p>
                      {verifiedCard.displayName && (
                        <p className="text-gray-700">
                          <span className="text-gray-500">Nom:</span>{" "}
                          <strong>{verifiedCard.displayName}</strong>
                        </p>
                      )}
                      <p className="text-gray-700">
                        <span className="text-gray-500">N° membre:</span>{" "}
                        <strong>{verifiedCard.memberId}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {account ? (
                <Button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                  data-testid="button-claim"
                >
                  {isClaiming ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Activation...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard size={18} />
                      Ajouter à mon compte
                    </span>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    Créez un compte Koomy pour activer cette carte
                  </p>
                  <Button
                    onClick={() => setLocation("/app/login")}
                    className="w-full h-12 rounded-xl"
                    data-testid="button-login-to-claim"
                  >
                    Créer un compte / Se connecter
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <img src={logo} alt="Koomy" className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-xs text-gray-400 mt-2">
            Koomy - Gestion de communautés
          </p>
        </div>
      </div>
    </div>
  );
}
