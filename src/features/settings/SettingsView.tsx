import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  User,
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  Edit,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { PolarityBadge } from '../../components/ui/PolarityBadge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/feedback/ToastContext';
import {
  createExportBundle,
  validateImportJson,
  ImportValidationResult,
} from '../../services/importExport/importExportService';
import {
  Award,
  CustomCounter,
  CounterEvent,
  DailyAudit,
  Goal,
  Milestone,
  UserProfile,
  UserPreferences,
} from '../../types';

interface SettingsViewProps {
  profile: UserProfile | null;
  goals: Goal[];
  audits: DailyAudit[];
  counters: CustomCounter[];
  counterEvents: CounterEvent[];
  milestones: Milestone[];
  awards: Award[];
  onUpdateProfileName: (name: string) => Promise<UserProfile>;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => Promise<UserProfile | null>;
  onOpenGoalCreator: () => void;
  onEditGoal: (goal: Goal) => void;
  onImportData: (data: ImportValidationResult['sanitizedData'], mode: 'replace' | 'merge') => Promise<void>;
  onClearAllData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  goals,
  audits,
  counters,
  counterEvents,
  milestones,
  awards,
  onUpdateProfileName,
  onUpdatePreferences,
  onOpenGoalCreator,
  onEditGoal,
  onImportData,
  onClearAllData,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile edit state
  const [nameInput, setNameInput] = useState(profile?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Preferences state
  const [goldThreshold, setGoldThreshold] = useState<number>(
    Math.round((profile?.preferences.starThresholds.gold || 0.85) * 100)
  );
  const [silverThreshold, setSilverThreshold] = useState<number>(
    Math.round((profile?.preferences.starThresholds.silver || 0.5) * 100)
  );
  const [confettiThreshold, setConfettiThreshold] = useState<number>(
    Math.round((profile?.preferences.confettiThreshold || 0.85) * 100)
  );
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    Boolean(profile?.preferences.reducedMotion)
  );

  // Import modal state
  const [importValidation, setImportValidation] = useState<ImportValidationResult | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [isImporting, setIsImporting] = useState(false);

