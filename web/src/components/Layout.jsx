import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTelemetry } from '../hooks/useTelemetry.js';
import ConnectionPill from './ConnectionPill.jsx';
import DemoBadge from './DemoBadge.jsx';
import Logo from './Logo.jsx';

const links = [
  ['/', 'Dashboard'],
  ['/history', 'History'],
  ['/settings', 'Settings'],
];

export default function Layout() {
  const { connection, demo, overall, storageAvailable, persistFailed } = useTelemetry();

  return (
    <div className="app" data-level={overall ?? 'idle'}>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to main content
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="brand" to="/" aria-label="AirGuard IoT home">
            <Logo />
            <span><strong>AirGuard</strong><small>IoT</small></span>
          </Link>
          <nav className="nav" aria-label="Primary navigation">
            {links.map(([to, label]) => (
              <NavLink key={to} className="nav-link" to={to} end={to === '/'}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="header-status" aria-label="Telemetry status">
            {demo && <DemoBadge />}
            <ConnectionPill state={connection.state} />
          </div>
        </div>
      </header>
      <main id="main" className="shell main-content" tabIndex="-1">
        {(!storageAvailable || persistFailed) && (
          <p className="settings-warning storage-notice" role="status">
            Browser storage is unavailable; settings and history will not persist.
          </p>
        )}
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="shell footer-inner">
          <span>AirGuard IoT · Real-time environmental safety</span>
          <span>Arduino Mega 2560 + ESP8266</span>
        </div>
      </footer>
    </div>
  );
}
