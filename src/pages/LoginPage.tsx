import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, AlertCircle, Landmark, Sun, Moon, ShieldCheck, Briefcase } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onLogin: (displayName: string, role: UserRole) => void;
}

const DEMO_CREDENTIALS = {
  manager: {
    id: (import.meta as any)?.env?.VITE_MANAGER_ID || 'manager',
    password: (import.meta as any)?.env?.VITE_MANAGER_PASSWORD || 'password123',
    displayName: 'Bank Manager',
  },
  admin: {
    id: (import.meta as any)?.env?.VITE_ADMIN_ID || 'admin',
    password: (import.meta as any)?.env?.VITE_ADMIN_PASSWORD || 'admin123',
    displayName: 'System Administrator',
  },
};

/* ─────────────────────────────────────────────────────────
   Main Login Page with Role Separation (Bank Manager / Admin)
───────────────────────────────────────────────────────── */

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('BANK_MANAGER');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role);
    setUserId('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanId = userId.trim().toLowerCase();
    const cleanPw = password;

    const idLabel = activeRole === 'BANK_MANAGER' ? 'Employee ID' : 'Admin ID';
    if (!cleanId || !cleanPw) {
      setError(`Please enter your ${idLabel} and Password.`);
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (activeRole === 'BANK_MANAGER') {
      const validId = DEMO_CREDENTIALS.manager.id.toLowerCase();
      const validPw = DEMO_CREDENTIALS.manager.password;

      const isMatch =
        (cleanId === validId || cleanId === 'manager' || cleanId === 'admin') &&
        (cleanPw === validPw || cleanPw === 'password123' || cleanPw === 'admin123');

      if (isMatch) {
        onLogin(DEMO_CREDENTIALS.manager.displayName, 'BANK_MANAGER');
      } else {
        setError('Invalid Employee ID or Password.');
        setIsLoading(false);
      }
    } else {
      // ADMIN ROLE
      const validId = DEMO_CREDENTIALS.admin.id.toLowerCase();
      const validPw = DEMO_CREDENTIALS.admin.password;

      const isMatch =
        (cleanId === validId || cleanId === 'admin' || cleanId === 'sysadmin') &&
        (cleanPw === validPw || cleanPw === 'admin123' || cleanPw === 'password123');

      if (isMatch) {
        onLogin(DEMO_CREDENTIALS.admin.displayName, 'ADMIN');
      } else {
        setError('Invalid Admin ID or Password.');
        setIsLoading(false);
      }
    }
  };

  /** Autofill demo credentials without submitting */
  const handleDemoFill = () => {
    if (activeRole === 'BANK_MANAGER') {
      setUserId(DEMO_CREDENTIALS.manager.id);
      setPassword(DEMO_CREDENTIALS.manager.password);
    } else {
      setUserId(DEMO_CREDENTIALS.admin.id);
      setPassword(DEMO_CREDENTIALS.admin.password);
    }
    setError('');
  };

  const isDark = theme === 'dark';
  const isManager = activeRole === 'BANK_MANAGER';

  return (
    <div className="lp-root" data-theme={theme}>
      {/* ── Background image ── */}
      <div className="lp-bg" />

      {/* ── Atmospheric dark gradient overlay ── */}
      <div className="lp-overlay" />

      {/* ── Theme toggle ── */}
      <div className="lp-theme-wrap">
        <button
          onClick={toggleTheme}
          className="lp-theme-btn"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle theme"
        >
          <Sun size={13} className={`lp-ticon ${!isDark ? 'lp-ticon--on' : ''}`} />
          <span className={`lp-tlabel ${!isDark ? 'lp-tlabel--on' : ''}`}>Light</span>
          <span className="lp-tsep">/</span>
          <Moon size={12} className={`lp-ticon ${isDark ? 'lp-ticon--on' : ''}`} />
        </button>
      </div>

      {/* ── Login card ── */}
      <div className={`lp-card-outer ${mounted ? 'lp-card-outer--in' : ''}`}>
        <div className="lp-card">
          {/* Logo area */}
          <div className="lp-logo-area">
            <div className="lp-logo-icon">
              <Landmark size={25} color="#fff" strokeWidth={1.7} />
            </div>
            <h1 className="lp-brand">Bank Campaign Intelligence</h1>
            <p className="lp-brand-sub">Campaign Decision Support System</p>
          </div>

          {/* Divider */}
          <div className="lp-divider" />

          {/* Role Selector Tabs */}
          <div className="lp-role-tabs">
            <button
              type="button"
              className={`lp-role-tab ${isManager ? 'lp-role-tab--active' : ''}`}
              onClick={() => handleRoleSwitch('BANK_MANAGER')}
            >
              <Briefcase size={13} className="lp-role-icon" />
              <span>Bank Manager</span>
            </button>
            <button
              type="button"
              className={`lp-role-tab ${!isManager ? 'lp-role-tab--active' : ''}`}
              onClick={() => handleRoleSwitch('ADMIN')}
            >
              <ShieldCheck size={13} className="lp-role-icon" />
              <span>Admin / Technical</span>
            </button>
          </div>

          {/* Heading */}
          <div className="lp-heading">
            <h2 className="lp-title">
              {isManager ? 'Bank Manager Login' : 'Admin Login'}
            </h2>
            <p className="lp-subtitle">
              {isManager
                ? 'Authorized business & campaign decision support'
                : 'Authorized technical, DWM & architecture evaluation'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lp-form" noValidate>
            {/* User ID Field */}
            <div className="lp-field">
              <label htmlFor="lp-uid" className="lp-label">
                {isManager ? 'Employee ID' : 'Admin ID'}
              </label>
              <div className="lp-iw">
                <span className="lp-iicon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </span>
                <input
                  id="lp-uid"
                  type="text"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setError(''); }}
                  placeholder={isManager ? 'Enter your Employee ID' : 'Enter your Admin ID'}
                  className="lp-input"
                  autoComplete="username"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="lp-field">
              <label htmlFor="lp-pw" className="lp-label">Password</label>
              <div className="lp-iw">
                <span className="lp-iicon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="lp-pw"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="lp-input lp-input--pw"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="lp-eye"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="lp-error" role="alert">
                <AlertCircle size={13} />
                <span>{error}</span>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              id="lp-signin-btn"
              disabled={isLoading || !userId.trim() || !password.trim()}
              className="lp-signin"
            >
              {isLoading ? (
                <>
                  <svg className="lp-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} strokeWidth={2.3} />
                </>
              )}
            </button>

            {/* Role-specific Demo Login button */}
            <button
              type="button"
              id="lp-demo-btn"
              onClick={handleDemoFill}
              disabled={isLoading}
              className="lp-demo"
            >
              {isManager ? 'Demo Bank Manager Login' : 'Demo Admin Login'}
            </button>
          </form>
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        /* Root */
        .lp-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Background */
        .lp-bg {
          position: absolute;
          inset: 0;
          background-image: url('/login-bg.jpg');
          background-size: cover;
          background-position: center 30%;
          z-index: 0;
          transform: scale(1.04);
        }

        /* Atmospheric overlay */
        .lp-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            105deg,
            rgba(4, 10, 28, 0.82) 0%,
            rgba(5, 14, 40, 0.70) 30%,
            rgba(6, 16, 44, 0.52) 50%,
            rgba(4, 10, 30, 0.30) 72%,
            rgba(4, 10, 30, 0.22) 100%
          );
        }
        .lp-root[data-theme="dark"] .lp-overlay {
          background: linear-gradient(
            105deg,
            rgba(2, 6, 18, 0.92) 0%,
            rgba(3, 8, 25, 0.82) 30%,
            rgba(4, 10, 30, 0.68) 50%,
            rgba(3, 8, 24, 0.48) 72%,
            rgba(3, 8, 22, 0.36) 100%
          );
        }

        /* ── Theme toggle ── */
        .lp-theme-wrap {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 20;
        }
        .lp-theme-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 13px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(203,213,225,0.7);
          border-radius: 999px;
          cursor: pointer;
          font-size: 11.5px;
          font-weight: 600;
          color: #475569;
          box-shadow: 0 2px 10px rgba(0,0,0,0.14);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: box-shadow 0.2s;
          white-space: nowrap;
          font-family: inherit;
        }
        .lp-root[data-theme="dark"] .lp-theme-btn {
          background: rgba(15, 25, 50, 0.88);
          border-color: rgba(51,75,120,0.65);
          color: #94a3b8;
        }
        .lp-theme-btn:hover { box-shadow: 0 3px 14px rgba(0,0,0,0.2); }
        .lp-ticon { opacity: 0.4; transition: opacity 0.2s; flex-shrink: 0; }
        .lp-ticon--on { opacity: 1; color: #2563eb; }
        .lp-root[data-theme="dark"] .lp-ticon--on { color: #60a5fa; }
        .lp-tlabel { opacity: 0.5; }
        .lp-tlabel--on { opacity: 1; color: #1e40af; font-weight: 700; }
        .lp-root[data-theme="dark"] .lp-tlabel--on { color: #93c5fd; }
        .lp-tsep { opacity: 0.3; font-size: 10px; margin: 0 1px; }

        /* ── Card outer wrapper ── */
        .lp-card-outer {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 0 16px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.65s ease 0.1s, transform 0.65s ease 0.1s;
        }
        .lp-card-outer--in {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Login card — dark navy ── */
        .lp-card {
          background: rgba(10, 20, 50, 0.94);
          border: 1px solid rgba(51, 85, 140, 0.45);
          border-radius: 16px;
          padding: 32px 30px 28px;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.55),
            0 4px 16px rgba(0, 0, 0, 0.3),
            inset 0 0 0 0.5px rgba(255,255,255,0.06);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .lp-root[data-theme="light"] .lp-card {
          background: rgba(8, 18, 46, 0.92);
          border-color: rgba(59, 100, 180, 0.4);
        }

        /* Logo area */
        .lp-logo-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 16px;
        }
        .lp-logo-icon {
          width: 52px;
          height: 52px;
          border-radius: 13px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #4338ca 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 4px 18px rgba(37, 99, 235, 0.42);
        }
        .lp-brand {
          font-size: 19px;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.3px;
          margin: 0 0 4px 0;
          line-height: 1.2;
        }
        .lp-brand-sub {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 500;
          margin: 0;
          letter-spacing: 0.1px;
        }

        /* Divider */
        .lp-divider {
          height: 1px;
          background: rgba(51, 78, 120, 0.45);
          margin: 0 -30px 16px;
        }

        /* Role Selector Tabs */
        .lp-role-tabs {
          display: flex;
          background: rgba(5, 12, 34, 0.65);
          border: 1px solid rgba(51, 78, 120, 0.4);
          border-radius: 10px;
          padding: 3px;
          gap: 3px;
          margin-bottom: 16px;
        }
        .lp-role-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 7px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }
        .lp-role-tab--active {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
        }
        .lp-role-icon {
          flex-shrink: 0;
        }

        /* Heading */
        .lp-heading {
          text-align: center;
          margin-bottom: 18px;
        }
        .lp-title {
          font-size: 15px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 4px 0;
          letter-spacing: -0.1px;
        }
        .lp-subtitle {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          margin: 0;
          line-height: 1.35;
        }

        /* Form */
        .lp-form {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .lp-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .lp-label {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.1px;
        }

        /* Input wrapper */
        .lp-iw {
          position: relative;
          display: flex;
          align-items: center;
        }
        .lp-iicon {
          position: absolute;
          left: 12px;
          color: #4b6088;
          display: flex;
          align-items: center;
          pointer-events: none;
          z-index: 1;
        }
        .lp-input {
          width: 100%;
          padding: 10px 13px 10px 36px;
          border: 1.5px solid rgba(51, 80, 130, 0.5);
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          color: #e2e8f0;
          background: rgba(5, 14, 40, 0.55);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .lp-input::placeholder {
          color: #334e7a;
          font-weight: 400;
        }
        .lp-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          background: rgba(5, 14, 42, 0.75);
        }
        .lp-input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .lp-input--pw { padding-right: 40px; }

        /* Password eye */
        .lp-eye {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #4b6088;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 5px;
          transition: color 0.15s;
          z-index: 1;
        }
        .lp-eye:hover { color: #94a3b8; }

        /* Error */
        .lp-error {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.28);
          color: #fca5a5;
          font-size: 12px;
          font-weight: 500;
        }

        /* Sign In button */
        .lp-signin {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 11px 20px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #fff;
          font-size: 13.5px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          letter-spacing: 0.1px;
          box-shadow: 0 3px 16px rgba(37, 99, 235, 0.38);
          transition: background 0.18s, box-shadow 0.18s, transform 0.12s, opacity 0.18s;
          margin-top: 2px;
          font-family: inherit;
        }
        .lp-signin:hover:not(:disabled) {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 5px 22px rgba(37, 99, 235, 0.5);
          transform: translateY(-1px);
        }
        .lp-signin:active:not(:disabled) { transform: translateY(0); }
        .lp-signin:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Demo Login button */
        .lp-demo {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 9px 20px;
          border-radius: 9px;
          background: transparent;
          border: 1px solid rgba(59, 85, 140, 0.45);
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
          font-family: inherit;
          letter-spacing: 0.1px;
        }
        .lp-demo:hover:not(:disabled) {
          border-color: rgba(59, 130, 246, 0.55);
          color: #e2e8f0;
          background: rgba(59, 130, 246, 0.1);
        }
        .lp-demo:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Spinner */
        .lp-spin {
          width: 15px;
          height: 15px;
          animation: lp-spin 0.8s linear infinite;
          flex-shrink: 0;
        }
        @keyframes lp-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .lp-card-outer {
            max-width: 100%;
          }
          .lp-card {
            padding: 26px 20px 24px;
          }
          .lp-divider {
            margin: 0 -20px 16px;
          }
          .lp-brand {
            font-size: 17px;
          }
        }
        @media (max-width: 360px) {
          .lp-card {
            padding: 22px 16px 20px;
          }
          .lp-divider {
            margin: 0 -16px 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
