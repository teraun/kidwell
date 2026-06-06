import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const rows = await query(
      `SELECT id, username, role, full_name, age, parent_id
       FROM users WHERE username = $1 AND password = $2`,
      [username, password]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const user = rows[0];
    const res = NextResponse.json({ user });
    res.cookies.set(SESSION_COOKIE, String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    );
  }
}
