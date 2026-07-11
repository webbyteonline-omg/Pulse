import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/notifications/webpush";

/** Push "friend created a poll" to all of the creator's friends. */
export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = z
    .object({ pollId: z.string().uuid() })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data: poll } = await admin
    .from("polls")
    .select("*")
    .eq("id", parsed.data.pollId)
    .eq("creator_id", user.id) // only your own polls
    .maybeSingle();
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  const [{ data: friends }, { data: profile }] = await Promise.all([
    admin.from("friendships").select("friend_id").eq("user_id", user.id),
    admin.from("user_profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);

  const name = profile?.display_name ?? profile?.username ?? "A friend";
  await Promise.allSettled(
    (friends ?? []).map((f) =>
      sendPushToUser(admin, f.friend_id, {
        title: `🗳️ ${name} started a poll`,
        body: poll.question,
        url: "/polls",
        tag: `poll-${poll.id}`,
      })
    )
  );
  return NextResponse.json({ ok: true });
}
