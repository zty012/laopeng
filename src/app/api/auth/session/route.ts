import { NextResponse } from "next/server";
import { signJWT } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await req.text();

    const token = await signJWT({});

    const response = NextResponse.json({ success: true });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
