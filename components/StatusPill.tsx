"use client";

import { useSettings } from "@/context/SettingsContext";

interface StatusPillProps {
  onClick: () => void;
}

export function StatusPill({ onClick }: StatusPillProps) {
  const { connectionStatus, selectedModel } = useSettings();

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
      aria-label="Settings"
    >
      {connectionStatus === "connected" && (
        <>
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-gray-700 truncate max-w-[140px]">
            {selectedModel || "Connected"}
          </span>
        </>
      )}
      {connectionStatus === "disconnected" && (
        <>
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-gray-500">Disconnected</span>
        </>
      )}
      {connectionStatus === "loading" && (
        <>
          <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0 animate-pulse" />
          <span className="text-gray-500">Connecting…</span>
        </>
      )}
    </button>
  );
}
