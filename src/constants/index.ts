import { MotivationalMessage, UserPreferences } from '../types';

export const DB_NAME = 'ReclaimMyselfDB';
export const CURRENT_SCHEMA_VERSION = 1;
export const APP_NAME = 'Reclaim Myself';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'midnight',
  starThresholds: {
    gold: 0.85,    // >= 85%
    silver: 0.50,  // >= 50%
    bronze: 0.00,  // < 50%
  },
  confettiThreshold: 0.85, // 85%
  reducedMotion: false,
};

export const DEFAULT_PALETTES = [
  '#38bdf8', // Sky Cyan
  '#818cf8', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

export const MOTIVATIONAL_MESSAGES: MotivationalMessage[] = [
  // Starting out (0-3 days)
  {
    id: 'start-1',
    text: 'Every master was once a disaster. Today is day one.',
    category: 'starting',
    minStreak: 0,
  },
  {
    id: 'start-2',
    text: 'Small daily disciplines compound into monumental lifetime victories.',
    category: 'starting',
    minStreak: 0,
  },
  {
    id: 'start-3',
    text: 'You don’t have to be extreme, just consistent.',
    category: 'starting',
    minStreak: 0,
  },
  {
    id: 'start-4',
    text: 'The secret of getting ahead is getting started.',
    category: 'starting',
    minStreak: 0,
  },
  // Momentum (4-14 days)
  {
    id: 'mom-1',
    text: 'Momentum is building. Protect the flame you started.',
    category: 'momentum',
    minStreak: 4,
  },
  {
    id: 'mom-2',
    text: 'We are what we repeatedly do. Excellence is not an act, but a habit.',
    category: 'momentum',
    minStreak: 4,
  },
  {
    id: 'mom-3',
    text: 'Consistency isn’t about never failing; it’s about never quitting.',
    category: 'momentum',
    minStreak: 7,
  },
  {
    id: 'mom-4',
    text: 'The pain of discipline is far less than the pain of regret.',
    category: 'momentum',
    minStreak: 7,
  },
  // Mastery (15+ days)
  {
    id: 'mast-1',
    text: 'Unstoppable trajectory. Your identity is transforming with every checkmark.',
    category: 'mastery',
    minStreak: 15,
  },
  {
    id: 'mast-2',
    text: 'Long streaks are built one ordinary choice at a time.',
    category: 'mastery',
    minStreak: 21,
  },
  {
    id: 'mast-3',
    text: 'You have forged resilience into your daily routine.',
    category: 'mastery',
    minStreak: 30,
  },
  {
    id: 'mast-4',
    text: 'Legends are written in the quiet consistency of daily audits.',
    category: 'mastery',
    minStreak: 45,
  },
  // Comeback / Recovery
  {
    id: 'rec-1',
    text: 'A bump in the road is not the end of the road. Reclaim your focus today.',
    category: 'comeback',
  },
  {
    id: 'rec-2',
    text: 'Never let a slip turn into a slide. The comeback begins right now.',
    category: 'comeback',
  },
];

export const BADGE_ICONS = [
  'Flame',
  'Trophy',
  'Shield',
  'Crown',
  'Sparkles',
  'Zap',
  'Award',
  'Target',
  'Compass',
  'Sun',
];
