"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Code,
  Zap,
  Shield,
  Brain,
  Rocket,
  FileText,
  Download,
  Copy,
  CheckCircle,
  AlertTriangle,
  Settings,
  Coins,
  ImageIcon,
  ExternalLink,
  Palette,
  Star,
} from "lucide-react";

interface ContractRequirements {
  insuranceType: string;
  coverageAmount: number;
  premiumAmount: number;
  conditions: string[];
  triggers: string[];
}

interface DeployedContract {
  id: string;
  name: string;
  address: string;
  status: "active" | "pending" | "inactive";
  deployedAt: string;
  balance: number;
  totalClaims: number;
  nftTokenId?: number;
  nftImageUrl?: string;
}

interface NFTData {
  tokenId: number;
  contractAddress: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  imageUrl: string;
  mintTransactionId: string;
  openseaUrl: string;
  hederaExplorerUrl: string;
}

export function SmartContractsPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState("generator");
  const [contractRequirements, setContractRequirements] =
    useState<ContractRequirements>({
      insuranceType: "Assurance Sécheresse",
      coverageAmount: 1000,
      premiumAmount: 50,
      conditions: [
        "Humidité du sol < 10%",
        "Température > 35°C",
        "Durée > 7 jours",
      ],
      triggers: ["Capteurs Irwise", "Stations météo", "Satellites"],
    });

  const [generatedContract, setGeneratedContract] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [contractExplanation, setContractExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<
    "idle" | "deploying" | "success" | "error"
  >("idle");
  const [deployedContractId, setDeployedContractId] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newTrigger, setNewTrigger] = useState("");
  const [nftData, setNftData] = useState<NFTData | null>(null);

  // Contrats déployés simulés avec NFTs
  const [deployedContracts] = useState<DeployedContract[]>([
    {
      id: "0.0.123456",
      name: "Assurance Sécheresse Premium",
      address: "0.0.123456",
      status: "active",
      deployedAt: "2025-01-14T10:30:00Z",
      balance: 2500,
      totalClaims: 12,
      nftTokenId: 1,
      nftImageUrl:
        "https://agrisure-nft.vercel.app/api/generate-nft/0.0.123456?type=drought&coverage=2500",
    },
    {
      id: "0.0.789012",
      name: "Protection Inondation",
      address: "0.0.789012",
      status: "active",
      deployedAt: "2025-01-10T14:15:00Z",
      balance: 1800,
      totalClaims: 8,
      nftTokenId: 2,
      nftImageUrl:
        "https://agrisure-nft.vercel.app/api/generate-nft/0.0.789012?type=flood&coverage=1800",
    },
    {
      id: "0.0.345678",
      name: "Assurance Grêle",
      address: "0.0.345678",
      status: "pending",
      deployedAt: "2025-01-14T16:45:00Z",
      balance: 0,
      totalClaims: 0,
      nftTokenId: 3,
      nftImageUrl:
        "https://agrisure-nft.vercel.app/api/generate-nft/0.0.345678?type=hail&coverage=1200",
    },
  ]);

  const handleGenerateContract = async (): Promise<void> => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/hedera/deploy-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: contractRequirements }),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedContract(data.contractCode);
        setDeployedContractId(data.contractId);
        setNftData(data.nft);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExplainContract = async (): Promise<void> => {
    if (!generatedContract) return;

    setIsExplaining(true);
    try {
      const response = await fetch("/api/ai/explain-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractCode: generatedContract }),
      });

      const data = await response.json();
      if (data.success) {
        setContractExplanation(data.explanation);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleDeployContract = async (): Promise<void> => {
    if (!generatedContract) return;

    setDeploymentStatus("deploying");
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setDeploymentStatus("success");

      await fetch("/api/n8n/trigger-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowType: "contract-deployed",
          data: {
            contractId: deployedContractId,
            type: contractRequirements.insuranceType,
            coverage: contractRequirements.coverageAmount,
            nftTokenId: nftData?.tokenId,
          },
        }),
      });
    } catch (error) {
      console.error("Erreur:", error);
      setDeploymentStatus("error");
    }
  };

  const addCondition = (): void => {
    if (newCondition.trim()) {
      setContractRequirements({
        ...contractRequirements,
        conditions: [...contractRequirements.conditions, newCondition.trim()],
      });
      setNewCondition("");
    }
  };

  const addTrigger = (): void => {
    if (newTrigger.trim()) {
      setContractRequirements({
        ...contractRequirements,
        triggers: [...contractRequirements.triggers, newTrigger.trim()],
      });
      setNewTrigger("");
    }
  };

  const removeCondition = (index: number): void => {
    setContractRequirements({
      ...contractRequirements,
      conditions: contractRequirements.conditions.filter((_, i) => i !== index),
    });
  };

  const removeTrigger = (index: number): void => {
    setContractRequirements({
      ...contractRequirements,
      triggers: contractRequirements.triggers.filter((_, i) => i !== index),
    });
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-green-800">
          Smart Contracts IA + NFT
        </h1>
        <p className="text-muted-foreground">
          Générez des contrats intelligents avec NFT automatique pour
          l&apos;assurance agricole
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Contrats déployés
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {deployedContracts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-pink-600" />
              <div>
                <p className="text-sm text-muted-foreground">NFTs mintés</p>
                <p className="text-2xl font-bold text-pink-600">
                  {deployedContracts.filter((c) => c.nftTokenId).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Valeur totale (HBAR)
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {deployedContracts.reduce(
                    (sum, contract) => sum + contract.balance,
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Réclamations traitées
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {deployedContracts.reduce(
                    (sum, contract) => sum + contract.totalClaims,
                    0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Contrats actifs</p>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    deployedContracts.filter((c) => c.status === "active")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Générateur IA + NFT</TabsTrigger>
          <TabsTrigger value="deployed">Contrats & NFTs</TabsTrigger>
          <TabsTrigger value="nft-gallery">Galerie NFT</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Onglet Générateur */}
        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Configuration du contrat + NFT
                </CardTitle>
                <CardDescription>
                  Définissez les paramètres de votre contrat intelligent avec
                  NFT automatique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceType">Type d&apos;assurance</Label>
                  <Select
                    value={contractRequirements.insuranceType}
                    onValueChange={(value) =>
                      setContractRequirements({
                        ...contractRequirements,
                        insuranceType: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Assurance Sécheresse">
                        Assurance Sécheresse
                      </SelectItem>
                      <SelectItem value="Protection Inondation">
                        Protection Inondation
                      </SelectItem>
                      <SelectItem value="Assurance Grêle">
                        Assurance Grêle
                      </SelectItem>
                      <SelectItem value="Protection Gel">
                        Protection Gel
                      </SelectItem>
                      <SelectItem value="Assurance Multi-Risques">
                        Assurance Multi-Risques
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverageAmount">Couverture (HBAR)</Label>
                    <Input
                      id="coverageAmount"
                      type="number"
                      value={contractRequirements.coverageAmount}
                      onChange={(e) =>
                        setContractRequirements({
                          ...contractRequirements,
                          coverageAmount: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premiumAmount">Prime (HBAR)</Label>
                    <Input
                      id="premiumAmount"
                      type="number"
                      value={contractRequirements.premiumAmount}
                      onChange={(e) =>
                        setContractRequirements({
                          ...contractRequirements,
                          premiumAmount: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-2">
                  <Label>Conditions de déclenchement</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter une condition..."
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addCondition()}
                    />
                    <Button onClick={addCondition} size="sm">
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contractRequirements.conditions.map((condition, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeCondition(index)}
                      >
                        {condition} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Déclencheurs */}
                <div className="space-y-2">
                  <Label>Sources de données</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter une source..."
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTrigger()}
                    />
                    <Button onClick={addTrigger} size="sm">
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contractRequirements.triggers.map((trigger, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeTrigger(index)}
                      >
                        {trigger} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateContract}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isGenerating ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Génération Smart Contract + NFT...
                    </>
                  ) : (
                    <>
                      <Palette className="h-4 w-4 mr-2" />
                      Générer Smart Contract + NFT
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Aperçu NFT */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-pink-600" />
                  Aperçu NFT de la police
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-300">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-purple-400 mb-2" />
                    <p className="text-sm text-purple-600 font-medium">
                      NFT généré automatiquement
                    </p>
                    <p className="text-xs text-purple-500">
                      Représente votre police d&apos;assurance
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Nom NFT:</span>
                    <span className="text-sm">
                      AgriSure Policy #{deployedContractId || "XXXXXX"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span className="text-sm">
                      {contractRequirements.insuranceType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Couverture:</span>
                    <span className="text-sm">
                      {contractRequirements.coverageAmount} HBAR
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Rareté:</span>
                    <Badge variant="outline" className="text-xs">
                      {contractRequirements.coverageAmount > 1000
                        ? "Rare"
                        : "Common"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Attributs NFT:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-purple-50 p-2 rounded">
                      <span className="font-medium">Insurance Type</span>
                      <br />
                      <span className="text-purple-600">
                        {contractRequirements.insuranceType}
                      </span>
                    </div>
                    <div className="bg-pink-50 p-2 rounded">
                      <span className="font-medium">Coverage Ratio</span>
                      <br />
                      <span className="text-pink-600">
                        {Math.round(
                          (contractRequirements.coverageAmount /
                            contractRequirements.premiumAmount) *
                            100
                        ) / 100}
                        :1
                      </span>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <span className="font-medium">Conditions</span>
                      <br />
                      <span className="text-blue-600">
                        {contractRequirements.conditions.length}
                      </span>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <span className="font-medium">Data Sources</span>
                      <br />
                      <span className="text-green-600">
                        {contractRequirements.triggers.length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* NFT généré */}
          {nftData && (
            <Card className="border-2 border-pink-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-pink-600" />
                    NFT généré avec succès !
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-pink-100 text-pink-800"
                  >
                    Token ID: {nftData.tokenId}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Votre police d&apos;assurance est maintenant un NFT unique sur
                  Hedera Hashgraph
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image NFT */}
                  <div className="space-y-3">
                    <div className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-16 w-16 mx-auto text-purple-600 mb-3" />
                        <p className="font-bold text-purple-800">
                          {nftData.metadata.name}
                        </p>
                        <p className="text-sm text-purple-600">
                          #{nftData.tokenId}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href={nftData.openseaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          OpenSea
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href={nftData.hederaExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Explorer
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Métadonnées */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Métadonnées NFT</h4>
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-2">
                        {nftData.metadata.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {nftData.metadata.attributes
                          .slice(0, 6)
                          .map((attr, index) => (
                            <div key={index} className="bg-gray-50 p-2 rounded">
                              <span className="font-medium">
                                {attr.trait_type}
                              </span>
                              <br />
                              <span className="text-gray-600">
                                {attr.value}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>
                        Transaction: {nftData.mintTransactionId.slice(0, 20)}...
                      </p>
                      <p>Contract: {nftData.contractAddress}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contrat généré */}
          {generatedContract && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-green-600" />
                    Smart Contract avec NFT généré
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContract)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExplainContract}
                      disabled={isExplaining}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {isExplaining ? "Analyse..." : "Expliquer"}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Contrat Solidity avec NFT intégré pour Hedera Hashgraph - ID:{" "}
                  {deployedContractId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-96">
                  <pre className="text-sm">
                    <code>{generatedContract}</code>
                  </pre>
                </div>

                {/* Actions de déploiement */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeployContract}
                    disabled={deploymentStatus === "deploying"}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {deploymentStatus === "deploying" ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Déploiement...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Déployer sur Hedera
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger .sol
                  </Button>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Audit sécurité
                  </Button>
                </div>

                {/* Statut de déploiement */}
                {deploymentStatus === "success" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Contrat et NFT déployés avec succès ! ID:{" "}
                      {deployedContractId} | NFT: #{nftData?.tokenId}
                    </AlertDescription>
                  </Alert>
                )}

                {deploymentStatus === "error" && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Erreur lors du déploiement. Vérifiez votre configuration
                      Hedera.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Explication du contrat */}
          {contractExplanation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Explication détaillée du contrat NFT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm bg-blue-50 p-4 rounded-lg">
                    {contractExplanation}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Contrats & NFTs déployés */}
        <TabsContent value="deployed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {deployedContracts.map((contract) => (
              <Card key={contract.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{contract.name}</span>
                    <div className="flex gap-2">
                      {contract.nftTokenId && (
                        <Badge
                          variant="secondary"
                          className="bg-pink-100 text-pink-800"
                        >
                          NFT #{contract.nftTokenId}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          contract.status === "active"
                            ? "default"
                            : contract.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>ID: {contract.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Aperçu NFT */}
                  {contract.nftImageUrl && (
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center border">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 mx-auto text-purple-500 mb-1" />
                        <p className="text-xs text-purple-600">
                          NFT Policy #{contract.nftTokenId}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Solde</p>
                      <p className="font-semibold">{contract.balance} HBAR</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Réclamations</p>
                      <p className="font-semibold">{contract.totalClaims}</p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground">Déployé le</p>
                    <p>
                      {new Date(contract.deployedAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Gérer
                    </Button>
                    {contract.nftTokenId && (
                      <Button size="sm" variant="outline" className="flex-1">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Voir NFT
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Galerie NFT */}
        <TabsContent value="nft-gallery" className="space-y-6">
          <div className="text-center py-8">
            <ImageIcon className="h-16 w-16 mx-auto text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Galerie NFT AgriSure</h3>
            <p className="text-muted-foreground mb-6">
              Collection de toutes les polices d&apos;assurance sous forme de NFTs
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {deployedContracts
                .filter((contract) => contract.nftTokenId)
                .map((contract) => (
                  <Card
                    key={contract.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-3">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 mx-auto text-purple-500 mb-2" />
                          <p className="text-sm font-medium text-purple-700">
                            #{contract.nftTokenId}
                          </p>
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {contract.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        {contract.address}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {contract.balance} HBAR
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>

        {/* Onglet Monitoring */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Intégration Hedera */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Réseau Hedera + NFT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Statut du réseau</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Opérationnel
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Environnement</span>
                  <Badge variant="outline">Testnet</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Frais moyens</span>
                  <span className="text-sm font-medium">0.0001 HBAR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">NFTs mintés</span>
                  <span className="text-sm font-medium">
                    {deployedContracts.filter((c) => c.nftTokenId).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contrats déployés</span>
                  <span className="text-sm font-medium">
                    {deployedContracts.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Automatisation n8n */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Workflows n8n + NFT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Workflows actifs</span>
                  <Badge variant="secondary">7</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Exécutions aujourd&apos;hui</span>
                  <span className="text-sm font-medium">52</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">NFTs créés automatiquement</span>
                  <span className="text-sm font-medium text-pink-600">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taux de succès</span>
                  <span className="text-sm font-medium text-green-600">
                    98.3%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Paiements automatiques</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Activé
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logs récents avec NFT */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente (Smart Contracts + NFT)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    time: "14:45",
                    action: "NFT minté",
                    details:
                      "AgriSure Policy #163887 - Assurance Multi-Risques",
                    status: "success",
                  },
                  {
                    time: "14:32",
                    action: "Contrat déployé",
                    details: "Assurance Grêle avec NFT - 0.0.345678",
                    status: "success",
                  },
                  {
                    time: "14:28",
                    action: "Paiement automatique NFT",
                    details: "50 HBAR vers propriétaire NFT #2",
                    status: "success",
                  },
                  {
                    time: "14:20",
                    action: "Transfert NFT",
                    details: "Police #1 transférée vers nouveau propriétaire",
                    status: "info",
                  },
                  {
                    time: "14:15",
                    action: "Événement détecté",
                    details: "Sécheresse niveau 7 - Déclenchement NFT #3",
                    status: "warning",
                  },
                  {
                    time: "14:10",
                    action: "Workflow NFT déclenché",
                    details: "Création automatique de métadonnées",
                    status: "info",
                  },
                ].map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        log.status === "success"
                          ? "bg-green-500"
                          : log.status === "warning"
                          ? "bg-orange-500"
                          : log.status === "error"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {log.action}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {log.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
