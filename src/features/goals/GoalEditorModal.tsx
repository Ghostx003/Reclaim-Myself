import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { GlassButton } from '../../components/ui/GlassButton';
import { Goal, GoalPolarity } from '../../types';
import { DEFAULT_PALETTES } from '../../constants';

interface GoalEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
  onSave: (data: {
    title: string;
    description?: string;
    polarity: GoalPolarity;
    color?: string;
    category?: string;
    targetStreak?: number;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const GoalEditorModal: React.FC<GoalEditorModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [polarity, setPolarity] = useState<GoalPolarity>('positive');
  const [color, setColor] = useState(DEFAULT_PALETTES[0]);
  const [category, setCategory] = useState('');
  const [targetStreak, setTargetStreak] = useState<number>(21);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setPolarity(goalToEdit.polarity);
      setColor(goalToEdit.color || DEFAULT_PALETTES[0]);
      setCategory(goalToEdit.category || '');
      setTargetStreak(goalToEdit.targetStreak || 21);
    } else {
      setTitle('');
      setDescription('');
      setPolarity('positive');
      setColor(DEFAULT_PALETTES[Math.floor(Math.random() * DEFAULT_PALETTES.length)]);
      setCategory('');
      setTargetStreak(21);
    }
    setShowDeleteConfirm(false);
  }, [goalToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        polarity,
        color,
        category: category.trim() || undefined,
        targetStreak: Number(targetStreak) || 21,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!goalToEdit || !onDelete || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onDelete(goalToEdit.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Goal Configuration' : 'Create New Goal'}
      maxWidth="560px"
    >
      {showDeleteConfirm ? (
        <div className="delete-confirm-box animate-pop-in">
          <div className="delete-warning-icon">
            <Trash2 size={28} color="var(--color-failure)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            Delete "{goalToEdit?.title}"?
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            This goal will be removed from your active daily audit. Note that past audit records and earned awards remain in your permanent history.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <GlassButton
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="danger"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Confirm Deletion
            </GlassButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="goal-editor-form">
          {/* Goal Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="goal-title">
              Goal Title <span className="req-star">*</span>
            </label>
            <input
              id="goal-title"
              type="text"
              className="glass-input"
              placeholder="e.g. Read 20 pages, No sugar, Morning run..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
              autoFocus={!goalToEdit}
            />
          </div>

          {/* Goal Polarity / Direction */}
          <div className="form-group">
            <label className="form-label">
              Goal Polarity / Direction <span className="req-star">*</span>
            </label>
            <p className="form-hint">
              Choose whether answering <strong>Yes</strong> or <strong>No</strong> during daily audit represents success.
            </p>
            <div className="polarity-selector">
              <div
                className={`polarity-option ${polarity === 'positive' ? 'active-positive' : ''}`}
                onClick={() => setPolarity('positive')}
                role="radio"
                aria-checked={polarity === 'positive'}
                tabIndex={0}
              >
                <div className={`radio-dot ${polarity === 'positive' ? 'radio-dot-positive' : ''}`}>
                  {polarity === 'positive' && <div className="dot-inner-positive" />}
                </div>
                <div className="polarity-text">
                  <div className="polarity-title">Positive Habit</div>
                  <div className="polarity-sub">Yes = Success (1 pt)</div>
                </div>
              </div>

              <div
                className={`polarity-option ${polarity === 'negative' ? 'active-negative' : ''}`}
                onClick={() => setPolarity('negative')}
                role="radio"
                aria-checked={polarity === 'negative'}
                tabIndex={0}
              >
                <div className={`radio-dot ${polarity === 'negative' ? 'radio-dot-negative' : ''}`}>
                  {polarity === 'negative' && <div className="dot-inner-negative" />}
                </div>
                <div className="polarity-text">
                  <div className="polarity-title">Negative Habit / Avoid</div>
                  <div className="polarity-sub">No = Success (1 pt)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Target Streak & Category */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="goal-target">
                Target Streak (Days)
              </label>
              <input
                id="goal-target"
                type="number"
                min={1}
                max={3650}
                className="glass-input"
                value={targetStreak}
                onChange={(e) => setTargetStreak(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="form-group" style={{ flex: 1.5 }}>
              <label className="form-label" htmlFor="goal-category">
                Category (Optional)
              </label>
              <input
                id="goal-category"
                type="text"
                className="glass-input"
                placeholder="e.g. Mind, Body, Craft..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={40}
              />
            </div>
          </div>

          {/* Color Accent */}
          <div className="form-group">
            <label className="form-label">Color Accent</label>
            <div className="palette-grid">
              {DEFAULT_PALETTES.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color-swatch ${color === c ? 'swatch-active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Description / Personal Why */}
          <div className="form-group">
            <label className="form-label" htmlFor="goal-desc">
              Personal "Why" / Description (Optional)
            </label>
            <textarea
              id="goal-desc"
              className="glass-input"
              rows={2}
              placeholder="Why is this goal vital for you? Notes or execution rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            {goalToEdit && onDelete && (
              <GlassButton
                type="button"
                variant="danger"
                size="md"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </GlassButton>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
              <GlassButton
                type="button"
                variant="secondary"
                size="md"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                size="md"
                disabled={!title.trim() || isSubmitting}
              >
                {goalToEdit ? 'Save Changes' : 'Create Goal'}
              </GlassButton>
            </div>
          </div>
        </form>
      )}

      <style>{`
        .goal-editor-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .form-label {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .req-star {
          color: var(--color-failure);
        }

        .form-hint {
          font-size: 0.8rem;
          color: var(--text-dim);
          line-height: 1.4;
          margin-bottom: 0.3rem;
        }

        .polarity-selector {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .polarity-option {
          flex: 1;
          min-width: 180px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          background: rgba(15, 23, 42, 0.45);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .radio-dot {
          width: 20px;
          height: 20px;
          border-radius: var(--radius-full);
          border: 2px solid var(--text-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .radio-dot-positive {
          border-color: var(--color-success);
        }

        .radio-dot-negative {
          border-color: var(--color-failure);
        }

        .dot-inner-positive {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
          background: var(--color-success);
        }

        .dot-inner-negative {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
          background: var(--color-failure);
        }

        .polarity-text {
          display: flex;
          flex-direction: column;
        }

        .polarity-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .polarity-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .palette-grid {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .color-swatch {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          border: 2px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .color-swatch:hover {
          transform: scale(1.15);
        }

        .swatch-active {
          border-color: #ffffff;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
          transform: scale(1.15);
        }

        .form-actions {
          display: flex;
          align-items: center;
          padding-top: 0.5rem;
          border-top: 1px solid var(--glass-border);
          margin-top: 0.5rem;
        }

        .delete-confirm-box {
          text-align: center;
          padding: 1.5rem 0.5rem;
        }

        .delete-warning-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background: var(--color-failure-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        @media (max-width: 640px) {
          .form-row {
            flex-direction: column;
          }
          .polarity-selector {
            flex-direction: column;
          }
        }
      `}</style>
    </Modal>
  );
};
