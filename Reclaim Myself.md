# RECLAIM MYSELF
## Master Product & Engineering Specification

Build a complete, production-quality **React + TypeScript + Vite** application called **Reclaim Myself**.

This is an **offline-first personal improvement, goal tracking, streak tracking, daily auditing, analytics, and gamification application**.

The application should feel like a premium commercial product rather than a basic CRUD project.

The visual language should be:

- Modern
- Premium
- Minimal
- Glassmorphic
- Smooth
- Motivating
- Highly polished
- Responsive
- Accessible
- Fast
- Intuitive

The application must be designed so that additional features can be added later without rewriting the existing architecture.

---

# 1. ABSOLUTE REQUIREMENTS

These requirements apply to the entire project.

## 1.1 React

Build the application using:

- React
- TypeScript
- Vite

Use functional components and modern React patterns.

Avoid unnecessary class components.

---

# 1.2 Offline First

The application must work completely offline.

The core application must NOT require:

- Firebase
- Firestore
- Firebase Authentication
- Firebase Storage
- A custom backend
- A remote database
- An internet connection

Do not add Firebase anywhere in the project.

The application should be installable/useable as a PWA.

Implement:

- Service worker
- Application shell caching
- Offline asset caching
- Appropriate PWA manifest
- Offline fallback behavior

The user should be able to close the browser, disconnect from the internet, reopen the application, and continue using it with their existing data.

---

# 1.3 IndexedDB

Use **IndexedDB as the primary persistent data store**.

Do not use localStorage as the primary database.

Create a dedicated storage/data-access layer.

The React components must not directly contain IndexedDB queries.

Use a repository/service abstraction such as:

```text
React Components
        ↓
Feature Services
        ↓
Repositories
        ↓
IndexedDB
```

A library such as Dexie may be used if appropriate.

The data layer should support:

- Create
- Read
- Update
- Delete
- Queries
- Transactions
- Versioned database migrations

Design the database so future schema changes can be migrated safely.

---

# 1.4 User Data Ownership

All user data belongs to the user and stays locally on their device.

Provide complete:

### Export

Export **all application data** into a portable JSON file.

The export should include everything necessary to reconstruct the user's application state.

Include:

- Profile information
- Goals
- Goal configuration
- Daily audits
- Answers
- Scores
- Streak information or reconstructable historical data
- Milestones
- Awards
- Custom counters
- Counter history
- Reasons/notes
- Application preferences
- Any future user-generated data

Do not export transient UI state unnecessarily.

---

### Import

Provide an Import Data feature.

The user should be able to select a previously exported JSON file.

Validate the imported data before modifying the database.

Handle:

- Invalid JSON
- Invalid schema
- Missing fields
- Unsupported schema versions
- Corrupt data
- Duplicate/import conflicts

Provide a clear confirmation step before replacing or merging existing data.

Never silently destroy existing data.

---

# 2. PROJECT ARCHITECTURE

Use a modular feature-oriented architecture.

