"use client";

import { useState, useCallback, useRef } from "react";
import { useSettings } from "@/context/SettingsContext";

interface TranslateParams {
  text: string;
  sourceLang: string;
  targetLang: string;
}

interface TranslationState {
  output: string;
  isTranslating: boolean;
  error: string | null;
}

export function useTranslation() {
  const { ollamaUrl, selectedModel } = useSettings();
  const [state, setState] = useState<TranslationState>({
    output: "",
    isTranslating: false,
    error: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((prev) => ({ ...prev, isTranslating: false }));
  }, []);

  const translate = useCallback(
    async ({ text, sourceLang, targetLang }: TranslateParams) => {
      // Abort any in-flight translation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!text.trim()) {
        setState({ output: "", isTranslating: false, error: null });
        return;
      }

      if (!selectedModel) {
        setState({
          output: "",
          isTranslating: false,
          error: "No model selected. Please configure a model in settings.",
        });
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({ output: "", isTranslating: true, error: null });

      const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Only output the translation, no introductory text:\n\n${text}`;

      try {
        const res = await fetch("/api/ollama/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ollamaUrl, model: selectedModel, prompt }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(data.error || `Request failed with status ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.response) {
                setState((prev) => ({
                  ...prev,
                  output: prev.output + json.response,
                }));
              }
              if (json.done) {
                setState((prev) => ({ ...prev, isTranslating: false }));
              }
            } catch {
              // Ignore unparseable lines
            }
          }
        }

        setState((prev) => ({ ...prev, isTranslating: false }));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Translation was cancelled — don't update error state
          return;
        }
        const message =
          err instanceof Error ? err.message : "Model failed to generate response";
        setState({ output: "", isTranslating: false, error: message });
      }
    },
    [ollamaUrl, selectedModel]
  );

  const clearOutput = useCallback(() => {
    setState({ output: "", isTranslating: false, error: null });
  }, []);

  return {
    ...state,
    translate,
    abort,
    clearOutput,
  };
}
