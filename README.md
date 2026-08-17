# Reclaim Myself

> **A production-grade, offline-first personal operating system for daily auditing, goal tracking, habit streak forging, analytics, and gamification.**

Built with **React 18, TypeScript, Vite, IndexedDB (Dexie), and PWA Service Workers**.

---

## 🌟 Overview

**Reclaim Myself** is a private, client-side personal improvement application designed to eliminate friction, respect user data ownership, and build unstoppable daily discipline.

Unlike generic habit trackers, **Reclaim Myself** has:
* **Zero Hardcoded Goals**: 100% user-defined goals, dynamic question generation, dynamic polarity scoring.
* **100% Offline-First**: No Firebase, no external servers, no tracking. All data resides securely in your device's browser via IndexedDB.
* **Goal Polarity (Positive vs Negative)**: Full mathematical support for positive habits (*Yes = Win*) and negative habits/vices to avoid (*No = Win*).
* **Authoritative Streak Engine**: Real-time streak calculation with longest streak retention, retroactive past audit recalculation, and permanent historical records.
* **Gamified Milestones & Awards**: Configurable milestone targets (7, 21, 30, 60, 90 days) unlocking persistent awards in your trophy case.
* **Custom Quantity Counters**: Track arbitrary cumulative metrics (money saved, pages read, meditation minutes) with event history.
* **Premium Glassmorphic Aesthetic**: Deep midnight aesthetic, fluid typography, dual-side celebration confetti, and full responsive support for Android, iOS, tablets, and desktop.

---

## ✨ Features

* **📅 Interactive Master Calendar**:
  * Inspired by Google Calendar with glassmorphism.
  * Year/month navigation, "Today" jump button, and historical daily completion scores.
  * 1-second deliberate hover tooltip on desktop; tap-to-inspect popover on mobile.
  * Strict future date locking (cannot audit future days).
* **📝 Dynamic Daily Audit**:
  * Dynamically generates natural Yes/No questions from active goals.
  * Large, touch-friendly toggle buttons (>=44px).
  * Real-time animated score donut, percentage, and Gold/Silver/Bronze star grading.
  * Optional reflection/reason notes per habit.
  * Dual-side celebratory confetti when exceeding high-performance thresholds.
* **🔥 Real Life Dashboard**:
  * Central command center with best streaks, total audits, and goal trajectory cards.
  * Intelligent rotating motivational quotes based on streak progression and comeback states.
  * Goal-specific 12-week activity heatmaps.
  * Cumulative quantity counters (+ / - increments with monthly & lifetime totals).
* **🔍 Deep Goal Detail View**:
  * Mini monthly calendar with ✓ (success) and ✕ (unsuccessful) indicators.
  * Historical reflection and reason log.
  * Safe streak reset action (preserves historical audits and trophies).
* **💾 Complete Data Ownership (Export & Import)**:
  * Export complete database to a portable JSON backup file.
  * Strict validation engine checking schema versions, corrupt JSON, and missing fields.
  * Replace or Merge options with detailed import preview.
* **📱 PWA & Mobile Optimization**:
  * Installable as a progressive web app on Android & iOS.
  * App shell and asset caching via Service Worker.
  * Tailored mobile bottom navigation bar and adaptive layout.
  * Full `@media (prefers-reduced-motion: reduce)` accessibility support.

---

## 🛠 Tech Stack

* **Core Framework**: React 18 & TypeScript
* **Build Tool**: Vite 6
* **Database / Storage**: IndexedDB via Dexie.js (with versioned schema migrations)
* **PWA & Caching**: `vite-plugin-pwa` with Workbox service worker caching
* **Styling**: Vanilla CSS Design System with CSS variables and Glassmorphism
* **Icons**: Lucide React
* **Celebration Effects**: Canvas Confetti
* **Testing**: Vitest & React Testing Library

---

## 🏛 Architecture

```text
src/
├── app/
│   └── App.tsx                  # Root application router and layout shell
│
├── components/
│   ├── ui/                      # GlassCard, GlassButton, DonutProgress, StarRating, Modal, Tooltip, Popover, PolarityBadge
│   ├── layout/                  # Navbar (Desktop & Mobile Bar), Header
│   └── feedback/                # ToastContext, ConfettiTrigger, EmptyState, LoadingSkeleton
│
├── features/
│   ├── onboarding/              # Welcome & personalized name onboarding
│   ├── calendar/                # Interactive calendar grid, hover tooltips, mobile popover
│   ├── daily-audit/             # Dynamic Yes/No question audit form, score calculator, notes
│   ├── real-life/               # Dashboard, goal cards, milestone bars, motivation ticker
│   ├── goals/                   # Goal editor modal with polarity radio buttons
│   ├── goal-detail/             # Goal deep dive: mini calendar, heatmap, notes log, counters
│   ├── counters/                # Custom quantity counters (+ / - increments, arbitrary units)
│   └── settings/                # Profile management, JSON Import/Export with validation
│
├── db/
│   ├── database.ts              # Dexie IndexedDB initialization & versioned schema migrations
│   └── repositories/            # UserRepository, GoalRepository, AuditRepository, CounterRepository, MilestoneRepository
│
├── services/
│   ├── scoring/                 # Centralized scoring calculation based on polarity
│   ├── streaks/                 # Streak engine (current, longest, previous streaks, historical recalculation)
│   ├── analytics/               # Heatmap matrix builder, monthly/yearly aggregates, success rate stats
│   ├── date/                    # Local timezone & date utilities (YYYY-MM-DD, leap years, future locks)
│   ├── importExport/            # Full JSON backup schema generator & validator
│   └── motivation/              # Dynamic habit quotes & motivation rotation engine
│
├── hooks/                       # useGoals, useAudits, useProfile, useCounters, useMilestones
├── types/                       # Core domain TypeScript interfaces & schemas
├── constants/                   # Default star thresholds, motivational quotes pool, app config
├── styles/                      # Glassmorphic design tokens, CSS variables, responsive grid
└── tests/                       # Vitest automated unit tests
```

---

## 📦 Data Model (IndexedDB)

The application utilizes 7 indexed tables in IndexedDB:

1. **`users`**: User profile, display name, and preferences (star thresholds, confetti threshold, reduced motion).
2. **`goals`**: User-defined habits, polarity (`positive` | `negative`), color, category, target streak, archive state.
3. **`audits`**: Daily audit records indexed by `date` (YYYY-MM-DD), goal answers, score, percentage, star rating, completion timestamp.
4. **`counters`**: Custom quantity counters with unit, increment value, and current total.
5. **`counterEvents`**: Timestamped delta events logged for every counter increment/decrement.
6. **`milestones`**: Target streak thresholds (e.g. 7, 21, 30, 60, 90 days) per goal.
7. **`awards`**: Permanent achievement trophies unlocked upon reaching milestones.

---

## 🔒 Local Storage & Privacy

* **Zero Cloud Dependence**: No data is ever transmitted to a remote server.
* **Complete Privacy**: All habits, reflections, and scores remain strictly on the user's device.
* **Portable Backups**: Users can export their entire dataset into a portable `.json` file at any time.

---

## 🚀 Development & Commands

### Prerequisites
* Node.js (v18+)
* npm

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Run Automated Unit Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🌐 Browser Support

* Chrome / Edge (Chromium 90+)
* Firefox (88+)
* Safari / iOS Safari (14+)
* Android WebViews / Chrome for Android

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