  // Danger zone reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    try {
      await onUpdateProfileName(nameInput.trim());
      showToast('success', 'Profile Updated', 'Name saved successfully.');
    } catch {
      showToast('error', 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await onUpdatePreferences({
        starThresholds: {
          gold: goldThreshold / 100,
          silver: silverThreshold / 100,
          bronze: 0,
        },
        confettiThreshold: confettiThreshold / 100,
        reducedMotion,
      });
      showToast('success', 'Preferences Saved', 'Scoring and visual thresholds updated.');
    } catch {
      showToast('error', 'Failed to save preferences');
    }
  };

  const handleExport = () => {
    try {
      const bundle = createExportBundle({
        profile,
        goals,
        audits,
        counters,
        counterEvents,
        milestones,
        awards,
      });

      const jsonStr = JSON.stringify(bundle, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().substring(0, 10);
      link.href = url;
      link.download = `reclaim-myself-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('success', 'Backup Exported', 'Full JSON backup downloaded successfully.');
    } catch {
      showToast('error', 'Export Failed', 'Could not generate backup file.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const validation = validateImportJson(content);
      setImportValidation(validation);
      setShowImportModal(true);
    };
    reader.readAsText(file);

    // reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecuteImport = async () => {
    if (!importValidation || !importValidation.isValid || !importValidation.sanitizedData) return;

    setIsImporting(true);
    try {
      await onImportData(importValidation.sanitizedData, importMode);
      setShowImportModal(false);
      setImportValidation(null);
      showToast('success', 'Import Successful', 'Database restored and synchronized.');
    } catch {
      showToast('error', 'Import Failed', 'An error occurred while restoring data.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);
    try {
      await onClearAllData();
      setShowResetModal(false);
      showToast('info', 'Database Reset', 'All local data was cleared.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="settings-view-container animate-fade-in">
      <div className="settings-header">
        <h2>Application Settings & Data Control</h2>
        <p>Manage your habits, fine-tune scoring thresholds, and export/import your offline database.</p>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <GlassCard className="settings-section-card">
          <div className="card-section-title">
            <User size={20} color="var(--accent-primary)" />
            <h3>Your Profile</h3>
          </div>

          <form onSubmit={handleSaveName} className="profile-form">
            <div className="form-group">
              <label className="form-label" htmlFor="user-name">
                Display Name
              </label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  id="user-name"
                  type="text"
                  className="glass-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={50}
                  required
                />
                <GlassButton type="submit" variant="primary" disabled={isSavingName}>
                  Save
                </GlassButton>
              </div>
            </div>
          </form>
        </GlassCard>

        {/* Data Ownership: Export / Import */}
        <GlassCard className="settings-section-card">
          <div className="card-section-title">
            <Download size={20} color="var(--accent-primary)" />
            <h3>User Data Ownership & Backup</h3>
          </div>
          <p style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            All your data is stored directly in your browser's IndexedDB. Create portable JSON backups or restore previous data at any time.
          </p>

          <div className="backup-buttons-row">
            <GlassButton variant="primary" onClick={handleExport} className="backup-btn">
              <Download size={18} />
              <span>Export Full JSON Backup</span>
            </GlassButton>

            <GlassButton
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="backup-btn"
            >
              <Upload size={18} />
              <span>Import Data Backup</span>
            </GlassButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </div>
        </GlassCard>

        {/* Manage Goals */}
        <GlassCard className="settings-section-card full-span-card">
          <div className="card-section-title-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={20} color="var(--accent-primary)" />
              <h3>Manage Goals ({goals.length})</h3>
            </div>
            <GlassButton variant="primary" size="sm" onClick={onOpenGoalCreator}>
              <Plus size={16} />
              <span>Create New Goal</span>
            </GlassButton>
          </div>

          <div className="settings-goals-list">
            {goals.length === 0 ? (
              <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem' }}>
                No goals defined yet. Click "Create New Goal" to start.
              </p>
            ) : (
              goals.map((g) => (
                <div key={g.id} className="goal-row-item">
                  <div className="goal-info-left">
                    <span className="goal-color-bar" style={{ backgroundColor: g.color || 'var(--accent-primary)' }} />
                    <div>
                      <div className="goal-item-title">{g.title}</div>
                      <div className="goal-item-sub">
                        Target: {g.targetStreak || 21} days | {g.category || 'General'}
                      </div>
                    </div>
                  </div>

                  <div className="goal-actions-right">
                    <PolarityBadge polarity={g.polarity} size="sm" />
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
                      onClick={() => onEditGoal(g)}
                      title="Edit Goal"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* Preferences & Thresholds */}
        <GlassCard className="settings-section-card full-span-card">
          <div className="card-section-title">
            <Sparkles size={20} color="var(--accent-primary)" />
            <h3>Configurable Scoring & Visual Thresholds</h3>
          </div>

          <div className="thresholds-form-grid">
            <div className="threshold-item">
              <label className="form-label">
                Gold Star Threshold ({goldThreshold}%)
              </label>
              <input
                type="range"
                min={50}
                max={100}
                value={goldThreshold}
                onChange={(e) => setGoldThreshold(Number(e.target.value))}
                className="range-slider"
              />
              <span className="form-hint">Daily score percentage needed for Gold Star grade.</span>
            </div>

            <div className="threshold-item">
              <label className="form-label">
                Silver Star Threshold ({silverThreshold}%)
              </label>
              <input
                type="range"
                min={20}
                max={80}
                value={silverThreshold}
                onChange={(e) => setSilverThreshold(Number(e.target.value))}
                className="range-slider"
              />
              <span className="form-hint">Daily score percentage needed for Silver Star grade.</span>
            </div>

            <div className="threshold-item">
              <label className="form-label">
                Celebration Confetti Threshold ({confettiThreshold}%)
              </label>
              <input
                type="range"
                min={50}
                max={100}
                value={confettiThreshold}
                onChange={(e) => setConfettiThreshold(Number(e.target.value))}
                className="range-slider"
              />
              <span className="form-hint">Score needed to trigger dual-side celebratory confetti.</span>
            </div>

            <div className="threshold-item">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                />
                <span>Enable Reduced Motion</span>
              </label>
              <span className="form-hint">Simplifies animations and transitions across the interface.</span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <GlassButton variant="primary" onClick={handleSavePreferences}>
              Save Thresholds
            </GlassButton>
          </div>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard className="settings-section-card danger-zone-card full-span-card">
          <div className="card-section-title">
            <ShieldAlert size={20} color="var(--color-failure)" />
            <h3 style={{ color: 'var(--color-failure)' }}>Danger Zone</h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Reset your database or clear all local habit records. Make sure to download a backup first.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <GlassButton variant="danger" size="md" onClick={() => setShowResetModal(true)}>
              <RotateCcw size={16} />
              <span>Reset All Application Data</span>
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* Import Confirmation & Validation Modal */}
      {importValidation && (
        <Modal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportValidation(null);
          }}
          title="Import Data Backup Preview"
          maxWidth="560px"
        >
          <div className="import-modal-content">
            {importValidation.isValid ? (
              <>
                <div className="import-valid-banner">
                  <CheckCircle2 size={22} color="var(--color-success)" />
                  <div>
                    <strong>Valid Backup File</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Ready to restore into your local IndexedDB.
                    </div>
                  </div>
                </div>

                <div className="import-summary-box">
                  <div className="summary-title">Backup Contents:</div>
                  <div className="summary-grid">
                    <div>Goals: <strong>{importValidation.summary.goalsCount}</strong></div>
                    <div>Audits: <strong>{importValidation.summary.auditsCount}</strong></div>
                    <div>Counters: <strong>{importValidation.summary.countersCount}</strong></div>
                    <div>Awards: <strong>{importValidation.summary.awardsCount}</strong></div>
                  </div>
                </div>

                {importValidation.warnings.length > 0 && (
                  <div className="import-warnings-box">
                    <div style={{ fontWeight: 700, color: 'var(--star-gold)' }}>Warnings:</div>
                    <ul>
                      {importValidation.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="import-mode-selector">
                  <label className="form-label">Import Strategy:</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className={`mode-btn ${importMode === 'replace' ? 'mode-active' : ''}`}
                      onClick={() => setImportMode('replace')}
                    >
                      <strong>Replace Existing Data</strong>
                      <span>Wipes current local database and replaces it with backup.</span>
                    </button>
                    <button
                      type="button"
                      className={`mode-btn ${importMode === 'merge' ? 'mode-active' : ''}`}
                      onClick={() => setImportMode('merge')}
                    >
                      <strong>Merge with Existing</strong>
                      <span>Combines backup records with your existing data.</span>
                    </button>
                  </div>
                </div>

                <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <GlassButton variant="secondary" onClick={() => setShowImportModal(false)}>
                    Cancel
                  </GlassButton>
                  <GlassButton variant="primary" onClick={handleExecuteImport} disabled={isImporting}>
                    {isImporting ? 'Restoring...' : 'Confirm & Restore'}
                  </GlassButton>
                </div>
              </>
            ) : (
              <div className="import-error-banner">
                <AlertTriangle size={24} color="var(--color-failure)" />
                <div>
                  <strong>Import Validation Failed</strong>
                  <ul style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    {importValidation.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Clear / Reset All Data Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Local Data?"
        maxWidth="460px"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-failure-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Trash2 size={28} color="var(--color-failure)" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Are you absolutely sure?</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            This will permanently delete all your goals, daily audit history, streaks, counters, and awards from this browser. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <GlassButton variant="secondary" onClick={() => setShowResetModal(false)} disabled={isResetting}>
              Cancel
            </GlassButton>
            <GlassButton variant="danger" onClick={handleExecuteReset} disabled={isResetting}>
              {isResetting ? 'Resetting...' : 'Yes, Delete Everything'}
            </GlassButton>
          </div>
        </div>
      </Modal>

      <style>{`
        .settings-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        .settings-section-card {
          padding: 1.5rem;
        }

        .full-span-card {
          grid-column: 1 / -1;
        }

        .card-section-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }

        .card-section-title-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .backup-buttons-row {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .settings-goals-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .goal-row-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          background: rgba(15, 23, 42, 0.45);
          border: 1px solid var(--glass-border);
        }

        .goal-info-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .goal-color-bar {
          width: 4px;
          height: 36px;
          border-radius: var(--radius-full);
        }

        .goal-item-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .goal-item-sub {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .goal-actions-right {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .thresholds-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }

        .threshold-item {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .range-slider {
          accent-color: var(--accent-primary);
          height: 6px;
          cursor: pointer;
        }

        .danger-zone-card {
          border: 1px solid var(--color-failure-border);
          background: rgba(244, 63, 94, 0.03);
        }

        /* Import Modal */
        .import-modal-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .import-valid-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem;
          background: var(--color-success-bg);
          border: 1px solid var(--color-success-border);
          border-radius: var(--radius-md);
        }

        .import-error-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.85rem;
          background: var(--color-failure-bg);
          border: 1px solid var(--color-failure-border);
          border-radius: var(--radius-md);
        }

        .import-summary-box {
          padding: 0.85rem;
          background: rgba(15, 23, 42, 0.5);
          border-radius: var(--radius-md);
        }

        .summary-title {
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 0.4rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .import-warnings-box {
          padding: 0.75rem;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
        }

        .mode-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.85rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          background: rgba(15, 23, 42, 0.4);
          text-align: left;
          color: var(--text-main);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .mode-btn span {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .mode-active {
          border-color: var(--accent-primary);
          background: rgba(56, 189, 248, 0.12);
        }
      `}</style>
    </div>
  );
};
