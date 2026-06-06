/**
 * In-memory data store (mock Postgres).
 * Persists for the lifetime of the server process — no external DB required.
 */

export type User = {
  id: number;
  username: string;
  password: string;
  role: "student" | "parent" | "counsellor";
  full_name: string;
  age: number | null;
  parent_id: number | null;
};

export type Checkin = {
  id: number;
  student_id: number;
  mood: number;
  energy: number;
  sleep_hours: number;
  pain_areas: string;
  wellbeing_score: number | null;
  summary: string | null;
  created_at: string;
};

type Store = {
  users: User[];
  checkins: Checkin[];
  nextUserId: number;
  nextCheckinId: number;
};

declare global {
  // eslint-disable-next-line no-var
  var _kidwellStore: Store | undefined;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function seedStore(): Store {
  const users: User[] = [
    {
      id: 1,
      username: "parent",
      password: "parent",
      role: "parent",
      full_name: "Mrs. Alemu",
      age: null,
      parent_id: null,
    },
    {
      id: 2,
      username: "counsellor",
      password: "counsellor",
      role: "counsellor",
      full_name: "Mr. Bekele",
      age: null,
      parent_id: null,
    },
    {
      id: 3,
      username: "sara",
      password: "sara",
      role: "student",
      full_name: "Sara",
      age: 10,
      parent_id: 1,
    },
  ];

  const checkins: Checkin[] = [
    {
      id: 1,
      student_id: 3,
      mood: 2,
      energy: 2,
      sleep_hours: 5.5,
      pain_areas: "",
      wellbeing_score: 38,
      summary: "Sara has had a tough week with low energy and short sleep.",
      created_at: daysAgo(5),
    },
    {
      id: 2,
      student_id: 3,
      mood: 2,
      energy: 3,
      sleep_hours: 6,
      pain_areas: "",
      wellbeing_score: 45,
      summary: "Still feeling low, though energy was a little better today.",
      created_at: daysAgo(4),
    },
    {
      id: 3,
      student_id: 3,
      mood: 1,
      energy: 2,
      sleep_hours: 5,
      pain_areas: "",
      wellbeing_score: 32,
      summary: "A hard day with very little rest and low mood.",
      created_at: daysAgo(3),
    },
    {
      id: 4,
      student_id: 3,
      mood: 2,
      energy: 2,
      sleep_hours: 5.5,
      pain_areas: "",
      wellbeing_score: 39,
      summary: "Mood remains low and sleep is still short.",
      created_at: daysAgo(2),
    },
    {
      id: 5,
      student_id: 3,
      mood: 2,
      energy: 3,
      sleep_hours: 6,
      pain_areas: "",
      wellbeing_score: 44,
      summary: "Slightly more energy, but still not sleeping enough.",
      created_at: daysAgo(1),
    },
  ];

  return {
    users,
    checkins,
    nextUserId: 4,
    nextCheckinId: 6,
  };
}

function getStore(): Store {
  if (!global._kidwellStore) {
    global._kidwellStore = seedStore();
  }
  return global._kidwellStore;
}

// ── Auth ──────────────────────────────────────────────

export function findUserByCredentials(
  username: string,
  password: string
): Omit<User, "password"> | null {
  const user = getStore().users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;
  const { password: _, ...safe } = user;
  return safe;
}

export function findUserById(id: number): Omit<User, "password"> | null {
  const user = getStore().users.find((u) => u.id === id);
  if (!user) return null;
  const { password: _, ...safe } = user;
  return safe;
}

// ── Check-ins ───────────────────────────────────────

export function getCheckinsByStudent(
  studentId: number,
  limit = 14
): Checkin[] {
  return getStore()
    .checkins.filter((c) => c.student_id === studentId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);
}

export function addCheckin(data: {
  student_id: number;
  mood: number;
  energy: number;
  sleep_hours: number;
  pain_areas: string;
  wellbeing_score: number;
  summary: string;
}): Checkin {
  const store = getStore();
  const checkin: Checkin = {
    id: store.nextCheckinId++,
    ...data,
    created_at: new Date().toISOString(),
  };
  store.checkins.push(checkin);
  return checkin;
}

// ── Parent ──────────────────────────────────────────

export function getChildrenByParent(parentId: number): Omit<User, "password">[] {
  return getStore()
    .users.filter((u) => u.role === "student" && u.parent_id === parentId)
    .map(({ password: _, ...safe }) => safe);
}

// ── Counsellor ────────────────────────────────────────

export function getStudentsWithLatestScore() {
  const store = getStore();
  return store.users
    .filter((u) => u.role === "student")
    .map((u) => {
      const latest = store.checkins
        .filter((c) => c.student_id === u.id)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )[0];
      return {
        id: u.id,
        full_name: u.full_name,
        age: u.age,
        latest_score: latest?.wellbeing_score ?? null,
        latest_checkin: latest?.created_at ?? null,
      };
    })
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export function findStudentById(
  id: number
): Omit<User, "password"> | null {
  const user = getStore().users.find(
    (u) => u.id === id && u.role === "student"
  );
  if (!user) return null;
  const { password: _, ...safe } = user;
  return safe;
}
