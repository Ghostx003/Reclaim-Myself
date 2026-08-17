import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Lock,
  Save,
  RotateCcw,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { DonutProgress } from '../../components/ui/DonutProgress';
import { StarRating } from '../../components/ui/StarRating';
import { PolarityBadge } from '../../components/ui/PolarityBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/feedback/ToastContext';
import {
  addDaysToDateKey,
  formatDisplayDate,
  getTodayKey,
  isFutureDate,
  isTodayDate,
} from '../../services/date/dateService';
import {
  calculateDailyScore,
  generateGoalQuestion,
  isGoalSuccess,
} from '../../services/scoring/scoringEngine';
import { DailyAudit, Goal, GoalAuditAnswer, UserPreferences } from '../../types';

interface DailyAuditViewProps {
  initialDateKey?: string;
  goals: Goal[];
  audits: DailyAudit[];
  preferences: UserPreferences;
  onSaveAudit: (
    date: string,
    answers: Record<string, GoalAuditAnswer>
  ) => Promise<void>;
  onDeleteAudit: (date: string) => Promise<void>;
  onOpenGoalCreator: () => void;
}

export const DailyAuditView: React.FC<DailyAuditViewProps> = ({
  initialDateKey,
  goals,
  audits,
  preferences,
  onSaveAudit,
  onDeleteAudit,
  onOpenGoalCreator,
}) => {
  const { showToast } = useToast();
  const [currentDateKey, setCurrentDateKey] = useState<string>(
    initialDateKey || getTodayKey()
  );
  const [answers, setAnswers] = useState<Record<string, GoalAuditAnswer>>({});
  const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [celebrateEffect, setCelebrateEffect] = useState(false);

  const activeGoals = useMemo(() => goals.filter((g) => !g.isArchived), [goals]);

  // Load existing audit if available for current date
  useEffect(() => {
    const existing = audits.find((a) => a.date === currentDateKey);
    if (existing && existing.answers) {
      setAnswers(existing.answers);
    } else {
      setAnswers({});
    }
  }, [currentDateKey, audits, activeGoals]);

  const scoreResult = useMemo(() => {
    return calculateDailyScore(activeGoals, answers, preferences);
  }, [activeGoals, answers, preferences]);

  const isFuture = isFutureDate(currentDateKey);
  const isToday = isTodayDate(currentDateKey);
  const canGoNext = !isFutureDate(addDaysToDateKey(currentDateKey, 1));
  const hasExistingRecordedAudit = useMemo(() => {
    return audits.some((a) => a.date === currentDateKey);
  }, [audits, currentDateKey]);

  const handlePrevDay = () => {
    setCurrentDateKey((d) => addDaysToDateKey(d, -1));
  };

  const handleNextDay = () => {
    const nextDate = addDaysToDateKey(currentDateKey, 1);
    if (!isFutureDate(nextDate)) {
      setCurrentDateKey(nextDate);
    }
  };

  const handleAnswerToggle = (goalId: string, value: boolean) => {
    if (isFuture) return;
    setAnswers((prev) => ({
      ...prev,
      [goalId]: {
        goalId,
        answer: value,
        note: prev[goalId]?.note,
      },
    }));
  };

  const handleNoteChange = (goalId: string, note: string) => {
    setAnswers((prev) => ({
      ...prev,
      [goalId]: {
        goalId,
        answer: prev[goalId] ? prev[goalId].answer : false,
        note,
      },
    }));
  };

  const toggleNoteInput = (goalId: string) => {
    setNotesOpen((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }));
  };

  const handleSave = async () => {
    if (isFuture || isSaving) return;

    // Check if at least one question is answered
    if (Object.keys(answers).length === 0 && activeGoals.length > 0) {
      showToast('warning', 'Please answer at least one goal question.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveAudit(currentDateKey, answers);
      setCelebrateEffect(true);
      showToast('success', 'Daily Audit Saved', `Score: ${scoreResult.score}/${scoreResult.total} (${scoreResult.percentage}%)`);
      setTimeout(() => setCelebrateEffect(false), 2000);
    } catch {
      showToast('error', 'Failed to save audit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndJumpToToday = async () => {
    const todayKey = getTodayKey();
    if (currentDateKey === todayKey) return;

    // If there are answers on this past date, save them
    if (Object.keys(answers).length > 0) {
      try {
        await onSaveAudit(currentDateKey, answers);
        showToast(
          'success',
          'Audit Saved',
          `Saved audit for ${formatDisplayDate(currentDateKey)} and jumped to Today.`
        );
      } catch {
        showToast('error', 'Failed to save audit for past date');
      }
    }

    // Switch to today
    setCurrentDateKey(todayKey);
  };

  const handleResetDayAudit = async () => {
    if (isFuture || isResetting) return;
    setIsResetting(true);
    try {
      await onDeleteAudit(currentDateKey);
      setAnswers({});
      setNotesOpen({});
      setShowResetConfirm(false);
      showToast('info', 'Audit Reset', `All answers and data cleared for ${formatDisplayDate(currentDateKey)}.`);
    } catch {
      showToast('error', 'Failed to reset audit');
    } finally {
      setIsResetting(false);
    }
  };

  if (activeGoals.length === 0) {
    return (
      <div className="daily-audit-container animate-fade-in">
        <EmptyState
          icon={<Sparkles size={32} />}
          title="No Active Goals Found"
          description="Create your first personal goal to unlock the daily audit engine, polarity scoring, and habit streaks."
          actionLabel="Create Your First Goal"
          onAction={onOpenGoalCreator}
        />
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const canReset = answeredCount > 0 || hasExistingRecordedAudit;

  return (
    <div className="daily-audit-container animate-fade-in">
      {/* Date Bar */}
      <div className="audit-date-bar glass-panel">
        <button
          type="button"
          onClick={handlePrevDay}
          className="btn-icon"
          aria-label="Previous day"
          style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px' }}
        >
          <ChevronLeft size={22} />
        </button>

        <div className="audit-date-center">
          <div className="audit-date-text">{formatDisplayDate(currentDateKey)}</div>
          <div className="audit-badges-row">
            {isToday && <span className="today-badge">TODAY'S AUDIT</span>}
            {isFuture && (
              <span className="locked-badge">
                <Lock size={12} /> FUTURE DATE (LOCKED)
              </span>
            )}
            {hasExistingRecordedAudit && !isFuture && (
              <span className="recorded-badge">AUDITED</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          className="btn-icon"
          disabled={!canGoNext}
          aria-label="Next day"
          style={{
            width: '44px',
            height: '44px',
            minWidth: '44px',
            minHeight: '44px',
            opacity: canGoNext ? 1 : 0.3,
            cursor: canGoNext ? 'pointer' : 'not-allowed',
          }}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Real-Time Live Score Summary Card */}
      <GlassCard className={`audit-score-card ${celebrateEffect ? 'animate-pop-in' : ''}`}>
        <div className="score-card-top-bar">
          <div className="score-status-title">Daily Performance Overview</div>
          <div className="score-top-actions">
            {!isToday && !isFuture && (
              <button
                type="button"
                className="jump-today-btn"
                onClick={handleSaveAndJumpToToday}
                title="Save this day's audit and return to Today"
              >
                <CalendarIcon size={14} />
                <span>Save & Jump to Today</span>
              </button>
            )}
            {canReset && !isFuture && (
              <button
                type="button"
                className="clear-audit-top-btn"
                onClick={() => setShowResetConfirm(true)}
                title="Clear all selected answers and delete audit record for this day"
              >
                <RotateCcw size={14} />
                <span>Clear / Reset Day Audit</span>
              </button>
            )}
          </div>
        </div>

        <div className="score-summary-flex">
          <div className="donut-wrap">
            <DonutProgress
              percentage={scoreResult.percentage}
              size={96}
              strokeWidth={8}
              color={
                scoreResult.percentage >= preferences.confettiThreshold * 100
                  ? 'var(--star-gold)'
                  : scoreResult.percentage >= 50
                  ? 'var(--accent-primary)'
                  : 'var(--color-failure)'
              }
              labelText={`${scoreResult.percentage}%`}
              subLabel={`${scoreResult.score}/${scoreResult.total}`}
            />
          </div>

          <div className="score-details-col">
            <div className="score-metric-row">
              <span className="score-label">Current Performance:</span>
              <span className="score-number">
                {scoreResult.score} / {scoreResult.total} Goals Achieved
              </span>
            </div>

            <div className="rating-row">
              <span className="score-label">Grading Status:</span>
              {scoreResult.starRating !== 'none' ? (
                <StarRating rating={scoreResult.starRating} size={20} showLabel />
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Awaiting answers...
                </span>
              )}
            </div>

            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${scoreResult.percentage}%`,
                  background:
                    scoreResult.percentage >= 85
                      ? 'linear-gradient(90deg, #38bdf8, #fbbf24)'
                      : scoreResult.percentage >= 50
                      ? 'linear-gradient(90deg, #38bdf8, #818cf8)'
                      : 'linear-gradient(90deg, #f43f5e, #fb7185)',
                }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Goal Questions List */}
      <div className="audit-questions-list">
        {activeGoals.map((goal) => {
          const currentAnswer = answers[goal.id];
          const hasAnswer = currentAnswer !== undefined;
          const isSuccess = hasAnswer ? isGoalSuccess(goal.polarity, currentAnswer.answer) : false;
          const questionText = generateGoalQuestion(goal);
          const hasNote = Boolean(currentAnswer?.note && currentAnswer.note.trim().length > 0);
          const showNoteField = notesOpen[goal.id] || hasNote;

          return (
            <GlassCard
              key={goal.id}
              className={`question-card ${
                hasAnswer
                  ? isSuccess
                    ? 'card-success-glow'
                    : 'card-fail-glow'
                  : ''
              }`}
            >
              <div className="question-header">
                <div className="question-title-block">
                  <div className="goal-title-row">
                    <span className="goal-title-badge" style={{ color: goal.color || 'inherit' }}>
                      {goal.title}
                    </span>
                    <PolarityBadge polarity={goal.polarity} size="sm" showDetail />
                  </div>
                  <h3 className="dynamic-question-prompt">{questionText}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => toggleNoteInput(goal.id)}
                  className={`btn-icon note-toggle-btn ${hasNote ? 'has-note-active' : ''}`}
                  title="Add Reason / Reflection Note"
                  aria-label="Add Reason / Reflection Note"
                >
                  <MessageSquare size={16} />
                </button>
              </div>

              {/* Big Touch-Friendly Yes/No Controls */}
              {(() => {
                const isPositive = goal.polarity === 'positive';
                const isYesSelected = hasAnswer && currentAnswer.answer === true;
                const isNoSelected = hasAnswer && currentAnswer.answer === false;

                const yesIsWin = isPositive;
                const yesSelectedClass = isYesSelected
                  ? yesIsWin
                    ? 'selected-win'
                    : 'selected-loss'
                  : '';

                const noIsWin = !isPositive;
                const noSelectedClass = isNoSelected
                  ? noIsWin
                    ? 'selected-win'
                    : 'selected-loss'
                  : '';

                return (
                  <div className="audit-answer-controls">
                    <button
                      type="button"
                      disabled={isFuture}
                      onClick={() => handleAnswerToggle(goal.id, true)}
                      className={`audit-choice-btn ${yesSelectedClass}`}
                      aria-pressed={isYesSelected}
                    >
                      {isYesSelected ? (
                        yesIsWin ? (
                          <Check size={20} strokeWidth={3} />
                        ) : (
                          <X size={20} strokeWidth={3} />
                        )
                      ) : (
                        <span className="choice-indicator-dot" />
                      )}
                      <span>Yes</span>
                      <span className={`choice-badge ${yesIsWin ? 'badge-is-win' : 'badge-is-loss'}`}>
                        {yesIsWin ? 'Win' : 'Loss'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isFuture}
                      onClick={() => handleAnswerToggle(goal.id, false)}
                      className={`audit-choice-btn ${noSelectedClass}`}
                      aria-pressed={isNoSelected}
                    >
                      {isNoSelected ? (
                        noIsWin ? (
                          <Check size={20} strokeWidth={3} />
                        ) : (
                          <X size={20} strokeWidth={3} />
                        )
                      ) : (
                        <span className="choice-indicator-dot" />
                      )}
                      <span>No</span>
                      <span className={`choice-badge ${noIsWin ? 'badge-is-win' : 'badge-is-loss'}`}>
                        {noIsWin ? 'Win' : 'Loss'}
                      </span>
                    </button>
                  </div>
                );
              })()}

              {/* Optional Reason / Note Input */}
              {showNoteField && (
                <div className="note-input-container animate-fade-in">
                  <label htmlFor={`note-${goal.id}`} className="note-label">
                    Optional Reason / Reflection:
                  </label>
                  <input
                    id={`note-${goal.id}`}
                    type="text"
                    className="glass-input note-input"
                    placeholder="e.g. Felt energized, ran out of time, resisted temptation..."
                    value={currentAnswer?.note || ''}
                    onChange={(e) => handleNoteChange(goal.id, e.target.value)}
                    maxLength={200}
                    disabled={isFuture}
                  />
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Save Audit Action Footer */}
      <div className="audit-footer-actions">
        <GlassButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={isFuture || isSaving || answeredCount === 0}
          onClick={handleSave}
          className="save-audit-btn"
        >
          <Save size={20} />
          <span>
            {isSaving
              ? 'Saving Audit...'
              : `Complete & Save Audit (${answeredCount}/${activeGoals.length})`}
          </span>
        </GlassButton>
      </div>

      {/* Reset Day Audit Confirmation Modal */}
      {showResetConfirm && (
        <Modal
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          title="Reset Audit for This Date?"
          maxWidth="460px"
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
              <RotateCcw size={24} color="var(--color-failure)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Clear all choices for {formatDisplayDate(currentDateKey)}?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.88rem', lineHeight: '1.45' }}>
              This will remove the recorded audit for this date, deselect all options, and recalculate streaks, calendar ratings, and win rates across Re-Life.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <GlassButton variant="secondary" onClick={() => setShowResetConfirm(false)} disabled={isResetting}>
                Cancel
              </GlassButton>
              <GlassButton variant="danger" onClick={handleResetDayAudit} disabled={isResetting}>
                {isResetting ? 'Resetting...' : 'Yes, Clear & Reset'}
              </GlassButton>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .daily-audit-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .audit-date-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          border: 1px solid var(--glass-border-hover);
        }

        .audit-date-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
        }

        .audit-date-text {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.15rem;
          color: var(--text-main);
          text-align: center;
        }

        .audit-badges-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .today-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--accent-primary);
          background: rgba(56, 189, 248, 0.15);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          letter-spacing: 0.05em;
        }

        .recorded-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--color-success);
          background: var(--color-success-bg);
          border: 1px solid var(--color-success-border);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          letter-spacing: 0.05em;
        }

        .locked-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--color-failure);
          background: var(--color-failure-bg);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        /* Score Summary Card */
        .audit-score-card {
          border: 1px solid var(--glass-border-hover);
          padding: 1.25rem 1.5rem;
        }

        .score-card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--glass-border-subtle);
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .score-status-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .score-top-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .jump-today-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 3px 10px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-primary);
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .jump-today-btn:hover {
          background: rgba(56, 189, 248, 0.22);
          border-color: var(--accent-primary);
          transform: translateY(-1px);
        }

        .clear-audit-top-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 3px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-failure);
          background: var(--color-failure-bg);
          border: 1px solid var(--color-failure-border);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .clear-audit-top-btn:hover {
          background: rgba(244, 63, 94, 0.2);
          transform: translateY(-1px);
        }

        .score-summary-flex {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .score-details-col {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          flex: 1;
        }

        .score-metric-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .score-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .score-number {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .rating-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .progress-bar-wrap {
          width: 100%;
          height: 8px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
          margin-top: 0.25rem;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Questions List */
        .audit-questions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .question-card {
          border: 1px solid var(--glass-border);
          transition: all var(--transition-fast);
        }

        .card-success-glow {
          border-color: var(--color-success-border);
          background: rgba(16, 185, 129, 0.04);
        }

        .card-fail-glow {
          border-color: var(--color-failure-border);
          background: rgba(244, 63, 94, 0.04);
        }

        .question-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .question-title-block {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .goal-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .goal-title-badge {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .dynamic-question-prompt {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
        }

        .note-toggle-btn {
          width: 36px;
          height: 36px;
          min-width: 36px;
          min-height: 36px;
        }

        .has-note-active {
          color: var(--accent-primary) !important;
          border-color: var(--accent-primary) !important;
          background: rgba(56, 189, 248, 0.15) !important;
        }

        /* Big Touch-Friendly Yes/No Controls */
        .audit-answer-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .audit-choice-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          min-height: 52px;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 1.05rem;
          border: 1px solid var(--glass-border);
          background: rgba(15, 23, 42, 0.5);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
          user-select: none;
        }

        .audit-choice-btn:hover:not(:disabled) {
          background: var(--glass-bg-hover);
          transform: translateY(-1px);
        }

        .selected-win {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(16, 185, 129, 0.2)) !important;
          border-color: var(--color-success) !important;
          color: #ffffff !important;
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.35) !important;
        }

        .selected-loss {
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.35), rgba(244, 63, 94, 0.2)) !important;
          border-color: var(--color-failure) !important;
          color: #ffffff !important;
          box-shadow: 0 0 16px rgba(244, 63, 94, 0.35) !important;
        }

        .choice-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          margin-left: 0.35rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .badge-is-win {
          background: rgba(16, 185, 129, 0.18);
          color: var(--color-success);
          border: 1px solid rgba(16, 185, 129, 0.35);
        }

        .badge-is-loss {
          background: rgba(244, 63, 94, 0.18);
          color: var(--color-failure);
          border: 1px solid rgba(244, 63, 94, 0.35);
        }

        .selected-win .badge-is-win {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.5);
        }

        .selected-loss .badge-is-loss {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.5);
        }

        .choice-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--text-dim);
        }

        .note-input-container {
          margin-top: 1rem;
          padding-top: 0.85rem;
          border-top: 1px solid var(--glass-border-subtle);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .note-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-dim);
        }

        .note-input {
          font-size: 0.88rem;
          padding: 0.55rem 0.85rem;
        }

        .audit-footer-actions {
          margin-top: 0.5rem;
        }

        .save-audit-btn {
          box-shadow: var(--shadow-lg);
        }

        @media (max-width: 640px) {
          .score-summary-flex {
            flex-direction: column;
            text-align: center;
            gap: 1.25rem;
          }
          .score-metric-row, .rating-row {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
