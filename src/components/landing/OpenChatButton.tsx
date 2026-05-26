"use client";

import { MessageSquare } from "lucide-react";

type OpenChatButtonProps = {
  variant?: "primary" | "secondary";
  label?: string;
};

export function OpenChatButton({ variant = "primary", label = "Probar agente ITSM" }: OpenChatButtonProps) {
  const openChat = () => {
    window.dispatchEvent(new Event("open-itsm-chat"));
  };

  return (
    <button
      type="button"
      onClick={openChat}
      className={
        variant === "primary"
          ? "inline-flex items-center justify-center gap-2 rounded-full bg-[#08233f] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:bg-[#123b63]"
          : "inline-flex items-center justify-center gap-2 rounded-full border border-[#b7d8e8] bg-white px-5 py-3 text-sm font-semibold text-[#08233f] transition hover:-translate-y-0.5 hover:border-[#00b8d9]"
      }
    >
      <MessageSquare size={18} aria-hidden />
      {label}
    </button>
  );
}
