'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@sparkline.sn');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Identifiants invalides');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          background-color: #f4f4f5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .login-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 600px;
          background: rgba(249, 115, 22, 0.08);
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .login-container {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 10;
          animation: slideUp 0.6s ease-out forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-logo {
          width: 160px;
          margin: 0 auto 24px;
        }
        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: #18181b;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }
        .login-subtitle {
          color: #71717a;
          font-size: 14px;
          margin: 0;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(228, 228, 231, 0.8);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08);
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #52525b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          margin-left: 4px;
        }
        .form-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          margin-left: 4px;
        }
        .form-link {
          font-size: 12px;
          color: #ea580c;
          text-decoration: none;
          font-weight: 500;
        }
        .form-link:hover {
          color: #c2410c;
        }
        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #a1a1aa;
          transition: color 0.2s;
        }
        .input-wrapper:focus-within .input-icon {
          color: #f97316;
        }
        .form-input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #d4d4d8;
          border-radius: 12px;
          padding: 12px 16px 12px 42px;
          font-size: 14px;
          color: #18181b;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .form-input::placeholder {
          color: #a1a1aa;
        }
        .form-input:focus {
          border-color: rgba(249, 115, 22, 0.5);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02), 0 0 0 3px rgba(249, 115, 22, 0.15);
        }
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #ef4444;
          font-size: 12px;
          font-weight: 500;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }
        .submit-btn {
          width: 100%;
          background: linear-gradient(to right, #f97316, #ea580c);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 8px 16px rgba(249, 115, 22, 0.2);
        }
        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(to right, #fb923c, #f97316);
          box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3);
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .submit-btn svg {
          transition: transform 0.2s;
        }
        .submit-btn:hover:not(:disabled) svg {
          transform: translateX(4px);
        }
        .login-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e4e4e7;
          text-align: center;
        }
        .footer-text {
          font-size: 12px;
          color: #71717a;
          margin-bottom: 8px;
        }
        .footer-badge {
          display: inline-block;
          font-size: 12px;
          color: #52525b;
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
        }
      `}</style>

      <div className="login-wrapper">
        <div className="login-glow" />

        <div className="login-container">
          <div className="login-header">
            <img
              src="/assets/sparkline-logo-dark.svg"
              alt="Sparkline"
              className="login-logo"
            />
            <h1 className="login-title">
              Connexion à l'espace interne
            </h1>
            <p className="login-subtitle">
              Gestion commerciale, devis, factures & finance
            </p>
          </div>

          <div className="login-card">
            <form onSubmit={handleSubmit}>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  Adresse e-mail
                </label>
                <div className="input-wrapper">
                  <Mail className="w-4 h-4 input-icon" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sparkline.sn"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Mot de passe
                  </label>
                  <a href="#" className="form-link">
                    Oublié ?
                  </a>
                </div>
                <div className="input-wrapper">
                  <Lock className="w-4 h-4 input-icon" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
