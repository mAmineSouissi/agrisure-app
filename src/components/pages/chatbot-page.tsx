"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Leaf,
  Cloud,
  BarChart3,
  Lightbulb,
} from "lucide-react";

interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export function ChatbotPage(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content:
        "Bonjour ! Je suis votre assistant IA AgriSure. Je peux vous aider avec vos questions sur l'assurance climatique, les recommandations de cultures, et l'analyse des risques. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
      suggestions: [
        "Quel est le risque de sécheresse cette semaine ?",
        "Quelles cultures recommandez-vous ?",
        "Montrez-moi mon historique de paiements",
        "Comment fonctionne l'assurance automatique ?",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simuler une réponse de l'IA
    setTimeout(() => {
      const botResponse = generateBotResponse(content.trim());
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();

    let response = "";
    let suggestions: string[] = [];

    if (input.includes("sécheresse") || input.includes("risque")) {
      response =
        "📊 **Analyse des risques de sécheresse :**\n\n• **Probabilité actuelle :** 70% pour les 7 prochains jours\n• **Zones à risque :** Nord et Est de votre exploitation\n• **Recommandation :** Activez l'irrigation préventive\n• **Couverture :** Votre assurance couvre jusqu'à 500$ pour cet événement\n\n🌡️ Les capteurs Irwise indiquent une humidité du sol à 15% (seuil critique : 12%)";
      suggestions = [
        "Comment activer l'irrigation ?",
        "Quand sera versé le paiement ?",
        "Autres risques climatiques ?",
      ];
    } else if (input.includes("culture") || input.includes("plante")) {
      response =
        "🌱 **Recommandations de cultures pour votre région :**\n\n**Optimal pour la saison :**\n• **Sorgho** - Résistant à la sécheresse (rendement prévu : 85%)\n• **Mil** - Adapté aux sols secs (rendement prévu : 78%)\n\n**Conditions actuelles :**\n• Température : 32°C (idéal pour sorgho)\n• Humidité sol : 15% (limite acceptable)\n• pH : 6.8 (optimal)\n\n💡 **Conseil IA :** Plantez le sorgho dans les 5 prochains jours avant la période sèche.";
      suggestions = [
        "Où acheter ces semences ?",
        "Calendrier de plantation ?",
        "Besoins en irrigation ?",
      ];
    } else if (input.includes("paiement") || input.includes("historique")) {
      response =
        "💰 **Historique des paiements AgriSure :**\n\n**Paiements reçus :**\n• 13/06/2025 : 50$ (Sécheresse) ✅\n• 15/04/2025 : 75$ (Inondation) ✅\n• 02/03/2025 : 30$ (Grêle) ✅\n\n**Total reçu :** 155$\n**Prochaine évaluation :** Dans 3 jours\n\n🔗 Tous les paiements sont traités automatiquement via la blockchain Hedera en moins de 24h après détection de l'événement.";
      suggestions = [
        "Comment fonctionne Hedera ?",
        "Délais de paiement ?",
        "Augmenter ma couverture ?",
      ];
    } else if (input.includes("assurance") || input.includes("fonctionne")) {
      response =
        "🛡️ **Comment fonctionne AgriSure :**\n\n**1. Surveillance continue**\n• Capteurs IoT Irwise mesurent sol et météo 24/7\n• IA analyse les données en temps réel\n\n**2. Détection automatique**\n• Algorithmes détectent les événements climatiques\n• Validation croisée avec stations météo\n\n**3. Paiement instantané**\n• Smart contracts sur Hedera déclenchent le paiement\n• Fonds transférés en moins de 24h\n\n🤖 **Aucune démarche de votre part !** Tout est automatisé.";
      suggestions = [
        "Quels événements sont couverts ?",
        "Comment modifier ma police ?",
        "Contacter le support ?",
      ];
    } else {
      response =
        "Je comprends votre question ! En tant qu'assistant IA d'AgriSure, je peux vous aider avec :\n\n🌾 **Analyses agricoles**\n• Recommandations de cultures\n• Prédictions météorologiques\n• Évaluation des risques\n\n💼 **Gestion d'assurance**\n• Statut de votre couverture\n• Historique des paiements\n• Explications des processus\n\n📊 **Données en temps réel**\n• Capteurs Irwise\n• Conditions météo\n• Probabilités de risques\n\nPouvez-vous préciser votre demande ?";
      suggestions = [
        "Risques climatiques actuels",
        "Recommandations de cultures",
        "Mon historique de paiements",
        "Comment fonctionne l'assurance",
      ];
    }

    return {
      id: Date.now(),
      type: "bot",
      content: response,
      timestamp: new Date(),
      suggestions,
    };
  };

  const handleSuggestionClick = (suggestion: string): void => {
    handleSendMessage(suggestion);
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* En-tête */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-full">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Assistant IA AgriSure</CardTitle>
              <p className="text-sm text-muted-foreground">
                Votre expert en assurance climatique et agriculture intelligente
              </p>
            </div>
            <div className="ml-auto">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                En ligne
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Zone de messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "bot" && (
                  <Avatar className="h-8 w-8 bg-green-600">
                    <AvatarFallback>
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] ${
                    message.type === "user" ? "order-first" : ""
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-green-600 text-white ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Suggestions */}
                  {message.type === "bot" && message.suggestions && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground px-1">
                        Suggestions :
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.type === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-green-600">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Zone de saisie */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question sur l'agriculture ou l'assurance climatique..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {/* Raccourcis rapides */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() =>
                handleSendMessage("Quel est le statut de mes cultures ?")
              }
            >
              <Leaf className="h-3 w-3 mr-1" />
              Statut cultures
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() =>
                handleSendMessage("Prévisions météo cette semaine")
              }
            >
              <Cloud className="h-3 w-3 mr-1" />
              Météo
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleSendMessage("Analyse des risques actuels")}
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Risques
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleSendMessage("Conseils d'optimisation")}
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Conseils
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
