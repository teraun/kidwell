import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Parent: view their child's profile + recent check-ins
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "parent") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const children = await query<{ id: number; full_name: string; age: number }>(
    `SELECT id, full_name, age FROM users
     WHERE role = 'student' AND parent_id = $1
     ORDER BY full_name`,
    [user.id]
  );

  if (children.length === 0) {
    return NextResponse.json({ child: null, checkins: [] });
  }

  const child = children[0];
  const checkins = await query(
    `SELECT mood, energy, sleep_hours, wellbeing_score, summary, created_at
     FROM checkins WHERE student_id = $1
     ORDER BY created_at DESC LIMIT 14`,
    [child.id]
  );

  return NextResponse.json({ child, checkins });
}
