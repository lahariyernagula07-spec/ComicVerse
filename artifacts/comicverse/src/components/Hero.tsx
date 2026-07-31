import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="hero-section">

      {/* Background Glows */}
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />

      {/* Hero Content */}
      <div className="hero-container">

        {/* Left Content */}
        <div className="hero-content">

          <div className="hero-badge">
            <Sparkles size={15} />
            AI-POWERED COMIC CREATION
          </div>

          <h1 className="hero-title">
            CREATE YOUR
            <span>OWN UNIVERSE.</span>
          </h1>

          <p className="hero-description">
            Turn your imagination into stunning comics with AI-powered
            storytelling, characters, artwork, and more.
          </p>

          <div className="hero-buttons">

            <a href="/create" className="primary-button">
              <Sparkles size={18} />
              Start Creating
              <ArrowRight size={18} />
            </a>

            <a href="#community" className="secondary-button">
              Explore Comics
            </a>

          </div>

          <p className="hero-small-text">
            ✨ Create stories. Build characters. Bring your imagination to life.
          </p>

        </div>

        {/* Right Comic Preview */}
        <div className="comic-preview-wrapper">

          <div className="comic-preview">

            {/* Header */}
            <div className="preview-header">

              <div>
                <p>YOUR COMIC UNIVERSE</p>
                <h2>AI Comic Studio</h2>
              </div>

              <span>AI READY</span>

            </div>

            {/* Comic Panels */}
            <div className="comic-panels">

              <div className="comic-panel">
                <span>✦</span>
              </div>

              <div className="comic-panel">
                <span>⚡</span>
              </div>

              <div className="comic-panel-wide">
                <span>YOUR STORY</span>
              </div>

            </div>

            {/* Footer */}
            <div className="preview-footer">

              <span>
                Transform your ideas into comics
              </span>

              <strong>
                CREATE
              </strong>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}