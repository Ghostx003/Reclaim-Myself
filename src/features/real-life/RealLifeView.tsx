import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Trophy,
  Plus,
  ArrowRight,
  Shield,
  Crown,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { PolarityBadge } from '../../components/ui/PolarityBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { calculateAllGoalsStreakStats } from '../../services/streaks/streakEngine';
import { getContextualMotivation } from '../../services/motivation/motivationService';
import { calculateCounterAggregates } from '../../services/analytics/analyticsService';
import {
  Award,
  CustomCounter,
  CounterEvent,
  DailyAudit,
  Goal,
  Milestone,
  MotivationalMessage,
} from '../../types';

interface RealLifeViewProps {
  goals: Goal[];
  audits: DailyAudit[];
  counters: CustomCounter[];
  counterEvents: CounterEvent[];
  awards: Award[];
  milestones: Milestone[];
  onSelectGoal: (goalId: string) => void;
  onOpenGoalCreator: () => void;
  onOpenCounterCreator: () => void;
  onUpdateCounterDelta: (counterId: string, delta: number) => Promise<void>;
}

export const RealLifeView: React.FC<RealLifeViewProps> = ({
  goals,
  audits,
  counters,
  counterEvents,
  awards,
  onSelectGoal,
  onOpenGoalCreator,
  onOpenCounterCreator,
  onUpdateCounterDelta,
}) => {
  const activeGoals = useMemo(() => goals.filter((g) => !g.isArchived), [goals]);
  const allStreakStats = useMemo(
    () => calculateAllGoalsStreakStats(activeGoals, audits),
    [activeGoals, audits]
  );

  // Motivational quote rotating state per goal
  const [quotes, setQuotes] = useState<Record<string, MotivationalMessage>>({});

  useEffect(() => {
    // Initial quotes
    const initialQuotes: Record<string, MotivationalMessage> = {};
    for (const goal of activeGoals) {
      initialQuotes[goal.id] = getContextualMotivation(allStreakStats[goal.id]);
    }
    setQuotes(initialQuotes);

    // Rotate quotes smoothly every 12 seconds
    const interval = setInterval(() => {
      setQuotes((prev) => {
        const next: Record<string, MotivationalMessage> = {};
        for (const goal of activeGoals) {
          next[goal.id] = getContextualMotivation(allStreakStats[goal.id], prev[goal.id]?.id);
        }
        return next;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [activeGoals, allStreakStats]);

  // Overall calculations
  const totalAuditsCount = audits.length;
  const bestOverallStreak = useMemo(() => {
    let max = 0;
    Object.values(allStreakStats).forEach((s) => {
      if (s.longestStreak > max) max = s.longestStreak;
    });
    return max;
  }, [allStreakStats]);

  if (activeGoals.length === 0) {
    return (
      <div className="reallife-view-container animate-fade-in">
        <EmptyState
          icon={<Sparkles size={32} />}
          title="Real Life Dashboard"
          description="Your personal habit trajectories, streaks, custom quantity counters, and persistent awards will illuminate here once you add goals."
          actionLabel="Create a Goal"
          onAction={onOpenGoalCreator}
        />
      </div>
    );
  }

  return (
    <div className="reallife-view-container animate-fade-in">
      {/* High-Level Overview Metrics */}
      <div className="reallife-metrics-grid">
        <GlassCard className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
            <Flame size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Best Streak Ever</span>
            <div className="metric-value">{bestOverallStreak} <span className="metric-unit">days</span></div>
          </div>
        </GlassCard>

        <GlassCard className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Calendar size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Days Audited</span>
            <div className="metric-value">{totalAuditsCount} <span className="metric-unit">days</span></div>
          </div>
        </GlassCard>

        <GlassCard className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
            <Trophy size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Awards Unlocked</span>
            <div className="metric-value">{awards.length} <span className="metric-unit">trophies</span></div>
          </div>
        </GlassCard>
      </div>

      {/* Goal Cards Grid */}
      <div className="section-header-row">
        <h2>Active Goal Trajectories</h2>
        <span className="section-count-tag">{activeGoals.length} Goals</span>
      </div>

      <div className="goal-cards-grid">
        {activeGoals.map((goal) => {
          const stats = allStreakStats[goal.id];
          const target = goal.targetStreak || 21;
          const currentStreak = stats ? stats.currentStreak : 0;
          const targetPct = Math.min(100, Math.round((currentStreak / target) * 100));
          const currentQuote = quotes[goal.id];

          return (
            <GlassCard
              key={goal.id}
              variant="interactive"
              className="goal-streak-card"
              onClick={() => onSelectGoal(goal.id)}
            >
              <div className="card-top-row">
                <div className="card-title-group">
                  <span
                    className="card-category-badge"
                    style={{ color: goal.color || 'var(--accent-primary)' }}
                  >
                    {goal.category || 'Habit'}
                  </span>
                  <h3 className="card-goal-title">{goal.title}</h3>
                </div>
                <PolarityBadge polarity={goal.polarity} size="sm" />
              </div>

              {/* Dynamic Animated Motivational Quote */}
              {currentQuote && (
                <div className="quote-box animate-fade-in" key={currentQuote.id}>
                  <Sparkles size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                  <span className="quote-text">"{currentQuote.text}"</span>
                </div>
              )}

              {/* Streak Counters */}
              <div className="streak-stats-row">
                <div className="streak-badge-main">
                  <Flame size={22} color={currentStreak > 0 ? '#f97316' : 'var(--text-dim)'} />
                  <div>
                    <div className="streak-days-count">{currentStreak}</div>
                    <div className="streak-sub-label">Current Streak</div>
                  </div>
                </div>

                <div className="streak-badge-secondary">
                  <div className="sub-stat-item">
                    <span className="stat-label">Best:</span>
                    <span className="stat-val">{stats?.longestStreak || 0}d</span>
                  </div>
                  <div className="sub-stat-item">
                    <span className="stat-label">Win Rate:</span>
                    <span className="stat-val">{stats?.successRate || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Milestone Target Bar */}
              <div className="milestone-progress-section">
                <div className="milestone-text-row">
                  <span className="milestone-target-text">
                    Target: {target} Days ({targetPct}%)
                  </span>
                  <span className="milestone-days-left">
                    {Math.max(0, target - currentStreak)} to go
                  </span>
                </div>
                <div className="milestone-bar-track">
                  <div
                    className="milestone-bar-fill"
                    style={{
                      width: `${targetPct}%`,
                      background:
                        targetPct >= 100
                          ? 'linear-gradient(90deg, #10b981, #38bdf8)'
                          : 'linear-gradient(90deg, #38bdf8, #818cf8)',
                    }}
                  />
                </div>
              </div>

              <div className="card-click-footer">
                <span>View Full Analytics & Mini Calendar</span>
                <ArrowRight size={14} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Custom Quantity Counters Section */}
      <div className="counters-section-container">
        <div className="section-header-row">
          <div>
            <h2>Custom Quantity Counters</h2>
            <p style={{ fontSize: '0.85rem' }}>
              Track arbitrary metrics (savings, steps, pages, water) with cumulative history.
            </p>
          </div>
          <GlassButton variant="secondary" size="sm" onClick={onOpenCounterCreator}>
            <Plus size={16} />
            <span>New Counter</span>
          </GlassButton>
        </div>

        {counters.length === 0 ? (
          <GlassCard className="empty-counters-box">
            <p>No custom counters created yet. Add one to track money saved, minutes meditated, or books read!</p>
          </GlassCard>
        ) : (
          <div className="counters-grid">
            {counters.map((counter) => {
              const aggregates = calculateCounterAggregates(counter, counterEvents);

              return (
                <GlassCard key={counter.id} className="counter-widget-card">
                  <div className="counter-header-row">
                    <span className="counter-name">{counter.name}</span>
                    <span className="counter-unit-tag">{counter.unit}</span>
                  </div>

                  <div className="counter-value-huge">
                    {counter.currentValue.toLocaleString()}
                  </div>

                  <div className="counter-aggregates-row">
                    <div className="agg-item">
                      <span className="agg-label">This Month:</span>
                      <span className="agg-value">+{aggregates.monthlyTotal.toLocaleString()}</span>
                    </div>
                    <div className="agg-item">
                      <span className="agg-label">Lifetime:</span>
                      <span className="agg-value">+{aggregates.lifetimeTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="counter-control-btns">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateCounterDelta(counter.id, -counter.incrementValue);
                      }}
                      aria-label={`Decrease ${counter.name} by ${counter.incrementValue}`}
                    >
                      -{counter.incrementValue}
                    </button>
                    <button
                      type="button"
                      className="counter-btn counter-btn-plus"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateCounterDelta(counter.id, counter.incrementValue);
                      }}
                      aria-label={`Increase ${counter.name} by ${counter.incrementValue}`}
                    >
                      +{counter.incrementValue}
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Persistent Awards & Achievements Gallery */}
      <div className="awards-section-container">
        <div className="section-header-row">
          <div>
            <h2>Trophy Case & Achievements</h2>
            <p style={{ fontSize: '0.85rem' }}>
              Persistent awards unlocked through your discipline. Once earned, awards stay forever.
            </p>
          </div>
          <span className="section-count-tag">{awards.length} Earned</span>
        </div>

        {awards.length === 0 ? (
          <GlassCard className="empty-counters-box">
            <p>Milestone awards unlock as you achieve 7, 21, 30, 60, and 90-day streaks. Keep auditing daily!</p>
          </GlassCard>
        ) : (
          <div className="awards-grid">
            {awards.map((award) => {
              let Icon = Trophy;
              if (award.badgeIcon === 'Crown') Icon = Crown;
              if (award.badgeIcon === 'Shield') Icon = Shield;
              if (award.badgeIcon === 'Flame') Icon = Flame;

              return (
                <GlassCard key={award.id} className="award-trophy-card animate-pop-in">
                  <div className="award-icon-ring">
                    <Icon size={26} color="var(--star-gold)" />
                  </div>
                  <div className="award-info">
                    <div className="award-title">{award.title}</div>
                    <div className="award-goal-target">{award.goalTitle}</div>
                    <div className="award-desc">{award.description}</div>
                    <div className="award-date">
                      Unlocked on {new Date(award.achievedAt).toLocaleDateString()}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .reallife-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .reallife-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }

        .metric-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-info {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .metric-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-main);
          font-family: var(--font-display);
        }

        .metric-unit {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-dim);
        }

        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .section-count-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-primary);
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        /* Goal Streak Cards */
        .goal-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        .goal-streak-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          cursor: pointer;
        }

        .card-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .card-title-group {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .card-category-badge {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-goal-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
          line-height: 1.3;
        }

        .quote-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(56, 189, 248, 0.06);
          border-left: 3px solid var(--accent-primary);
          padding: 0.5rem 0.75rem;
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        }

        .quote-text {
          font-size: 0.8rem;
          font-style: italic;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .streak-stats-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.45);
          border-radius: var(--radius-md);
        }

        .streak-badge-main {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .streak-days-count {
          font-size: 1.35rem;
          font-weight: 800;
          font-family: var(--font-display);
          line-height: 1;
        }

        .streak-sub-label {
          font-size: 0.7rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        .streak-badge-secondary {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: right;
        }

        .sub-stat-item {
          font-size: 0.78rem;
          display: flex;
          gap: 0.35rem;
          justify-content: flex-end;
        }

        .stat-label {
          color: var(--text-dim);
        }

        .stat-val {
          font-weight: 700;
          color: var(--text-main);
        }

        .milestone-progress-section {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .milestone-text-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .milestone-bar-track {
          height: 6px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .milestone-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.5s ease;
        }

        .card-click-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--accent-primary);
          padding-top: 0.5rem;
          border-top: 1px solid var(--glass-border-subtle);
        }

        /* Counters */
        .counters-section-container, .awards-section-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .counters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }

        .counter-widget-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .counter-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .counter-name {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-main);
        }

        .counter-unit-tag {
          font-size: 0.72rem;
          color: var(--text-dim);
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .counter-value-huge {
          font-size: 2rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--accent-primary);
          line-height: 1.1;
        }

        .counter-aggregates-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-muted);
          border-top: 1px solid var(--glass-border-subtle);
          padding-top: 0.4rem;
        }

        .agg-item {
          display: flex;
          gap: 0.3rem;
        }

        .agg-value {
          font-weight: 700;
          color: var(--color-success);
        }

        .counter-control-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .counter-btn {
          min-height: 40px;
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          background: rgba(15, 23, 42, 0.5);
          color: var(--text-main);
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .counter-btn:hover {
          background: var(--glass-bg-hover);
        }

        .counter-btn-plus {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.35);
          color: var(--accent-primary);
        }

        .counter-btn-plus:hover {
          background: rgba(56, 189, 248, 0.25);
        }

        .empty-counters-box {
          padding: 2rem;
          text-align: center;
          color: var(--text-muted);
        }

        /* Awards Gallery */
        .awards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .award-trophy-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          border: 1px solid rgba(251, 191, 36, 0.25);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.05), rgba(15, 23, 42, 0.6));
        }

        .award-icon-ring {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-full);
          background: rgba(251, 191, 36, 0.12);
          border: 1px solid rgba(251, 191, 36, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 16px rgba(251, 191, 36, 0.2);
        }

        .award-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .award-title {
          font-weight: 800;
          font-size: 0.95rem;
          color: var(--star-gold);
        }

        .award-goal-target {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .award-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .award-date {
          font-size: 0.68rem;
          color: var(--text-dim);
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
};
