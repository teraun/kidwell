import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { askOpenRouter, parseJsonLoose } from "@/lib/openrouter";

// GET: current student's recent check-ins
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const checkins = await query(
    `SELECT id, mood, energy, sleep_hours, pain_areas, wellbeing_score, summary, created_at
     FROM checkins WHERE student_id = $1
     ORDER BY created_at DESC LIMIT 14`,
    [user.id]
  );

  return NextResponse.json({ student: user.full_name, checkins });
}

// POST: submit a new check-in (student only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { mood, energy, sleepHours, painAreas } = await request.json();
    if (mood == null || energy == null || sleepHours == null) {
      return NextResponse.json(
        { error: "mood, energy, and sleepHours are required" },
        { status: 400 }
      );
    }

    const system = `You are a supportive school wellbeing assistant for KidWell.
Given a student's check-in, compute a wellbeing score from 0-100 and write ONE encouraging sentence (address the student warmly).
Respond ONLY with valid JSON: {"wellbeing_score": number, "summary": "one encouraging sentence"}
Rules: never diagnose or name mental-health conditions; be warm and age-appropriate.
Scoring weights: mood 35%, energy 25%, sleep 25%, pain-free 15% (no pain = full points).`;

    const userMessage = JSON.stringify({
      student_name: user.full_name,
      age: user.age,
      mood: Number(mood),
      energy: Number(energy),
      sleep_hours: Number(sleepHours),
      pain_areas: painAreas || [],
    });

    const raw = await askOpenRouter(system, userMessage);
    const parsed = parseJsonLoose<{ wellbeing_score: number; summary: string }>(
      raw
    );

    await query(
      `INSERT INTO checkins (student_id, mood, energy, sleep_hours, pain_areas, wellbeing_score, summary)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        user.id,
        Number(mood),
        Number(energy),
        Number(sleepHours),
        Array.isArray(painAreas) ? painAreas.join(", ") : painAreas || "",
        parsed.wellbeing_score,
        parsed.summary,
      ]
    );

    return NextResponse.json({
      wellbeing_score: parsed.wellbeing_score,
      summary: parsed.summary,
    });
  } catch (error) {
    console.error("Check-in API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process check-in",
      },
      { status: 500 }
    );
  }
}
