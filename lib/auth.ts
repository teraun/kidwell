import { cookies } from "next/headers";
import { query } from "@/lib/db";

export const SESSION_COOKIE = "kidwell_uid";

export type SessionUser = {
  id: number;
  username: string;
  role: "student" | "parent" | "counsellor";
  full_name: string;
  age: number | null;
  parent_id: number | null;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const uid = cookies().get(SESSION_COOKIE)?.value;
  if (!uid) return null;

  const rows = await query<SessionUser>(
    `SELECT id, username, role, full_name, age, parent_id
     FROM users WHERE id = $1`,
    [Number(uid)]
  );
  return rows[0] || null;
}
