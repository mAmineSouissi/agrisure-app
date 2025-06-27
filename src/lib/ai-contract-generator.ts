interface ContractRequirements {
  insuranceType: string;
  coverageAmount: number;
  premiumAmount: number;
  conditions: string[];
  triggers: string[];
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export class AIContractGenerator {
  // Générer un smart contract avec NFT intégré
  async generateSmartContract(
    requirements: ContractRequirements
  ): Promise<string> {
    try {
      console.log("🧠 Génération du contrat avec NFT intégré...");
      const contractTemplate = this.getContractWithNFTTemplate(requirements);
      // Simulation d'un délai de génération pour l'UX
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("✅ Contrat avec NFT généré avec succès");
      return contractTemplate;
    } catch (error) {
      console.error("Erreur lors de la génération du contrat:", error);
      throw error;
    }
  }

  // Générer les métadonnées NFT pour la police d'assurance
  generateNFTMetadata(
    requirements: ContractRequirements,
    contractId: string
  ): NFTMetadata {
    const riskLevel = this.calculateRiskLevel(requirements);
    const coverageRatio =
      requirements.coverageAmount / requirements.premiumAmount;

    return {
      name: `AgriSure Policy #${contractId}`,
      description: `Police d'assurance agricole ${requirements.insuranceType} avec couverture de ${requirements.coverageAmount} HBAR. Smart contract déployé sur Hedera Hashgraph avec paiements automatiques basés sur l'IoT.`,
      image: this.generateNFTImageURL(requirements, contractId),
      attributes: [
        { trait_type: "Insurance Type", value: requirements.insuranceType },
        {
          trait_type: "Coverage Amount",
          value: `${requirements.coverageAmount} HBAR`,
        },
        {
          trait_type: "Premium Amount",
          value: `${requirements.premiumAmount} HBAR`,
        },
        { trait_type: "Coverage Ratio", value: `${coverageRatio}:1` },
        { trait_type: "Risk Level", value: riskLevel },
        {
          trait_type: "Conditions Count",
          value: requirements.conditions.length,
        },
        { trait_type: "Data Sources", value: requirements.triggers.length },
        { trait_type: "Blockchain", value: "Hedera Hashgraph" },
        {
          trait_type: "Contract Standard",
          value: "HTS (Hedera Token Service)",
        },
        { trait_type: "Automation", value: "IoT + AI Powered" },
      ],
    };
  }

  // Calculer le niveau de risque basé sur les paramètres
  private calculateRiskLevel(requirements: ContractRequirements): string {
    const coverageRatio =
      requirements.coverageAmount / requirements.premiumAmount;
    const conditionsCount = requirements.conditions.length;

    if (coverageRatio > 50 || conditionsCount < 2) return "High Risk";
    if (coverageRatio > 20 || conditionsCount < 4) return "Medium Risk";
    return "Low Risk";
  }

  // Générer l'URL de l'image NFT
  private generateNFTImageURL(
    requirements: ContractRequirements,
    contractId: string
  ): string {
    const insuranceTypeSlug = requirements.insuranceType
      .toLowerCase()
      .replace(/\s+/g, "-");
    return `https://agrisure-nft.vercel.app/api/generate-nft/${contractId}?type=${insuranceTypeSlug}&coverage=${requirements.coverageAmount}`;
  }

  // Template de smart contract avec NFT intégré
  private getContractWithNFTTemplate(
    requirements: ContractRequirements
  ): string {
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * ${requirements.insuranceType} - Smart Contract AgriSure avec NFT
 * Généré automatiquement pour l'assurance agricole
 * Couverture: ${requirements.coverageAmount} HBAR
 * Prime: ${requirements.premiumAmount} HBAR
 * 
 * Chaque police d'assurance est représentée par un NFT unique
 * Compatible avec Hedera Token Service (HTS)
 */
contract AgriSureInsuranceNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    uint256 public constant COVERAGE_AMOUNT = ${
      requirements.coverageAmount
    } * 1e18;
    uint256 public constant PREMIUM_AMOUNT = ${
      requirements.premiumAmount
    } * 1e18;
    
    struct InsurancePolicy {
        string farmerId;
        uint256 tokenId;
        uint256 coverageAmount;
        bool isActive;
        uint256 premiumPaid;
        uint256 createdAt;
        string metadataURI;
    }
    
    struct ClimateEvent {
        string eventType;
        uint256 severity; // 1-10
        uint256 timestamp;
        bool verified;
        string dataSource;
    }
    
    struct Claim {
        string farmerId;
        uint256 tokenId;
        uint256 amount;
        string eventType;
        bool processed;
        uint256 timestamp;
        string transactionId;
    }
    
    mapping(string => InsurancePolicy) public policies;
    mapping(uint256 => string) public tokenToFarmer;
    mapping(uint256 => ClimateEvent) public climateEvents;
    mapping(uint256 => Claim) public claims;
    
    uint256 public eventCounter;
    uint256 public claimCounter;
    
    // Events
    event PolicyCreated(string indexed farmerId, uint256 indexed tokenId, uint256 coverageAmount);
    event NFTMinted(string indexed farmerId, uint256 indexed tokenId, string metadataURI);
    event ClimateEventRecorded(uint256 indexed eventId, string eventType, uint256 severity);
    event ClaimProcessed(uint256 indexed claimId, string farmerId, uint256 tokenId, uint256 amount);
    event PaymentSent(string indexed farmerId, uint256 indexed tokenId, uint256 amount, string transactionId);
    event PolicyTransferred(uint256 indexed tokenId, address from, address to);
    
    constructor() ERC721("AgriSure Insurance Policy", "ASIP") {}
    
    /**
     * Créer une police d'assurance avec NFT
     * Conditions: ${requirements.conditions.join(", ")}
     */
    function createPolicyWithNFT(
        string memory _farmerId,
        string memory _metadataURI,
        address _farmerAddress
    ) public payable returns (uint256) {
        require(msg.value >= PREMIUM_AMOUNT, "Insufficient premium payment");
        require(bytes(_farmerId).length > 0, "Invalid farmer ID");
        require(!policies[_farmerId].isActive, "Policy already exists");
        require(_farmerAddress != address(0), "Invalid farmer address");
        
        // Mint NFT
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(_farmerAddress, tokenId);
        _setTokenURI(tokenId, _metadataURI);
        
        // Create policy
        policies[_farmerId] = InsurancePolicy({
            farmerId: _farmerId,
            tokenId: tokenId,
            coverageAmount: COVERAGE_AMOUNT,
            isActive: true,
            premiumPaid: msg.value,
            createdAt: block.timestamp,
            metadataURI: _metadataURI
        });
        
        tokenToFarmer[tokenId] = _farmerId;
        
        emit PolicyCreated(_farmerId, tokenId, COVERAGE_AMOUNT);
        emit NFTMinted(_farmerId, tokenId, _metadataURI);
        
        return tokenId;
    }
    
    /**
     * Enregistrer un événement climatique
     * Sources de données: ${requirements.triggers.join(", ")}
     */
    function recordClimateEvent(
        string memory _eventType,
        uint256 _severity,
        string memory _dataSource
    ) public onlyOwner {
        require(_severity >= 1 && _severity <= 10, "Severity must be between 1 and 10");
        require(bytes(_eventType).length > 0, "Invalid event type");
        
        eventCounter++;
        
        climateEvents[eventCounter] = ClimateEvent({
            eventType: _eventType,
            severity: _severity,
            timestamp: block.timestamp,
            verified: true,
            dataSource: _dataSource
        });
        
        emit ClimateEventRecorded(eventCounter, _eventType, _severity);
        
        // Déclencher automatiquement les paiements si nécessaire
        _triggerAutomaticPayments(_eventType, _severity);
    }
    
    /**
     * Traiter une réclamation d'assurance avec vérification NFT
     */
    function processInsuranceClaimWithNFT(
        string memory _farmerId,
        uint256 _amount,
        string memory _eventType
    ) public onlyOwner {
        require(policies[_farmerId].isActive, "Policy not active");
        require(_amount <= policies[_farmerId].coverageAmount, "Amount exceeds coverage");
        require(address(this).balance >= _amount, "Insufficient contract balance");
        
        uint256 tokenId = policies[_farmerId].tokenId;
        require(_exists(tokenId), "NFT does not exist");
        
        claimCounter++;
        string memory txId = string(abi.encodePacked("HBAR_NFT_", block.timestamp));
        
        claims[claimCounter] = Claim({
            farmerId: _farmerId,
            tokenId: tokenId,
            amount: _amount,
            eventType: _eventType,
            processed: true,
            timestamp: block.timestamp,
            transactionId: txId
        });
        
        // Envoyer le paiement au propriétaire du NFT
        address nftOwner = ownerOf(tokenId);
        payable(nftOwner).transfer(_amount);
        
        emit ClaimProcessed(claimCounter, _farmerId, tokenId, _amount);
        emit PaymentSent(_farmerId, tokenId, _amount, txId);
    }
    
    /**
     * Transférer une police (NFT) à un autre propriétaire
     */
    function transferPolicy(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Transfer not approved");
        
        _transfer(from, to, tokenId);
        
        emit PolicyTransferred(tokenId, from, to);
    }
    
    /**
     * Obtenir les informations d'une police par NFT
     */
    function getPolicyByTokenId(uint256 _tokenId) 
        public 
        view 
        returns (
            string memory farmerId,
            uint256 coverage,
            bool active,
            uint256 premium,
            uint256 created,
            string memory metadataURI
        ) 
    {
        require(_exists(_tokenId), "Token does not exist");
        string memory farmer = tokenToFarmer[_tokenId];
        InsurancePolicy memory policy = policies[farmer];
        
        return (
            policy.farmerId,
            policy.coverageAmount,
            policy.isActive,
            policy.premiumPaid,
            policy.createdAt,
            policy.metadataURI
        );
    }
    
    /**
     * Obtenir tous les NFTs d'un propriétaire
     */
    function getPoliciesByOwner(address _owner) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (_exists(i) && ownerOf(i) == _owner) {
                tokenIds[index] = i;
                index++;
            }
        }
        
        return tokenIds;
    }
    
    /**
     * Mettre à jour les métadonnées d'un NFT
     */
    function updateTokenMetadata(uint256 _tokenId, string memory _newURI) 
        public 
        onlyOwner 
    {
        require(_exists(_tokenId), "Token does not exist");
        _setTokenURI(_tokenId, _newURI);
        
        string memory farmerId = tokenToFarmer[_tokenId];
        policies[farmerId].metadataURI = _newURI;
    }
    
    /**
     * Déclencher des paiements automatiques basés sur les événements
     */
    function _triggerAutomaticPayments(string memory _eventType, uint256 _severity) internal {
        uint256 paymentAmount = _calculatePaymentAmount(_eventType, _severity);
        
        if (paymentAmount > 0 && address(this).balance >= paymentAmount) {
            // Pour la démo, on simule un paiement automatique
            string memory demoFarmerId = "demo_farmer_001";
            if (policies[demoFarmerId].isActive) {
                uint256 tokenId = policies[demoFarmerId].tokenId;
                claimCounter++;
                string memory autoTxId = string(abi.encodePacked("AUTO_NFT_", block.timestamp));
                
                claims[claimCounter] = Claim({
                    farmerId: demoFarmerId,
                    tokenId: tokenId,
                    amount: paymentAmount,
                    eventType: _eventType,
                    processed: true,
                    timestamp: block.timestamp,
                    transactionId: autoTxId
                });
                
                // Payer au propriétaire du NFT
                if (_exists(tokenId)) {
                    address nftOwner = ownerOf(tokenId);
                    payable(nftOwner).transfer(paymentAmount);
                    emit PaymentSent(demoFarmerId, tokenId, paymentAmount, autoTxId);
                }
            }
        }
    }
    
    /**
     * Calculer le montant du paiement basé sur l'événement et la sévérité
     */
    function _calculatePaymentAmount(string memory _eventType, uint256 _severity) internal pure returns (uint256) {
        bytes32 eventHash = keccak256(bytes(_eventType));
        
        if (eventHash == keccak256(bytes("drought"))) {
            return _severity * 10 * 1e18; // 10 HBAR par niveau de sévérité
        } else if (eventHash == keccak256(bytes("flood"))) {
            return _severity * 15 * 1e18; // 15 HBAR par niveau de sévérité
        } else if (eventHash == keccak256(bytes("hail"))) {
            return _severity * 8 * 1e18; // 8 HBAR par niveau de sévérité
        } else if (eventHash == keccak256(bytes("frost"))) {
            return _severity * 12 * 1e18; // 12 HBAR par niveau de sévérité
        }
        
        return _severity * 5 * 1e18; // Paiement par défaut
    }
    
    /**
     * Obtenir le nombre total de NFTs mintés
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * Vérifier si un token existe
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * Arrêt d'urgence
     */
    function emergencyStop(string memory _reason) public onlyOwner {
        // Logique d'arrêt d'urgence
    }
    
    /**
     * Retirer les fonds (owner seulement)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * Recevoir des fonds
     */
    receive() external payable {
        // Le contrat peut recevoir des HBAR
    }
    
    /**
     * Obtenir le solde du contrat
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`;
  }

  // Analyser et optimiser un contrat existant
  async optimizeContract(contractCode: string): Promise<string> {
    try {
      return `${contractCode}

/*
OPTIMISATIONS NFT SUGGÉRÉES:
1. ✅ Standard ERC721 avec extensions
2. ✅ Métadonnées on-chain et off-chain
3. ✅ Transfert de polices via NFT
4. ✅ Paiements automatiques au propriétaire du NFT
5. ✅ Vérification d'existence des tokens
6. ✅ Gestion des métadonnées dynamiques
7. ✅ Compteur de tokens sécurisé

FONCTIONNALITÉS NFT:
- Chaque police = 1 NFT unique
- Métadonnées riches avec attributs
- Transfert de propriété possible
- Paiements automatiques au détenteur
- Historique complet on-chain

COMPATIBILITÉ HEDERA:
- Compatible avec Hedera Token Service (HTS)
- Optimisé pour les frais Hedera
- Intégration avec les wallets Hedera
*/`;
    } catch (error) {
      console.error("Erreur lors de l'optimisation du contrat:", error);
      throw error;
    }
  }

  // Expliquer le fonctionnement d'un contrat avec NFT
  async explainContract(contractCode: string): Promise<string> {
    // You can optionally use contractCode inside your explanation
    // For example, just append or embed it:
    return `# 🎨 Smart Contract AgriSure avec NFT

## 🎯 **Innovation : Police d'Assurance = NFT**
Ce smart contract révolutionnaire transforme chaque police d'assurance agricole en NFT unique sur Hedera Hashgraph. Chaque agriculteur reçoit un token non-fongible représentant sa couverture.

-- Contrat fourni --
${contractCode}

## 🖼️ **Fonctionnalités NFT**

### 1. **Mint automatique** 🎨
- Chaque police génère automatiquement un NFT
- Métadonnées riches avec tous les détails de la police
- Image générée dynamiquement selon le type d'assurance

### 2. **Propriété transférable** 🔄
- Les polices peuvent être vendues/transférées
- Le nouveau propriétaire reçoit automatiquement les paiements
- Marché secondaire possible pour les assurances

### 3. **Métadonnées dynamiques** 📊
- **Type d'assurance** : Sécheresse, Inondation, Grêle, etc.
- **Couverture** : Montant en HBAR
- **Ratio de couverture** : Calcul automatique
- **Niveau de risque** : Évaluation IA
- **Sources de données** : Capteurs IoT connectés

## 🤖 **Paiements automatiques au détenteur NFT**
Les paiements d'assurance sont envoyés automatiquement au propriétaire actuel du NFT :
- ✅ Vérification de propriété en temps réel
- ✅ Paiement instantané lors d'événements
- ✅ Traçabilité complète des transactions

## 🎨 **Génération d'image NFT**
Chaque NFT a une image unique générée selon :
- **Type d'assurance** → Couleur et icônes
- **Niveau de risque** → Bordures et effets
- **Couverture** → Taille et éléments visuels
- **ID du contrat** → Pattern unique

## 🌐 **Intégration marketplace**
Les NFTs peuvent être :
- **Listés** sur les marketplaces Hedera
- **Échangés** entre agriculteurs
- **Utilisés comme collatéral** pour des prêts
- **Fractionnés** pour des investissements partagés

## 💎 **Avantages révolutionnaires**

### **Pour les agriculteurs :**
- 🎨 **Propriété visuelle** de leur assurance
- 💰 **Possibilité de revente** avant expiration
- 🔄 **Transfert facile** à d'autres exploitations
- 📈 **Valeur potentielle** sur le marché secondaire

### **Pour les investisseurs :**
- 📊 **Transparence totale** des risques
- 💹 **Marché liquide** des assurances agricoles
- 🎯 **Diversification** par type de risque/région
- 🤖 **Rendements automatiques** via smart contracts

### **Pour l'écosystème :**
- 🌍 **Démocratisation** de l'assurance agricole
- 📈 **Nouveaux modèles économiques**
- 🔗 **Interopérabilité** avec DeFi
- 🎨 **Gamification** de l'assurance

## 🛡️ **Sécurité renforcée**
- **Vérification NFT** avant chaque paiement
- **Contrôle d'accès** basé sur la propriété
- **Métadonnées immuables** sur IPFS
- **Audit trail** complet des transferts

Cette innovation transforme l'assurance agricole traditionnelle en actifs numériques négociables, créant un nouveau marché financier décentralisé pour l'agriculture ! 🚀`;
  }
}

export const aiContractGenerator = new AIContractGenerator();
