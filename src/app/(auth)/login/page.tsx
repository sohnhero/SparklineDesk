'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@sparkline.sn');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedDemo, setCopiedDemo] = useState(false);
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

  const handleFillDemo = () => {
    setEmail('admin@sparkline.sn');
    setPassword('password123');
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <div className="login-page-root">
        <div className="login-split-card">
          {/* LEFT HERO BANNER */}
          <div className="login-hero-banner">
            {/* Top Bar with Brand & Internal Badge */}
            <div className="hero-top-bar">
              <div className="hero-brand">
                <img
                  src="/assets/sparkline-logo-dark.svg"
                  alt="Sparkline"
                  className="hero-brand-logo"
                />
              </div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                <span>Espace interne</span>
              </div>
            </div>

            {/* Middle Feature Chips (Floating aesthetic cards) */}
            <div className="hero-middle-features">
              <div className="hero-feature-chip">
                <span className="hero-feature-dot" />
                <span>Devis & Factures A4 conformes</span>
              </div>
              <div className="hero-feature-chip" style={{ marginLeft: '12px' }}>
                <span className="hero-feature-dot" />
                <span>Propositions commerciales de prestige</span>
              </div>
              <div className="hero-feature-chip">
                <span className="hero-feature-dot" />
                <span>Trésorerie & suivi financier en temps réel</span>
              </div>
            </div>

            {/* Bottom Content with Catchy Editorial Headline */}
            <div className="hero-bottom-content">
              <span className="hero-kicker">Gérez sans friction</span>
              <h2 className="hero-headline">
                Pilotez vos documents et votre finance avec clarté et précision.
              </h2>
            </div>
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="login-form-panel">
            {/* 8-Point Asterisk Accent (inspired by reference) */}
            <div className="form-accent-symbol">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2.5V21.5M2.5 12H21.5M5.28 5.28L18.72 18.72M5.28 18.72L18.72 5.28"
                  stroke="#ea580c"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Header */}
            <div className="form-header">
              <h1 className="form-title">Connexion</h1>
              <p className="form-subtitle">
                Accédez à vos documents, clients et indicateurs financiers en un seul endroit sécurisé.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="form-error-banner" role="alert">
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <div className="form-field">
                <div className="form-field-header">
                  <label htmlFor="login-email" className="form-label">
                    Votre adresse e-mail
                  </label>
                </div>
                <div className="form-input-container">
                  <Mail className="w-4 h-4 form-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sparkline.sn"
                    className="form-input-control"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-field">
                <div className="form-field-header">
                  <label htmlFor="login-password" className="form-label">
                    Mot de passe
                  </label>
                  <a href="#" className="form-forgot-link" onClick={(e) => e.preventDefault()}>
                    Oublié ?
                  </a>
                </div>
                <div className="form-input-container">
                  <Lock className="w-4 h-4 form-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="form-input-control"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="form-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button (High-contrast obsidian black, matching reference) */}
              <button
                type="submit"
                disabled={loading}
                className="form-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4 arrow-icon" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-fill Pill */}
            <div className="form-demo-section">
              <button
                type="button"
                className="form-demo-pill"
                onClick={handleFillDemo}
                title="Cliquer pour pré-remplir les identifiants de démonstration"
              >
                <div>
                  <div className="demo-pill-title">Compte Administrateur Démo</div>
                  <div className="demo-pill-sub">admin@sparkline.sn · password123</div>
                </div>
                <span className="demo-pill-badge">
                  {copiedDemo ? (
                    <>
                      <Check size={12} strokeWidth={2.5} />
                      <span>Rempli</span>
                    </>
                  ) : (
                    <span>Pré-remplir</span>
                  )}
                </span>
              </button>

              {/* Security info */}
              <div className="form-footer-security">
                <ShieldCheck size={14} color="#71717a" />
                <span>Espace sécurisé Sparkline Desk · SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
