import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendPushToUser, type PushPayload } from "@/lib/notifications/webpush";
import { sendDigestEmail, type NotificationItem } from "@/lib/notifications/email";
import { attendancePercent, formatDate, todayIST } from "@/lib/utils";
import type { EventType } from "@/lib/supabase/types";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function addDaysIST(days: number): string {
  const [y, m, d] = todayIST().split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, (d ?? 1) + days));
  return date.toISOString().slice(0, 10);
}

const EVENT_EMOJI: Record<EventType, string> = {
  exam: "📝",
  quiz: "❓",
  assignment: "📌",
  holiday: "🌴",
  other: "📅",
};

/**
 * Daily notification cron (Vercel: 2:30 UTC = 8:00 AM IST).
 * For every user: events in 3 days / tomorrow, subjects below 76%,
 * budgets at 80%+. Sends push + email, marks notified flags.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  const in1 = addDaysIST(1);
  const in3 = addDaysIST(3);
  const today = todayIST();
  const [ty, tm] = today.split("-").map(Number);

  // ---- Gather everything in bulk ------------------------------------------
  const [{ data: events3 }, { data: events1 }, { data: subjects }, { data: budgets }, { data: expenses }] =
    await Promise.all([
      admin.from("academic_events").select("*").eq("date", in3).eq("notified_3day", false),
      admin.from("academic_events").select("*").eq("date", in1).eq("notified_1day", false),
      admin.from("subjects").select("*").gt("total_classes", 0),
      admin.from("budgets").select("*").eq("month", tm ?? 1).eq("year", ty ?? 2026),
      admin
        .from("expenses")
        .select("user_id, amount, category, date")
        .gte("date", `${today.slice(0, 7)}-01`)
        .lte("date", today),
    ]);

  // Per-user notification items
  const itemsByUser = new Map<string, NotificationItem[]>();
  const pushByUser = new Map<string, PushPayload[]>();

  const add = (userId: string, item: NotificationItem, push: PushPayload) => {
    itemsByUser.set(userId, [...(itemsByUser.get(userId) ?? []), item]);
    pushByUser.set(userId, [...(pushByUser.get(userId) ?? []), push]);
  };

  // ---- Events: 3 days out --------------------------------------------------
  for (const event of events3 ?? []) {
    const type = event.event_type ?? "other";
    add(
      event.user_id,
      {
        emoji: EVENT_EMOJI[type],
        title: `${event.title} in 3 days`,
        detail: formatDate(event.date, { withYear: true }),
      },
      {
        title: `${EVENT_EMOJI[type]} ${event.title} — 3 days to go`,
        body: `On ${formatDate(event.date)}. Time to start preparing.`,
        url: "/academic",
        tag: `event-3d-${event.id}`,
      }
    );
  }

  // ---- Events: tomorrow ----------------------------------------------------
  for (const event of events1 ?? []) {
    const type = event.event_type ?? "other";
    const isHoliday = type === "holiday";
    add(
      event.user_id,
      {
        emoji: EVENT_EMOJI[type],
        title: isHoliday ? `Holiday tomorrow — ${event.title}` : `${event.title} is tomorrow`,
        detail: formatDate(event.date, { withYear: true }),
      },
      {
        title: isHoliday
          ? `🌴 Holiday tomorrow — ${event.title}`
          : `⏰ Tomorrow: ${event.title}`,
        body: isHoliday ? "Enjoy the day off!" : "Last day to prepare — you've got this.",
        url: "/academic",
        tag: `event-1d-${event.id}`,
      }
    );
  }

  // ---- Attendance below 76% -----------------------------------------------
  for (const subject of subjects ?? []) {
    const pct = attendancePercent(subject.attended_classes, subject.total_classes);
    if (pct < 76) {
      add(
        subject.user_id,
        {
          emoji: "⚠️",
          title: `${subject.name} at ${pct}%`,
          detail: `Below the ${subject.required_percentage}% requirement — attend the next classes.`,
        },
        {
          title: `⚠️ ${subject.name} attendance at ${pct}%`,
          body: "Attend your next classes to stay safe.",
          url: `/attendance/${subject.id}`,
          tag: `att-${subject.id}`,
        }
      );
    }
  }

  // ---- Budgets at 80%+ ------------------------------------------------------
  const spentByUserCategory = new Map<string, number>();
  for (const expense of expenses ?? []) {
    const key = `${expense.user_id}:${expense.category ?? "others"}`;
    spentByUserCategory.set(key, (spentByUserCategory.get(key) ?? 0) + Number(expense.amount));
  }
  for (const budget of budgets ?? []) {
    const limit = Number(budget.amount);
    if (limit <= 0) continue;
    const spent = spentByUserCategory.get(`${budget.user_id}:${budget.category}`) ?? 0;
    const pct = Math.round((spent / limit) * 100);
    if (pct >= 80) {
      add(
        budget.user_id,
        {
          emoji: "💸",
          title: `${budget.category} budget at ${pct}%`,
          detail: `₹${spent.toFixed(0)} of ₹${limit.toFixed(0)} spent this month.`,
        },
        {
          title: `💸 ${budget.category} budget at ${pct}%`,
          body: `₹${spent.toFixed(0)} of ₹${limit.toFixed(0)} used. Ease off a little?`,
          url: "/finance",
          tag: `budget-${budget.id}`,
        }
      );
    }
  }

  // ---- Send push + email per user -------------------------------------------
  const userIds = [...new Set([...itemsByUser.keys()])];
  let pushCount = 0;
  let emailCount = 0;

  for (const userId of userIds) {
    const pushes = pushByUser.get(userId) ?? [];
    for (const payload of pushes) {
      await sendPushToUser(admin, userId, payload);
      pushCount++;
    }

    const items = itemsByUser.get(userId) ?? [];
    if (items.length > 0) {
      const { data: userRes } = await admin.auth.admin.getUserById(userId);
      const email = userRes?.user?.email;
      const name =
        ((userRes?.user?.user_metadata as { name?: string } | null)?.name ?? "there");
      if (email) {
        await sendDigestEmail(email, name, items);
        emailCount++;
      }
    }
  }

  // ---- Mark notified flags ----------------------------------------------------
  const ids3 = (events3 ?? []).map((e) => e.id);
  const ids1 = (events1 ?? []).map((e) => e.id);
  if (ids3.length > 0) {
    await admin.from("academic_events").update({ notified_3day: true }).in("id", ids3);
  }
  if (ids1.length > 0) {
    await admin.from("academic_events").update({ notified_1day: true }).in("id", ids1);
  }

  return NextResponse.json({
    ok: true,
    users: userIds.length,
    pushes: pushCount,
    emails: emailCount,
    events3: ids3.length,
    events1: ids1.length,
  });
}
