"use client";

import { useState, useCallback } from "react";
import GiftInput from "./GiftInput";
import Response from "./Response";

export default function AppContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [accumulated, setAccumulated] = useState("");  // * accumulated holds the full markdown text built up from SSE deltas
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = useCallback(
    async (userPrompt) => {
      if (isLoading) return;

      // setLoading(true): hide output, animate lamp
      setIsLoading(true);
      setIsStreaming(false);
      setAccumulated("");
      setErrorMsg(null);

      try {
        const res = await fetch("/api/gift", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userPrompt }),
        });

        // showStream(): reveal output container as stream begins
        setIsStreaming(true);

        const reader = res.body.getReader(); // Give me manual control over reading the response body stream rather than res.json() which waits for the entire response.
        const decoder = new TextDecoder(); // bytes → TextDecoder → String
        let buffer = "";
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read(); // * reader.read gives Uint8Array
          if (done) break;

          // Buffer handles chunks that split an SSE line mid-way
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep last incomplete line

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") { streamDone = true; break; }

            const { delta, error } = JSON.parse(payload);
            if (error) throw new Error(error);

            // Append delta — re-render is triggered by React state update
            setAccumulated((prev) => prev + delta);
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(
          "Sorry, I can't access what I need right now. Please try again in a bit."
        );
      } finally {
        // setLoading(false): restore compact lamp
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const hasResponse = isStreaming || !!errorMsg;

  return (
    <main className="main-content">
      <GiftInput
        isLoading={isLoading}
        hasResponse={hasResponse}
        onSubmit={handleSubmit}
      />
      <Response
        isLoading={isLoading}
        isStreaming={isStreaming}
        accumulated={accumulated}
        errorMsg={errorMsg}
      />
    </main>
  );
}