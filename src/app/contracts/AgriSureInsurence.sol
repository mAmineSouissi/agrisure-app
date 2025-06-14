// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgriSureInsurance {
    address public owner;
    
    struct InsurancePolicy {
        string farmerId;
        uint256 coverageAmount;
        bool isActive;
        uint256 premiumPaid;
    }
    
    struct ClimateEvent {
        string eventType;
        uint256 severity; // 1-10
        uint256 timestamp;
        bool verified;
    }
    
    struct Claim {
        string farmerId;
        uint256 amount;
        string eventType;
        bool processed;
        uint256 timestamp;
    }
    
    mapping(string => InsurancePolicy) public policies;
    mapping(uint256 => ClimateEvent) public climateEvents;
    mapping(uint256 => Claim) public claims;
    
    uint256 public eventCounter;
    uint256 public claimCounter;
    
    event PolicyCreated(string farmerId, uint256 coverageAmount);
    event ClimateEventRecorded(uint256 eventId, string eventType, uint256 severity);
    event ClaimProcessed(uint256 claimId, string farmerId, uint256 amount);
    event PaymentSent(string farmerId, uint256 amount, string transactionId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Créer une police d'assurance
    function createPolicy(
        string memory _farmerId,
        uint256 _coverageAmount
    ) public payable {
        require(msg.value > 0, "Premium must be paid");
        
        policies[_farmerId] = InsurancePolicy({
            farmerId: _farmerId,
            coverageAmount: _coverageAmount,
            isActive: true,
            premiumPaid: msg.value
        });
        
        emit PolicyCreated(_farmerId, _coverageAmount);
    }
    
    // Enregistrer un événement climatique (appelé par les capteurs IoT)
    function recordClimateEvent(
        string memory _eventType,
        uint256 _severity
    ) public onlyOwner {
        eventCounter++;
        
        climateEvents[eventCounter] = ClimateEvent({
            eventType: _eventType,
            severity: _severity,
            timestamp: block.timestamp,
            verified: true
        });
        
        emit ClimateEventRecorded(eventCounter, _eventType, _severity);
        
        // Déclencher automatiquement les paiements si nécessaire
        _triggerAutomaticPayments(_eventType, _severity);
    }
    
    // Traiter une réclamation d'assurance
    function processInsuranceClaim(
        string memory _farmerId,
        uint256 _amount,
        string memory _eventType
    ) public payable onlyOwner {
        require(policies[_farmerId].isActive, "Policy not active");
        require(_amount <= policies[_farmerId].coverageAmount, "Amount exceeds coverage");
        
        claimCounter++;
        
        claims[claimCounter] = Claim({
            farmerId: _farmerId,
            amount: _amount,
            eventType: _eventType,
            processed: true,
            timestamp: block.timestamp
        });
        
        // Envoyer le paiement
        payable(msg.sender).transfer(_amount);
        
        emit ClaimProcessed(claimCounter, _farmerId, _amount);
        emit PaymentSent(_farmerId, _amount, "HBAR_AUTO_PAYMENT");
    }
    
    // Déclencher des paiements automatiques basés sur les événements
    function _triggerAutomaticPayments(
        string memory _eventType,
        uint256 _severity
    ) internal {
        uint256 paymentAmount = _calculatePaymentAmount(_eventType, _severity);
        
        if (paymentAmount > 0) {
            // Logique pour identifier les fermiers affectés
            // Pour la démo, on simule un paiement
            emit PaymentSent("demo_farmer", paymentAmount, "AUTO_TRIGGER");
        }
    }
    
    // Calculer le montant du paiement basé sur l'événement
    function _calculatePaymentAmount(
        string memory _eventType,
        uint256 _severity
    ) internal pure returns (uint256) {
        if (keccak256(bytes(_eventType)) == keccak256(bytes("drought"))) {
            return _severity * 10 * 1e18; // 10 HBAR par niveau de sévérité
        } else if (keccak256(bytes(_eventType)) == keccak256(bytes("flood"))) {
            return _severity * 15 * 1e18; // 15 HBAR par niveau de sévérité
        } else if (keccak256(bytes(_eventType)) == keccak256(bytes("hail"))) {
            return _severity * 8 * 1e18; // 8 HBAR par niveau de sévérité
        }
        return 0;
    }
    
    // Obtenir les informations d'une police
    function getPolicyInfo(string memory _farmerId) 
        public 
        view 
        returns (uint256, bool, uint256) 
    {
        InsurancePolicy memory policy = policies[_farmerId];
        return (policy.coverageAmount, policy.isActive, policy.premiumPaid);
    }
    
    // Retirer les fonds (owner seulement)
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    // Recevoir des fonds
    receive() external payable {}
}
