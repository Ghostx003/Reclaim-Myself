import React from 'react';
import { Calendar, CheckSquare, Sparkles, Settings } from 'lucide-react';

export type AppView = 'calendar' | 'audit' | 'reallife' | 'settings' | 'goaldetail';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenGoalCreator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'calendar' as AppView, label: 'Calendar', icon: Calendar },
    { id: 'audit' as AppView, label: 'Daily Audit', icon: CheckSquare },
    { id: 'reallife' as AppView, label: 'Real Life', icon: Sparkles },
    { id: 'settings' as AppView, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Top Glass Navigation */}
      <header className="desktop-navbar">
        <div className="desktop-navbar-inner glass-panel">
          <div
            className="navbar-brand"
            onClick={() => onNavigate('calendar')}
            role="button"
            tabIndex={0}
          >
            <div className="brand-logo-ring">
              <Sparkles size={18} color="#38bdf8" />
            </div>
            <span className="brand-title">Reclaim Myself</span>
          </div>

          <nav className="desktop-nav-links" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'reallife' && currentView === 'goaldetail');
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`nav-link-btn ${isActive ? 'nav-link-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Glass Navigation Bar (Android & iOS) */}
      <nav className="mobile-bottom-nav glass-panel" aria-label="Mobile Bottom Navigation">
        <div className="mobile-bottom-nav-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'reallife' && currentView === 'goaldetail');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`mobile-nav-btn ${isActive ? 'mobile-nav-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="mobile-nav-icon-wrap">
                  <Icon size={20} />
                </div>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <style>{`
        .desktop-navbar {
          position: fixed;
          top: 1rem;
          left: 0;
          right: 0;
          z-index: 500;
          display: none;
          justify-content: center;
          padding: 0 1.5rem;
        }

        .desktop-navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1100px;
          height: 60px;
          padding: 0 1.5rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--glass-border-hover);
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          cursor: pointer;
          user-select: none;
        }

        .brand-logo-ring {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.15rem;
          background: linear-gradient(135deg, #f8fafc, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .desktop-nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          min-height: 40px;
          padding: 0.45rem 1rem;
          border-radius: var(--radius-full);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          transition: all var(--transition-fast);
        }

        .nav-link-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.06);
        }

        .nav-link-btn.nav-link-active {
          color: #ffffff;
          background: rgba(56, 189, 248, 0.18);
          border: 1px solid rgba(56, 189, 248, 0.35);
        }

        /* Mobile Bottom Nav */
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0.75rem;
          left: 0.75rem;
          right: 0.75rem;
          z-index: 500;
          display: flex;
          align-items: center;
          height: var(--nav-height-mobile);
          border-radius: var(--radius-xl);
          padding: 0 0.5rem;
          border: 1px solid var(--glass-border-hover);
          box-shadow: var(--shadow-glass);
        }

        .mobile-bottom-nav-inner {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-around;
        }

        .mobile-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          min-height: var(--touch-target-min);
          padding: 0.35rem 0.5rem;
          color: var(--text-dim);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .mobile-nav-btn.mobile-nav-active {
          color: var(--accent-primary);
        }

        .mobile-nav-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24px;
        }

        .mobile-nav-label {
          font-size: 0.7rem;
          font-weight: 600;
          margin-top: 3px;
        }

        @media (min-width: 1025px) {
          .desktop-navbar {
            display: flex;
          }
          .mobile-bottom-nav {
            display: none;
          }
        }
      `}</style>
    </>
  );
};
