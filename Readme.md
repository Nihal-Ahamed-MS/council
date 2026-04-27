# Council

A terminal-based chat app built on top of LiteLLM Gateway to query all your favorite LLMs at once using.


## Features

- Broadcasts one prompt to all active models in parallel
- Streams tokens in real time — all panels update simultaneously
- Two modes: **gateway mode** (LiteLLM via Docker) and **sdk mode** (direct API calls)
- Independently scrollable panels per model

## Requirements

- Node.js 18+
- Docker Desktop (optional — needed for Ollama and gateway mode)
- API keys for the providers you want to use

## Install

```bash
npm install -g .
```

## Usage

**First-time setup** — configure providers and API keys:

```bash
council setup
# or
npm run setup
```

**Launch the TUI:**

```bash
council
# or
npm start
```

## Supported Models

| Provider | Model | Requires |
|---|---|---|
| OpenAI | `openai/gpt-4o` | `OPENAI_API_KEY` |
| Anthropic | `anthropic/claude-3-5-sonnet-latest` | `ANTHROPIC_API_KEY` |
| Google | `gemini/gemini-2.5-flash` | `GEMINI_API_KEY` |
| Ollama | `ollama/llama3` | Docker + Ollama running locally |

## Logs

Logs are written to `council.log` in the directory where you run the command.

## Tech Stack

- **Runtime:** Node.js
- **TUI:** [Ink](https://github.com/vadimdemedes/ink) (React for terminals)
- **Gateway:** [LiteLLM](https://github.com/BerriAI/litellm) (Docker)
- **SDK fallbacks:** `openai`, `@anthropic-ai/sdk`, `@google/generative-ai`
