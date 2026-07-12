"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CreateGroupForm } from "@/components/groups/CreateGroupForm";

export default function CreateGroupPage() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="p-2 -ml-2 min-h-[44px] min-w-[44px] rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center -ml-9">New Group</h1>
      </div>

      <CreateGroupForm />
    </div>
  );
}
