import {
  Client,
  PrivateKey,
  AccountId,
  ContractCreateTransaction,
  ContractExecuteTransaction,
  ContractCallQuery,
  Hbar,
  FileCreateTransaction,
  type ContractId,
} from "@hashgraph/sdk"

// Configuration Hedera
const client = Client.forTestnet()

// Remplacez par vos vraies clés Hedera
const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID || "0.0.123456")
const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY || "your-private-key")

client.setOperator(operatorId, operatorKey)

export class HederaService {
  private client: Client

  constructor() {
    this.client = client
  }

  // Déployer un smart contract d'assurance
  async deployInsuranceContract(bytecode: string): Promise<ContractId> {
    try {
      // 1. Créer un fichier avec le bytecode
      const fileCreateTx = new FileCreateTransaction()
        .setContents(bytecode)
        .setKeys([operatorKey])
        .setMaxTransactionFee(new Hbar(2))

      const fileCreateSubmit = await fileCreateTx.execute(this.client)
      const fileCreateReceipt = await fileCreateSubmit.getReceipt(this.client)
      const bytecodeFileId = fileCreateReceipt.fileId

      console.log("Bytecode file ID:", bytecodeFileId?.toString())

      // 2. Déployer le contrat
      const contractCreateTx = new ContractCreateTransaction()
        .setBytecodeFileId(bytecodeFileId!)
        .setGas(100000)
        .setConstructorParameters(new (require("@hashgraph/sdk").ContractFunctionParameters)())

      const contractCreateSubmit = await contractCreateTx.execute(this.client)
      const contractCreateReceipt = await contractCreateSubmit.getReceipt(this.client)
      const contractId = contractCreateReceipt.contractId

      console.log("Contract deployed with ID:", contractId?.toString())
      return contractId!
    } catch (error) {
      console.error("Erreur lors du déploiement du contrat:", error)
      throw error
    }
  }

  // Déclencher un paiement automatique
  async triggerAutomaticPayment(
    contractId: ContractId,
    farmerId: string,
    amount: number,
    eventType: string,
  ): Promise<string> {
    try {
      const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(
          "processInsuranceClaim",
          // Paramètres du smart contract
          new (require("@hashgraph/sdk").ContractFunctionParameters)()
            .addString(farmerId)
            .addUint256(amount * 100)
            .addString(eventType), // amount en centimes
        )
        .setPayableAmount(new Hbar(amount))

      const contractExecuteSubmit = await contractExecuteTx.execute(this.client)
      const contractExecuteReceipt = await contractExecuteSubmit.getReceipt(this.client)

      const transactionId = contractExecuteSubmit.transactionId.toString()
      console.log("Paiement automatique déclenché:", transactionId)

      return transactionId
    } catch (error) {
      console.error("Erreur lors du paiement automatique:", error)
      throw error
    }
  }

  // Vérifier le statut d'un contrat
  async getContractInfo(contractId: ContractId, functionName: string): Promise<any> {
    try {
      const contractCallQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(functionName)

      const contractCallResult = await contractCallQuery.execute(this.client)
      return contractCallResult
    } catch (error) {
      console.error("Erreur lors de la requête du contrat:", error)
      throw error
    }
  }
}

export const hederaService = new HederaService()
