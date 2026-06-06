type CheckinInput = {
  studentName: string;
  mood: number;
  energy: number;
  sleepHours: number;
  painAreas: string[] | string;
};

function painAreaCount(painAreas: string[] | string): number {
  if (Array.isArray(painAreas)) return painAreas.length;
  return painAreas
    ? painAreas.split(",").map((s) => s.trim()).filter(Boolean).length
    : 0;
}

/** Local wellbeing score using the same weights as the AI prompt. */
export function computeWellbeingScore(input: CheckinInput): number {
  const moodScore = ((input.mood - 1) / 4) * 100;
  const energyScore = ((input.energy - 1) / 4) * 100;
  const sleepScore = Math.min(input.sleepHours / 8, 1) * 100;
  const painFreeScore =
    painAreaCount(input.painAreas) === 0
      ? 100
      : Math.max(0, 100 - painAreaCount(input.painAreas) * 25);

  return Math.round(
    moodScore * 0.35 +
      energyScore * 0.25 +
      sleepScore * 0.25 +
      painFreeScore * 0.15
  );
}

export function buildWellbeingSummary(
  input: CheckinInput,
  score: number
): string {
  const firstName = input.studentName.split(" ")[0] || "there";

  if (score >= 75) {
    return `Great job checking in, ${firstName} — you're doing really well today. Keep it up!`;
  }
  if (score >= 55) {
    return `Thanks for sharing, ${firstName} — you're doing okay, and small healthy habits can help you feel even better.`;
  }
  if (input.sleepHours < 7) {
    return `Thanks for checking in, ${firstName} — rest might help today; try to get a little more sleep tonight.`;
  }
  return `Thanks for being honest today, ${firstName} — it's okay to have tough days, and talking to someone you trust can help.`;
}

export function computeWellbeing(input: CheckinInput): {
  wellbeing_score: number;
  summary: string;
} {
  const wellbeing_score = computeWellbeingScore(input);
  return {
    wellbeing_score,
    summary: buildWellbeingSummary(input, wellbeing_score),
  };
}
