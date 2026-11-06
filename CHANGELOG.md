# Changelog

All notable changes to the AirGuard IoT web dashboard are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The firmware and hardware documentation are not affected by this release.

## [Unreleased]

### Added

- **Sidebar layout.** A left navigation sidebar and a top bar replace the old top header. On screens 860 px wide or narrower the sidebar becomes a bottom tab bar.
- **Area sparklines** along the bottom edge of each metric card.
- **Chart grid.** The dashboard shows Air, Gas, Dust, Temperature and Humidity charts together, each with its latest value. The 5m / 15m / 1h range control applies to all of them. The single-chart layout with metric tabs is still available through `TrendChart`'s default `layout="single"`.
- **Connection states.** The connection pill, status banner and Device panel now distinguish:
  - **Connecting** and **Reconnecting** while the MQTT link is being established or restored.
  - **Broker connected**: subscribed, but no reading has arrived yet.
  - **Live data**: readings are arriving.
  - **Waiting for device data**: the broker is connected but the station has stopped publishing (no data for more than 15 seconds).
  - **Disconnected** and **Error**: the broker link is down.
  The state is derived in `src/lib/linkState.js` from the broker status and from whether a valid message has been received in the current session.
- **Typography.** Inter (body) and Space Grotesk (headings) are self-hosted through `@fontsource-variable/inter` and `@fontsource-variable/space-grotesk`, with system-font fallbacks.
- 23 new tests covering connection-state derivation, the pill, banner and Device panel copy, a mocked-broker walk through every state, the chart grid, and the metric-card tags.

### Changed

- The status banner is a compact strip instead of a large hero panel.
- Panels use a flatter, near-black theme. The dashboard rail (Alerts, Device, Quick actions) sits in a row below the charts.
- Chart time-axis labels include seconds when the visible data spans less than three minutes, so labels no longer repeat.
- The `theme-color` meta tag matches the new background.
- Metric-card tags read **LIVE** only while fresh live data exists; otherwise **NO DATA** or **STALE**. Demo mode still reads **SIM**.

### Fixed

- The header pill and Device panel no longer say "Live" when the broker is connected but no data has arrived.
- Metric cards no longer overflow the right edge on narrow screens (implicit grid columns could grow past the viewport).
- Chart cards show the newest reading by timestamp rather than the last array item.

### Removed

- The Google Fonts `<link>` tags in `index.html`. Fonts no longer depend on a third-party CDN.
- Dead CSS: the unused `.page-placeholder` and `.footer-inner` rules, the leftover header and footer rules, the `≤700px` header navigation rules that no longer applied, an always-hidden `.status-banner::after` decoration, and a no-op `flex-direction` on the grid container.

### Maintenance

- `styles.css` was consolidated: duplicate selectors were merged into their base rules and every breakpoint now has a single `@media` block at the end of the file, widest first.
- The cleanup was checked by comparing computed styles and element positions and sizes at 12 viewport widths (375 to 1440 px, including both sides of every breakpoint) across four app states, plus hover and focus styles. The only differences were three computed values with no visual effect: `flex-direction` on the grid container, `order` on the mobile nav, and the removed hidden pseudo-element.
- `package-lock.json` changes only add the two font packages.
