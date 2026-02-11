"use client";

import { LanguageSelector } from "./LanguageSelector";
import { CopyButton } from "./CopyButton";

interface TranslationPaneProps {
  mode: "source" | "target";
  language: string;
  onLanguageChange: (lang: string) => void;
  text: string;
  onTextChange?: (text: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function TranslationPane({
  mode,
  language,
  onLanguageChange,
  text,
  onTextChange,
  isLoading = false,
  error = null,
}: TranslationPaneProps) {
  const isSource = mode === "source";

  const handleClear = () => {
    onTextChange?.("");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
        <LanguageSelector
          value={language}
          onChange={onLanguageChange}
        />
        <div className="flex items-center gap-2">
          {isSource && text && (
            <button
              onClick={handleClear}
              className="flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Clear text"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {!isSource && <CopyButton text={text} />}
        </div>
      </div>

      {/* Text area */}
      <div className="relative flex-1">
        {isLoading && !text && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm text-gray-400 animate-pulse">Translating…</span>
          </div>
        )}
        {error && !isSource && (
          <div className="absolute inset-0 flex items-start p-4 pointer-events-none">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        <textarea
          value={text}
          onChange={isSource ? (e) => onTextChange?.(e.target.value) : undefined}
          readOnly={!isSource}
          placeholder={isSource ? "Enter text to translate…" : ""}
          className={`w-full h-full min-h-[240px] resize-none p-4 text-sm leading-relaxed focus:outline-none ${
            !isSource ? "bg-gray-50 text-gray-700 cursor-default" : "text-gray-900"
          }`}
          spellCheck={isSource}
        />
      </div>
    </div>
  );
}
