import { computeWellbeing } from "@/lib/wellbeing";

export function demoCheckin(input: {
  student_name: string;
  age: number | null;
  mood: number;
  energy: number;
  sleep_hours: number;
  pain_areas: string[] | string;
}) {
  return computeWellbeing({
    studentName: input.student_name,
    mood: input.mood,
    energy: input.energy,
    sleepHours: input.sleep_hours,
    painAreas: input.pain_areas,
  });
}

export function demoNutritionPlan(studentName: string, age: number) {
  return {
    days: [
      {
        day: "Day 1",
        breakfast: "Beso (roasted barley drink) with banana",
        lunch: "Injera with shiro wot and mixed salad",
        dinner: "Genfo with yogurt and lightly steamed vegetables",
      },
      {
        day: "Day 2",
        breakfast: "Oat porridge with milk and seasonal fruit",
        lunch: "Injera with misir wot (red lentils) and cabbage",
        dinner: "Chickpea stew with rice and carrots",
      },
      {
        day: "Day 3",
        breakfast: "Eggs with whole-grain bread and orange slices",
        lunch: "Injera with gomen (collard greens) and atkilt (vegetable stew)",
        dinner: "Ful medames with tomato salad and avocado",
      },
    ],
    rationale: `A balanced 3-day plan for ${studentName} (age ${age}) using affordable Ethiopian staples — legumes, vegetables, injera, and fruit — to support steady energy for school.`,
  };
}

export function demoCounsellorBrief(studentName: string) {
  return {
    summary: `${studentName} has reported consistently low mood and energy over recent check-ins, with sleep often below 7 hours. Patterns suggest fatigue may be affecting daily wellbeing.`,
    concerns: [
      "Repeated low mood scores (1–2 out of 5)",
      "Sleep averaging under 6.5 hours on several days",
      "Energy levels staying low despite small improvements",
    ],
    conversation_starters: [
      "How have you been sleeping this week — is anything making it hard to rest?",
      "What's one small thing that helped you feel a bit better, even for a moment?",
      "Is there someone at school or home you feel comfortable talking to when days feel tough?",
    ],
  };
}
