// import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, password } = body;

    // Basic validation
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Make a call to the actual authentication API
    // Make a call to the actual authentication API
    const apiUrl = process.env.BACKEND_API_URL || "localhost:3000/api/v1";
    const authEndpoint = "/auth/register";

    const apiResponse = await fetch(`${apiUrl}${authEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        password,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      return NextResponse.json(
        { message: errorData.message || "Registration failed" },
        { status: apiResponse.status }
      );
    }

    // const data = await apiResponse.json();

    // In some registration flows, you might want to set the auth token immediately
    // But for this implementation, we'll just return success and expect the user to log in
    // If you want to automatically log the user in after registration, you would set cookies here

    // Return a success response
    return NextResponse.json({
      message: "Registration successful! Please log in.",
      user: { email },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
