import React, { useState } from 'react';
import { Navbar, AppView } from '../components/layout/Navbar';
import { Header } from '../components/layout/Header';
import { OnboardingView } from '../features/onboarding/OnboardingView';
import { CalendarView } from '../features/calendar/CalendarView';
import { DailyAuditView } from '../features/daily-audit/DailyAuditView';
import { RealLifeView } from '../features/real-life/RealLifeView';
import { GoalDetailView } from '../features/goal-detail/GoalDetailView';
import { SettingsView } from '../features/settings/SettingsView';
import { GoalEditorModal } from '../features/goals/GoalEditorModal';
import { CounterManagerModal } from '../features/counters/CounterManagerModal';
import { useProfile } from '../hooks/useProfile';
import { useGoals } from '../hooks/useGoals';
import { useAudits } from '../hooks/useAudits';
import { useCounters } from '../hooks/useCounters';
import { useMilestones } from '../hooks/useMilestones';
import { useToast } from '../components/feedback/ToastContext';
import { db } from '../db/database';
import { Goal, GoalPolarity, UserPreferences, AppExportData } from '../types';
import { getTodayKey } from '../services/date/dateService';

export const App: React.FC = () => {
  const { showToast } = useToast();
  const { profile, isOnboarded, saveName, updatePreferences, clearProfile } = useProfile();
  const { goals, createGoal, updateGoal, deleteGoal } = useGoals(false);
  const { audits, saveAudit } = useAudits();
  const { counters, counterEvents, createCounter, updateDelta, deleteCounter } = useCounters();
  const { milestones, awards } = useMilestones();

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('calendar');
  const [selectedAuditDate, setSelectedAuditDate] = useState<string>(getTodayKey());
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [counterGoalId, setCounterGoalId] = useState<string | undefined>(undefined);

  // If user is not yet onboarded, show the Onboarding flow
  if (!isOnboarded) {
    return (
      <OnboardingView
        onComplete={async (name: string) => {
          await saveName(name);
        }}
      />
    );
  }

  const handleOpenGoalCreator = () => {
    setGoalToEdit(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (data: {
    title: string;
    description?: string;
    polarity: GoalPolarity;
    color?: string;
    category?: string;
    targetStreak?: number;
  }) => {
    if (goalToEdit) {
      await updateGoal(goalToEdit.id, data);
      showToast('success', 'Goal Updated', `"${data.title}" configuration saved.`);
    } else {
      await createGoal(data);
      showToast('success', 'Goal Created', `"${data.title}" is ready for daily audits.`);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
    showToast('info', 'Goal Removed', 'Goal was removed from active audits.');
    if (selectedGoalId === id) {
      setSelectedGoalId(null);
      setCurrentView('reallife');
    }
  };

  const handleOpenCounterCreator = (targetGoalId?: string) => {
    setCounterGoalId(targetGoalId);
    setIsCounterModalOpen(true);
  };

  const handleSaveCounter = async (data: {
    goalId?: string;
    name: string;
    unit: string;
    incrementValue: number;
    initialValue?: number;
  }) => {
    await createCounter(data);
    showToast('success', 'Counter Created', `Tracking "${data.name}" in ${data.unit}.`);
  };

  const handleUpdateCounterDelta = async (counterId: string, delta: number) => {
    await updateDelta(counterId, delta);
  };

  const handleSelectDateToAudit = (dateKey: string) => {
    setSelectedAuditDate(dateKey);
    setCurrentView('audit');
  };

  const handleSelectGoalDetail = (goalId: string) => {
    setSelectedGoalId(goalId);
    setCurrentView('goaldetail');
  };

  const handleImportData = async (
    data: AppExportData | undefined,
    mode: 'replace' | 'merge'
  ) => {
    if (!data) return;

    if (mode === 'replace') {
      await db.transaction(
        'rw',
        [db.users, db.goals, db.audits, db.counters, db.counterEvents, db.milestones, db.awards],
        async () => {
          await db.users.clear();
          await db.goals.clear();
          await db.audits.clear();
          await db.counters.clear();
          await db.counterEvents.clear();
          await db.milestones.clear();
          await db.awards.clear();

          if (data.profile) await db.users.put(data.profile);
          if (data.goals?.length) await db.goals.bulkPut(data.goals);
          if (data.audits?.length) await db.audits.bulkPut(data.audits);
          if (data.counters?.length) await db.counters.bulkPut(data.counters);
          if (data.counterEvents?.length) await db.counterEvents.bulkPut(data.counterEvents);
          if (data.milestones?.length) await db.milestones.bulkPut(data.milestones);
          if (data.awards?.length) await db.awards.bulkPut(data.awards);
        }
      );
    } else {
      // Merge mode
      await db.transaction(
        'rw',
        [db.users, db.goals, db.audits, db.counters, db.counterEvents, db.milestones, db.awards],
        async () => {
          if (data.profile) await db.users.put(data.profile);
          if (data.goals?.length) await db.goals.bulkPut(data.goals);
          if (data.audits?.length) await db.audits.bulkPut(data.audits);
          if (data.counters?.length) await db.counters.bulkPut(data.counters);
          if (data.counterEvents?.length) await db.counterEvents.bulkPut(data.counterEvents);
          if (data.milestones?.length) await db.milestones.bulkPut(data.milestones);
          if (data.awards?.length) await db.awards.bulkPut(data.awards);
        }
      );
    }
  };

  const handleClearAllData = async () => {
    await db.transaction(
      'rw',
      [db.users, db.goals, db.audits, db.counters, db.counterEvents, db.milestones, db.awards],
      async () => {
        await db.users.clear();
        await db.goals.clear();
        await db.audits.clear();
        await db.counters.clear();
        await db.counterEvents.clear();
        await db.milestones.clear();
        await db.awards.clear();
      }
    );
    await clearProfile();
  };

  const selectedGoal = goals.find((g) => g.id === selectedGoalId) || null;
  const userPrefs: UserPreferences = profile?.preferences || {
    theme: 'midnight',
    starThresholds: { gold: 0.85, silver: 0.5, bronze: 0.0 },
    confettiThreshold: 0.85,
    reducedMotion: false,
  };

  return (
    <div className="app-container">
      {/* Top / Bottom Glass Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
        }}
        onOpenGoalCreator={handleOpenGoalCreator}
      />

      <main className="main-content">
        {/* Header (Greeting & Quick Actions) */}
        <Header
          userName={profile?.name}
          onOpenGoalCreator={handleOpenGoalCreator}
        />

        {/* View Routing */}
        {currentView === 'calendar' && (
          <CalendarView
            goals={goals}
            audits={audits}
            onSelectDateToAudit={handleSelectDateToAudit}
            onOpenGoalCreator={handleOpenGoalCreator}
          />
        )}

        {currentView === 'audit' && (
          <DailyAuditView
            initialDateKey={selectedAuditDate}
            goals={goals}
            audits={audits}
            preferences={userPrefs}
            onSaveAudit={async (date, answers) => {
              await saveAudit(date, answers, userPrefs);
            }}
            onOpenGoalCreator={handleOpenGoalCreator}
          />
        )}

        {currentView === 'reallife' && (
          <RealLifeView
            goals={goals}
            audits={audits}
            counters={counters}
            counterEvents={counterEvents}
            awards={awards}
            milestones={milestones}
            onSelectGoal={handleSelectGoalDetail}
            onOpenGoalCreator={handleOpenGoalCreator}
            onOpenCounterCreator={() => handleOpenCounterCreator()}
            onUpdateCounterDelta={handleUpdateCounterDelta}
            onDeleteCounter={deleteCounter}
          />
        )}

        {currentView === 'goaldetail' && selectedGoal && (
          <GoalDetailView
            goal={selectedGoal}
            audits={audits}
            counters={counters.filter((c) => c.goalId === selectedGoal.id)}
            onBack={() => setCurrentView('reallife')}
            onEditGoal={handleEditGoal}
            onOpenCounterCreator={(gId) => handleOpenCounterCreator(gId)}
            onUpdateCounterDelta={handleUpdateCounterDelta}
            onDeleteCounter={deleteCounter}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            profile={profile}
            goals={goals}
            audits={audits}
            counters={counters}
            counterEvents={counterEvents}
            milestones={milestones}
            awards={awards}
            onUpdateProfileName={async (name) => {
              return await saveName(name);
            }}
            onUpdatePreferences={async (prefs) => {
              return await updatePreferences(prefs);
            }}
            onOpenGoalCreator={handleOpenGoalCreator}
            onEditGoal={handleEditGoal}
            onImportData={handleImportData}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Goal Creation / Edit Modal */}
      <GoalEditorModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
      />

      {/* Counter Manager Modal */}
      <CounterManagerModal
        isOpen={isCounterModalOpen}
        onClose={() => setIsCounterModalOpen(false)}
        associatedGoalId={counterGoalId}
        goals={goals}
        onSave={handleSaveCounter}
      />
    </div>
  );
};
