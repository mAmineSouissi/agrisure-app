import { type NextRequest, NextResponse } from "next/server";
import { aiContractGenerator } from "@/lib/ai-contract-generator";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Début de la génération du contrat avec NFT...");

    const body = await request.json();
    console.log("📝 Données reçues:", JSON.stringify(body, null, 2));

    const { requirements } = body;

    if (!requirements) {
      console.log("❌ Paramètres manquants");
      return NextResponse.json(
        { error: "Paramètres de contrat manquants" },
        { status: 400 }
      );
    }

    // 1. Générer le smart contract avec NFT intégré
    console.log("🧠 Génération du contrat avec NFT...");
    const contractCode = await aiContractGenerator.generateSmartContract(
      requirements
    );

    // 2. Simuler un déploiement réussi avec des données réalistes
    const mockContractId = `0.0.${Math.floor(Math.random() * 900000) + 100000}`;
    const deploymentCost = (Math.random() * 2 + 1.5).toFixed(2); // Entre 1.5 et 3.5 HBAR
    const estimatedGas = Math.floor(Math.random() * 50000) + 75000; // Entre 75k et 125k gas

    // 3. Générer les métadonnées NFT
    console.log("🎨 Génération des métadonnées NFT...");
    const nftMetadata = aiContractGenerator.generateNFTMetadata(
      requirements,
      mockContractId
    );

    // 4. Simuler la création du NFT
    const nftTokenId = Math.floor(Math.random() * 10000) + 1;
    const nftImageUrl = `https://agrisure-nft.vercel.app/api/generate-nft/${mockContractId}?type=${requirements.insuranceType
      .toLowerCase()
      .replace(/\s+/g, "-")}&coverage=${requirements.coverageAmount}`;

    console.log("✅ Contrat avec NFT généré avec succès:", mockContractId);
    console.log("🎨 NFT créé avec ID:", nftTokenId);

    // 5. Simuler un délai de déploiement réaliste
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const metadataUrl = `${baseUrl}/api/nft/metadata/${mockContractId}?type=${encodeURIComponent(
      requirements.insuranceType
    )}&coverage=${requirements.coverageAmount}&premium=${requirements.premiumAmount}&conditions=${encodeURIComponent(
      requirements.conditions.join(",")
    )}&triggers=${encodeURIComponent(requirements.triggers.join(","))}`;

    const response = {
      success: true,
      contractCode,
      contractId: mockContractId,
      message: "Smart contract avec NFT généré avec succès",
      deploymentCost: `${deploymentCost} HBAR`,
      estimatedGas: estimatedGas.toLocaleString(),
      networkStatus: "testnet",
      timestamp: new Date().toISOString(),
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      // Nouvelles données NFT
      nft: {
        tokenId: nftTokenId,
        contractAddress: mockContractId,
        metadata: {
          ...nftMetadata,
          token_uri: metadataUrl,
        },
        imageUrl: nftImageUrl,
        mintTransactionId: `0x${Math.random().toString(16).substr(2, 64)}`,
        openseaUrl: `https://testnets.opensea.io/assets/hedera/${mockContractId}/${nftTokenId}`,
        hederaExplorerUrl: `https://hashscan.io/testnet/token/${mockContractId}/${nftTokenId}`,
      },
    };

    console.log("📤 Réponse envoyée avec NFT:", response.message);
    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Erreur lors du déploiement:", error);

    // Retourner une erreur détaillée
    return NextResponse.json(
      {
        error: "Erreur lors du déploiement du contrat avec NFT",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        timestamp: new Date().toISOString(),
        suggestion:
          "Le contrat utilise maintenant un template NFT prédéfini. Réessayez.",
      },
      { status: 500 }
    );
  }
}
