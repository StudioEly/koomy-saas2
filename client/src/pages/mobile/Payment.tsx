import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, CreditCard, CheckCircle, Clock, AlertCircle, Euro, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "expired";
  dueDate: string;
  message?: string;
  feeName: string;
}

export default function MobilePayment() {
  const { communityId } = useParams();
  const { user, currentCommunity } = useAuth();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Mock payment requests - in production, fetch from API
  const paymentRequests: PaymentRequest[] = [
    {
      id: "req_1",
      amount: 12000, // 120.00 EUR in cents
      currency: "EUR",
      status: "pending",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      message: "Cotisation annuelle 2025",
      feeName: "Cotisation Annuelle"
    }
  ];

  const paymentHistory = [
    {
      id: "pay_1",
      amount: 12000,
      currency: "EUR",
      status: "completed",
      date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Cotisation Annuelle 2024"
    }
  ];

  const formatAmount = (cents: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency 
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const openPaymentModal = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setIsPaymentOpen(true);
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvv) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsProcessing(true);
    
    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentOpen(false);
      setSelectedRequest(null);
      setCardNumber("");
      setExpiry("");
      setCvv("");
      toast.success("Paiement effectué avec succès!");
    }, 2000);
  };

  const pendingRequests = paymentRequests.filter(r => r.status === "pending");
  const totalPending = pendingRequests.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="mobile-payment-page">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl">
        {/* Header */}
        <header className="bg-primary text-white p-4 pt-12 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href={`/app/${communityId}/profile`}>
              <button className="p-2 hover:bg-white/10 rounded-full" data-testid="button-back">
                <ArrowLeft size={24} />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Paiements</h1>
              <p className="text-sm text-blue-100">Gérer mes cotisations</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {/* Summary Card */}
          {pendingRequests.length > 0 && (
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-90">Montant en attente</p>
                  <p className="text-2xl font-bold">{formatAmount(totalPending, "EUR")}</p>
                </div>
              </div>
              <p className="text-sm opacity-80">
                Vous avez {pendingRequests.length} paiement(s) en attente
              </p>
            </div>
          )}

          {/* Pending Payments */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={20} className="text-orange-500" />
              Paiements en attente
            </h2>
            
            {pendingRequests.length === 0 ? (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                <p className="text-green-700 font-medium">Vous êtes à jour!</p>
                <p className="text-sm text-green-600">Aucun paiement en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    data-testid={`payment-request-${request.id}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.feeName}</h3>
                        {request.message && (
                          <p className="text-sm text-gray-500">{request.message}</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {formatAmount(request.amount, request.currency)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>Échéance: {formatDate(request.dueDate)}</span>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => openPaymentModal(request)}
                        data-testid={`button-pay-${request.id}`}
                      >
                        <CreditCard size={16} className="mr-2" />
                        Payer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Payment History */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              Historique des paiements
            </h2>
            
            {paymentHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun historique de paiement</p>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div 
                    key={payment.id}
                    className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{payment.description}</p>
                      <p className="text-sm text-gray-500">{formatDate(payment.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatAmount(payment.amount, payment.currency)}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle size={10} /> Payé
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Contribution Status */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Statut de cotisation</h3>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                currentCommunity?.contributionStatus === "up_to_date" 
                  ? "bg-green-100 text-green-600" 
                  : "bg-orange-100 text-orange-600"
              }`}>
                {currentCommunity?.contributionStatus === "up_to_date" 
                  ? <CheckCircle size={20} /> 
                  : <Clock size={20} />
                }
              </div>
              <div>
                <p className={`font-medium ${
                  currentCommunity?.contributionStatus === "up_to_date" 
                    ? "text-green-700" 
                    : "text-orange-700"
                }`}>
                  {currentCommunity?.contributionStatus === "up_to_date" 
                    ? "À jour" 
                    : "En attente de règlement"
                  }
                </p>
                {currentCommunity?.nextDueDate && (
                  <p className="text-sm text-blue-600">
                    Prochaine échéance: {formatDate(currentCommunity.nextDueDate.toString())}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Payment Modal */}
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                <CreditCard className="mx-auto mb-2 text-primary" size={32} />
                Payer ma cotisation
              </DialogTitle>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="py-4 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">{selectedRequest.feeName}</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatAmount(selectedRequest.amount, selectedRequest.currency)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Numéro de carte
                    </label>
                    <Input 
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      className="font-mono"
                      data-testid="input-card-number"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Expiration
                      </label>
                      <Input 
                        placeholder="MM/AA"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                        data-testid="input-expiry"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        CVV
                      </label>
                      <Input 
                        placeholder="123"
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        data-testid="input-cvv"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                  <p className="font-medium mb-1">Paiement sécurisé</p>
                  <p>Vos informations de paiement sont protégées par un chiffrement SSL.</p>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col gap-2">
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handlePayment}
                disabled={isProcessing}
                data-testid="button-confirm-payment"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Traitement en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard size={18} />
                    Confirmer le paiement
                  </span>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsPaymentOpen(false)}
              >
                Annuler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
