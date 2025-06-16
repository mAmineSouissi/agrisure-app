import { supabase } from "./supabase"

export interface SystemEvent {
  event_type: string
  title: string
  description: string
  status?: "completed" | "in-progress" | "failed"
  details?: string
  user_id?: string
}

export class EventTracker {
  // Enregistrer un nouvel événement
  static async trackEvent(event: SystemEvent) {
    try {
      const { data, error } = await supabase
        .from("system_events")
        .insert([
          {
            event_type: event.event_type,
            title: event.title,
            description: event.description,
            status: event.status || "completed",
            details: event.details || {},
            user_id: event.user_id,
          },
        ])
        .select()

      if (error) throw error
      console.log("✅ Événement enregistré:", event.title)
      return data[0]
    } catch (error) {
      console.error("❌ Erreur enregistrement événement:", error)
      return null
    }
  }

  // Enregistrer l'exécution d'un workflow
  static async trackWorkflowExecution(workflow: {
    name: string
    type: string
    status: "success" | "failed" | "running"
    executionTime?: number
    dataProcessed?: number
    description?: string
  }) {
    try {
      const { data, error } = await supabase
        .from("n8n_workflow_executions")
        .insert([
          {
            workflow_name: workflow.name,
            workflow_type: workflow.type,
            status: workflow.status,
            execution_time: workflow.executionTime,
            data_processed: workflow.dataProcessed,
            description: workflow.description,
          },
        ])
        .select()

      if (error) throw error
      console.log("✅ Workflow enregistré:", workflow.name)
      return data[0]
    } catch (error) {
      console.error("❌ Erreur enregistrement workflow:", error)
      return null
    }
  }

  // Enregistrer le déploiement d'un contrat
  static async trackContractDeployment(contract: {
    userId: string
    contractType: string
    contractAddress?: string
    network: string
    coverageAmount: number
    status: "pending" | "deployed" | "failed"
    deploymentHash?: string
  }) {
    try {
      const { data, error } = await supabase
        .from("smart_contracts")
        .insert([
          {
            user_id: contract.userId,
            contract_type: contract.contractType,
            contract_address: contract.contractAddress,
            blockchain_network: contract.network,
            coverage_amount: contract.coverageAmount,
            status: contract.status,
            deployment_hash: contract.deploymentHash,
            deployed_at: contract.status === "deployed" ? new Date().toISOString() : null,
          },
        ])
        .select()

      if (error) throw error
      console.log("✅ Contrat enregistré:", contract.contractType)
      return data[0]
    } catch (error) {
      console.error("❌ Erreur enregistrement contrat:", error)
      return null
    }
  }

  // Récupérer les événements récents
  static async getRecentEvents(limit = 10) {
    try {
      const { data, error } = await supabase
        .from("system_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("❌ Erreur récupération événements:", error)
      return []
    }
  }

  // Récupérer les workflows récents
  static async getRecentWorkflows(limit = 5) {
    try {
      const { data, error } = await supabase
        .from("n8n_workflow_executions")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("❌ Erreur récupération workflows:", error)
      return []
    }
  }

  // Récupérer les contrats récents
  static async getRecentContracts(limit = 5) {
    try {
      const { data, error } = await supabase
        .from("smart_contracts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("❌ Erreur récupération contrats:", error)
      return []
    }
  }
}
