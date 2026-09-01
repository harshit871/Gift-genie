export default function Response({ isLoading, response }) {
  // Mirror setLoading: hidden while loading, visible once response arrives
  const containerClass = `${!isLoading && response ? "visible" : "hidden"}`;

  return (
    <section className="output-section">
      <div id="output-container" className={containerClass}>
        <div id="output-content">
          {response?.error ? (
            <p style={{ color: "var(--accent-primary)" }}>{response.error}</p>
          ) : (
            response?.message || response?.result || null
          )}
        </div>
      </div>
    </section>
  );
}