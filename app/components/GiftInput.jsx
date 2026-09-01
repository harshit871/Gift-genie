export default function GiftInput() {
    return (
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
    )
}