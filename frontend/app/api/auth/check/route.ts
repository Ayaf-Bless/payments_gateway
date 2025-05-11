import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth";

export async function GET() {
  const token = await getAuthToken();
  return NextResponse.json({ authenticated: !!token, token }, { status: 200 });
}
