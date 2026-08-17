import confetti from 'canvas-confetti';

/**
 * Fires an elegant dual-side celebratory confetti burst for high scores & milestones.
 * Originates from both sides of the interface in a tasteful, premium fashion.
 */
export function fireCelebrationConfetti(): void {
  // Check prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const count = 60;
  const defaults = {
    origin: { y: 0.7 },
    spread: 55,
    ticks: 200,
    gravity: 0.9,
    decay: 0.94,
    startVelocity: 35,
    colors: ['#38bdf8', '#818cf8', '#fbbf24', '#10b981', '#ec4899'],
  };

  // Fire from left side
  confetti({
    ...defaults,
    particleCount: count,
    angle: 60,
    origin: { x: 0.15, y: 0.65 },
  });

  // Fire from right side
  confetti({
    ...defaults,
    particleCount: count,
    angle: 120,
    origin: { x: 0.85, y: 0.65 },
  });
}
