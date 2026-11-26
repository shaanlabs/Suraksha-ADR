import { NavLink, Link } from "react-router-dom";

export function SiteHeader() {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link to="/" className="brand">
          <span>Suraksha</span>
          <small>Drug Safety</small>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>Cases</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/methodology">Methodology</NavLink>
          <NavLink to="/privacy">Privacy</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
