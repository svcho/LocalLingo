"use client";

import { useState, useCallback, useRef } from "react";
import { useSettings } from "@/context/SettingsContext";

interface GenerationState {
  output: string;
  isGenerating: boolean;
  error: string | null;
}

interface StreamChunk {
  response?: string;
}

export function useOllamaGeneration() {
  const { ollamaUrl, selectedModel } = useSettings();
  const [state, setState] = useState<GenerationState>({
    output: "",
    isGenerating: false,
    error: null,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState((prev) => ({ ...prev, isGenerating: false }));
  }, []);

  const clearOutput = useCallback(() => {
    setState({ output: "", isGenerating: false, error: null });
  }, []);

  const generate = useCallback(
    async (prompt: string) => {
      // Abort any in-flight generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!prompt.trim()) {
        clearOutput();
        return;
      }

      if (!selectedModel) {
        setState({
          output: "",
          isGenerating: false,
          error: "No model selected. Please configure a model in settings.",
        });
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({ output: "", isGenerating: true, error: null });

      const appendChunk = (line: string) => {
        if (!line.trim()) return;

        try {
          const json = JSON.parse(line) as StreamChunk;
          if (json.response) {
            setState((prev) => ({
              ...prev,
              output: prev.output + json.response,
            }));
          }
        } catch {
          // Ignore unparseable lines
        }
      };

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
            appendChunk(line);
          }
        }

        appendChunk(buffer);
        setState((prev) => ({ ...prev, isGenerating: false }));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled; keep current output as-is.
          return;
        }

        const message =
          err instanceof Error ? err.message : "Model failed to generate response";
        setState({ output: "", isGenerating: false, error: message });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [ollamaUrl, selectedModel, clearOutput]
  );

  return {
    ...state,
    generate,
    abort,
    clearOutput,
  };
}
