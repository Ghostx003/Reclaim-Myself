# Changelog

All notable changes to the **Reclaim Myself** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-17

### Added
- **Core Architecture**:
  - Offline-first React 18 + TypeScript + Vite architecture.
  - IndexedDB storage layer powered by Dexie.js with versioned schema migrations.
  - PWA Service Worker caching (Workbox) and standalone mobile manifest.
- **Goal Management & Polarity**:
  - Dynamic user-defined goal creation without hardcoded goals or presets.
  - Goal polarity configuration: Positive habits (Yes = Success) and Negative habits/vices (No = Success).
  - Target streak configuration and custom color palettes.
- **Daily Audit Engine**:
  - Dynamic Yes/No question generator derived from active goals.
  - Large touch-optimized controls (>=44px).
  - Centralized scoring engine with Gold/Silver/Bronze star grading.
  - Reflection and reason note logs per goal.
  - Dual-side celebration confetti for high scores.
  - Date restrictions blocking future date audits.
- **Interactive Calendar**:
  - Inspired by Google Calendar with glassmorphism design.
  - Month and year navigation, "Today" jump button, and completion percentage donut indicators.
  - 1-second deliberate hover tooltip on desktop; tap-to-inspect popover on mobile.
- **Real Life Dashboard**:
  - High-level progress metrics and best streak trackers.
  - Goal cards with intelligent rotating motivational messages.
  - 12-week activity heatmaps for habit visualization.
  - Custom quantity counters with cumulative monthly and lifetime history.
  - Persistent trophy case awards unlocked via streak milestones.
- **Goal Detail Deep Dive**:
  - Mini calendar with semantic ✓ and ✕ indicators.
  - Reflection notes history.
  - Safe manual streak reset action preserving historical records.
- **Data Ownership & Settings**:
  - Full JSON database export.
  - Defensive import validation engine with schema checking and Replace/Merge modes.
  - Configurable scoring and confetti thresholds.
  - Full `@media (prefers-reduced-motion: reduce)` accessibility support.
- **Automated Test Suite**:
  - Unit tests covering scoring, polarity, streak calculations, retroactive audit edits, date limits, and JSON backup validation.
