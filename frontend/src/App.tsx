
import { useState } from 'react'
import './App.css'

function App() {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!pickup.trim() || !destination.trim()) {
      setMessage('Please enter both pickup and destination cities.')
      return
    }

    if (pickup.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setMessage('Pickup and destination must be different.')
      return
    }

    setMessage(
      `Search details: ${pickup.trim()} → ${destination.trim()}${
        date ? ` | Date: ${date}` : ''
      }. Trip search will be connected to the backend next.`,
    )
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">R</span>
          <span>Route<span className="brand-accent">Back</span></span>
        </a>

        <nav className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#customers">For customers</a>
          <a href="#drivers">For drivers</a>
        </nav>

        <div className="nav-actions">
          <button className="login-button" onClick={() => setMessage('Login will be available when authentication is built.')}>
            Log in
          </button>
          <button className="nav-cta" onClick={() => setMessage('Registration will be available when authentication is built.')}>
            Get started
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot" />
              SMARTER GOODS TRANSPORTATION
            </div>

            <h1>
              Every journey
              <br />
              can carry <span>more.</span>
            </h1>

            <p className="hero-description">
              Connect with available goods vehicles, find return-trip
              transport, and make every journey count with RouteBack.
            </p>

            <div className="hero-points">
              <span>✓ Find available vehicles</span>
              <span>✓ Discover return trips</span>
            </div>
          </div>

          <div className="hero-visual">
            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=85"
              alt="Goods truck travelling on a highway"
            />
            <div className="floating-card">
              <span className="floating-icon">↗</span>
              <div>
                <strong>Make every trip count</strong>
                <p>Find opportunities on the road</p>
              </div>
            </div>
            <div className="image-caption">Moving goods. Connecting journeys.</div>
          </div>
        </section>

        <section className="search-section" aria-labelledby="search-title">
          <div className="search-heading">
            <div>
              <span className="section-kicker">START YOUR JOURNEY</span>
              <h2 id="search-title">Where do you need to send goods?</h2>
            </div>
            <p>Find transport that fits your route.</p>
          </div>

          <form className="search-form" onSubmit={handleSearch}>
            <label className="search-field">
              <span className="field-icon pickup-icon">●</span>
              <span className="field-content">
                <span className="field-label">PICKUP LOCATION</span>
                <input
                  value={pickup}
                  onChange={(event) => setPickup(event.target.value)}
                  placeholder="e.g. Bengaluru"
                  aria-label="Pickup location"
                  required
                />
              </span>
            </label>

            <label className="search-field">
              <span className="field-icon destination-icon">◆</span>
              <span className="field-content">
                <span className="field-label">DESTINATION</span>
                <input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="e.g. Chennai"
                  aria-label="Destination"
                  required
                />
              </span>
            </label>

            <label className="search-field date-field">
              <span className="field-icon">▦</span>
              <span className="field-content">
                <span className="field-label">PICKUP DATE</span>
                <input
                  type="date"
                  min={new Date().toLocaleDateString('en-CA')}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  aria-label="Pickup date"
                />
              </span>
            </label>

            <button className="search-button" type="submit">
              Find transport <span>→</span>
            </button>
          </form>

          {message && (
            <p className="search-message" role="status">
              {message}
            </p>
          )}
        </section>

        <section className="features" id="how-it-works">
          <div className="section-heading">
            <span className="section-kicker">WHY ROUTEBACK?</span>
            <h2>A smarter way to move goods.</h2>
            <p>Transport that connects available capacity with real needs.</p>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon orange">↔</div>
              <h3>Find return trips</h3>
              <p>
                Discover vehicles travelling your route, including
                opportunities on return journeys.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon blue">⌕</div>
              <h3>Find suitable transport</h3>
              <p>
                Search by pickup, destination, date, and vehicle
                requirements.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon green">✓</div>
              <h3>Book with confidence</h3>
              <p>
                Build trust through vehicle checks, driver verification,
                and clear booking details.
              </p>
            </article>
          </div>
        </section>

        <section className="audience-grid">
          <article className="audience-card customer-card" id="customers">
            <div>
              <span className="section-kicker">FOR CUSTOMERS</span>
              <h2>Goods to move?</h2>
              <p>Find a vehicle for your next delivery.</p>
            </div>
            <button onClick={() => setMessage('Customer booking will be available in the next development phase.')}>
              Explore transport <span>→</span>
            </button>
          </article>

          <article className="audience-card driver-card" id="drivers">
            <div>
              <span className="section-kicker">FOR DRIVERS & OWNERS</span>
              <h2>Have space to fill?</h2>
              <p>List your available trip and connect with customers.</p>
            </div>
            <button onClick={() => setMessage('Vehicle listing will be available in the next development phase.')}>
              List your vehicle <span>→</span>
            </button>
          </article>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon">R</span>
          <span>Route<span className="brand-accent">Back</span></span>
        </a>
        <p>Making every journey count.</p>
        <span>© {new Date().getFullYear()} RouteBack</span>
      </footer>
    </div>
  )
}

export default App