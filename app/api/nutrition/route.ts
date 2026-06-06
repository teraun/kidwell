import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { askOpenRouter, parseJsonLoose } from "@/lib/openrouter";
import { parseLocale, withLocalePrompt } from "@/lib/i18n/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const locale = parseLocale(body?.locale);

    const system = withLocalePrompt(
      `You are a nutrition assistant for KidWell, a school wellbeing platform.
Create a simple, culturally appropriate 3-day meal plan for an Ethiopian student.
Respond ONLY with valid JSON in this exact shape:
{"days":[{"day":"Day 1","breakfast":"...","lunch":"...","dinner":"..."}],"rationale":"one short paragraph"}
Use affordable, local Ethiopian foods (injera, legumes, vegetables, local staples). Age-appropriate portions.`,
      locale
    );

    const userMessage = JSON.stringify({
      student_name: user.full_name,
      age: user.age ?? 10,
      allergies: [],
      context: "Ethiopian diet",
    });

    const raw = await askOpenRouter(system, userMessage);
    const parsed = parseJsonLoose(raw);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Nutrition API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate nutrition plan",
      },
      { status: 500 }
    );
  }
}
