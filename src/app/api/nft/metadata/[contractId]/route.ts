import { NextRequest, NextResponse } from "next/server"
import { aiContractGenerator } from "@/lib/ai-contract-generator"

export async function GET(req: NextRequest, { params }: { params: { contractId: string } }) {
  const { searchParams } = new URL(req.url)
  const insuranceType = searchParams.get("type") || "Assurance Sécheresse"
  const coverageAmount = Number(searchParams.get("coverage") || 1000)
  const premiumAmount = Number(searchParams.get("premium") || 50)
  const conditions = (searchParams.get("conditions") || "").split(",").filter(Boolean)
  const triggers = (searchParams.get("triggers") || "").split(",").filter(Boolean)

  const requirements = {
    insuranceType,
    coverageAmount,
    premiumAmount,
    conditions,
    triggers,
  }

  const metadata = aiContractGenerator.generateNFTMetadata(requirements, params.contractId)
  return NextResponse.json(metadata)
}