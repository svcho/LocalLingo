# LocalLingo

A privacy-focused translation web app powered entirely by local AI models via [Ollama](https://ollama.com). No text ever leaves your machine or network.

![LocalLingo screenshot](https://github.com/user-attachments/assets/placeholder)

## Features

- **100% private** — all inference runs locally; no API keys, no cloud services
- **Streaming output** — translations appear token-by-token as the model generates them
- **Auto-translate** — starts translating automatically after you stop typing (800 ms debounce)
- **20 languages** — English, Spanish, French, German, Italian, Portuguese, Chinese (Simplified & Traditional), Japanese, Korean, Russian, Arabic, Hindi, Dutch, Swedish, Polish, Turkish, Vietnamese, Thai, Indonesian
- **Swap languages** — exchange source and target languages (and their text) in one click
- **Settings modal** — configure the Ollama URL, test the connection, and pick a model; settings persist across sessions
- **Connection status pill** — live indicator showing the connected model or a disconnected state
- **Responsive** — split-pane layout on desktop, stacked on mobile

## How it works

The browser talks to a local Next.js API server (two thin proxy routes) rather than calling Ollama directly. This avoids any CORS configuration on Ollama's side while keeping all data on your machine.

```
Browser → Next.js API routes → Ollama (localhost:11434)
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Ollama](https://ollama.com/download) installed and running locally
- At least one language model pulled in Ollama (a general-purpose instruction model works best):

```bash
ollama pull llama3.2
# or any other model, e.g. mistral, gemma3, qwen2.5
```

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/svcho/LocalLingo.git
cd LocalLingo

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The status pill in the top-right corner will turn green once LocalLingo connects to Ollama and a model is detected.

## Production build

```bash
pnpm build
pnpm start
```

## Configuration

Click the status pill in the top-right corner to open the Settings panel where you can:

- **Change the Ollama URL** — useful if Ollama is running on a different host or port (default: `http://localhost:11434`)
- **Test the connection** — verifies Ollama is reachable before saving
- **Select a model** — choose from any model you have pulled in Ollama

Settings are persisted in `localStorage` and restored on next visit.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| State | React Context + `localStorage` |
| AI backend | [Ollama](https://ollama.com) (local) |
| Package manager | pnpm |

## Project structure

```
app/
  api/ollama/
    tags/route.ts       # Proxy: GET /api/tags → Ollama
    generate/route.ts   # Proxy: POST /api/generate → Ollama (streaming)
  layout.tsx
  page.tsx
  globals.css
components/
  Header.tsx            # App title + status pill
  StatusPill.tsx        # Connection indicator (green/yellow/red)
  SettingsModal.tsx     # URL input, connection test, model selector
  TranslationPane.tsx   # Reusable source/target pane
  LanguageSelector.tsx  # Language dropdown
  CopyButton.tsx        # Clipboard copy with feedback
context/
  SettingsContext.tsx   # Global settings state
hooks/
  useOllama.ts          # Connection health + model list
  useTranslation.ts     # Streaming translation logic
  useDebounce.ts        # Debounce hook
lib/
  constants.ts          # Default URL, debounce delay
  languages.ts          # Supported language list
```

## License

MIT
