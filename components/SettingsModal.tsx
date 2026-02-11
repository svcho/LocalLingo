"use client";

import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useOllama } from "@/hooks/useOllama";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { ollamaUrl, selectedModel, availableModels, updateUrl, selectModel, refreshConnection } =
    useSettings();
  const { connectionStatus } = useOllama();

  const [urlInput, setUrlInput] = useState(ollamaUrl);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    try {
      const res = await fetch(
        `/api/ollama/tags?ollamaUrl=${encodeURIComponent(urlInput)}`
      );
      const data = await res.json();
      if (res.ok && !data.error) {
        setTestStatus("ok");
      } else {
        setTestStatus("fail");
      }
    } catch {
      setTestStatus("fail");
    }
  };

  const handleSave = async () => {
    updateUrl(urlInput);
    await refreshConnection(urlInput);
    onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ollama URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setTestStatus("idle");
                }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="http://localhost:11434"
              />
              <button
                onClick={handleTestConnection}
                disabled={testStatus === "testing"}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {testStatus === "testing" ? "Testing…" : "Test"}
              </button>
            </div>
            {testStatus === "ok" && (
              <p className="text-green-600 text-xs mt-1">Connection successful</p>
            )}
            {testStatus === "fail" && (
              <p className="text-red-500 text-xs mt-1">
                Cannot reach Ollama at {urlInput}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            {availableModels.length === 0 ? (
              <p className="text-sm text-gray-400">
                {connectionStatus === "loading"
                  ? "Loading models…"
                  : "No models available. Check your Ollama connection."}
              </p>
            ) : (
              <select
                value={selectedModel}
                onChange={(e) => selectModel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
