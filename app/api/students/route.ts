import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStudentsWithLatestScore } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "counsellor") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const students = getStudentsWithLatestScore();
  return NextResponse.json({ students });
}
