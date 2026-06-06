import { cookies } from "next/headers";
import { findUserById } from "@/lib/store";

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
  return findUserById(Number(uid));
}
