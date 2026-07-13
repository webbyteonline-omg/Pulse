"use client";

import { useRouter } from "next/navigation";
import { Camera, ChevronRight, Lock, MapPin, MessageCircle, Settings, Sparkles, UserCircle, Users } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/hooks/useToast";

export interface MoreMenuSheetProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: typeof Users;
  label: string;
  onTap: (navigate: (href: string) => void, toast: (msg: string) => void) => void;
}

const MAIN_ITEMS: MenuItem[] = [
  { icon: Camera, label: "Snaps", onTap: (nav) => nav("/snaps") },
  { icon: MessageCircle, label: "Chats", onTap: (nav) => nav("/chats") },
  { icon: Users, label: "Groups", onTap: (nav) => nav("/groups") },
  { icon: MapPin, label: "Campus Map", onTap: (nav) => nav("/map") },
  { icon: Sparkles, label: "Health", onTap: (nav) => nav("/health") },
  { icon: UserCircle, label: "Profile", onTap: (nav) => nav("/profile") },
];

const MORE_ITEMS: MenuItem[] = [
  { icon: Settings, label: "Settings", onTap: (nav) => nav("/settings") },
  { icon: Lock, label: "Privacy Policy", onTap: (nav) => nav("/privacy") },
  {
    icon: Sparkles,
    label: "About DockIn",
    onTap: (_nav, toast) => toast("Built by Sachin, BU 2025–29"),
  },
];

function MenuRow({ item, onTap }: { item: MenuItem; onTap: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3.5 px-1 h-14 rounded-input hover:bg-card-hover active:bg-card-hover transition-colors text-left"
    >
      <div className="h-10 w-10 rounded-xl grid place-items-center shrink-0 bg-card-hover text-ink">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <span className="flex-1 text-[15px] font-medium text-ink">{item.label}</span>
      <ChevronRight className="h-4 w-4 text-ink-dim shrink-0" />
    </button>
  );
}

/** "More" bottom sheet — reachable from the 6th bottom-nav tab. Surfaces
 * every destination that doesn't fit in the 5-tab bar (Groups, Campus Map,
 * Health, Profile) plus settings/legal/about. */
export function MoreMenuSheet({ open, onClose }: MoreMenuSheetProps) {
  const router = useRouter();
  const { toast, showToast } = useToast();

  const navigate = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Menu" className="h-[65dvh] flex flex-col">
        <div className="space-y-0.5">
          {MAIN_ITEMS.map((item) => (
            <MenuRow key={item.label} item={item} onTap={() => item.onTap(navigate, showToast)} />
          ))}
        </div>

        <div className="my-4 border-t border-line" />

        <p className="text-[11px] font-bold text-ink-dim uppercase tracking-wider mb-1 px-1">
          Settings &amp; More
        </p>
        <div className="space-y-0.5">
          {MORE_ITEMS.map((item) => (
            <MenuRow key={item.label} item={item} onTap={() => item.onTap(navigate, showToast)} />
          ))}
        </div>
      </Modal>

      {toast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] clay rounded-full px-4 py-2.5 text-xs font-bold shadow-2xl whitespace-nowrap"
          role="status"
        >
          {toast}
        </div>
      )}
    </>
  );
}
