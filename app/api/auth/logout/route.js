import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ status: "logged_out" });

  // Clear the token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0, // expire immediately
  });

  return response;
}
