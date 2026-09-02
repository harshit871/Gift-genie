import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.AI_KEY,
    baseURL: process.env.AI_URL,
});

const systemPrompt = `You are the Gift Genie that can search the web! 

You generate gift ideas that feel thoughtful, specific, and genuinely useful.
Your output must be in structured Markdown.
Do not write introductions or conclusions.
Start directly with the gift suggestions.

Each gift must:
- Have a clear heading with the actual product's name
- Include a short explanation of why it works
- Include the current price or a price range
- Include one or more links to websites or social media business pages
where the gift can be bought

Prefer products that are widely available and well-reviewed.
If you can't find a working link, say so rather than guessing.

If the user mentions a location, situation, or constraint,
adapt the gift ideas and add another short section 
under each gift that guides the user to get the gift in that 
constrained context.

After the gift ideas, include a section titled "Questions for you"
with clarifying questions that would help improve the recommendations.

Finish with a section with H2 heading titled "Wanna browse yourself?"
with links to various ecommerce sites with relevant search queries and filters 
already applied.`;

// Browser
//    │
//    │ POST /api/...
//    │ { userPrompt: "Hello" }
//    ▼
// Next.js Route Handler
//    │
//    │ OpenAI request (stream: true)
//    ▼
// OpenAI
//    │
//    │ "Hel"
//    │ "lo"
//    │ "!"
//    ▼
// Next.js
//    │
//    │ SSE chunks
//    │ data: {"delta":"Hel"}\n\n
//    │ data: {"delta":"lo"}\n\n
//    │ data: {"delta":"!"}\n\n
//    │ data: [DONE]\n\n
//    ▼
// Browser

export async function POST(req) {
    const { userPrompt } = await req.json();

    const encoder = new TextEncoder();
    let hasSentData = false;

    // * I'm creating a stream in which i can push data time to time
    const stream = new ReadableStream({
        // * run this function when the streaming starts
        async start(controller) { // * controller is the control to put data in the stream
            try {
                const openaiStream = await openai.responses.create({
                    model: process.env.AI_MODEL,
                    input: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt },
                    ],
                    //   tools: [{ type: "web_search_preview" }],
                    stream: true,
                });

                for await (const event of openaiStream) { // openaiStream is a async iterable => इसमें future में values आती रहेंगी और हर value आने पर मुझे process करने देना।
                    if (event.type === "response.output_text.delta") {
                        controller.enqueue(
                            encoder.encode( // * converts string into bytes to Uint8Array for queuing this chunk into controller, Not required as they will be passed as bytes due to "Content-Type": "text/event-stream", but byte streams are a very common and predictable representation.
                                `data: ${JSON.stringify({ delta: event.delta })}\n\n`
                            )
                        );
                        hasSentData = true;
                    }
                }

                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            } catch (e) {
                console.error(e);
                const errPayload = hasSentData
                    ? "data: [DONE]\n\n"
                    : `data: ${JSON.stringify({ error: "Something went wrong on the server" })}\n\n`;
                controller.enqueue(encoder.encode(errPayload));
            } finally {
                controller.close(); // * Closing the stream
            }
        },
    });

    // ReadableStream created
    //        ↓
    // enqueue("Hello")
    //        ↓
    // enqueue(" world")
    //        ↓
    // enqueue("!")
    //        ↓
    // close()

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream", // telling browser it's a SSE stream and and keeps the HTTP connection open indefinitely instead of closing it right away.
            "Cache-Control": "no-cache", // server → immediately → client
            Connection: "keep-alive", // To keep HTTP connection alive, Not mandatory with HTTP/2/HTTP/3 environments
        },
    });
}

// OpenAI:
//     event.delta = "Hel"

//         ↓

// JSON:
//     {"delta":"Hel"}

//         ↓

// SSE:
//     data: {"delta":"Hel"}\n\n

//         ↓

// TextEncoder:
//     bytes

//         ↓

// controller.enqueue():
//     stream में डालो

//         ↓

// Browser:
//     chunk receive करो

// Mental Model
//                 ┌───────────────┐
// POST /api/chat  │   Next.js     │
// ───────────────►│ Route Handler │
//                 └───────┬───────┘
//                         │
//                         │ stream:true
//                         ▼
//                 ┌───────────────┐
//                 │    OpenAI     │
//                 └───────┬───────┘
//                         │
//                  delta "Hel"
//                         │
//                  delta "lo"
//                         │
//                  delta "!"
//                         ▼
//                 ┌───────────────┐
//                 │ for await     │
//                 │ each event    │
//                 └───────┬───────┘
//                         │
//                  controller.enqueue()
//                         │
//                         ▼
//                 ┌───────────────┐
//                 │ ReadableStream│
//                 └───────┬───────┘
//                         │
//                         ▼
//                      Browser