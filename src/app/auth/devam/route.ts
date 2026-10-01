import { NextResponse, type NextRequest } from "next/server";
import { getProfile, getUser, safeNext } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(new URL(`/giris?next=${encodeURIComponent(next)}`, request.url));
  }
  const profile = await getProfile();
  const target = profile ? next : `/profil?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(new URL(target, request.url));
}
