import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Lock,
  ArrowRight,
  Star,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { DonutProgress } from '../../components/ui/DonutProgress';
import { StarRating } from '../../components/ui/StarRating';
import { Tooltip } from '../../components/ui/Tooltip';
import { Modal } from '../../components/ui/Modal';
import {
  formatDisplayDate,
  formatShortDate,
  getMonthMatrix,
} from '../../services/date/dateService';
import { buildCalendarAuditSummaries } from '../../services/analytics/analyticsService';
import { DailyAudit, DayAuditSummary, Goal } from '../../types';

interface CalendarViewProps {
  goals: Goal[];
  audits: DailyAudit[];
  onSelectDateToAudit: (dateKey: string) => void;
  onOpenGoalCreator: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  goals,
  audits,
  onSelectDateToAudit,
}) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedMobileDay, setSelectedMobileDay] = useState<DayAuditSummary | null>(null);
  const [mobileDayDateKey, setMobileDayDateKey] = useState<string | null>(null);

  const monthMatrix = useMemo(() => {
    return getMonthMatrix(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const auditSummaries = useMemo(() => {
    return buildCalendarAuditSummaries(audits, goals);
  }, [audits, goals]);

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

  const handleJumpToToday = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  };

  const handleDayClick = (dateKey: string, isFuture: boolean) => {
    if (isFuture) return;
    
    // Check if mobile width
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const summary = auditSummaries.get(dateKey) || null;
      setSelectedMobileDay(summary);
      setMobileDayDateKey(dateKey);
    } else {
      onSelectDateToAudit(dateKey);
    }
  };

  return (
    <div className="calendar-view-container animate-fade-in">
      {/* Calendar Header & Controls */}
      <div className="calendar-nav-bar glass-panel">
        <div className="month-year-indicator">
          <CalendarIcon size={22} color="var(--accent-primary)" />
          <h2 className="month-year-title">
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </h2>
        </div>

        <div className="calendar-controls">
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={handleJumpToToday}
            className="today-btn"
          >
            Today
          </GlassButton>

          <div className="nav-arrows">
            <button
              onClick={handlePrevMonth}
              className="btn-icon"
              style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px' }}
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextMonth}
              className="btn-icon"
              style={{ width: '38px', height: '38px', minWidth: '38px', minHeight: '38px' }}
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <GlassCard className="calendar-grid-card">
        {/* Week Day Header */}
        <div className="calendar-week-header">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="calendar-weekday-cell">
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="calendar-days-grid">
          {monthMatrix.map((cell) => {
            const summary = auditSummaries.get(cell.dateKey);
            const isAudited = Boolean(summary && summary.isAudited);
            const isFuture = cell.isFuture;
            const isToday = cell.isToday;

            let cellStateClass = 'cell-untracked';
            if (isFuture) {
              cellStateClass = 'cell-future';
            } else if (isAudited) {
              if (summary && summary.percentage >= 85) cellStateClass = 'cell-gold';
              else if (summary && summary.percentage >= 50) cellStateClass = 'cell-silver';
              else cellStateClass = 'cell-bronze';
            } else if (isToday) {
              cellStateClass = 'cell-today-pending';
            }

            const tooltipContent = (
              <div className="calendar-tooltip-body">
                <div className="tooltip-date-row">
                  <span className="tooltip-date">{formatShortDate(cell.dateKey)}</span>
                  {summary?.starRating && summary.starRating !== 'none' && (
                    <StarRating rating={summary.starRating} size={14} />
                  )}
                </div>
                {isAudited && summary ? (
                  <>
                    <div className="tooltip-score-row">
                      <span className="tooltip-score">
                        {summary.score} / {summary.total} Completed
                      </span>
                      <span className="tooltip-pct">{summary.percentage}%</span>
                    </div>
                    <div className="tooltip-action-hint">Click to edit audit</div>
                  </>
                ) : isFuture ? (
                  <div className="tooltip-locked-text">
                    <Lock size={12} /> Locked (Future date)
                  </div>
                ) : (
                  <div className="tooltip-action-hint">Click to conduct daily audit</div>
                )}
              </div>
            );

            return (
              <Tooltip key={cell.dateKey} content={tooltipContent} delayMs={800}>
                <div
                  className={`calendar-day-cell ${cellStateClass} ${
                    cell.isCurrentMonth ? '' : 'day-outside-month'
                  } ${isToday ? 'day-today' : ''}`}
                  onClick={() => handleDayClick(cell.dateKey, isFuture)}
                  role="button"
                  tabIndex={isFuture ? -1 : 0}
                  aria-disabled={isFuture}
                  aria-label={`${cell.dateKey} ${isAudited ? `${summary?.score}/${summary?.total}` : ''}`}
                >
                  <div className="day-cell-top">
                    <span className="day-number">{cell.dayNumber}</span>
                    {isToday && <span className="today-badge">TODAY</span>}
                    {isFuture && <Lock size={12} className="cell-lock-icon" />}
                  </div>

                  {/* Cell Performance Visuals */}
                  {!isFuture && isAudited && summary && (
                    <div className="day-cell-content">
                      <div className="cell-donut-wrap">
                        <DonutProgress
                          percentage={summary.percentage}
                          size={32}
                          strokeWidth={3.5}
                          color={
                            summary.percentage >= 85
                              ? 'var(--star-gold)'
                              : summary.percentage >= 50
                              ? 'var(--accent-primary)'
                              : 'var(--color-failure)'
                          }
                          showLabel={false}
                        />
                        <span className="cell-score-text">
                          {summary.score}/{summary.total}
                        </span>
                      </div>
                      {summary.starRating && summary.starRating !== 'none' && (
                        <div className="cell-star-icon">
                          <Star
                            size={12}
                            fill={
                              summary.starRating === 'gold'
                                ? 'var(--star-gold)'
                                : summary.starRating === 'silver'
                                ? 'var(--star-silver)'
                                : 'var(--star-bronze)'
                            }
                            color={
                              summary.starRating === 'gold'
                                ? 'var(--star-gold)'
                                : summary.starRating === 'silver'
                                ? 'var(--star-silver)'
                                : 'var(--star-bronze)'
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {!isFuture && !isAudited && isToday && (
                    <div className="day-cell-pending">
                      <span className="audit-now-pill">Audit</span>
                    </div>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </GlassCard>

      {/* Mobile Tap Popover / Modal */}
      {mobileDayDateKey && (
        <Modal
          isOpen={Boolean(mobileDayDateKey)}
          onClose={() => {
            setSelectedMobileDay(null);
            setMobileDayDateKey(null);
          }}
          title={formatDisplayDate(mobileDayDateKey)}
          maxWidth="440px"
        >
          <div className="mobile-day-popover-content">
            {selectedMobileDay && selectedMobileDay.isAudited ? (
              <div className="mobile-popover-stats">
                <div className="popover-donut-section">
                  <DonutProgress
                    percentage={selectedMobileDay.percentage}
                    size={80}
                    strokeWidth={7}
                    color={
                      selectedMobileDay.percentage >= 85
                        ? 'var(--star-gold)'
                        : selectedMobileDay.percentage >= 50
                        ? 'var(--accent-primary)'
                        : 'var(--color-failure)'
                    }
                    labelText={`${selectedMobileDay.percentage}%`}
                    subLabel={`${selectedMobileDay.score}/${selectedMobileDay.total}`}
                  />
                  <div className="popover-rating-wrap">
                    <StarRating rating={selectedMobileDay.starRating} size={18} showLabel />
                  </div>
                </div>

                <div className="popover-answers-list">
                  <div className="popover-answers-header">Goal Results:</div>
                  {goals.map((goal) => {
                    const ans = selectedMobileDay.answers[goal.id];
                    if (!ans) return null;
                    return (
                      <div key={goal.id} className="popover-answer-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {ans.success ? (
                            <CheckCircle2 size={16} color="var(--color-success)" />
                          ) : (
                            <div className="fail-dot" />
                          )}
                          <span className="popover-goal-title">{goal.title}</span>
                        </div>
                        <span className={`popover-status-tag ${ans.success ? 'tag-success' : 'tag-fail'}`}>
                          {ans.success ? 'Success' : 'Missed'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mobile-popover-empty">
                <p>No audit recorded for this date.</p>
              </div>
            )}

            <div className="mobile-popover-actions">
              <GlassButton
                variant="primary"
                fullWidth
                onClick={() => {
                  const target = mobileDayDateKey;
                  setSelectedMobileDay(null);
                  setMobileDayDateKey(null);
                  onSelectDateToAudit(target);
                }}
              >
                <span>{selectedMobileDay?.isAudited ? 'Edit Audit' : 'Start Audit'}</span>
                <ArrowRight size={16} />
              </GlassButton>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .calendar-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .calendar-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border: 1px solid var(--glass-border-hover);
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .month-year-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .month-year-title {
          font-size: 1.35rem;
          font-weight: 800;
          margin: 0;
          color: var(--text-main);
        }

        .calendar-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-arrows {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .calendar-grid-card {
          padding: 1.25rem;
          border: 1px solid var(--glass-border-hover);
        }

        .calendar-week-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 0.5rem;
        }

        .calendar-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .calendar-day-cell {
          aspect-ratio: 1.05;
          min-height: 80px;
          border-radius: var(--radius-md);
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--glass-border-subtle);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          user-select: none;
        }

        .calendar-day-cell:hover:not(.cell-future) {
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .day-outside-month {
          opacity: 0.35;
        }

        .day-today {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 0 1px var(--accent-primary-glow);
          background: rgba(56, 189, 248, 0.08) !important;
        }

        .cell-future {
          cursor: not-allowed;
          opacity: 0.25;
          background: rgba(0, 0, 0, 0.2);
        }

        .day-cell-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .day-number {
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--text-main);
        }

        .today-badge {
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--accent-primary);
          background: rgba(56, 189, 248, 0.15);
          padding: 1px 4px;
          border-radius: 4px;
        }

        .cell-lock-icon {
          color: var(--text-dim);
        }

        .day-cell-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .cell-donut-wrap {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .cell-score-text {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .day-cell-pending {
          margin-top: auto;
          display: flex;
          justify-content: center;
        }

        .audit-now-pill {
          font-size: 0.68rem;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, #38bdf8, #6366f1);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        /* Tooltip style */
        .calendar-tooltip-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .tooltip-date-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 700;
          color: var(--text-main);
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 0.25rem;
        }

        .tooltip-score-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .tooltip-score {
          color: var(--text-muted);
        }

        .tooltip-pct {
          font-weight: 700;
          color: var(--accent-primary);
        }

        .tooltip-action-hint {
          font-size: 0.7rem;
          color: var(--accent-primary);
          margin-top: 0.2rem;
        }

        .tooltip-locked-text {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--text-dim);
          font-size: 0.75rem;
        }

        /* Mobile Popover */
        .mobile-day-popover-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .popover-donut-section {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.5);
          border-radius: var(--radius-md);
        }

        .popover-answers-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .popover-answers-header {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
        }

        .popover-answer-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.03);
        }

        .popover-goal-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .popover-status-tag {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .tag-success {
          background: var(--color-success-bg);
          color: var(--color-success);
        }

        .tag-fail {
          background: var(--color-failure-bg);
          color: var(--color-failure);
        }

        .fail-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--color-failure);
        }

        @media (max-width: 768px) {
          .calendar-days-grid {
            gap: 4px;
          }
          .calendar-day-cell {
            min-height: 56px;
            padding: 0.35rem;
          }
          .cell-score-text {
            display: none;
          }
          .day-number {
            font-size: 0.75rem;
          }
          .today-badge {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
