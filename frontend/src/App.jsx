import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import About from './pages/About';

function Navbar({ menuOpen, setMenuOpen }) {
  const location = useLocation();

  const links = [
    { to: '/',          label: 'Home' },
    { to: '/analysis',  label: 'Analysis' },
    { to: '/about',     label: 'About' },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(240,239,248,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg,#6C63FF,#A89CFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, boxShadow: '0 4px 12px rgba(108,99,255,0.35)',
          }}>🚇</div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Metro<span style={{ color: 'var(--accent)' }}>Nova</span>
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: 4 }}>
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                textDecoration: 'none',
                padding: '7px 18px',
                borderRadius: 30,
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                background: isActive ? 'rgba(108,99,255,0.1)' : 'transparent',
                transition: 'all 0.2s',
              })}
            >{label}</NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'none', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 22, color: 'var(--text)',
            '@media(max-width:600px)': { display: 'block' }
          }}
        >☰</button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          padding: '12px 24px 20px',
        }}>
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'block', padding: '12px 0',
                textDecoration: 'none', fontSize: 16, fontWeight: 500,
                color: isActive ? 'var(--accent)' : 'var(--text)',
                borderBottom: '1px solid var(--border)',
              })}
            >{label}</NavLink>
          ))}
        </div>
      )}
    </header>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/analysis"  element={<Analysis />} />
            <Route path="/about"     element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
