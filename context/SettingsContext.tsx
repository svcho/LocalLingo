"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { DEFAULT_OLLAMA_URL } from "@/lib/constants";

export type ConnectionStatus = "connected" | "disconnected" | "loading";

interface SettingsContextType {
  ollamaUrl: string;
  selectedModel: string;
  connectionStatus: ConnectionStatus;
  availableModels: string[];
  updateUrl: (url: string) => void;
  selectModel: (model: string) => void;
  refreshConnection: (url?: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ollamaUrl, setOllamaUrl] = useState<string>(DEFAULT_OLLAMA_URL);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("loading");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted values on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem("ollamaUrl") || DEFAULT_OLLAMA_URL;
    const savedModel = localStorage.getItem("selectedModel") || "";
    setOllamaUrl(savedUrl);
    setSelectedModel(savedModel);
    setHydrated(true);
  }, []);

  const refreshConnection = useCallback(async (url?: string) => {
    const targetUrl = url ?? ollamaUrl;
    setConnectionStatus("loading");
    try {
      const res = await fetch(
        `/api/ollama/tags?ollamaUrl=${encodeURIComponent(targetUrl)}`
      );
      if (!res.ok) throw new Error("Failed to fetch models");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const models: string[] = (data.models ?? []).map(
        (m: { name: string }) => m.name
      );
      setAvailableModels(models);
      setConnectionStatus("connected");
      // Auto-select first model if none selected or current not in list
      setSelectedModel((prev) => {
        if (models.length > 0 && (!prev || !models.includes(prev))) {
          const first = models[0];
          localStorage.setItem("selectedModel", first);
          return first;
        }
        return prev;
      });
    } catch {
      setAvailableModels([]);
      setConnectionStatus("disconnected");
    }
  }, [ollamaUrl]);

  // Check connection after hydration
  useEffect(() => {
    if (hydrated) {
      refreshConnection(ollamaUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const updateUrl = useCallback((url: string) => {
    setOllamaUrl(url);
    localStorage.setItem("ollamaUrl", url);
  }, []);

  const selectModel = useCallback((model: string) => {
    setSelectedModel(model);
    localStorage.setItem("selectedModel", model);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        ollamaUrl,
        selectedModel,
        connectionStatus,
        availableModels,
        updateUrl,
        selectModel,
        refreshConnection,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
