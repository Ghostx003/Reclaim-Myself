import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { GlassButton } from '../../components/ui/GlassButton';
import { Goal } from '../../types';

interface CounterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  associatedGoalId?: string;
  goals: Goal[];
  onSave: (data: {
    goalId?: string;
    name: string;
    unit: string;
    incrementValue: number;
    initialValue?: number;
  }) => Promise<void>;
}

export const CounterManagerModal: React.FC<CounterManagerModalProps> = ({
  isOpen,
  onClose,
  associatedGoalId,
  goals,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [incrementValue, setIncrementValue] = useState<number>(1);
  const [initialValue, setInitialValue] = useState<number>(0);
  const [goalId, setGoalId] = useState<string>(associatedGoalId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName('');
    setUnit('');
    setIncrementValue(1);
    setInitialValue(0);
    setGoalId(associatedGoalId || '');
  }, [isOpen, associatedGoalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unit.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        unit: unit.trim(),
        incrementValue: Number(incrementValue) || 1,
        initialValue: Number(initialValue) || 0,
        goalId: goalId.trim() ? goalId : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Custom Quantity Counter" maxWidth="500px">
      <form onSubmit={handleSubmit} className="counter-form">
        <div className="form-group">
          <label className="form-label" htmlFor="counter-name">
            Counter Name <span className="req-star">*</span>
          </label>
          <input
            id="counter-name"
            type="text"
            className="glass-input"
            placeholder="e.g. Pages Read, Dollars Saved, Pushups, Deep Work Mins..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="counter-unit">
              Unit Label <span className="req-star">*</span>
            </label>
            <input
              id="counter-unit"
              type="text"
              className="glass-input"
              placeholder="e.g. pages, $, mins, reps, cups..."
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              maxLength={20}
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="counter-inc">
              Default Increment [ + / - ]
            </label>
            <input
              id="counter-inc"
              type="number"
              min={1}
              max={100000}
              className="glass-input"
              value={incrementValue}
              onChange={(e) => setIncrementValue(Math.max(1, parseInt(e.target.value) || 1))}
              onFocus={(e) => e.target.select()}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="counter-goal">
            Associated Goal (Optional)
          </label>
          <select
            id="counter-goal"
            className="glass-input"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
          >
            <option value="">-- Standalone (General Counter) --</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="counter-init">
            Starting Value
          </label>
          <input
            id="counter-init"
            type="number"
            className="glass-input"
            value={initialValue}
            onChange={(e) => setInitialValue(parseInt(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
          />
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <GlassButton type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            disabled={!name.trim() || !unit.trim() || isSubmitting}
          >
            Create Counter
          </GlassButton>
        </div>
      </form>

      <style>{`
        .counter-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
      `}</style>
    </Modal>
  );
};
