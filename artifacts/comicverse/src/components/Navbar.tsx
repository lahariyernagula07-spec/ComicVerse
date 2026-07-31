import { BookOpen, Sparkles, User, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="cv-navbar">
      <div className="cv-navbar-container">

        {/* Logo */}
        <a href="#home" className="cv-logo">
          <div className="cv-logo-icon">
            <BookOpen size={24} />
          </div>

          <div className="cv-logo-text">
            <span className="cv-logo-title">
              COMICVERSE
            </span>

            <span className="cv-logo-tagline">
              CREATE YOUR UNIVERSE
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="cv-nav-links">
          <a href="#home" className="cv-nav-link active">
            Home
          </a>

          <a href="#features" className="cv-nav-link">
            Features
          </a>

          <a href="#community" className="cv-nav-link">
            Community
          </a>

          <a href="#about" className="cv-nav-link">
            About
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="cv-nav-actions">
          <a href="/sign-in" className="cv-signin-button">
            <User size={16} />
            Sign In
          </a>

          <a href="/create" className="cv-create-button">
            <Sparkles size={16} />
            Create Comic
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="cv-mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="cv-mobile-menu">
            <a
              href="#home"
              className="cv-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>

            <a
              href="#features"
              className="cv-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>

            <a
              href="#community"
              className="cv-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Community
            </a>

            <a
              href="#about"
              className="cv-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>

            <a
              href="/create"
              className="cv-mobile-create"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles size={17} />
              Create Comic
            </a>

            <a
              href="/sign-in"
              className="cv-mobile-signin"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}