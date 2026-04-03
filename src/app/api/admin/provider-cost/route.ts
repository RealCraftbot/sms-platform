import { NextResponse } from "next/server"
import { getBestSupplier } from "@/lib/suppliers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const service = searchParams.get("service")
    const country = searchParams.get("country")
    const platform = searchParams.get("platform")

    if (!type || !service) {
      return NextResponse.json(
        { error: "Missing required parameters: type and service" },
        { status: 400 }
      )
    }

    let category: "SMS" | "BOOSTING" | "ACCOUNTS"
    
    switch (type) {
      case "SMS_NUMBER":
        category = "SMS"
        break
      case "SOCIAL_BOOST":
        category = "BOOSTING"
        break
      case "SOCIAL_LOG":
        category = "ACCOUNTS"
        break
      default:
        return NextResponse.json(
          { error: "Invalid service type" },
          { status: 400 }
        )
    }

    const provider = await getBestSupplier(category)

    if (!provider) {
      return NextResponse.json(
        { error: "No available provider for this service type" },
        { status: 404 }
      )
    }

    const costResult = await provider.getCost(service, country ?? undefined)

    if (!costResult.success) {
      return NextResponse.json(
        { error: costResult.message || "Failed to fetch cost from provider" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      cost: costResult.cost,
      currency: costResult.currency ?? (category === "SMS" ? "RUB" : "USD"),
      stock: costResult.stock,
      provider: provider.name,
    })
  } catch (error) {
    console.error("Provider cost API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
