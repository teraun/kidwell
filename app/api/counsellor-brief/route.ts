import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { findStudentById, getCheckinsByStudent } from "@/lib/store";
import { askOpenRouter, parseJsonLoose } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "counsellor") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { studentId } = await request.json();
    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const student = findStudentById(Number(studentId));
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const checkins = getCheckinsByStudent(student.id, 30);

    const system = `You are an AI assistant helping a school counsellor prepare for a supportive check-in.
You receive a student's recent check-in patterns. You NEVER diagnose or label conditions.
Respond ONLY with valid JSON in this exact shape:
{"summary":"2-3 sentence neutral pattern summary","concerns":["concern 1","concern 2"],"conversation_starters":["starter 1","starter 2"]}
Use plain, non-clinical language. Describe observed patterns only.`;

    const userMessage = JSON.stringify({
      student_ref: `S-${student.id}`,
      age: student.age,
      recent_checkins: checkins,
    });

    const raw = await askOpenRouter(system, userMessage);
    const parsed = parseJsonLoose<{
      summary: string;
      concerns: string[];
      conversation_starters: string[];
    }>(raw);

    return NextResponse.json({ student: student.full_name, ...parsed });
  } catch (error) {
    console.error("Counsellor brief API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate counsellor brief",
      },
      { status: 500 }
    );
  }
}
