"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Download, KeyRound, ListChecks, Lock, LogOut, MapPin, Trash2, Upload } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { useAllExpenses } from "@/hooks/useFinance";
import { usePushNotifications } from "@/hooks/useNotifications";
import { useMyProfile, useUpdateProfile } from "@/hooks/useProfile";
import { exportKeyFile, hasKey, importKeyFile } from "@/lib/encryption";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { downloadCSV } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore, type NotificationPrefs, type PrivacyPrefs } from "@/store/settingsStore";

const NOTIFICATION_ITEMS: Array<{ key: keyof NotificationPrefs; label: string; desc: string }> = [
  { key: "examReminders", label: "Exam & event reminders", desc: "3 days and 1 day before" },
  { key: "attendanceWarnings", label: "Attendance warnings", desc: "When a subject drops below required %" },
  { key: "budgetWarnings", label: "Budget alerts", desc: "When a category crosses 80%" },
  { key: "friendActivity", label: "Friend activity", desc: "Friend requests and new polls" },
  { key: "emailBackup", label: "Email backup", desc: "Also send reminders by email" },
];

const PRIVACY_ITEMS: Array<{
  key: keyof PrivacyPrefs;
  profileKey: "privacy_steps" | "privacy_location" | "privacy_attendance" | "privacy_finance" | "privacy_friends_only";
  label: string;
  desc: string;
}> = [
  { key: "steps", profileKey: "privacy_steps", label: "Share steps & mood", desc: "Friends see your daily steps + mood average" },
  { key: "location", profileKey: "privacy_location", label: "Share location area", desc: 'Only "In Campus" / "Outside Campus" — never coordinates' },
  { key: "attendance", profileKey: "privacy_attendance", label: "Share attendance %", desc: "Shown on your profile and leaderboard" },
  { key: "finance", profileKey: "privacy_finance", label: "Share budget health", desc: "% of budget left — never amounts" },
  { key: "profileFriendsOnly", profileKey: "privacy_friends_only", label: "Only friends see my profile", desc: "Hide your profile from search by strangers" },
];

