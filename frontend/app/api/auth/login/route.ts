import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Make a call to the actual authentication API
    const apiUrl = process.env.BACKEND_API_URL || "localhost:3000/api/v1";
    const authEndpoint = "/auth/login";
    const apiResponse = await fetch(`${apiUrl}${authEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json(
        { message: errorData.message || "Authentication failed" },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();

    // Set the auth token in an HTTP-only, secure cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: "/",
    });

    // Return a success response without the token (since it's now in HTTP-only cookies)
    return NextResponse.json({
      message: "Login successful",
      user: { email },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
