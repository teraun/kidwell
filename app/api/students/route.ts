import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Counsellor: list students with their latest wellbeing score
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "counsellor") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const students = await query(
    `SELECT u.id, u.full_name, u.age,
            c.wellbeing_score AS latest_score,
            c.created_at AS latest_checkin
     FROM users u
     LEFT JOIN LATERAL (
       SELECT wellbeing_score, created_at
       FROM checkins
       WHERE student_id = u.id
       ORDER BY created_at DESC
       LIMIT 1
     ) c ON true
     WHERE u.role = 'student'
     ORDER BY u.full_name`
  );

  return NextResponse.json({ students });
}
