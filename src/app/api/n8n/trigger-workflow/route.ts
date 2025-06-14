import { type NextRequest, NextResponse } from "next/server"
import { n8nService } from "@/lib/n8n-integration"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Déclenchement workflow n8n...")

    const body = await request.json()
    const { workflowType, data } = body

    console.log(`📋 Type de workflow: ${workflowType}`)
    console.log(`📊 Données:`, JSON.stringify(data, null, 2))

    switch (workflowType) {
      case "weather-monitoring":
        await n8nService.triggerWeatherMonitoring(data.farmId)
        break

      case "sensor-processing":
        await n8nService.processSensorData(data)
        break

      case "automatic-payment":
        await n8nService.triggerAutomaticPayment(data.farmerId, data.amount, data.eventType)
        break

      case "contract-deployed":
        await n8nService.triggerContractDeployment(data.contractId, data.type, data.coverage)
        break

      case "crop-recommendations":
        const recommendations = await n8nService.generateCropRecommendations(
          data.farmId,
          data.weatherData,
          data.soilData,
        )
        return NextResponse.json({
          success: true,
          message: `Workflow ${workflowType} déclenché avec succès`,
          data: { recommendations },
          timestamp: new Date().toISOString(),
        })

      default:
        console.warn(`⚠️ Type de workflow non supporté: ${workflowType}`)
        return NextResponse.json(
          {
            error: "Type de workflow non supporté",
            supportedTypes: [
              "weather-monitoring",
              "sensor-processing",
              "automatic-payment",
              "crop-recommendations",
              "contract-deployed",
            ],
          },
          { status: 400 },
        )
    }

    console.log(`✅ Workflow ${workflowType} déclenché avec succès`)

    return NextResponse.json({
      success: true,
      message: `Workflow ${workflowType} déclenché avec succès`,
      timestamp: new Date().toISOString(),
      n8nAvailable: true,
    })
  } catch (error) {
    console.error("❌ Erreur lors du déclenchement du workflow:", error)

    return NextResponse.json(
      {
        error: "Erreur lors du déclenchement du workflow",
        details: error instanceof Error ? error.message : "Erreur inconnue",
        timestamp: new Date().toISOString(),
        suggestion: "Vérifiez que n8n est démarré sur http://localhost:5678",
      },
      { status: 500 },
    )
  }
}
