"use client";

import { useRef } from "react";

export default function GiftInput({ isLoading, hasResponse, onSubmit }) {
  const textareaRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const value = textareaRef.current?.value?.trim();
    if (!value || isLoading) return;
    onSubmit(value);
    // Reset textarea height (mirrors userInput.style.height = "auto")
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  // Derive button class: loading → "lamp-btn loading", after response → "lamp-btn compact", default → "lamp-btn"
  const btnClass = `lamp-btn${isLoading ? " loading" : hasResponse ? " compact" : ""}`;

  return (
    <form id="gift-form" className="gift-form" onSubmit={handleSubmit}>
      <div className="input-section">
        <div className="input-wrapper">
          <textarea
            id="user-input"
            ref={textareaRef}
            placeholder="e.g., My friend who loves hiphop music has a birthday coming up in 3 days. 40-60 bucks budget. I live in..."
          />
        </div>
      </div>

      <div className="lamp-container">
        <button
          type="submit"
          id="lamp-button"
          className={btnClass}
          aria-label={isLoading ? "Summoning Gift Ideas..." : "Rub the Lamp"}
          disabled={isLoading}
        >
          <span className="lamp-icon">
            <img src="/lamp.svg" alt="Magic Lamp" className="lamp-icon-img" />
          </span>
          <span className="lamp-text">
            {isLoading ? "Summoning Gift Ideas..." : "Rub the Lamp"}
          </span>
        </button>
      </div>
    </form>
  );
}