"use client";

import { useCallback } from "react";
import { useOllamaGeneration } from "@/hooks/useOllamaGeneration";

interface SpellcheckParams {
  text: string;
  languageHint?: string;
}

export function useSpellcheck() {
  const { output, isGenerating, error, generate, abort, clearOutput } =
    useOllamaGeneration();

  const spellcheck = useCallback(
    async ({ text, languageHint }: SpellcheckParams) => {
      if (!text.trim()) {
        clearOutput();
        return;
      }

      const languageLine = languageHint
        ? `The input language is primarily ${languageHint}.`
        : "Detect the input language.";

      const prompt = `You are a careful spellchecker and grammar corrector.\n${languageLine}\nCorrect spelling, grammar, and punctuation mistakes while preserving the original meaning, tone, and formatting (including line breaks).\nDo not translate the text.\nIf the text is already correct, return it unchanged.\nOnly output the corrected text with no commentary.\n\nText:\n${text}`;

      await generate(prompt);
    },
    [generate, clearOutput]
  );

  return {
    correctedText: output,
    isChecking: isGenerating,
    error,
    spellcheck,
    abort,
    clearOutput,
  };
}