Prefer something similar to:

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── App.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── feedback/
│   └── common/
│
├── features/
│   ├── onboarding/
│   ├── goals/
│   ├── calendar/
│   ├── daily-audit/
│   ├── real-life/
│   ├── streaks/
│   ├── awards/
│   ├── counters/
│   └── settings/
│
├── db/
│   ├── database.ts
│   ├── schema.ts
│   ├── repositories/
│   └── migrations/
│
├── services/
│   ├── scoring/
│   ├── streaks/
│   ├── analytics/
│   ├── export/
│   ├── import/
│   └── motivation/
│
├── hooks/
├── utils/
├── types/
├── constants/
└── styles/
```

The exact structure may differ, but maintain the same architectural principles.

---

# 3. NO HARDCODED USER GOALS

This is one of the most important requirements.

**Never hardcode user goals.**

Do not create predefined goals such as:

- Health goals
- Food goals
- Exercise goals
- Personal habits
- Hygiene goals
- Sexual behavior goals
- Study goals
- Financial goals

The examples discussed during development are **only conceptual examples**.

They must NOT appear as default application data.

The user creates every goal themselves.

If the user creates 2 goals, the application works with 2.

If the user creates 50 goals, the application works with 50.

All UI, scoring, auditing, analytics, streaks, calendars, and dashboards must dynamically derive their data from IndexedDB.

---

# 4. ONBOARDING

When the application is opened for the first time:

Show a beautiful onboarding screen.

Ask:

> What should we call you?

Provide a name input.

After submission, transition into a personalized greeting.

For example, conceptually:

```text
Hello,
[User Name]
```

Do not hardcode any user's name.

Save the name in IndexedDB.

On subsequent visits, load the name from IndexedDB.

Do not ask for the name again unless the user edits/resets their profile.

Use smooth transitions between onboarding states.

---

# 5. MAIN NAVIGATION

Create a premium glass-style navigation bar.

The navigation should contain the application's major areas.

At minimum:

```text
Calendar
Daily Audit
Real Life
Settings
```

The navigation should be:

- Responsive
- Keyboard accessible
- Touch friendly
- Visually polished
- Mobile friendly

On desktop, it can behave as a glass horizontal navbar.

On Android/mobile widths, adapt it appropriately.

Do not allow navigation items to become cramped.

Consider:

- Compact mobile navigation
- Bottom navigation where appropriate
- Responsive menu behavior
- Icon + label combinations
- Touch targets of approximately 44px or greater

The Settings/Gear icon should remain easily accessible.

---

# 6. SETTINGS / GEARBOX

Clicking Settings opens the Settings interface.

Include:

- Import Data
- Export Data
- Manage Goals / Write Goals

Structure the settings page so additional settings can be added later.

---

# 7. GOAL CREATION

Create a dedicated **Write Goals / Manage Goals** interface.

This can be presented as:

- Modal
- Drawer
- Full-screen mobile view

depending on viewport size.

The goal editor must allow the user to:

- Create a goal
- Edit a goal
- Delete a goal
- Configure the goal
- View existing goals

Deleting a goal must remove it from all relevant application views.

However, because historical analytics may depend on deleted goals, design deletion carefully.

Prefer a confirmation dialog.

The application should avoid accidental destructive actions.

---

# 8. GOAL POLARITY / DIRECTION

Every goal has a polarity.

The goal editor should contain two circular radio-style controls:

### Positive

Green visual treatment.

### Negative

Red visual treatment.

The user chooses which answer direction represents success.

Conceptually:

```text
Goal: [user-defined goal]

