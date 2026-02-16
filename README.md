# LocalLingo

Local-first translation and spellchecking powered by [Ollama](https://ollama.com).
Your text is processed by your own local model and does not require cloud APIs or API keys.

## Highlights

- Private by default: inference runs against your configured Ollama instance
- Two focused workflows in one UI: `Translate` for bilingual translation and `Spellcheck` for spelling, grammar, and punctuation correction
- Streaming model output for responsive feedback
- Auto-run after typing pause (800 ms debounce), plus manual action buttons
- Model + endpoint settings persisted in `localStorage`
- Works on desktop and mobile layouts

## Requirements

- Node.js 18+
- pnpm
- Ollama installed and running (default: `http://localhost:11434`)
- At least one local model pulled in Ollama

Example:

```bash
ollama pull translategemma:4b
# or mistral / gemma3 / qwen2.5 etc.
```

## Quick Start

```bash
git clone https://github.com/svcho/LocalLingo.git
cd LocalLingo
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## How To Use

### Translate Mode

1. Select source and target languages.
2. Type or paste text in the left pane.
3. Translation streams into the right pane automatically after a short pause.
4. Optional controls: `Translate` to run immediately, `Swap` to swap languages and reuse output, and `Copy` to copy translated text.

### Spellcheck Mode

1. Switch to `Spellcheck`.
2. Paste or type text in the input pane.
3. Corrected text appears in the output pane (auto-check + manual `Spellcheck` button).
4. Optional controls: `Replace Input` to continue editing from corrected text and `Copy` to copy corrected text.

## Privacy And Safety Notes

- LocalLingo only sends text to your configured Ollama URL.
- If you point to a remote Ollama host, privacy depends on that host/network.
- Model outputs can be wrong or stylistically imperfect. Review important text before use.

## Configuration

Click the status pill in the header to open settings:

- Set Ollama URL
- Test connection
- Choose the active model

## Supported Translation Languages

English, Spanish, French, German, Italian, Portuguese, Chinese (Simplified), Chinese (Traditional), Japanese, Korean, Russian, Arabic, Hindi, Dutch, Swedish, Polish, Turkish, Vietnamese, Thai, Indonesian.

## Build And Run

```bash
pnpm build
pnpm start
```

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript 5
- Tailwind CSS v4
- Ollama local models

## Project Structure

```text
app/
  api/ollama/
    tags/route.ts
    generate/route.ts
  layout.tsx
  page.tsx
components/
  Header.tsx
  SettingsModal.tsx
  SpellcheckPane.tsx
  TranslationPane.tsx
  CopyButton.tsx
context/
  SettingsContext.tsx
hooks/
  useOllamaGeneration.ts
  useTranslation.ts
  useSpellcheck.ts
```

## License

MIT
