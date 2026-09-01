# Gift Genie 🧞

An AI-powered gift recommendation app that searches the web in real time to suggest thoughtful, specific gifts with prices and purchase links.

## How It Works

1. Describe the person and occasion in the text area (e.g. budget, interests, time constraints, location).
2. Hit **"Rub the Lamp"** — the frontend posts your prompt to the Express backend.
3. The server calls the AI Responses API with the `web_search_preview` tool and **streams the response back** to the browser via Server-Sent Events (SSE).
4. The client reads the SSE stream chunk by chunk, accumulating Markdown and re-rendering it live as tokens arrive.
5. When the server sends the `[DONE]` sentinel, the stream loop exits cleanly and the UI resets to idle.

## Tech Stack

| Layer        | Tool                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| Frontend     | Vanilla JS + Vite (dev bundler only)                                                                    |
| Backend      | [Express](https://expressjs.com/) (Node.js)                                                             |
| AI SDK       | [OpenAI Node SDK](https://github.com/openai/openai-node) (Responses API with `web_search_preview` tool) |
| Streaming    | Server-Sent Events (SSE) — `response.output_text.delta` events forwarded in real time                   |
| Markdown     | [marked](https://github.com/markedjs/marked)                                                            |
| Sanitization | [DOMPurify](https://github.com/cure53/DOMPurify)                                                        |
| Styling      | Vanilla CSS (LCH color system, CSS custom properties)                                                   |

> **Note:** The OpenAI SDK is used with a custom `baseURL`, so any OpenAI-compatible provider (Groq, OpenRouter, etc.) works.

## Prerequisites

- **Node.js** ≥ 18
- An API key for an OpenAI-compatible provider that supports the Responses API with `web_search_preview`

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/harshit871/Gift-genie.git
cd Gift-genie

# 2. Install dependencies
npm install

# 3. Create a .env file in the project root
cp .env.example .env   # or create manually
```

### Environment Variables

Create a `.env` file with the following:

```env
AI_URL=https://api.your-provider.com/v1
AI_KEY=your-api-key-here
AI_MODEL=your-model-name
PORT=3000          # optional, defaults to 3000
```

| Variable   | Description                                            |
| ---------- | ------------------------------------------------------ |
| `AI_URL`   | Base URL of the OpenAI-compatible API provider         |
| `AI_KEY`   | API key for authentication (**never sent to browser**) |
| `AI_MODEL` | Model identifier (e.g. `gpt-4o`, `openai/gpt-oss-20b`) |
| `PORT`     | Port the Express server listens on (default: `3000`)   |

### Run the Dev Server

```bash
npm run dev
```

Vite's dev server proxies `/api/*` requests to the Express backend. Open `http://localhost:5173` in your browser.

### Run the Production Server

```bash
# Build the frontend bundle
npm run build

# Start the Express server (serves the built frontend + API)
node server.js
```

The app will be available at `http://localhost:3000` (or whichever `PORT` you set).

## Project Structure

```
Gift-genie/
├── assets/
│   ├── genie.svg          # Header genie icon
│   └── lamp.svg           # Lamp button icon
├── index.html             # Entry HTML (single page)
├── index.js               # Frontend — form handling, SSE stream reader, Markdown renderer
├── utils.js               # Helpers — textarea resize, loading/stream UI state
├── style.css              # All styles (dark theme, animations, responsive)
├── server.js              # Express backend — AI proxy, SSE streaming endpoint
├── vite.config.js         # Vite config — dev proxy for /api/* → Express
├── package.json
├── .env                   # Your local env vars (git-ignored)
└── .gitignore
```

### Key Files

- **[`server.js`](server.js)** — Express app. Exposes `POST /api/gift`, creates an OpenAI streaming request (`stream: true`), and forwards each `response.output_text.delta` event to the client as an SSE `data:` line. Ends the stream with a `data: [DONE]` sentinel.
- **[`index.js`](index.js)** — Posts the user prompt to `/api/gift`, reads the SSE stream with a `ReadableStream` reader, accumulates Markdown deltas, and re-renders them live with `marked` + `DOMPurify`. Uses a `streamDone` flag to cleanly exit the read loop when `[DONE]` is received.
- **[`utils.js`](utils.js)** — `setLoading()` / `showStream()` manage UI state transitions; `autoResizeTextarea()` grows the input as the user types.
- **[`vite.config.js`](vite.config.js)** — Configures the Vite dev server proxy so `/api/*` requests are forwarded to the local Express server without CORS issues.

## How the AI Integration Works

1. The user submits a prompt via the frontend form.
2. `index.js` `POST`s the prompt to `POST /api/gift` on the Express backend.
3. `server.js` sets SSE headers (`Content-Type: text/event-stream`) and opens a streaming Responses API call with the `web_search_preview` tool enabled.
4. For every `response.output_text.delta` event, the server writes `data: {"delta":"..."}` to the response.
5. Once the stream ends, the server writes `data: [DONE]` and closes the connection.
6. The frontend reads each SSE line, accumulates the deltas, parses them with `marked`, sanitises with `DOMPurify`, and injects into the DOM — giving the user a live, streaming Markdown render.
7. On receiving `[DONE]`, a `streamDone` flag exits the read loop without attempting another `reader.read()` on the closed stream.

> **🔒 Security:** The API key lives exclusively in `.env` and is only accessed by the Express server. It is **never bundled into or sent to the browser**.

## License

This project does not currently specify a license. Contact the repository owner for usage terms.