○ Positive
○ Negative
```

The exact goal itself is always user-defined.

The meaning is:

### Positive polarity

A **Yes** answer represents successful behavior.

A **No** answer represents unsuccessful behavior.

### Negative polarity

A **No** answer represents successful behavior.

A **Yes** answer represents unsuccessful behavior.

This polarity must be stored with the goal.

---

# 9. GOAL QUESTION GENERATION

The Daily Audit should generate questions dynamically from the user's goals.

Do not hardcode questions.

Transform the goal text into a natural Yes/No question where appropriate.

For example, if the user creates a goal, the audit should construct a question around that goal.

The question generation system should be generic.

Do not create goal-specific conditionals such as:

```typescript
if (goal.name === "something") ...
```

Never build the system around individual example goals.

---

# 10. DAILY AUDIT

Add **Daily Audit** to the main navigation.

The Daily Audit is the place where the user records their daily goal results.

Display:

- Date
- Progress
- Current score
- Maximum possible score
- Percentage
- Goal questions
- Yes/No controls
- Completion state

Each goal becomes one Yes/No audit item.

---

# 11. DATE RULES

The user can audit:

- Today
- Previous dates

The user cannot audit future dates.

A future date must remain locked.

A new day becomes available automatically after local midnight.

Use the user's local device date/time.

Do not rely on a server clock.

The system should correctly handle:

- Month boundaries
- Year boundaries
- Leap years
- Time zones
- Daylight-saving transitions where applicable

---

# 12. AUDIT EDITING

Historical audits must be editable.

The user can revisit previous dates and change their answers.

If an answer changes:

- Recalculate the score
- Recalculate affected streaks
- Recalculate affected statistics
- Recalculate calendar status
- Recalculate milestones if necessary
- Recalculate awards if necessary

Never store derived values in a way that can permanently become inconsistent with the underlying answers.

Prefer calculating derived analytics from authoritative historical data, or maintain them through a reliable recalculation service.

---

# 13. SCORING ENGINE

Create a centralized scoring engine.

Do NOT scatter scoring logic throughout React components.

Conceptually:

```text
Goal
+
Goal Polarity
+
Daily Answer
=
Goal Result
```

A successful goal receives:

```text
1 point
```

An unsuccessful goal receives:

```text
0 points
```

Daily score:

```text
completed goals / total goals
```

Example:

```text
3 / 4
75%
```

The exact number of goals must always be dynamic.

If there are 10 goals:

```text
7 / 10
70%
```

If there are 3:

```text
2 / 3
66.67%
```

---

# 14. DAILY SCORE DISPLAY

Show the daily result prominently.

Include:

- X / Y completed
- Percentage
- Visual progress indicator
- Star rating
- Donut progress visualization

The visual treatment should make the score immediately understandable.

---

# 15. CALENDAR

The main landing page should be the Calendar.

Design it with inspiration from modern calendar applications such as Google Calendar, while maintaining an original visual identity.

The calendar should support:

- Month navigation
- Year navigation
- Previous month
- Next month
- Jump to month/year
- Today button
- Historical scores

Do not restrict the calendar to the current month.

The user should be able to navigate through historical months and years.

Future dates may be displayed but should not contain audit results.

---

# 16. CALENDAR DAY CELLS

Each day should display its progress visually.

A day may contain:

- Score
- Star
- Progress ring/donut
- Completion percentage
- Visual state

Example conceptual display:

```text
3 / 4
⭐
75%
```

Do not literally copy this layout if a better visual treatment exists.

The design should be elegant and compact.

---

# 17. CALENDAR HOVER TOOLTIP

When the user hovers over a calendar day for approximately one second, display a small premium tooltip.

The tooltip should show:

- Date
- Score
- Completed / total goals
- Percentage
- Star rating
- Relevant daily summary

Use a deliberate hover delay to prevent accidental flashing.

For mobile devices, there is no true hover.

Therefore implement an equivalent touch interaction:

- Tap day
- Open tooltip/popover
- Tap outside to close

Do not rely exclusively on hover.

---

# 18. STAR GRADING

Use a star to visually represent daily performance.

Create a sensible grading system.

The exact thresholds should be centralized in configuration rather than scattered throughout components.

For example, conceptually:

- High performance → gold star
- Medium performance → intermediate visual state
- Low performance → red star

The thresholds must be configurable.

Do not hardcode arbitrary thresholds inside JSX.

The grading system should be extensible.

---

# 19. DONUT PROGRESS

Next to the star or score, show a compact donut/ring indicator.

The ring represents the percentage of goals completed.

Examples conceptually:

```text
70%
40%
90%
```

The ring should animate smoothly when the value changes.

Use CSS/SVG rather than unnecessarily heavy chart libraries.

---

# 20. DAILY COMPLETION ANIMATION

When the user completes an audit:

Animate the result.

Possible effects:

- Star appearance
- Score count-up
- Progress ring animation
- Subtle scale animation
- Celebration particles
- Confetti

Animations must remain performant.

Respect:

```css
prefers-reduced-motion
```

Users who prefer reduced motion should receive a simplified experience.

---

# 21. CONFETTI

When the user reaches a strong daily score, trigger a celebratory effect.

For example, when the user reaches a configured high-performance threshold.

The confetti should originate visually from both sides of the interface.

Do not make the animation overwhelming.

It should feel like a premium reward rather than a children's game.

Make the threshold configurable.

---

# 22. REAL LIFE DASHBOARD

Add a **Real Life** section.

This is the user's complete personal progress dashboard.

It should contain:

- Overall progress
- Current streaks
- Longest streaks
- Goal cards
- Heatmaps
- Milestones
- Awards
- Custom counters
- Goal-specific analytics

The dashboard should be visually rich while remaining easy to understand.

---

# 23. INDIVIDUAL GOAL STREAKS

Every goal gets an independent streak.

Display:

```text
🔥 Current Streak
7 days
```

Also display:

- Current streak
- Longest streak
- Target streak
- Progress toward target
- Motivational message

The streak calculation must respect goal polarity.

A successful result continues the streak.

An unsuccessful result breaks it.

---

# 24. STREAK MILESTONES

Allow the user to define streak targets.

Examples of milestone lengths may be:

```text
21 days
30 days
40 days
60 days
90 days
```

But these must NOT be hardcoded as the only possible targets.

The user should be able to create custom milestones.

A configurable default milestone may be provided.

When a milestone is achieved:

- Display an achievement
- Celebrate the achievement
- Add it to the Awards section
- Preserve the historical achievement

If a streak later breaks, the previously earned award must remain earned.

---

# 25. HABIT MOTIVATION

Each goal should display motivational messaging based on progress.

For example, early streaks should have encouraging messages.

Longer streaks should have more advanced motivational messages.

The system should support a pool of motivational messages.

Messages can be selected dynamically based on:

- Current streak
- Milestone progress
- Recent performance
- Whether the user recently broke a streak

Do not repeat the same message every time.

Rotate messages intelligently.

---

# 26. MOTIVATIONAL ANIMATION

Next to each goal, show a motivational message.

The message should:

1. Appear
2. Remain visible for several seconds
3. Fade/transition out
4. Be replaced by another message

Use smooth animation.

Do not create an annoying constant animation loop.

Allow the user to continue using the dashboard normally.

Respect reduced-motion preferences.

---

# 27. GOAL DETAIL PAGE

Every goal must be clickable.

Clicking a goal should open a **complete detail page/view for that goal**.

The page should be generated dynamically.

It should contain:

### Overview

- Goal name
- Goal polarity
- Current streak
- Longest streak
- Target
- Completion percentage
- Historical performance

### Activity

Show which dates were successful and unsuccessful.

### Calendar

Include a compact goal-specific calendar.

For each day display the result.

For example conceptually:

```text
✓ Successful
✕ Unsuccessful
```

Use colors and icons consistently.

The goal calendar must be generated from the actual audit history.

---

# 28. GOAL HISTORY

The goal detail page should show historical information such as:

- Successful dates
- Unsuccessful dates
- Current streak
- Longest streak
- Total successful days
- Total unsuccessful days
- Overall success percentage

Do not fabricate any historical data.

---

# 29. REASONS / NOTES

Allow the user to attach an optional reason/note to relevant goal activity.

For example, if a goal was unsuccessful, the user may record why.

The reason should be stored with the relevant historical record.

This must be optional.

Do not force users to provide explanations.

---

# 30. CUSTOM COUNTERS

Allow goals to have optional custom counters.

The user should be able to create a counter associated with a goal.

The counter should allow:

- Custom name
- Custom unit/label
- Increment amount
- Current value
- Historical values
- Total accumulation

Example concept:

```text
[ + ] 
Counter
+3
```

Every click should persist the updated value to IndexedDB.

The value must survive:

- Page reload
- Browser restart
- Offline use

---

# 31. MONEY / QUANTITY COUNTERS

Counters should support arbitrary quantities.

Do not build a special "money saved" implementation.

Instead build a generic counter system.

The user can configure:

```text
Counter name
Unit
Increment value
```

The unit may be:

- Currency
- Steps
- Minutes
- Pages
- Items
- Any custom unit
- etc.

Do not hardcode units.

---

# 32. CUMULATIVE COUNTERS

Counters should maintain cumulative history.

For example:

```text
Current total
Monthly total
Lifetime total
```

The system should preserve historical counter events.

Do not simply overwrite one number.

Store counter events so analytics can be reconstructed.

---

# 33. GOAL-SPECIFIC HEATMAP

Each goal should have a visual activity heatmap.

Show activity across time.

Use intensity to communicate:

- Successful days
- Unsuccessful days
- Missing/uncompleted days

Make the heatmap responsive.

On desktop it may resemble a contribution graph.

On Android/mobile it should adapt rather than becoming horizontally unusable.

---

# 34. SMALL GOAL CALENDAR

Each goal detail page should include a small calendar.

The calendar should visually show the result for each date.

For example:

```text
✓ = successful
✕ = unsuccessful
```

Do not hardcode the meaning based on specific goals.

The icons should represent the semantic result calculated by the scoring engine.

---

# 35. AWARDS

At the bottom of the Real Life dashboard, create an **Awards / Achievements** section.

The user should receive an award when they complete a configured milestone.

Awards should be persistent.

Once earned, an award remains in the user's history.

Include:

- Award title
- Goal
- Milestone
- Date achieved
- Visual medal/badge
- Optional description

The user may create multiple milestones for multiple goals.

---

# 36. MILESTONE SYSTEM

Create a reusable milestone engine.

A milestone should contain:

```text
id
goalId
targetValue
type
createdAt
achievedAt
status
```

The exact schema may be improved as necessary.

Support multiple milestones per goal.

Support arbitrary milestone values.

Do not assume a fixed progression forever.

---

# 37. STREAK RESET VS HISTORICAL DATA

This distinction is critical.

When a streak breaks:

```text
Current streak → 0
```

But historical information must NOT disappear.

Preserve:

- Previous streak
- Longest streak
- Historical successful days
- Historical unsuccessful days
- Awards already earned
- Historical audits

Do not erase history when resetting a current streak.

The user's historical record is permanent unless explicitly deleted/imported/replaced by the user.

---

# 38. MANUAL RESET

Provide an explicit reset action where appropriate.

If the user manually resets a streak:

- Ask for confirmation
- Explain what will change
- Do not delete historical audit data unless explicitly requested
- Preserve earned awards unless the user specifically chooses to reset achievements

---

# 39. RESPONSIVE DESIGN — CRITICAL

The application MUST be fully responsive.

Do not treat mobile as an afterthought.

Primary target:

### Android phones

The application must work properly on:

- Small Android phones
- Standard Android phones
- Large Android phones
- Tablets
- Desktop
- Large desktop monitors

---

# 40. RESPONSIVE BREAKPOINTS

Use a sensible responsive strategy.

You may use Tailwind breakpoints, CSS media queries, or both.

At minimum account for:

```css
@media (max-width: 640px)
@media (min-width: 641px) and (max-width: 1024px)
@media (min-width: 1025px)
```

Add additional breakpoints when necessary.

Do not simply shrink the desktop UI.

Actually redesign layouts for smaller screens.

---

# 41. MOBILE NAVBAR

The navbar must be fully responsive.

Desktop:

```text
Calendar | Daily Audit | Real Life | ... | Settings
```

Mobile should use an appropriate layout such as:

- Bottom navigation
- Compact top navigation
- Responsive menu

Choose whichever provides the best UX.

The Settings button must remain easy to access.

Navigation items must not overlap.

Avoid horizontal scrolling caused by navigation.

---

# 42. MOBILE CALENDAR

The calendar must remain usable on Android.

Do not make tiny unreadable day cells.

Use responsive sizing.

Allow:

- Touch interaction
- Tap-to-view day details
- Swipe/navigation if appropriate
- Month/year controls without crowding

Tooltips must become tap-based popovers on touch devices.

---

# 43. MOBILE DAILY AUDIT

The Daily Audit should be extremely easy to use with one hand.

Each question should have large Yes/No controls.

Avoid tiny buttons.

Use touch targets of approximately 44px minimum.

The user should be able to rapidly complete an audit without accidentally selecting neighboring answers.

---

# 44. MOBILE REAL LIFE DASHBOARD

Cards should stack vertically when necessary.

Do not force desktop multi-column layouts onto phones.

Charts and heatmaps must resize intelligently.

Long goal names should wrap correctly.

No text should overflow outside cards.

No buttons should be cut off.

---

# 45. RESPONSIVE MODALS

Every modal must have mobile behavior.

Desktop:

- Centered modal
- Appropriate max width

Mobile:

- Full-width or near-full-width
- Appropriate padding
- Scrollable content
- Safe-area support where appropriate

Never allow a modal to become taller than the viewport without scrolling.

---

# 46. CSS QUALITY

Write proper responsive CSS/media queries wherever necessary.

Do not solve responsiveness by:

- Random negative margins
- Hardcoded pixel positioning
- Absolute positioning everywhere
- Overflow hacks
- JavaScript viewport checks for ordinary layout problems

Prefer:

- CSS Grid
- Flexbox
- Responsive units
- clamp()
- minmax()
- max-width
- container queries where useful
- Media queries

---

# 47. ACCESSIBILITY

Implement:

- Semantic HTML
- Keyboard navigation
- Focus states
- ARIA labels where needed
- Accessible dialogs
- Accessible buttons
- Accessible form controls
- Sufficient contrast
- Reduced motion support

Do not rely solely on color to communicate success/failure.

For example:

```text
✓ + green
✕ + red
```

rather than color alone.

---

# 48. DESIGN SYSTEM

Create a consistent design system.

Define reusable:

- Colors
- Typography
- Spacing
- Border radii
- Shadows
- Glass effects
- Buttons
- Inputs
- Cards
- Modals
- Tooltips
- Progress indicators
- Badges
- Toasts

Avoid styling every component independently.

---

# 49. GLASS UI

Use glassmorphism carefully.

The UI should feel premium rather than excessively blurry.

Use:

- Translucent surfaces
- Backdrop blur
- Subtle borders
- Soft shadows
- Layered depth
- Controlled gradients

Do not make text difficult to read.

The glass effect should degrade gracefully on browsers that do not support backdrop-filter.

---

# 50. ANIMATION

Use subtle, purposeful animations.

Examples:

- Page transitions
- Modal transitions
- Card hover
- Progress ring animation
- Score animation
- Streak celebration
- Award unlock
- Confetti
- Tooltip appearance

Avoid excessive animation.

Every animation should improve feedback or perceived quality.

Support:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 51. PERFORMANCE

The application should remain fast even with a large amount of historical data.

Avoid:

- Unnecessary re-renders
- Recalculating every goal on every keystroke
- Large synchronous operations on the main thread
- Excessive animation
- Huge DOM trees

Use:

- Memoization where justified
- IndexedDB queries
- Efficient selectors
- Lazy-loaded routes/features
- Virtualization if eventually required

Do not prematurely optimize everything.

Measure first where possible.

---

# 52. DATA CONSISTENCY

There should be a single source of truth.

For example:

```text
Goals
Audits
Answers
Counter Events
Milestones
Awards
```

should be stored as authoritative records.

Derived information such as:

```text
Current streak
Longest streak
Percentage
Heatmap
Calendar score
```

should be calculated consistently from the authoritative records.

Create centralized services for these calculations.

---

# 53. TIME & DATE HANDLING

Create a centralized date utility layer.

Do not scatter:

```javascript
new Date()
```

and custom date calculations throughout the application.

Handle:

- Local date
- Local midnight
- Month boundaries
- Year boundaries
- Leap years
- Historical dates
- Future date restrictions

Daily audit availability must use the user's local calendar date.

---

# 54. ERROR HANDLING

Provide friendly UI for errors.

Handle:

- IndexedDB failure
- Import failure
- Invalid import
- Storage quota issues
- Unexpected application errors

Do not expose raw stack traces to users.

Provide useful recovery actions.

---

# 55. EMPTY STATES

Design proper empty states.

If the user has no goals, do not show broken charts or empty cards.

Instead provide a beautiful explanation and a clear action to create the first goal.

Do not create fake demo data merely to make the dashboard look populated.

---

# 56. LOADING STATES

Use polished loading states.

Prefer:

- Skeletons
- Subtle transitions
- Lightweight loading indicators

Avoid blocking the entire application unnecessarily.

---

# 57. TOAST / FEEDBACK SYSTEM

Create a reusable notification system.

Use it for:

- Goal created
- Goal updated
- Goal deleted
- Data exported
- Data imported
- Audit saved
- Milestone achieved
- Counter updated

Notifications should be concise.

---

# 58. TESTING

Include automated tests for critical business logic.

At minimum test:

### Goal polarity

Positive:

```text
Yes → success
No → failure
```

Negative:

```text
No → success
Yes → failure
```

### Scoring

Test:

```text
0 / N
N / N
partial completion
```

### Streaks

Test:

- First successful day
- Consecutive successful days
- Broken streak
- Historical streak
- Longest streak
- Editing historical answers
- Multiple goals

### Date restrictions

Test:

- Today
- Yesterday
- Future dates
- Month changes
- Year changes

### Import/export

Test:

- Valid export
- Valid import
- Invalid JSON
- Invalid schema
- Version mismatch

---

# 59. SECURITY

Even though this is a local application:

- Validate imported data
- Sanitize user-generated text where rendered as HTML
- Never execute imported code
- Never use eval()
- Never inject raw HTML unnecessarily
- Do not trust imported JSON
- Do not store secrets

---

# 60. GITHUB REPOSITORY

Create a new GitHub repository named:

```text
Reclaim-Myself
```

If the GitHub account naming rules require a different representation, use the closest valid repository name while preserving the project identity **Reclaim Myself**.

Initialize Git.

Create a sensible `.gitignore`.

Commit the project.

Push it to GitHub.

Use a clean commit history.

---

# 61. README

Create an excellent production-quality README.

It should include:

## Reclaim Myself

A short product description.

### Features

- Offline-first
- IndexedDB
- Goal management
- Goal polarity
- Daily Audit
- Calendar
- Streaks
- Heatmaps
- Goal analytics
- Milestones
- Awards
- Custom counters
- Import/export
- PWA
- Responsive Android UI

### Tech Stack

Document the actual technologies used.

### Architecture

Explain the major application layers.

### Data Model

Explain the major IndexedDB entities.

### Local Storage

Explain that user data remains local.

### Offline Behavior

Explain how the PWA works offline.

### Development

Include commands for:

```bash
npm install
npm run dev
npm run build
npm run preview
npm test
```

Only document commands that actually exist.

### Production Build

Explain how to build and deploy.

### Data Backup

Explain export/import.

### Browser Support

Document realistic browser support.

### Contributing

Provide contribution guidance.

### License

Add an appropriate license file.

---

# 62. RELEASE NOTES

Create release notes for the initial release.

Use a professional changelog format.

For example:

```text
CHANGELOG.md
```

Document:

- Initial release
- Major functionality
- Architecture
- Offline functionality
- Known limitations if any

Do not claim functionality that has not actually been implemented.

---

# 63. VERSIONING

Use semantic versioning.

Initial release:

```text
v1.0.0
```

Create an appropriate Git tag for the release.

Only tag after the application builds successfully and tests pass.

---

# 64. PRODUCTION FILES

Include appropriate production files such as:

```text
.gitignore
README.md
CHANGELOG.md
LICENSE
package.json
vite.config.*
tsconfig.*
eslint configuration
prettier configuration if used
PWA configuration
```

Only add configuration files that are actually used.

Do not create meaningless placeholder files.

---

# 65. CODE QUALITY

Use:

- TypeScript types
- Clear interfaces
- Small components
- Reusable hooks
- Reusable services
- Feature boundaries
- Consistent naming
- Error boundaries where appropriate
- Centralized constants
- Centralized business logic

Avoid:

- Giant components
- 2,000-line files
- Duplicated logic
- Inline business rules everywhere
- Hardcoded goals
- Hardcoded audit questions
- Hardcoded user data
- Hardcoded analytics
- Tight coupling between UI and IndexedDB

---

# 66. IMPORTANT: DO NOT OVERENGINEER

The architecture should be modular but understandable.

Do not create abstractions merely for the sake of abstractions.

Every abstraction should solve a real problem.

Prefer simple, maintainable code.

---

# 67. FINAL UX STANDARD

Before considering the application complete, inspect the entire application as a real user.

The application should feel like:

> "This is a polished personal operating system for improving my life."

It should NOT feel like:

> "This is a CRUD dashboard built for a coding assignment."

Pay particular attention to:

- Typography
- Spacing
- Micro-interactions
- Animations
- Empty states
- Loading states
- Mobile behavior
- Calendar usability
- Goal cards
- Streak presentation
- Awards
- Visual hierarchy
- Touch interaction

---

# 68. RESPONSIVE QA CHECKLIST

Before finishing, test at minimum:

### Mobile

- 320px
- 360px
- 375px
- 390px
- 412px
- 430px

### Tablet

- 768px
- 820px
- 1024px

### Desktop

- 1280px
- 1440px
- 1920px

Verify:

- Navbar
- Calendar
- Daily Audit
- Goal editor
- Settings
- Real Life dashboard
- Goal detail page
- Heatmaps
- Modals
- Tooltips
- Charts
- Buttons
- Forms
- Long goal names
- Large goal counts

No horizontal overflow should exist unless intentionally designed.

---

# 69. IMPLEMENTATION ORDER

Build the application in this order:

### Phase 1

Project setup and design system.

### Phase 2

IndexedDB architecture.

### Phase 3

Onboarding/profile.

### Phase 4

Goal management.

### Phase 5

Goal polarity/scoring engine.

### Phase 6

Daily Audit.

### Phase 7

Calendar.

### Phase 8

Real Life dashboard.

### Phase 9

Streak engine.

### Phase 10

Goal detail pages.

### Phase 11

Heatmaps and analytics.

### Phase 12

Milestones and awards.

### Phase 13

Custom counters.

### Phase 14

Import/export.

### Phase 15

PWA/offline functionality.

### Phase 16

Responsive/mobile optimization.

### Phase 17

Accessibility.

### Phase 18

Testing.

### Phase 19

Production build.

### Phase 20

GitHub repository, README, changelog, release tag, and final push.

---

# 70. FINAL VALIDATION

Before declaring the project complete, verify all of the following:

- [ ] React application builds successfully
- [ ] TypeScript has no errors
- [ ] Linting passes
- [ ] Tests pass
- [ ] IndexedDB persistence works
- [ ] User name persists
- [ ] Goals persist
- [ ] Goal deletion works
- [ ] Goal polarity works
- [ ] Daily Audit works
- [ ] Future dates cannot be audited
- [ ] Historical dates can be edited
- [ ] Calendar reflects historical scores
- [ ] Calendar tooltips/popovers work
- [ ] Scoring is correct
- [ ] Streaks are correct
- [ ] Longest streak is preserved
- [ ] Historical data remains after streak breaks
- [ ] Milestones work
- [ ] Awards persist
- [ ] Goal detail pages work
- [ ] Goal-specific calendars work
- [ ] Heatmaps work
- [ ] Custom counters work
- [ ] Counter history persists
- [ ] Import works
- [ ] Export works
- [ ] Imported data is validated
- [ ] PWA works
- [ ] Offline functionality works
- [ ] Android layout works
- [ ] Desktop layout works
- [ ] Navbar is responsive
- [ ] Modals are responsive
- [ ] Accessibility basics are implemented
- [ ] Reduced-motion behavior works
- [ ] No Firebase exists anywhere
- [ ] No hardcoded user goals exist
- [ ] No hardcoded audit questions exist
- [ ] No fake demo data exists in production
- [ ] README is complete
- [ ] CHANGELOG exists
- [ ] LICENSE exists
- [ ] Git repository is initialized
- [ ] Production build succeeds
- [ ] GitHub repository is pushed
- [ ] Release tag is created

---

# FINAL INSTRUCTION TO THE AI

Do not merely generate a visual prototype.

Build the **actual functional application**.

Prioritize correctness of the underlying data model and business logic first, then build the premium UI around it.

Most importantly:

**Everything must be dynamic.**

Goals come from IndexedDB.

Questions come from goals.

Scores come from answers.

Streaks come from historical scores.

Calendar data comes from audits.

Heatmaps come from historical activity.

Awards come from milestones.

Counters come from user-created counter definitions and events.

Nothing related to the user's personal goals should be hardcoded.

The architecture should be ready for future Parts 5, 6, 7, etc. without requiring a rewrite.

After implementation, run the application, test the critical flows, fix all discovered issues, run the production build, and only then commit and push the final working version to GitHub.