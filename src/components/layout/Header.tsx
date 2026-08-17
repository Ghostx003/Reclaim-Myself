import React from 'react';
import { Plus } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { formatDisplayDate, getTodayKey } from '../../services/date/dateService';

interface HeaderProps {
  userName?: string;
  onOpenGoalCreator: () => void;
  quickStat?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Friend',
  onOpenGoalCreator,
  quickStat,
}) => {
  const todayFormatted = formatDisplayDate(getTodayKey());

  return (
    <header className="app-header-container">
      <div className="header-text-block">
        <div className="header-date-badge">{todayFormatted}</div>
        <h1 className="header-greeting">
          Hello, <span className="greeting-name">{userName}</span>
        </h1>
      </div>

      <div className="header-actions">
        {quickStat}
        <GlassButton
          variant="primary"
          onClick={onOpenGoalCreator}
          size="md"
          className="header-create-btn"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>New Goal</span>
        </GlassButton>
      </div>

      <style>{`
        .app-header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .header-date-badge {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.2rem;
        }

        .header-greeting {
          margin: 0;
          font-weight: 800;
        }

        .greeting-name {
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        @media (max-width: 640px) {
          .app-header-container {
            margin-bottom: 1rem;
          }
          .header-create-btn span {
            display: inline;
          }
        }
      `}</style>
    </header>
  );
};
