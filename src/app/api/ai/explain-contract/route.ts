import { type NextRequest, NextResponse } from "next/server"
import { aiContractGenerator } from "@/lib/ai-contract-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contractCode } = body

    // Expliquer le contrat
    const explanation = await aiContractGenerator.explainContract(contractCode)

    return NextResponse.json({
      success: true,
      explanation,
    })
  } catch (error) {
    console.error("Erreur lors de l'explication:", error)
    return NextResponse.json({ error: "Erreur lors de l'explication du contrat" }, { status: 500 })
  }
}
