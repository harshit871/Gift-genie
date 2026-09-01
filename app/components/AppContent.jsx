"use client";

import { useState, useCallback } from "react";
import GiftInput from "./GiftInput";
import Response from "./Response";

export default function AppContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = useCallback(
    async (userInput) => {
      if (isLoading) return;

      setIsLoading(true);
      setResponse(null);

      try {
        const res = await fetch("/api/gift", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userInput }),
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();
        setResponse(data);
      } catch (err) {
        console.error(err);
        setResponse({ error: "Something went wrong. Please try again." });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  return (
    <main className="main-content">
      <GiftInput isLoading={isLoading} hasResponse={response !== null} onSubmit={handleSubmit} />
      <Response isLoading={isLoading} response={response} />
    </main>
  );
}