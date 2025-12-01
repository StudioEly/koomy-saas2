import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Headphones, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/api/config";

interface Message {
  id: string;
  content: string;
  sender: "bot" | "user" | "agent";
  timestamp: Date;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const BOT_WELCOME = "Bonjour ! 👋 Je suis l'assistant Koomy. Comment puis-je vous aider aujourd'hui ?";

const QUICK_SUGGESTIONS = [
  "Quels sont vos tarifs ?",
  "Quelles fonctionnalités proposez-vous ?",
  "Y a-t-il un essai gratuit ?"
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForAgent, setWaitingForAgent] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        content: BOT_WELCOME,
        sender: "bot",
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (content: string, sender: "bot" | "user" | "agent") => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date()
    }]);
  };

  const sendToAI = async (userMessage: string) => {
    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", content: userMessage }];
    setChatHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const aiReply = data.reply;

      setChatHistory(prev => [...prev, { role: "assistant", content: aiReply }]);
      addMessage(aiReply, "bot");
    } catch (error) {
      console.error("Chat error:", error);
      addMessage("Désolé, une erreur s'est produite. Veuillez réessayer ou contacter notre support.", "bot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, "user");
    setInputValue("");

    if (agentConnected) {
      addMessage("Notre agent a bien reçu votre message. Il vous répondra dans quelques instants...", "bot");
      return;
    }

    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes("agent") || lowerMessage.includes("humain") || lowerMessage.includes("conseiller") || lowerMessage.includes("parler à quelqu'un")) {
      setShowContactForm(true);
      addMessage("Je comprends que vous souhaitez parler à un conseiller. Merci de remplir le formulaire ci-dessous.", "bot");
      return;
    }

    await sendToAI(userMessage);
  };

  const handleQuickSuggestion = async (suggestion: string) => {
    addMessage(suggestion, "user");
    await sendToAI(suggestion);
  };

  const handleRequestAgent = () => {
    if (!userName || !userEmail) return;
    
    setShowContactForm(false);
    setWaitingForAgent(true);
    addMessage(`Merci ${userName} ! Je transfère votre conversation à un conseiller. Veuillez patienter quelques instants...`, "bot");
    
    setTimeout(() => {
      setWaitingForAgent(false);
      setAgentConnected(true);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `Bonjour ${userName} ! Je suis Marie de l'équipe commerciale Koomy. Comment puis-je vous aider ?`,
        sender: "agent",
        timestamp: new Date()
      }]);
    }, 3000);
  };

  const resetChat = () => {
    setMessages([{
      id: "welcome",
      content: BOT_WELCOME,
      sender: "bot",
      timestamp: new Date()
    }]);
    setChatHistory([]);
    setAgentConnected(false);
    setWaitingForAgent(false);
    setShowContactForm(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-200 transition-all hover:scale-110 animate-bounce"
          data-testid="button-open-chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5" style={{ height: "500px", maxHeight: "calc(100vh - 6rem)" }}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {agentConnected ? (
                <>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Marie - Équipe Koomy</p>
                    <p className="text-xs text-blue-100 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      En ligne
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Assistant Koomy</p>
                    <p className="text-xs text-blue-100">Propulsé par IA</p>
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              data-testid="button-close-chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={cn(
                  "flex gap-2 animate-in fade-in slide-in-from-bottom-2",
                  message.sender === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.sender === "user" ? "bg-blue-100 text-blue-600" :
                  message.sender === "agent" ? "bg-purple-100 text-purple-600" :
                  "bg-gray-200 text-gray-600"
                )}>
                  {message.sender === "user" ? <User size={16} /> :
                   message.sender === "agent" ? <Headphones size={16} /> :
                   <Bot size={16} />}
                </div>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                  message.sender === "user" 
                    ? "bg-blue-600 text-white rounded-br-md" 
                    : message.sender === "agent"
                    ? "bg-purple-100 text-purple-900 rounded-bl-md"
                    : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                )}>
                  <p className="whitespace-pre-line">{message.content}</p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    message.sender === "user" ? "text-blue-200" : "text-gray-400"
                  )}>
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot size={16} className="text-gray-600" />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">En train de réfléchir...</span>
                  </div>
                </div>
              </div>
            )}

            {waitingForAgent && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Connexion à un conseiller...</p>
              </div>
            )}

            {showContactForm && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-in fade-in">
                <p className="text-sm font-medium text-gray-800 mb-3">Pour vous mettre en relation avec un conseiller :</p>
                <div className="space-y-3">
                  <Input
                    placeholder="Votre nom"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-10"
                    data-testid="input-chat-name"
                  />
                  <Input
                    type="email"
                    placeholder="Votre email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="h-10"
                    data-testid="input-chat-email"
                  />
                  <Button 
                    onClick={handleRequestAgent}
                    disabled={!userName || !userEmail}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    data-testid="button-connect-agent"
                  >
                    <Headphones size={16} className="mr-2" />
                    Parler à un conseiller
                  </Button>
                </div>
              </div>
            )}

            {!agentConnected && !waitingForAgent && !showContactForm && !isLoading && messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">Suggestions :</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                      data-testid={`quick-suggestion-${index}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100">
            {agentConnected && (
              <button 
                onClick={resetChat}
                className="w-full text-xs text-gray-500 hover:text-gray-700 mb-2 flex items-center justify-center gap-1"
              >
                <ArrowLeft size={12} /> Retour à l'assistant IA
              </button>
            )}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={agentConnected ? "Écrivez à l'agent..." : "Posez votre question..."}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                disabled={isLoading}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-send-message"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Propulsé par ChatGPT • Support 24/7
            </p>
          </div>
        </div>
      )}
    </>
  );
}
