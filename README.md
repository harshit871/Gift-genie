# Gift Genie 🧞

An AI-powered gift recommendation app that searches the web in real time to suggest thoughtful, specific gifts with prices and purchase links — streamed live to your browser.

## How It Works

1. Describe the person and occasion in the textarea (e.g. budget, interests, location, time constraints).
2. Hit **"Rub the Lamp"** — the React frontend posts your prompt to a Next.js Route Handler.
3. The server calls an OpenAI-compatible API with `stream: true` and **streams the response back** via Server-Sent Events (SSE).
4. The client reads SSE chunks, accumulates Markdown deltas, and re-renders them live as tokens arrive.
5. When the server sends the `[DONE]` sentinel, the stream loop exits and the UI resets to idle.

## Tech Stack

| Layer        | Tool                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Framework    | [Next.js 16](https://nextjs.org/) (App Router)                                                       |
| UI           | [React 19](https://react.dev/) — Server + Client Components                                          |
| AI SDK       | [OpenAI Node SDK](https://github.com/openai/openai-node) (Responses API, `stream: true`)             |
| Streaming    | Server-Sent Events (SSE) — `response.output_text.delta` events forwarded in real time                |
| Markdown     | [marked](https://github.com/markedjs/marked)                                                         |
| Sanitization | [DOMPurify](https://github.com/cure53/DOMPurify)                                                     |
| Styling      | Vanilla CSS (`globals.css`) — dark theme, CSS custom properties, animations                          |

> **Note:** The OpenAI SDK is initialised with a custom `baseURL`, so any OpenAI-compatible provider (Groq, OpenRouter, etc.) works out of the box.

## Prerequisites

- **Node.js** ≥ 18
- An API key for an OpenAI-compatible provider that supports the Responses API with streaming

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/harshit871/gift-genie.git
cd gift-genie

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env   # or create .env manually
```

### Environment Variables

Create a `.env` file in the project root:

```env
AI_URL=https://api.your-provider.com/v1
AI_KEY=your-api-key-here
AI_MODEL=your-model-name
```

| Variable   | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `AI_URL`   | Base URL of your OpenAI-compatible API provider                 |
| `AI_KEY`   | API key for authentication (**never sent to the browser**)      |
| `AI_MODEL` | Model identifier (e.g. `gpt-4o`, `openai/gpt-oss-20b`)         |

### Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
gift-genie/
├── app/
│   ├── api/
│   │   └── gift/
│   │       └── route.js        # Next.js Route Handler — SSE streaming endpoint
│   ├── components/
│   │   ├── AppContent.jsx      # Client Component — state management + SSE reader
│   │   ├── GiftInput.jsx       # Client Component — textarea + submit button
│   │   └── Response.jsx        # Client Component — live Markdown renderer
│   ├── globals.css             # Global styles (dark theme, animations)
│   ├── layout.js               # Root layout (metadata, body)
│   └── page.js                 # Home page — header + <AppContent />
├── public/
│   ├── genie.svg               # Header genie icon
│   └── lamp.svg                # Lamp button icon
├── .env                        # Local env vars (git-ignored)
├── next.config.mjs
└── package.json
```

### Key Files

- **[`app/api/gift/route.js`](app/api/gift/route.js)** — The Next.js Route Handler (`POST /api/gift`). Creates a `ReadableStream`, calls the OpenAI Responses API with `stream: true`, and forwards each `response.output_text.delta` event to the browser as an SSE `data:` line. Ends with `data: [DONE]`.

- **[`app/components/AppContent.jsx`](app/components/AppContent.jsx)** — Top-level client component that owns all state (`isLoading`, `accumulated`, `isStreaming`, `errorMsg`). Fetches `/api/gift`, manually reads the SSE stream, accumulates Markdown deltas via `setAccumulated`, and passes state down as props.

- **[`app/components/GiftInput.jsx`](app/components/GiftInput.jsx)** — Controlled textarea + submit button. Auto-resizes as the user types. Button label and CSS class adapt based on `isLoading` and `hasResponse` props.

- **[`app/components/Response.jsx`](app/components/Response.jsx)** — Renders the accumulated Markdown using `marked` + `DOMPurify`. Shows a loading state while waiting, live Markdown while streaming, or an error message if something goes wrong.

## Data Flow

```
Browser (React)
    │
    │  POST /api/gift  { userPrompt }
    ▼
Next.js Route Handler  (app/api/gift/route.js)
    │
    │  openai.responses.create({ stream: true })
    ▼
OpenAI-compatible API
    │
    │  response.output_text.delta → "Hel"
    │  response.output_text.delta → "lo"
    │  response.output_text.delta → "!"
    ▼
Next.js  (ReadableStream + controller.enqueue)
    │
    │  data: {"delta":"Hel"}
    │  data: {"delta":"lo"}
    │  data: {"delta":"!"}
    │  data: [DONE]
    ▼
Browser  (AppContent SSE reader → setAccumulated → Response renders live Markdown)
```

## How the AI Integration Works

1. The user submits a prompt via `GiftInput`.
2. `AppContent` `POST`s the prompt to `/api/gift`.
3. `route.js` sets SSE headers (`Content-Type: text/event-stream`) and opens a streaming Responses API call.
4. For every `response.output_text.delta` event, the server writes `data: {"delta":"..."}` to the response stream.
5. Once the AI stream ends, the server writes `data: [DONE]` and closes the connection.
6. The client reads each SSE line, accumulates the deltas, parses them with `marked`, sanitises with `DOMPurify`, and injects into the DOM — giving the user a live Markdown render.
7. On receiving `[DONE]`, a `streamDone` flag exits the read loop cleanly.

> **🔒 Security:** The API key lives exclusively in `.env` and is only read by the Next.js server. It is **never bundled into or sent to the browser**.

## License

This project does not currently specify a license. Contact the repository owner for usage terms.
