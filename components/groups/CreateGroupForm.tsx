"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImageUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useFriends } from "@/hooks/useFriends";
import { useCreateGroup } from "@/hooks/useGroups";
import { useAuthStore } from "@/store/authStore";

const EMOJI_OPTIONS = ["🎮", "🏏", "📚", "🎵", "🏋️", "🎨"] as const;

// Hardcoded per-swatch — these are the group's OWN accent color choices,
// not theme colors, so they're deliberately the same in light and dark.
const COLOR_OPTIONS = ["#6C63FF", "#4FACFE", "#43D98C", "#FFB347", "#FF6584", "#E24B4A"] as const;

const NAME_MAX = 30;

export function CreateGroupForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: friends } = useFriends();
  const createGroup = useCreateGroup();

  const [avatarMode, setAvatarMode] = useState<"emoji" | "photo">("emoji");
  const [emoji, setEmoji] = useState<string>(EMOJI_OPTIONS[0]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
  const [name, setName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const filteredFriends = useMemo(() => {
    const term = memberSearch.trim().toLowerCase();
    const list = friends ?? [];
    if (!term) return list;
    return list.filter(
      (f) =>
        (f.display_name ?? "").toLowerCase().includes(term) ||
        f.username.toLowerCase().includes(term)
    );
  }, [friends, memberSearch]);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Storage path convention: {groupId}/{userId}.jpg — but we don't have a
  // groupId yet at upload time (the group doesn't exist until submit), so
  // this uploads under a temp/{userId}/{timestamp}.jpg key instead and
  // stores the resulting public URL directly on the group row. Simpler
  // than a two-phase "create group, then upload, then update" flow, and
  // the storage RLS policy only restricts the group-scoped upload path,
  // not reads, so this still works with the "publicly readable" policy.
  const handlePhotoSelect = async (file: File) => {
    if (!user) return;
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = getSupabaseBrowser();
      const path = `temp/${user.id}/${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("group-avatars")
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("group-avatars").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Couldn't upload photo");
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = name.trim().length > 0 && !createGroup.isPending;

  const submit = async () => {
    if (!name.trim()) {
      setError("Give your group a name");
      return;
    }
    try {
      const group = await createGroup.mutateAsync({
        name: name.trim(),
        avatarEmoji: emoji,
        avatarImageUrl: avatarMode === "photo" ? photoUrl : null,
        color,
        memberIds: [...selectedIds],
      });
      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create group");
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar picker */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-20 w-20 rounded-full grid place-items-center overflow-hidden"
          style={{ background: avatarMode === "emoji" ? `${color}26` : undefined }}
        >
          {avatarMode === "photo" && photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          ) : avatarMode === "photo" && uploading ? (
            <Loader2 className="h-6 w-6 text-ink-dim animate-spin" />
          ) : (
            <span style={{ fontSize: 36 }}>{emoji}</span>
          )}
        </div>
        <p className="text-xs text-ink-dim">Tap to change</p>

        <div className="flex items-center gap-1 clay rounded-btn p-1 mt-2">
          {(["emoji", "photo"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAvatarMode(mode)}
              className={`px-4 h-8 rounded-input text-xs font-bold transition-colors ${
                avatarMode === mode ? "clay-purple-btn" : "text-ink-dim"
              }`}
            >
              {mode === "emoji" ? "Emoji" : "Photo"}
            </button>
          ))}
        </div>

        {avatarMode === "emoji" ? (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                aria-pressed={emoji === e}
                className={`h-11 w-11 rounded-full grid place-items-center text-xl border transition-colors ${
                  emoji === e ? "border-primary bg-primary/10" : "border-line"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePhotoSelect(file);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
            >
              <ImageUp className="h-4 w-4" /> Upload photo
            </Button>
            {uploadError && <p className="text-xs text-danger mt-1.5 text-center">{uploadError}</p>}
          </div>
        )}
      </div>

      {/* Group name */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-ink-dim">Group name</p>
          <p className="text-[11px] text-ink-faint">
            {name.length}/{NAME_MAX}
          </p>
        </div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
          placeholder="e.g. CS Gang"
          maxLength={NAME_MAX}
        />
      </div>

      {/* Color theme */}
      <div>
        <p className="text-xs font-medium text-ink-dim mb-2">Color theme</p>
        <div className="flex flex-wrap gap-2.5">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-pressed={color === c}
              aria-label={c}
              className="h-14 w-14 rounded-full grid place-items-center border-2 transition-colors"
              style={{ background: c, borderColor: color === c ? "rgb(var(--ink))" : "transparent" }}
            >
              {color === c && <Check className="h-5 w-5 text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Add members */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-medium text-ink-dim">Add members</p>
          {selectedIds.size > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-bold">
              {selectedIds.size}
            </span>
          )}
        </div>
        <Input
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          placeholder="Search your friends..."
          className="mb-2"
        />
        {(friends ?? []).length === 0 ? (
          <p className="text-xs text-ink-faint py-2">
            Add friends first — only your accepted friends can be added to a group.
          </p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filteredFriends.map((friend) => {
              const checked = selectedIds.has(friend.id);
              return (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-input hover:bg-card transition-colors"
                >
                  <Avatar
                    name={friend.display_name ?? friend.username}
                    size={40}
                    showOnline={false}
                    src={friend.avatar_url}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {friend.display_name ?? friend.username}
                    </p>
                    <p className="text-[11px] text-ink-dim truncate">@{friend.username}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => toggleMember(friend.id)}
                    className={`relative h-6 w-11 rounded-full shrink-0 transition-colors ${
                      checked ? "bg-primary" : "bg-line"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        checked ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button size="lg" className="w-full" onClick={submit} disabled={!canSubmit} loading={createGroup.isPending}>
        Gang banao 🤙
      </Button>
    </div>
  );
}
