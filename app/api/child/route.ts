import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getChildrenByParent, getCheckinsByStudent } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "parent") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const children = getChildrenByParent(user.id);
  if (children.length === 0) {
    return NextResponse.json({ child: null, checkins: [] });
  }

  const child = children[0];
  const checkins = getCheckinsByStudent(child.id, 14);

  return NextResponse.json({ child, checkins });
}
