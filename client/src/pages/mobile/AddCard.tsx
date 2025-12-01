import { useState } from "react";
import { useLocation } from "wouter";
import { Ticket, Check, ArrowLeft, CreditCard, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL as API_URL } from "@/api/config";
import koomyLogo from "@assets/ChatGPT Image 30 nov. 2025, 05_54_45_1764590118748.png";

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
      setLocation(`/app/${data.membership.communityId}/home`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur d'activation");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="add-card-page" style={{
      background: "linear-gradient(180deg, #E8F4FF 0%, #F5FAFF 40%, #FFFFFF 100%)"
    }}>
      <div className="absolute top-0 left-0 w-full h-60 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-60 h-60 rounded-full opacity-25" style={{
          background: "radial-gradient(circle, rgba(68, 168, 255, 0.4) 0%, transparent 70%)"
        }} />
        <div className="absolute top-20 right-0 w-40 h-40 rounded-full opacity-20" style={{
          background: "radial-gradient(circle, rgba(68, 168, 255, 0.5) 0%, transparent 70%)"
        }} />
      </div>

      <div className="relative z-10 px-5 pt-6 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(account ? "/app/hub" : "/app/login")}
          className="text-gray-500 hover:text-[#44A8FF] hover:bg-[#44A8FF]/10 -ml-2 rounded-xl transition-all"
          data-testid="button-back"
        >
          <ArrowLeft size={18} className="mr-1" />
          Retour
        </Button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pb-8">
        <div className="relative mb-5">
          <div className="absolute inset-0 blur-lg opacity-30" style={{
            background: "radial-gradient(circle, rgba(68, 168, 255, 0.5) 0%, transparent 70%)"
          }} />
          <div className="relative bg-white p-4 rounded-2xl shadow-lg" style={{
            boxShadow: "0 4px 20px -4px rgba(68, 168, 255, 0.2)"
          }}>
            <Ticket className="w-10 h-10 text-[#44A8FF]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Ajouter une carte
        </h1>
        <p className="text-gray-500 text-center mb-8 max-w-xs text-sm">
          Entrez le code d'activation fourni par votre organisation pour lier votre carte d'adhérent.
        </p>

        <div className="w-full max-w-sm koomy-card p-5">
          <div className="space-y-2 mb-4">
            <label className="text-sm font-semibold text-gray-600">Code d'activation</label>
            <Input
              type="text"
              placeholder="XXXX-XXXX"
              value={claimCode}
              onChange={handleCodeChange}
              className="h-14 text-center text-2xl font-mono tracking-widest rounded-xl bg-[#F5F9FF] border-2 border-[#E0EDFF] focus:border-[#44A8FF] focus:ring-[#44A8FF]/20 uppercase"
              maxLength={9}
              data-testid="input-claim-code"
            />
            <p className="text-xs text-gray-400 text-center">
              Le code se trouve sur votre invitation ou email d'adhésion
            </p>
          </div>

          {!verifiedCard && (
            <Button
              onClick={handleVerify}
              disabled={claimCode.replace('-', '').length !== 8 || isVerifying}
              className="w-full h-12 rounded-xl font-semibold transition-all"
              variant="outline"
              style={{
                borderColor: claimCode.replace('-', '').length === 8 ? "#44A8FF" : undefined,
                color: claimCode.replace('-', '').length === 8 ? "#44A8FF" : undefined
              }}
              data-testid="button-verify"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#44A8FF] border-t-transparent rounded-full animate-spin" />
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
            <div className="space-y-4 mt-4">
              <div className="rounded-xl p-4" style={{
                background: "linear-gradient(135deg, #E8FFF0 0%, #F0FFF5 100%)",
                border: "1.5px solid #86EFAC"
              }}>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-green-700">Code valide !</p>
                    <div className="mt-2 space-y-1.5 text-sm">
                      <p className="text-gray-600">
                        <span className="text-gray-400">Communauté:</span>{" "}
                        <strong className="text-gray-700">{verifiedCard.communityName || "N/A"}</strong>
                      </p>
                      {verifiedCard.displayName && (
                        <p className="text-gray-600">
                          <span className="text-gray-400">Nom:</span>{" "}
                          <strong className="text-gray-700">{verifiedCard.displayName}</strong>
                        </p>
                      )}
                      <p className="text-gray-600">
                        <span className="text-gray-400">N° membre:</span>{" "}
                        <strong className="text-gray-700">{verifiedCard.memberId}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {account ? (
                <Button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="w-full h-12 rounded-xl font-bold transition-all"
                  style={{
                    background: "linear-gradient(135deg, #5AB8FF 0%, #44A8FF 100%)",
                    boxShadow: "0 4px 14px -2px rgba(68, 168, 255, 0.4)"
                  }}
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
                  <p className="text-sm text-gray-500 text-center">
                    Créez un compte Koomy pour activer cette carte
                  </p>
                  <Button
                    onClick={() => setLocation("/app/login")}
                    className="w-full h-12 rounded-xl font-bold transition-all"
                    style={{
                      background: "linear-gradient(135deg, #5AB8FF 0%, #44A8FF 100%)",
                      boxShadow: "0 4px 14px -2px rgba(68, 168, 255, 0.4)"
                    }}
                    data-testid="button-login-to-claim"
                  >
                    Créer un compte / Se connecter
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <img src={koomyLogo} alt="Koomy" className="w-20 mx-auto opacity-25" />
          <p className="text-xs text-gray-300 mt-2">
            Vos communautés, une app.
          </p>
        </div>
      </div>
    </div>
  );
}
