"use client";

import { CopyButton } from "./CopyButton";

interface SpellcheckPaneProps {
  mode: "input" | "output";
  text: string;
  onTextChange?: (text: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onClear?: () => void;
  onUseResult?: () => void;
}

export function SpellcheckPane({
  mode,
  text,
  onTextChange,
  isLoading = false,
  error = null,
  onClear,
  onUseResult,
}: SpellcheckPaneProps) {
  const isInput = mode === "input";

  return (
    <div className="flex flex-col flex-1 min-h-0 border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {isInput ? "Original Text" : "Corrected Text"}
        </span>
        <div className="flex items-center gap-2">
          {isInput && text && (
            <button
              onClick={onClear}
              className="flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Clear text"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {!isInput && (
            <>
              <button
                onClick={onUseResult}
                disabled={!text}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-600"
              >
                Replace Input
              </button>
              <CopyButton text={text} />
            </>
          )}
        </div>
      </div>

      <div className="relative flex-1">
        {isLoading && !text && !isInput && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-sm text-gray-400 animate-pulse">Checking…</span>
          </div>
        )}
        {error && !isInput && (
          <div className="absolute inset-0 flex items-start p-4 pointer-events-none">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        <textarea
          value={text}
          onChange={isInput ? (e) => onTextChange?.(e.target.value) : undefined}
          readOnly={!isInput}
          placeholder={isInput ? "Paste or type text to spellcheck…" : "Corrected text appears here…"}
          className={`w-full h-full min-h-[240px] resize-none p-4 text-sm leading-relaxed focus:outline-none ${
            !isInput ? "bg-gray-50 text-gray-700 cursor-default" : "text-gray-900"
          }`}
          spellCheck={isInput}
        />
      </div>
    </div>
  );
}
