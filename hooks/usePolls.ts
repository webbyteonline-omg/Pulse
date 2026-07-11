"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { PROFILE_COLUMNS } from "@/lib/supabase/columns";
import { logActivity } from "@/lib/activityLog";
import { isRateLimitError } from "./useFriends";
import { useAuthStore } from "@/store/authStore";
import type { Poll, PollVote, UserProfile } from "@/lib/supabase/types";

export interface PollWithMeta extends Poll {
  creator: UserProfile | null;
  myVote: number | null;
  totalVotes: number;
  expired: boolean;
}

export function usePolls() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["polls"],
    enabled: !!user,
    queryFn: async (): Promise<PollWithMeta[]> => {
      const supabase = getSupabaseBrowser();
      const { data: polls, error } = await supabase
        .from("polls")
        .select("id,creator_id,question,options,votes,anonymous,expires_at,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      if (polls.length === 0) return [];

      const creatorIds = [...new Set(polls.map((p) => p.creator_id))];
      const pollIds = polls.map((p) => p.id);
      const [{ data: profiles }, { data: myVotes }] = await Promise.all([
        supabase.from("user_profiles").select(PROFILE_COLUMNS).in("id", creatorIds),
        supabase
          .from("poll_votes")
          .select("id,poll_id,user_id,option_index,created_at")
          .in("poll_id", pollIds)
          .eq("user_id", user!.id),
      ]);
      const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
      const voteByPoll = new Map((myVotes ?? []).map((v: PollVote) => [v.poll_id, v.option_index]));
      const now = Date.now();

      return polls.map((p) => ({
        ...p,
        options: (p.options as unknown as string[]) ?? [],
        votes: (p.votes as Record<string, number>) ?? {},
        creator: profileById.get(p.creator_id) ?? null,
        myVote: voteByPoll.get(p.id) ?? null,
        totalVotes: Object.values((p.votes as Record<string, number>) ?? {}).reduce(
          (a, b) => a + b,
          0
        ),
        expired: p.expires_at !== null && new Date(p.expires_at).getTime() < now,
      }));
    },
  });
}

export function useCreatePoll() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: async (input: {
      question: string;
      options: string[];
      anonymous: boolean;
      expiresAt: string | null;
    }) => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("polls")
        .insert({
          creator_id: user!.id,
          question: input.question,
          options: input.options,
          anonymous: input.anonymous,
          expires_at: input.expiresAt,
        })
        .select()
        .single();
      if (error) throw new Error(isRateLimitError(error) ?? error.message);
      logActivity("poll_created", "poll", { entityId: data.id, newValue: { question: input.question } });
      // Notify friends (push) — fire and forget
      void fetch("/api/polls/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: data.id }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["polls"] }),
  });
}

export function useVote() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation({
    mutationFn: async ({ poll, optionIndex }: { poll: Poll; optionIndex: number }) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: poll.id,
        user_id: user!.id,
        option_index: optionIndex,
      });
      if (error) {
        if (/duplicate|unique/i.test(error.message)) throw new Error("You already voted on this poll");
        if (/poll_expired/i.test(error.message)) throw new Error("This poll has ended");
        throw error;
      }
      logActivity("poll_voted", "poll", { entityId: poll.id, newValue: { option: optionIndex } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["polls"] }),
  });
}

export function useDeletePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.from("polls").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["polls"] }),
  });
}
