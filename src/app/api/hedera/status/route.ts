import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Vérifier si les variables d'environnement Hedera sont configurées
    const accountId = process.env.HEDERA_ACCOUNT_ID
    const privateKey = process.env.HEDERA_PRIVATE_KEY

    if (!accountId || !privateKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "Variables d'environnement Hedera manquantes",
          configured: false,
        },
        { status: 500 },
      )
    }

    // Simuler une vérification de connectivité
    // En production, vous pourriez faire un appel réel à l'API Hedera
    return NextResponse.json({
      status: "connected",
      network: "testnet",
      accountId: accountId,
      configured: true,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Erreur de connexion Hedera",
        configured: false,
      },
      { status: 500 },
    )
  }
}
