import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, amount = 99000, description = "AI CAVE Pro Plan Subscription" } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid payment token is required." },
        { status: 400 },
      );
    }

    const secretKey = process.env.OMISE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "Payment service is not configured." },
        { status: 500 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const omise = require("omise")({ secretKey, omiseVersion: "2019-05-29" });

    const charge = await omise.charges.create({
      amount,       // in satangs: 99000 = ฿990
      currency: "thb",
      card: token,
      description,
      capture: true,
    });

    if (charge.status === "successful") {
      return NextResponse.json({ success: true, chargeId: charge.id });
    }

    return NextResponse.json(
      { success: false, message: charge.failure_message ?? "Payment was declined." },
      { status: 402 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
