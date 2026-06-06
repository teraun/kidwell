import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCheckinsByStudent, addCheckin } from "@/lib/store";
import { demoCheckin } from "@/lib/demo-ai";
import { parseJsonLoose, tryAskOpenRouter } from "@/lib/openrouter";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const checkins = getCheckinsByStudent(user.id, 14);
  return NextResponse.json({ student: user.full_name, checkins });
}

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

    const raw = await tryAskOpenRouter(system, userMessage);
    const parsed = raw
      ? parseJsonLoose<{ wellbeing_score: number; summary: string }>(raw)
      : demoCheckin({
          student_name: user.full_name,
          age: user.age,
          mood: Number(mood),
          energy: Number(energy),
          sleep_hours: Number(sleepHours),
          pain_areas: painAreas || [],
        });

    addCheckin({
      student_id: user.id,
      mood: Number(mood),
      energy: Number(energy),
      sleep_hours: Number(sleepHours),
      pain_areas: Array.isArray(painAreas)
        ? painAreas.join(", ")
        : painAreas || "",
      wellbeing_score: parsed.wellbeing_score,
      summary: parsed.summary,
    });

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
