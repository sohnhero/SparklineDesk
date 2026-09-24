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
    <div className="min-h-screen bg-[#070708] flex flex-col justify-center items-center relative overflow-hidden px-4 selection:bg-orange-500/30">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8 text-center space-y-6">
          <img
            src="/assets/sparkline-logo-white.svg"
            alt="Sparkline"
            className="w-[160px] drop-shadow-xl"
          />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Connexion à l'espace interne
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              Gestion commerciale, devis, factures & finance
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0f0f11]/80 backdrop-blur-xl border border-zinc-800/60 rounded-[24px] p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                Adresse e-mail
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sparkline.sn"
                  className="w-full bg-[#161619] border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Mot de passe
                </label>
                <a href="#" className="text-xs font-medium text-orange-500 hover:text-orange-400 transition-colors">
                  Oublié ?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#161619] border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 flex items-center space-x-2 text-red-400 text-xs font-medium rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold rounded-xl py-3.5 px-4 text-sm transition-all duration-200 flex items-center justify-center space-x-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-zinc-800/60 text-center space-y-1.5">
            <p className="text-xs text-zinc-500 font-medium">Compte administrateur par défaut :</p>
            <p className="text-xs font-medium text-zinc-400 bg-[#161619] inline-block px-3 py-1.5 rounded-lg border border-zinc-800">
              admin@sparkline.sn / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
