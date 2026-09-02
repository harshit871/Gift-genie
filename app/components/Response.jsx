"use client";

import { useEffect, useRef } from "react";
import { marked } from "marked";

export default function Response({ isLoading, isStreaming, accumulated, errorMsg }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;

    if (errorMsg && !accumulated) {
      // Mirror: only show error if no content rendered yet
      contentRef.current.textContent = errorMsg;
      return;
    }

    if (!accumulated) {
      contentRef.current.innerHTML = "";
      return;
    }

    // Mirror: outputContent.innerHTML = DOMPurify.sanitize(marked.parse(accumulated))
    // DOMPurify needs the browser window — import lazily to avoid SSR errors
    const html = marked.parse(accumulated);
    import("dompurify").then(({ default: DOMPurify }) => {
      if (contentRef.current) {
        contentRef.current.innerHTML = DOMPurify.sanitize(html);
      }
    });
  }, [accumulated, errorMsg]);

  // Mirror showStream(): visible as soon as streaming starts, hidden while waiting
  const containerClass = isStreaming || errorMsg ? "visible" : "hidden";

  return (
    <section className="output-section">
      <div id="output-container" className={containerClass}>
        <div id="output-content" ref={contentRef} />
      </div>
    </section>
  );
}