import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Flame,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Trophy,
  Edit2,
  Check,
  Trash2,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { PolarityBadge } from '../../components/ui/PolarityBadge';
import { DonutProgress } from '../../components/ui/DonutProgress';
import { Modal } from '../../components/ui/Modal';
import { calculateGoalStreakStats } from '../../services/streaks/streakEngine';
import { generateGoalHeatmap } from '../../services/analytics/analyticsService';
import { formatDisplayDate, getDaysInMonth } from '../../services/date/dateService';
import { isGoalSuccess } from '../../services/scoring/scoringEngine';
import { CustomCounter, DailyAudit, Goal } from '../../types';

interface GoalDetailViewProps {
  goal: Goal;
  audits: DailyAudit[];
  counters: CustomCounter[];
  onBack: () => void;
  onEditGoal: (goal: Goal) => void;
  onUpdateGoalHeatmapDays: (goalId: string, days: number) => Promise<void>;
  onOpenCounterCreator: (goalId: string) => void;
  onUpdateCounterDelta: (counterId: string, delta: number) => Promise<void>;
  onDeleteCounter: (counterId: string) => Promise<void>;
}

export const GoalDetailView: React.FC<GoalDetailViewProps> = ({
  goal,
  audits,
  counters,
  onBack,
  onEditGoal,
  onUpdateGoalHeatmapDays,
  onOpenCounterCreator,
  onUpdateCounterDelta,
  onDeleteCounter,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Per-Goal Editable Heatmap Timeframe state (Default to 21 Days or stored preference)
  const [heatmapDays, setHeatmapDays] = useState<number>(goal.heatmapDays || 21);

  useEffect(() => {
    setHeatmapDays(goal.heatmapDays || 21);
  }, [goal.id, goal.heatmapDays]);

  const handleHeatmapDaysChange = (newDays: number) => {
    const clamped = Math.max(1, Math.min(365, newDays));
    setHeatmapDays(clamped);
    onUpdateGoalHeatmapDays(goal.id, clamped);
  };

  // Inline Counter Editing state
  const [editingCounterId, setEditingCounterId] = useState<string | null>(null);
  const [editCounterValue, setEditCounterValue] = useState<string>('');
  const counterInputRef = useRef<HTMLInputElement>(null);

  // Counter Deletion Confirmation state
  const [counterToDelete, setCounterToDelete] = useState<CustomCounter | null>(null);
  const [isDeletingCounter, setIsDeletingCounter] = useState(false);

  const startEditingCounter = (counter: CustomCounter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCounterId(counter.id);
    setEditCounterValue(String(counter.currentValue ?? 0));
  };

  useEffect(() => {
    if (editingCounterId && counterInputRef.current) {
      counterInputRef.current.focus();
      counterInputRef.current.select();
    }
  }, [editingCounterId]);

  const commitCounterEdit = (counter: CustomCounter) => {
    if (editingCounterId !== counter.id) return;
    const parsed = parseInt(editCounterValue, 10);
    const newVal = isNaN(parsed) ? 0 : parsed;
    const delta = newVal - (counter.currentValue || 0);

    if (delta !== 0) {
      onUpdateCounterDelta(counter.id, delta);
    }
    setEditingCounterId(null);
  };

  const cancelCounterEdit = () => {
    setEditingCounterId(null);
  };

  const handleConfirmDeleteCounter = async () => {
    if (!counterToDelete) return;
    setIsDeletingCounter(true);
    try {
      await onDeleteCounter(counterToDelete.id);
      setCounterToDelete(null);
    } finally {
      setIsDeletingCounter(false);
    }
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  };

  const stats = useMemo(
    () => calculateGoalStreakStats(goal, audits),
    [goal, audits]
  );

  const heatmapCells = useMemo(
    () => generateGoalHeatmap(goal, audits, Math.max(1, heatmapDays)),
    [goal, audits, heatmapDays]
  );

  // Notes history
  const notesList = useMemo(() => {
    const list: { date: string; note: string; success: boolean }[] = [];
    audits
      .filter((a) => a.answers && a.answers[goal.id] && a.answers[goal.id].note)
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((a) => {
        const raw = a.answers[goal.id];
        const success = isGoalSuccess(goal.polarity, raw.answer);
        if (raw.note && raw.note.trim().length > 0) {
          list.push({ date: a.date, note: raw.note, success });
        }
      });
    return list;
  }, [goal, audits]);

  // Mini goal-specific calendar matrix for current/selected month
  const goalMonthDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const auditMap = new Map<string, boolean>();

    for (const a of audits) {
      if (a.answers && a.answers[goal.id] !== undefined) {
        const success = isGoalSuccess(goal.polarity, a.answers[goal.id].answer);
        auditMap.set(a.date, success);
      }
    }

    const days: { dateKey: string; dayNumber: number; status: 'success' | 'failure' | 'none' }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let status: 'success' | 'failure' | 'none' = 'none';
      if (auditMap.has(dateKey)) {
        status = auditMap.get(dateKey) ? 'success' : 'failure';
      }
      days.push({ dateKey, dayNumber: d, status });
    }
    return days;
  }, [goal, audits, selectedYear, selectedMonth]);

  const isCurrentMonthActive =
    selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear();

  return (
    <div className="goal-detail-container animate-fade-in">
      {/* Navigation Top Bar */}
      <div className="detail-top-nav">
        <GlassButton variant="secondary" size="sm" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </GlassButton>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <GlassButton variant="secondary" size="sm" onClick={() => onEditGoal(goal)}>
            <Edit size={16} />
            <span>Configure Goal</span>
          </GlassButton>
        </div>
      </div>

      {/* Hero Overview Card */}
      <GlassCard className="goal-hero-card">
        <div className="hero-top-row">
          <div>
            <div className="hero-category-row">
              <span className="hero-category" style={{ color: goal.color || 'var(--accent-primary)' }}>
                {goal.category || 'Personal Goal'}
              </span>
              <PolarityBadge polarity={goal.polarity} showDetail />
            </div>
            <h1 className="hero-title">{goal.title}</h1>
            {goal.description && <p className="hero-description">{goal.description}</p>}
          </div>

          <div className="hero-donut-wrap">
            <DonutProgress
              percentage={stats.successRate}
              size={90}
              strokeWidth={8}
              color={goal.color || '#38bdf8'}
              labelText={`${stats.successRate}%`}
              subLabel="Win Rate"
            />
          </div>
        </div>

        {/* Key Numerical Metrics Grid */}
        <div className="stats-cards-grid">
          <div className="stat-card-box">
            <Flame size={22} color="#f97316" />
            <div className="stat-card-number">{stats.currentStreak}</div>
            <div className="stat-card-label">Current Streak (Days)</div>
          </div>

          <div className="stat-card-box">
            <Trophy size={22} color="var(--star-gold)" />
            <div className="stat-card-number">{stats.longestStreak}</div>
            <div className="stat-card-label">Longest Streak Ever</div>
          </div>

          <div className="stat-card-box">
            <CheckCircle2 size={22} color="var(--color-success)" />
            <div className="stat-card-number">{stats.totalSuccessfulDays}</div>
            <div className="stat-card-label">Total Successful Days</div>
          </div>

          <div className="stat-card-box">
            <XCircle size={22} color="var(--color-failure)" />
            <div className="stat-card-number">{stats.totalUnsuccessfulDays}</div>
            <div className="stat-card-label">Unsuccessful Days</div>
          </div>
        </div>
      </GlassCard>

      {/* Editable Goal Activity Heatmap */}
      <GlassCard className="heatmap-section-card">
        <div className="section-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <CalendarIcon size={18} color="var(--accent-primary)" />
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <input
                type="number"
                min={1}
                max={365}
                className="heatmap-days-input"
                value={heatmapDays}
                onChange={(e) => handleHeatmapDaysChange(parseInt(e.target.value) || 21)}
                onFocus={(e) => e.target.select()}
                title="Type custom number of days for heatmap"
              />
              <span>-Day Heatmap</span>
            </h3>

            {/* Timeframe Presets */}
            <div className="heatmap-presets">
              {[7, 21, 30, 60, 90, 84].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`heatmap-preset-chip ${heatmapDays === d ? 'chip-active' : ''}`}
                  onClick={() => handleHeatmapDaysChange(d)}
                >
                  {d === 84 ? '12w' : `${d}d`}
                </button>
              ))}
            </div>
          </div>

          <div className="heatmap-legend">
            <div className="legend-item">
              <span className="legend-dot dot-success" /> Success
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-fail" /> Missed
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-untracked" /> Untracked
            </div>
          </div>
        </div>

        <div className="heatmap-matrix-grid">
          {heatmapCells.map((cell) => {
            let bg = 'rgba(255, 255, 255, 0.04)';
            let title = `${cell.date}: Untracked`;
            if (cell.status === 'success') {
              bg = 'var(--color-success)';
              title = `${cell.date}: Successful (✓)`;
            } else if (cell.status === 'failure') {
              bg = 'var(--color-failure)';
              title = `${cell.date}: Unsuccessful (✕)`;
            } else if (cell.status === 'future') {
              bg = 'transparent';
              title = `${cell.date}: Future (Locked)`;
            }

            return (
              <div
                key={cell.date}
                className={`heatmap-cell ${cell.isToday ? 'cell-is-today' : ''}`}
                style={{ backgroundColor: bg }}
                title={title}
              />
            );
          })}
        </div>
      </GlassCard>

      {/* Mini Goal Calendar with Month Navigation Controls */}
      <GlassCard className="goal-mini-calendar-card">
        <div className="section-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={18} color="var(--accent-primary)" />
            <h3>Monthly Audit History</h3>
          </div>

          <div className="mini-calendar-nav-controls">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="btn-icon"
              style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="mini-month-display">
              {new Date(selectedYear, selectedMonth).toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric',
              })}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="btn-icon"
              style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>

            {!isCurrentMonthActive && (
              <button type="button" onClick={handleResetToCurrentMonth} className="current-month-pill-btn">
                Today
              </button>
            )}
          </div>
        </div>

        <div className="mini-calendar-days-grid">
          {goalMonthDays.map((d) => (
            <div
              key={d.dateKey}
              className={`mini-day-cell ${
                d.status === 'success'
                  ? 'mini-success'
                  : d.status === 'failure'
                  ? 'mini-failure'
                  : 'mini-none'
              }`}
            >
              <span className="mini-day-num">{d.dayNumber}</span>
              {d.status === 'success' && <CheckCircle2 size={12} className="mini-icon" />}
              {d.status === 'failure' && <XCircle size={12} className="mini-icon" />}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Attached Custom Counters */}
      <div className="detail-counters-section">
        <div className="section-title-row">
          <div>
            <h3>Goal Counters</h3>
            <p style={{ fontSize: '0.8rem' }}>Custom metrics specifically associated with this goal. Hover to delete or click value to edit.</p>
          </div>
          <GlassButton variant="secondary" size="sm" onClick={() => onOpenCounterCreator(goal.id)}>
            <Plus size={14} />
            <span>Add Counter</span>
          </GlassButton>
        </div>

        {counters.length === 0 ? (
          <GlassCard className="empty-sub-card">
            <p>No custom counters attached to this goal yet.</p>
          </GlassCard>
        ) : (
          <div className="detail-counters-grid">
            {counters.map((c) => {
              const isEditing = editingCounterId === c.id;

              return (
                <GlassCard key={c.id} className="goal-counter-card">
                  <div className="counter-row">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="counter-card-title">{c.name}</span>
                        {/* Delete Counter Button */}
                        <button
                          type="button"
                          className="counter-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCounterToDelete(c);
                          }}
                          title={`Delete "${c.name}"`}
                          aria-label={`Delete "${c.name}"`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {isEditing ? (
                        <div className="counter-edit-wrapper" onClick={(e) => e.stopPropagation()}>
                          <input
                            ref={counterInputRef}
                            type="number"
                            className="glass-input counter-inline-input"
                            value={editCounterValue}
                            onChange={(e) => setEditCounterValue(e.target.value)}
                            onBlur={() => commitCounterEdit(c)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitCounterEdit(c);
                              if (e.key === 'Escape') cancelCounterEdit();
                            }}
                          />
                          <button
                            type="button"
                            className="counter-edit-save-btn"
                            onClick={() => commitCounterEdit(c)}
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="counter-value-huge-clickable"
                          onClick={(e) => startEditingCounter(c, e)}
                          title="Click to directly edit value"
                        >
                          <span>{(c.currentValue ?? 0).toLocaleString()}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginLeft: '4px' }}>
                            {c.unit}
                          </span>
                          <Edit2 size={12} className="counter-edit-pencil-icon" />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="counter-btn"
                        style={{ minHeight: '36px', padding: '0 12px' }}
                        onClick={() => onUpdateCounterDelta(c.id, -c.incrementValue)}
                      >
                        -{c.incrementValue}
                      </button>
                      <button
                        className="counter-btn counter-btn-plus"
                        style={{ minHeight: '36px', padding: '0 12px' }}
                        onClick={() => onUpdateCounterDelta(c.id, c.incrementValue)}
                      >
                        +{c.incrementValue}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Reflection Notes History */}
      <div className="notes-log-section">
        <h3>Reflection & Reason Log</h3>
        {notesList.length === 0 ? (
          <GlassCard className="empty-sub-card">
            <p>No reflection notes recorded yet. Add notes while conducting your daily audits.</p>
          </GlassCard>
        ) : (
          <div className="notes-list-col">
            {notesList.map((n, idx) => (
              <GlassCard key={idx} className="note-item-card">
                <div className="note-top">
                  <span className="note-date">{formatDisplayDate(n.date)}</span>
                  <span className={`note-status-badge ${n.success ? 'badge-win' : 'badge-loss'}`}>
                    {n.success ? 'Success' : 'Unsuccessful'}
                  </span>
                </div>
                <p className="note-content">"{n.note}"</p>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Delete Counter Confirmation Modal */}
      {counterToDelete && (
        <Modal
          isOpen={Boolean(counterToDelete)}
          onClose={() => setCounterToDelete(null)}
          title={`Delete "${counterToDelete.name}"?`}
          maxWidth="440px"
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-failure-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Trash2 size={24} color="var(--color-failure)" />
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Are you sure you want to delete this custom counter? All historical quantity entries for this counter will be removed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <GlassButton variant="secondary" onClick={() => setCounterToDelete(null)} disabled={isDeletingCounter}>
                Cancel
              </GlassButton>
              <GlassButton variant="danger" onClick={handleConfirmDeleteCounter} disabled={isDeletingCounter}>
                {isDeletingCounter ? 'Deleting...' : 'Confirm Delete'}
              </GlassButton>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .goal-detail-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .goal-hero-card {
          padding: 1.75rem;
          border: 1px solid var(--glass-border-hover);
        }

        .hero-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          margin-bottom: 1.75rem;
        }

        .hero-category-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.4rem;
        }

        .hero-category {
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hero-title {
          font-size: 1.85rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          color: var(--text-main);
        }

        .hero-description {
          color: var(--text-muted);
          font-size: 0.95rem;
          max-width: 600px;
        }

        .stats-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .stat-card-box {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.5);
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
        }

        .stat-card-number {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--text-main);
          line-height: 1;
        }

        .stat-card-label {
          font-size: 0.78rem;
          color: var(--text-dim);
          font-weight: 600;
        }

        /* Heatmap Section */
        .heatmap-section-card {
          padding: 1.5rem;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .heatmap-days-input {
          width: 52px;
          font-size: 1.05rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--accent-primary);
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--glass-border-hover);
          border-radius: var(--radius-sm);
          padding: 2px 4px;
          text-align: center;
        }

        .heatmap-days-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px var(--accent-primary-glow);
        }

        .heatmap-presets {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-left: 0.5rem;
        }

        .heatmap-preset-chip {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .heatmap-preset-chip:hover {
          background: var(--glass-bg-hover);
          color: var(--text-main);
        }

        .chip-active {
          background: rgba(56, 189, 248, 0.15) !important;
          border-color: var(--accent-primary) !important;
          color: var(--accent-primary) !important;
        }

        .mini-calendar-nav-controls {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .mini-month-display {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-main);
          min-width: 130px;
          text-align: center;
        }

        .current-month-pill-btn {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-primary);
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: var(--radius-full);
          padding: 2px 8px;
          cursor: pointer;
        }

        .heatmap-legend {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }

        .dot-success { background: var(--color-success); }
        .dot-fail { background: var(--color-failure); }
        .dot-untracked { background: rgba(255, 255, 255, 0.1); }

        .heatmap-matrix-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(14px, 1fr));
          gap: 6px;
        }

        .heatmap-cell {
          aspect-ratio: 1;
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.15s ease;
        }

        .heatmap-cell:hover {
          transform: scale(1.3);
          z-index: 10;
        }

        .cell-is-today {
          outline: 2px solid var(--accent-primary);
        }

        /* Mini Goal Calendar */
        .mini-calendar-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .mini-day-cell {
          aspect-ratio: 1.1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          padding: 0.25rem;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid var(--glass-border-subtle);
          background: rgba(15, 23, 42, 0.4);
        }

        .mini-success {
          background: var(--color-success-bg);
          border-color: var(--color-success-border);
          color: var(--color-success);
        }

        .mini-failure {
          background: var(--color-failure-bg);
          border-color: var(--color-failure-border);
          color: var(--color-failure);
        }

        .mini-none {
          color: var(--text-dim);
        }

        .mini-icon {
          margin-top: 2px;
        }

        /* Detail Counters */
        .detail-counters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1rem;
        }

        .goal-counter-card {
          padding: 1rem;
          position: relative;
        }

        .counter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .counter-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .counter-delete-btn {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-sm);
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: all var(--transition-fast);
        }

        .goal-counter-card:hover .counter-delete-btn,
        .counter-delete-btn:focus {
          opacity: 1;
        }

        .counter-delete-btn:hover {
          background: var(--color-failure-bg);
          border-color: var(--color-failure-border);
          color: var(--color-failure);
        }

        .counter-value-huge-clickable {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 1.4rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--accent-primary);
          cursor: pointer;
          border-radius: var(--radius-sm);
          padding: 2px 6px;
          margin-left: -6px;
          transition: background var(--transition-fast);
        }

        .counter-value-huge-clickable:hover {
          background: rgba(56, 189, 248, 0.12);
        }

        .counter-edit-pencil-icon {
          opacity: 0;
          color: var(--text-dim);
          transition: opacity var(--transition-fast);
        }

        .counter-value-huge-clickable:hover .counter-edit-pencil-icon {
          opacity: 1;
        }

        .counter-edit-wrapper {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.2rem;
        }

        .counter-inline-input {
          font-size: 1.2rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--accent-primary);
          padding: 0.2rem 0.4rem;
          width: 100px;
          min-height: 32px;
        }

        .counter-edit-save-btn {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          background: var(--accent-primary);
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* Reflection Notes */
        .notes-list-col {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.75rem;
        }

        .note-item-card {
          padding: 1rem 1.25rem;
        }

        .note-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4rem;
        }

        .note-date {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-dim);
        }

        .note-status-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .badge-win {
          background: var(--color-success-bg);
          color: var(--color-success);
        }

        .badge-loss {
          background: var(--color-failure-bg);
          color: var(--color-failure);
        }

        .note-content {
          font-size: 0.9rem;
          color: var(--text-main);
          font-style: italic;
          line-height: 1.5;
        }

        .empty-sub-card {
          padding: 1.5rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
          .hero-top-row {
            flex-direction: column;
          }
        }

        @media (hover: none) {
          .counter-delete-btn {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};
