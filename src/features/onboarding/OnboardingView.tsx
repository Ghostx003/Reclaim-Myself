import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Heart } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';

interface OnboardingViewProps {
  onComplete: (name: string) => Promise<void>;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'prompt' | 'greeting'>('prompt');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    await onComplete(trimmed);
    setStep('greeting');

    // Smooth transition to the calendar after greeting
    setTimeout(() => {
      // The parent App component reactively updates when profile is saved
    }, 1500);
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-container">
        {step === 'prompt' ? (
          <GlassCard className="onboarding-card animate-pop-in">
            <div className="onboarding-badge">
              <Sparkles size={20} color="#38bdf8" />
              <span>Offline-First Personal Operating System</span>
            </div>

            <h1 className="onboarding-title">
              Reclaim <span className="title-gradient">Myself</span>
            </h1>

            <p className="onboarding-subtitle">
              A private, distraction-free space to build empowering habits, conduct honest daily audits, and track your streaks. 100% stored on your device.
            </p>

            <form onSubmit={handleSubmit} className="onboarding-form">
              <label htmlFor="user-name-input" className="onboarding-label">
                What should we call you?
              </label>
              <div className="input-group">
                <input
                  id="user-name-input"
                  type="text"
                  className="glass-input onboarding-input"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                  maxLength={50}
                />
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!name.trim() || isSubmitting}
                className="onboarding-submit-btn"
              >
                <span>Begin Your Journey</span>
                <ArrowRight size={18} />
              </GlassButton>
            </form>

            <div className="onboarding-pillars">
              <div className="pillar-item">
                <ShieldCheck size={16} color="var(--color-success)" />
                <span>100% Local & Offline</span>
              </div>
              <div className="pillar-item">
                <Zap size={16} color="var(--accent-primary)" />
                <span>Zero Hardcoded Goals</span>
              </div>
              <div className="pillar-item">
                <Heart size={16} color="var(--star-gold)" />
                <span>Your Data Stays Yours</span>
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="onboarding-card animate-pop-in greeting-card">
            <div className="greeting-sparkle-ring">
              <Sparkles size={36} color="#38bdf8" />
            </div>
            <div className="greeting-subtitle">Welcome to your sanctuary,</div>
            <h1 className="greeting-name-huge">{name}</h1>
            <p className="greeting-text">
              Initializing your personal habit vault and daily calendar...
            </p>
          </GlassCard>
        )}
      </div>

      <style>{`
        .onboarding-screen {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .onboarding-container {
          width: 100%;
          max-width: 520px;
        }

        .onboarding-card {
          padding: 2.5rem 2rem;
          text-align: center;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--glass-border-hover);
        }

        .onboarding-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent-primary);
          margin-bottom: 1.5rem;
        }

        .onboarding-title {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
        }

        .title-gradient {
          background: linear-gradient(135deg, #38bdf8, #818cf8, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .onboarding-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .onboarding-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: left;
        }

        .onboarding-label {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .onboarding-input {
          font-size: 1.05rem;
          padding: 0.85rem 1.15rem;
        }

        .onboarding-submit-btn {
          margin-top: 0.5rem;
        }

        .onboarding-pillars {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--glass-border);
          flex-wrap: wrap;
        }

        .pillar-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-dim);
          font-weight: 500;
        }

        /* Greeting state */
        .greeting-card {
          padding: 3.5rem 2rem;
        }

        .greeting-sparkle-ring {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-full);
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .greeting-subtitle {
          font-size: 1.1rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .greeting-name-huge {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }

        .greeting-text {
          font-size: 0.9rem;
          color: var(--text-dim);
        }

        @media (max-width: 640px) {
          .onboarding-card {
            padding: 1.75rem 1.25rem;
          }
          .onboarding-title {
            font-size: 1.85rem;
          }
          .onboarding-pillars {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
