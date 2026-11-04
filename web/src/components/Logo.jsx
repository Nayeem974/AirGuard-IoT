export default function Logo() {
  return (
    <svg className="logo" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="airguard-logo" x1="7" y1="5" x2="31" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <path d="M20 3.5 33 8v9.8c0 8.2-5.2 14.7-13 18.7-7.8-4-13-10.5-13-18.7V8l13-4.5Z" fill="none" stroke="url(#airguard-logo)" strokeWidth="2.4" />
      <path d="M11.8 20.8c3.2 0 3.2-3 6.4-3s3.2 3 6.4 3 3.2-3 6.4-3M12.5 26c2.7 0 2.7-2.5 5.4-2.5s2.7 2.5 5.4 2.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
