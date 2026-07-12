"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export interface GroupSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function GroupSearchBar({ value, onChange, placeholder = "Search groups..." }: GroupSearchBarProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      rightSlot={<Search className="h-4 w-4 text-ink-faint" />}
    />
  );
}
