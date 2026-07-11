"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NotificationPrefs {
  examReminders: boolean;
  attendanceWarnings: boolean;
  budgetWarnings: boolean;
  emailBackup: boolean;
}

interface SettingsState {
  theme: "dark" | "light";
  defaultRequiredPercentage: number;
  semesterStart: string | null; // YYYY-MM-DD
  semesterEnd: string | null;
  reminderTime: string; // HH:mm, informational (cron runs 8 AM IST)
  notifications: NotificationPrefs;
  dismissedAlerts: string[]; // alert ids dismissed today, prefixed with date
  setTheme: (t: "dark" | "light") => void;
  setDefaultRequiredPercentage: (v: number) => void;
  setSemester: (start: string | null, end: string | null) => void;
  setReminderTime: (t: string) => void;
  setNotificationPref: <K extends keyof NotificationPrefs>(
    key: K,
    value: boolean
  ) => void;
  dismissAlert: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      defaultRequiredPercentage: 75,
      semesterStart: null,
      semesterEnd: null,
      reminderTime: "08:00",
      notifications: {
        examReminders: true,
        attendanceWarnings: true,
        budgetWarnings: true,
        emailBackup: true,
      },
      dismissedAlerts: [],
      setTheme: (theme) => set({ theme }),
      setDefaultRequiredPercentage: (defaultRequiredPercentage) =>
        set({ defaultRequiredPercentage }),
      setSemester: (semesterStart, semesterEnd) => set({ semesterStart, semesterEnd }),
      setReminderTime: (reminderTime) => set({ reminderTime }),
      setNotificationPref: (key, value) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
      dismissAlert: (id) =>
        set((s) => ({ dismissedAlerts: [...s.dismissedAlerts.slice(-30), id] })),
    }),
    { name: "pulse-settings" }
  )
);
