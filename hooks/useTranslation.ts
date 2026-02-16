"use client";

import { useCallback } from "react";
import { useOllamaGeneration } from "@/hooks/useOllamaGeneration";

interface TranslateParams {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export function useTranslation() {
  const { output, isGenerating, error, generate, abort, clearOutput } =
    useOllamaGeneration();

  const translate = useCallback(
    async ({ text, sourceLang, targetLang }: TranslateParams) => {
      if (!text.trim()) {
        clearOutput();
        return;
      }

      const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Only output the translation, no introductory text:\n\n${text}`;
      await generate(prompt);
    },
    [generate, clearOutput]
  );

  return {
    output,
    isTranslating: isGenerating,
    error,
    translate,
    abort,
    clearOutput,
  };
}
