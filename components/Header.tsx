"use client";

import { useState } from "react";
import { StatusPill } from "./StatusPill";
import { SettingsModal } from "./SettingsModal";

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">LocalLingo</span>
          <span className="text-xs text-gray-400 font-normal hidden sm:inline">
            Private translation via Ollama
          </span>
        </div>
        <StatusPill onClick={() => setSettingsOpen(true)} />
      </header>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