function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-3 mt-8 first:mt-0 scroll-mt-20">
      {children}
    </h2>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName)();
  const setUser = useAuthStore((s) => s.setUser);

  const settings = useSettingsStore();
  const push = usePushNotifications();
  const expensesQuery = useAllExpenses();
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(displayName);
  const [nameSaved, setNameSaved] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [keyExists, setKeyExists] = useState(false);
  const [keyMessage, setKeyMessage] = useState<string | null>(null);
  const keyFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void hasKey().then(setKeyExists);
  }, []);

  const profile = profileQuery.data;

  const setPrivacy = (item: (typeof PRIVACY_ITEMS)[number], value: boolean) => {
    settings.setPrivacyPref(item.key, value);
    updateProfile.mutate({ [item.profileKey]: value });
  };

  const saveName = async () => {
    if (!name.trim() || name.trim() === displayName) return;
    setSavingName(true);
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
    if (!error && data.user) {
      setUser(data.user);
      updateProfile.mutate({ display_name: name.trim() });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 1500);
    }
    setSavingName(false);
  };

  const logout = async () => {
    await getSupabaseBrowser().auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  const exportExpenses = () => {
    const rows = (expensesQuery.data ?? []).map((e) => ({
      date: e.date,
      amount: e.amount,
      category: e.category ?? "others",
      merchant: e.merchant ?? "",
      note: e.note?.startsWith("enc:") ? "(encrypted)" : (e.note ?? ""),
      source: e.source ?? "manual",
    }));
    downloadCSV(`pulse-expenses-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const setCampusHere = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        settings.setCampusCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          radiusM: 800,
        });
      },
      () => setKeyMessage("Couldn't read your location — allow location access and retry.")
    );
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Couldn't delete account");
      }
      await getSupabaseBrowser().auth.signOut();
      router.replace("/signup");
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  };

  return (
    <div>
      <Header title="Settings" />

      {/* Theme */}
      <SectionTitle>Theme</SectionTitle>
      <ThemeSelector />

      {/* Profile */}
      <SectionTitle>Profile</SectionTitle>
      <Card className="p-4 space-y-4">
        <div className="flex items-end gap-2">
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button
            variant="secondary"
            onClick={saveName}
            loading={savingName}
            disabled={!name.trim() || name.trim() === displayName}
            className="h-11"
          >
            {nameSaved ? <Check className="h-4 w-4 text-success" /> : "Save"}
          </Button>
        </div>
        <Input label="Username" value={profile ? `@${profile.username}` : "…"} readOnly disabled hint="Friends find you by this" />
        <Input label="Email" value={user?.email ?? ""} readOnly disabled hint="Email can't be changed" />
      </Card>

      {/* Privacy */}
      <SectionTitle id="privacy">Privacy</SectionTitle>
      <Card className="divide-y divide-line/60">
        {PRIVACY_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-ink-dim">{item.desc}</p>
            </div>
            <Toggle
              checked={profile ? profile[item.profileKey] : settings.privacy[item.key]}
              onChange={(v) => setPrivacy(item, v)}
              label={item.label}
            />
          </div>
        ))}
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Live location tracking</p>
            <p className="text-xs text-ink-dim">
              Updates every 30s while Pulse is open. Coordinates are encrypted on your device.
            </p>
          </div>
          <Toggle
            checked={settings.locationSharing}
            onChange={settings.setLocationSharing}
            label="Location tracking"
          />
        </div>
        {settings.locationSharing && (
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Campus center</p>
              <p className="text-xs text-ink-dim">
                {settings.campusCenter
                  ? `Set (${settings.campusCenter.lat.toFixed(3)}, ${settings.campusCenter.lng.toFixed(3)}) · 800m radius`
                  : "Stand anywhere on campus and tap"}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={setCampusHere}>
              <MapPin className="h-3.5 w-3.5" /> Set here
            </Button>
          </div>
        )}
      </Card>

      {/* Encryption */}
      <SectionTitle>Encryption</SectionTitle>
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-3 rounded-btn bg-success-dim border border-success/25 px-3.5 py-2.5">
          <Lock className="h-4 w-4 text-success shrink-0" />
          <p className="text-xs text-success font-semibold">
            Your location & private notes are encrypted on your device — the key never leaves it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={async () => {
              await exportKeyFile();
              setKeyExists(true);
              setKeyMessage("Key exported — keep the file somewhere safe.");
            }}
          >
            <KeyRound className="h-4 w-4" /> Export key
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => keyFileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import key
          </Button>
          <input
            ref={keyFileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const ok = await importKeyFile(file);
              setKeyMessage(ok ? "Key imported — encrypted data from your other device is readable now." : "That file isn't a valid Pulse key.");
              e.target.value = "";
            }}
          />
        </div>
        {keyMessage && <p className="text-xs text-ink-dim">{keyMessage}</p>}
        <p className="text-[11px] text-ink-faint">
          {keyExists ? "A key exists on this device." : "A key will be created the first time you use encryption."}{" "}
          Moving to a new phone? Export here, import there.
        </p>
      </Card>

      {/* Notifications */}
      <SectionTitle id="notifications">Notifications</SectionTitle>
      <Card className="divide-y divide-line/60">
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Push notifications</p>
            <p className="text-xs text-ink-dim">
              {push.permission === "unsupported"
                ? "Not supported in this browser"
                : push.permission === "denied"
                  ? "Blocked — enable in browser settings"
                  : push.subscribed
                    ? "Enabled on this device"
                    : "Get reminders on this device"}
            </p>
          </div>
          <Toggle
            checked={push.subscribed}
            onChange={(v) => (v ? void push.subscribe() : void push.unsubscribe())}
            label="Push notifications"
          />
        </div>
        {NOTIFICATION_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-ink-dim">{item.desc}</p>
            </div>
            <Toggle
              checked={settings.notifications[item.key]}
              onChange={(v) => settings.setNotificationPref(item.key, v)}
              label={item.label}
            />
          </div>
        ))}
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1">
            <p className="text-sm font-semibold">Daily reminder time</p>
            <p className="text-xs text-ink-dim">Server digest goes out 8:00 AM IST</p>
          </div>
          <input
            type="time"
            value={settings.reminderTime}
            onChange={(e) => settings.setReminderTime(e.target.value)}
            aria-label="Daily reminder time"
            className="h-11 px-3 rounded-input bg-input border border-line text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </Card>

      {/* Preferences */}
      <SectionTitle>Preferences</SectionTitle>
      <Card className="divide-y divide-line/60">
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1">
            <p className="text-sm font-semibold">Default required attendance</p>
            <p className="text-xs text-ink-dim">Applies to new subjects</p>
          </div>
          <div className="relative">
            <input
              type="number"
              min={1}
              max={100}
              value={settings.defaultRequiredPercentage}
              onChange={(e) =>
                settings.setDefaultRequiredPercentage(
                  Math.max(1, Math.min(100, Number(e.target.value) || 75))
                )
              }
              aria-label="Default required attendance percentage"
              className="w-20 h-11 px-3 pr-7 rounded-input bg-input border border-line text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-dim">%</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm font-semibold">Academic year</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Semester start"
              type="date"
              value={settings.semesterStart ?? ""}
              onChange={(e) => settings.setSemester(e.target.value || null, settings.semesterEnd)}
            />
            <Input
              label="Semester end"
              type="date"
              value={settings.semesterEnd ?? ""}
              onChange={(e) => settings.setSemester(settings.semesterStart, e.target.value || null)}
            />
          </div>
        </div>
      </Card>

      {/* Data */}
      <SectionTitle>Data</SectionTitle>
      <Card className="p-4 space-y-3">
        <Button variant="secondary" className="w-full" onClick={exportExpenses} disabled={expensesQuery.isLoading}>
          <Download className="h-4 w-4" /> Export expenses (CSV)
        </Button>
        <Link href="/profile/activity" className="block">
          <Button variant="secondary" className="w-full">
            <ListChecks className="h-4 w-4" /> My activity log <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </Card>

      {/* Account */}
      <SectionTitle>Account</SectionTitle>
      <Card className="p-4 space-y-3">
        <Button variant="secondary" className="w-full" onClick={logout}>
          <LogOut className="h-4 w-4" /> Log out
        </Button>
        <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" /> Delete account
        </Button>
      </Card>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete account?" variant="center">
        <p className="text-sm text-ink-dim">
          This permanently deletes your account and all data — subjects, attendance, events,
          expenses, friends, polls and stats. There is no undo.
        </p>
        <div className="mt-4">
          <Input
            label={'Type "delete" to confirm'}
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder="delete"
          />
        </div>
        {deleteError && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {deleteError}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={deleteText.toLowerCase() !== "delete"}
            loading={deleting}
            onClick={deleteAccount}
          >
            Delete forever
          </Button>
        </div>
      </Modal>
    </div>
  );
}
