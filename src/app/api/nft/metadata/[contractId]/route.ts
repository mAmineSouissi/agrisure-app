import { NextRequest, NextResponse } from "next/server";
import { aiContractGenerator } from "@/lib/ai-contract-generator";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  // The pathname is something like /api/nft/metadata/[contractId]
  // We split and get the last segment which is the contractId
  const pathSegments = url.pathname.split('/');
  const contractId = pathSegments[pathSegments.length - 1];

  // Then get the query params
  const insuranceType = url.searchParams.get("type") || "Assurance Sécheresse";
  const coverageAmount = Number(url.searchParams.get("coverage") || 1000);
  const premiumAmount = Number(url.searchParams.get("premium") || 50);
  const conditions = (url.searchParams.get("conditions") || "").split(",").filter(Boolean);
  const triggers = (url.searchParams.get("triggers") || "").split(",").filter(Boolean);

  const requirements = {
    insuranceType,
    coverageAmount,
    premiumAmount,
    conditions,
    triggers,
  };

  // Call your AI metadata generator with the contractId and requirements
  const metadata = aiContractGenerator.generateNFTMetadata(requirements, contractId);

  return NextResponse.json(metadata);
}
