import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch(
            `${process.env.AUTH_BACKEND_URL}/auth/google`
        );
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching Google Auth URL:", error);
        return NextResponse.json(
            { error: "Failed to fetch Google Auth URL" },
            { status: 500 }
        );
    }
}
