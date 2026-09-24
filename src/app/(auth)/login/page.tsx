'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0b0c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#141416',
          border: '1px solid #262629',
          borderRadius: '22px',
          padding: '36px 32px',
          color: '#fff',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/assets/sparkline-logo-white.svg"
            alt="Sparkline"
            style={{ width: '170px', margin: '0 auto 16px' }}
          />
          <h1 style={{ fontSize: '20px', margin: '0 0 6px', fontWeight: 800 }}>
            Connexion à l’espace interne
          </h1>
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>
            Gestion commerciale, devis, factures & finance
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(201, 77, 77, 0.15)',
              border: '1px solid rgba(201, 77, 77, 0.4)',
              color: '#ff8282',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label style={{ color: '#aaa' }}>Adresse e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sparkline.sn"
              style={{
                background: '#1c1c1f',
                borderColor: '#333337',
                color: '#fff',
              }}
            />
          </div>

          <div className="field">
            <label style={{ color: '#aaa' }}>Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                background: '#1c1c1f',
                borderColor: '#333337',
                color: '#fff',
              }}
            />
          </div>

          <button
            type="submit"
            className="primary-action"
            style={{ marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #222226',
            textAlign: 'center',
            fontSize: '11px',
            color: '#666',
          }}
        >
          Compte administrateur par défaut :<br />
          <strong style={{ color: '#aaa' }}>admin@sparkline.sn</strong> /{' '}
          <strong style={{ color: '#aaa' }}>password123</strong>
        </div>
      </div>
    </div>
  );
}
