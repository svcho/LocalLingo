"use client";

import { useState, useEffect, useCallback } from "react";
import { TranslationPane } from "@/components/TranslationPane";
import { SpellcheckPane } from "@/components/SpellcheckPane";
import { useTranslation } from "@/hooks/useTranslation";
import { useSpellcheck } from "@/hooks/useSpellcheck";
import { useDebounce } from "@/hooks/useDebounce";
import { useSettings } from "@/context/SettingsContext";
import { DEBOUNCE_DELAY } from "@/lib/constants";
import { LANGUAGES } from "@/lib/languages";

const DEFAULT_SOURCE_LANG = "English";
const DEFAULT_TARGET_LANG = "Spanish";
type WorkspaceMode = "translate" | "spellcheck";

export default function HomePage() {
  const { connectionStatus } = useSettings();
  const [mode, setMode] = useState<WorkspaceMode>("translate");
  const [sourceText, setSourceText] = useState("");
  const [sourceLang, setSourceLang] = useState(DEFAULT_SOURCE_LANG);
  const [targetLang, setTargetLang] = useState(DEFAULT_TARGET_LANG);
  const [spellcheckText, setSpellcheckText] = useState("");

  const { output, isTranslating, error, translate, abort, clearOutput } =
    useTranslation();
  const {
    correctedText,
    isChecking,
    error: spellcheckError,
    spellcheck,
    abort: abortSpellcheck,
    clearOutput: clearSpellcheckOutput,
  } = useSpellcheck();

  const debouncedSource = useDebounce(sourceText, DEBOUNCE_DELAY);
  const debouncedSpellcheck = useDebounce(spellcheckText, DEBOUNCE_DELAY);

  // Auto-translate on debounced source text change
  useEffect(() => {
    if (mode !== "translate") return;
    if (debouncedSource.trim()) {
      translate({ text: debouncedSource, sourceLang, targetLang });
    } else {
      abort();
      clearOutput();
    }
  }, [mode, debouncedSource, sourceLang, targetLang, translate, abort, clearOutput]);

  // Auto-spellcheck on debounced input change
  useEffect(() => {
    if (mode !== "spellcheck") return;
    if (debouncedSpellcheck.trim()) {
      spellcheck({ text: debouncedSpellcheck });
    } else {
      abortSpellcheck();
      clearSpellcheckOutput();
    }
  }, [mode, debouncedSpellcheck, spellcheck, abortSpellcheck, clearSpellcheckOutput]);

  // Cancel background work when switching modes
  useEffect(() => {
    if (mode === "translate") {
      abortSpellcheck();
    } else {
      abort();
    }
  }, [mode, abort, abortSpellcheck]);

  const handleSourceChange = useCallback(
    (text: string) => {
      setSourceText(text);
      if (!text.trim()) {
        abort();
        clearOutput();
      }
    },
    [abort, clearOutput]
  );

  const handleSpellcheckChange = useCallback(
    (text: string) => {
      setSpellcheckText(text);
      if (!text.trim()) {
        abortSpellcheck();
        clearSpellcheckOutput();
      }
    },
    [abortSpellcheck, clearSpellcheckOutput]
  );

  const handleTranslateClick = useCallback(() => {
    if (sourceText.trim()) {
      translate({ text: sourceText, sourceLang, targetLang });
    }
  }, [sourceText, sourceLang, targetLang, translate]);

  const handleSpellcheckClick = useCallback(() => {
    if (spellcheckText.trim()) {
      spellcheck({ text: spellcheckText });
    }
  }, [spellcheckText, spellcheck]);

  const handleSwap = useCallback(() => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(output || sourceText);
    abort();
    clearOutput();
  }, [sourceLang, targetLang, output, sourceText, abort, clearOutput]);

  const handleUseCorrection = useCallback(() => {
    if (!correctedText.trim()) return;
    setSpellcheckText(correctedText);
  }, [correctedText]);

  const isDisconnected = connectionStatus === "disconnected";

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 max-w-7xl mx-auto w-full">
      {/* Disconnected banner */}
      {isDisconnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          Ollama is not reachable. Click the status pill in the header to configure your connection.
        </div>
      )}

      {/* Mode switch */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setMode("translate")}
            aria-pressed={mode === "translate"}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              mode === "translate"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Translate
          </button>
          <button
            onClick={() => setMode("spellcheck")}
            aria-pressed={mode === "spellcheck"}
            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
              mode === "spellcheck"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Spellcheck
          </button>
        </div>
      </div>

      {mode === "translate" ? (
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {/* Source pane */}
          <TranslationPane
            mode="source"
            language={sourceLang}
            onLanguageChange={setSourceLang}
            text={sourceText}
            onTextChange={handleSourceChange}
          />

          {/* Center controls */}
          <div className="flex md:flex-col items-center justify-center gap-3 md:py-4">
            {/* Swap button */}
            <button
              onClick={handleSwap}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Swap languages"
              title="Swap languages"
            >
              <svg
                className="w-4 h-4 text-gray-500 md:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </button>

            {/* Translate button */}
            <button
              onClick={handleTranslateClick}
              disabled={!sourceText.trim() || isDisconnected || isTranslating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
            >
              {isTranslating ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Translating
                </>
              ) : (
                "Translate"
              )}
            </button>
          </div>

          {/* Target pane */}
          <TranslationPane
            mode="target"
            language={targetLang}
            onLanguageChange={setTargetLang}
            text={output}
            isLoading={isTranslating}
            error={error}
          />
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <SpellcheckPane
            mode="input"
            text={spellcheckText}
            onTextChange={handleSpellcheckChange}
            onClear={() => handleSpellcheckChange("")}
          />

          <div className="flex md:flex-col items-center justify-center gap-3 md:py-4">
            <button
              onClick={handleSpellcheckClick}
              disabled={!spellcheckText.trim() || isDisconnected || isChecking}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
            >
              {isChecking ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Checking
                </>
              ) : (
                "Spellcheck"
              )}
            </button>
          </div>

          <SpellcheckPane
            mode="output"
            text={correctedText}
            isLoading={isChecking}
            error={spellcheckError}
            onUseResult={handleUseCorrection}
          />
        </div>
      )}

      {/* Language count hint */}
      <p className="text-xs text-gray-400 text-center">
        {mode === "translate"
          ? `${LANGUAGES.length} languages supported · All inference runs locally via Ollama`
          : "Auto-checks after a short pause · All inference runs locally via Ollama"}
      </p>
    </div>
  );
}
