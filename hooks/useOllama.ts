"use client";

import { useSettings } from "@/context/SettingsContext";

export function useOllama() {
  const { ollamaUrl, refreshConnection, availableModels, connectionStatus } =
    useSettings();

  const checkConnection = async (url?: string) => {
    await refreshConnection(url ?? ollamaUrl);
  };

  const fetchModels = async (url?: string): Promise<string[]> => {
    const targetUrl = url ?? ollamaUrl;
    try {
      const res = await fetch(
        `/api/ollama/tags?ollamaUrl=${encodeURIComponent(targetUrl)}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      if (data.error) return [];
      return (data.models ?? []).map((m: { name: string }) => m.name);
    } catch {
      return [];
    }
  };

  return {
    checkConnection,
    fetchModels,
    availableModels,
    connectionStatus,
  };
}
