import { NextResponse } from "next/server"

export async function GET() {
  try {
    const n8nUrl = process.env.N8N_BASE_URL || "http://localhost:5678"
    const n8nApiKey = process.env.N8N_API_KEY

    if (!n8nApiKey) {
      return NextResponse.json(
        {
          status: "disconnected",
          message: "Clé API n8n manquante - Mode simulation activé",
          mode: "simulation",
        },
        { status: 200 },
      )
    }

    // Tenter de contacter n8n
    try {
      const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
        headers: {
          "X-N8N-API-KEY": n8nApiKey,
        },
        signal: AbortSignal.timeout(5000), // Timeout de 5 secondes
      })

      if (response.ok) {
        const workflows = await response.json()
        return NextResponse.json({
          status: "connected",
          url: n8nUrl,
          workflowCount: workflows.data?.length || 0,
          mode: "real",
          timestamp: new Date().toISOString(),
        })
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (fetchError) {
      return NextResponse.json(
        {
          status: "disconnected",
          message: "n8n non accessible - Mode simulation activé",
          mode: "simulation",
          error: fetchError instanceof Error ? fetchError.message : "Erreur inconnue",
        },
        { status: 200 },
      )
    }
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Erreur de configuration n8n",
        mode: "simulation",
      },
      { status: 500 },
    )
  }
}
