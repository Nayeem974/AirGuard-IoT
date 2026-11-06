import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTelemetry } from '../hooks/useTelemetry.js';
import ConnectionPill from './ConnectionPill.jsx';
import DemoBadge from './DemoBadge.jsx';
import Logo from './Logo.jsx';

const icon = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false' };
const ICONS = {
  '/': <svg {...icon}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>,
  '/history': <svg {...icon}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  '/settings': <svg {...icon}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>,
};
const links = [
  ['/', 'Dashboard', 'Live station overview'],
  ['/history', 'History', 'Recorded readings'],
  ['/settings', 'Settings', 'Thresholds and connection'],
];

export default function Layout() {
  const { link, demo, overall, storageAvailable, persistFailed } = useTelemetry();
  const { pathname } = useLocation();
  const [, title, subtitle] = links.find(([to]) => to === pathname) ?? links[0];

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
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="AirGuard IoT home">
          <Logo />
          <span><strong>AirGuard</strong><small>IoT</small></span>
        </Link>
        <nav className="nav" aria-label="Primary navigation">
          {links.map(([to, label]) => (
            <NavLink key={to} className="nav-link" to={to} end={to === '/'}>
              {ICONS[to]}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <p className="sidebar-foot">Arduino Mega 2560 + ESP8266</p>
      </aside>
      <div className="content">
        <header className="topbar">
          <div className="topbar-title">
            <p>{title}</p>
            <small>{subtitle}</small>
          </div>
          <div className="header-status" aria-label="Telemetry status">
            {demo && <DemoBadge />}
            <ConnectionPill state={link} />
          </div>
        </header>
        <main id="main" className="main-content" tabIndex="-1">
          {(!storageAvailable || persistFailed) && (
            <p className="settings-warning storage-notice" role="status">
              Browser storage is unavailable; settings and history will not persist.
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
