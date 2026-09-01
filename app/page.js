export default function Home() {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="title-group">
          <img src="/genie.svg" alt="Genie" className="genie-icon-img" />
          <h1>Gift Genie</h1>
        </div>
      </header>

      <main className="main-content">
        <form id="gift-form" className="gift-form">
          <div className="input-section">
            <div className="input-wrapper">
              <textarea
                id="user-input"
                placeholder="e.g., My friend who loves hiphop music has a birthday coming up in 3 days. 40-60 bucks budget. I live in..."
              ></textarea>
            </div>
          </div>

          <div className="lamp-container">
            <button
              type="submit"
              id="lamp-button"
              className="lamp-btn"
              aria-label="Rub the Lamp"
            >
              <span className="lamp-icon">
                <img
                  src="/lamp.svg"
                  alt="Magic Lamp"
                  className="lamp-icon-img"
                />
              </span>
              <span className="lamp-text">Rub the Lamp</span>
            </button>
          </div>
        </form>

        <section className="output-section">
          <div id="output-container" className="hidden">
            <div id="output-content"></div>
          </div>
        </section>
      </main>
    </div>
  );
}
