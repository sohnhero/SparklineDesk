'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, Users, ArrowRight, Hash, Command, Loader2 } from 'lucide-react';
import { TYPE_META, DocTypeKey } from '@/domains/documents/types';

interface SearchItem {
  id: string;
  type: 'document' | 'client';
  title: string;
  sub: string;
  url: string;
  icon: string;
}

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchItem) => {
    router.push(item.url);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  const quickLinks = [
    { label: 'Nouveau document', shortcut: '⌘N', href: '/documents' },
    { label: 'Tous les clients', shortcut: '⌘C', href: '/clients' },
    { label: 'Finance', shortcut: '⌘F', href: '/finance' },
  ];

  return (
    <>
      <style>{`
        @keyframes paletteIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .sp-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: backdropIn 0.2s ease;
        }
        .sp-wrap {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          width: min(640px, calc(100vw - 32px));
          background: rgba(12, 12, 14, 0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;
          overflow: hidden;
          animation: paletteIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sp-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sp-search-icon {
          color: #f97316;
          flex-shrink: 0;
        }
        .sp-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 16px;
          font-weight: 400;
          letter-spacing: -0.2px;
        }
        .sp-input::placeholder { color: rgba(255,255,255,0.3); }
        .sp-kbd {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .sp-key {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 6px;
          font-family: inherit;
        }
        .sp-clear {
          background: rgba(255,255,255,0.07);
          border: none;
          color: rgba(255,255,255,0.4);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: all 0.15s;
        }
        .sp-clear:hover {
          background: rgba(255,255,255,0.12);
          color: white;
        }
        .sp-body {
          max-height: 400px;
          overflow-y: auto;
          padding: 8px;
        }
        .sp-body::-webkit-scrollbar { width: 4px; }
        .sp-body::-webkit-scrollbar-track { background: transparent; }
        .sp-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .sp-section-label {
          padding: 8px 12px 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: rgba(255,255,255,0.25);
        }
        .sp-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.1s;
        }
        .sp-item:hover, .sp-item.active {
          background: rgba(249, 115, 22, 0.12);
        }
        .sp-item.active .sp-item-arrow { opacity: 1; color: #f97316; }
        .sp-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .sp-icon-doc {
          background: rgba(249, 115, 22, 0.12);
          border: 1px solid rgba(249, 115, 22, 0.2);
          color: #f97316;
        }
        .sp-icon-client {
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #818cf8;
        }
        .sp-icon-quick {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4);
        }
        .sp-item-text { flex: 1; min-width: 0; }
        .sp-item-title {
          font-size: 13px;
          font-weight: 500;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sp-item-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sp-item-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          flex-shrink: 0;
        }
        .sp-item-badge-doc {
          background: rgba(249, 115, 22, 0.12);
          color: #f97316;
        }
        .sp-item-badge-client {
          background: rgba(99, 102, 241, 0.12);
          color: #818cf8;
        }
        .sp-item-arrow {
          color: rgba(255,255,255,0.2);
          opacity: 0;
          transition: opacity 0.15s;
          flex-shrink: 0;
        }
        .sp-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sp-footer-hints {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .sp-footer-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
        }
        .sp-footer-hint kbd {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.35);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-family: inherit;
        }
        .sp-empty {
          padding: 40px 16px;
          text-align: center;
        }
        .sp-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          display: grid;
          place-items: center;
          margin: 0 auto 12px;
          color: rgba(255,255,255,0.2);
        }
        .sp-empty-title { font-size: 13px; color: rgba(255,255,255,0.45); font-weight: 500; }
        .sp-empty-sub { font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 4px; }
        .sp-loader {
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: rgba(255,255,255,0.3);
          font-size: 13px;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="sp-backdrop" onClick={onClose} />

      <div className="sp-wrap">
        {/* Search Header */}
        <div className="sp-header">
          <Search size={18} className="sp-search-icon" strokeWidth={2.5} />
          <input
            ref={inputRef}
            className="sp-input"
            type="text"
            placeholder="Rechercher un document, client, référence..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {query ? (
            <button className="sp-clear" onClick={() => setQuery('')}>
              <X size={12} />
            </button>
          ) : (
            <div className="sp-kbd">
              <kbd className="sp-key">Échap</kbd>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="sp-body">
          {/* Loading */}
          {loading && (
            <div className="sp-loader">
              <Loader2 size={16} className="spin" />
              Recherche en cours...
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <>
              <div className="sp-section-label">Résultats ({results.length})</div>
              {results.map((item, idx) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`sp-item ${selectedIndex === idx ? 'active' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className={`sp-icon-wrap ${item.type === 'document' ? 'sp-icon-doc' : 'sp-icon-client'}`}>
                    {item.type === 'document' ? <FileText size={15} strokeWidth={2} /> : <Users size={15} strokeWidth={2} />}
                  </div>
                  <div className="sp-item-text">
                    <div className="sp-item-title">{item.title}</div>
                    <div className="sp-item-sub">{item.sub}</div>
                  </div>
                  <span className={`sp-item-badge ${item.type === 'document' ? 'sp-item-badge-doc' : 'sp-item-badge-client'}`}>
                    {item.type === 'document' ? 'Document' : 'Client'}
                  </span>
                  <ArrowRight size={14} className="sp-item-arrow" />
                </div>
              ))}
            </>
          )}

          {/* Empty state */}
          {!loading && query && results.length === 0 && (
            <div className="sp-empty">
              <div className="sp-empty-icon">
                <Hash size={20} strokeWidth={1.5} />
              </div>
              <div className="sp-empty-title">Aucun résultat trouvé</div>
              <div className="sp-empty-sub">Aucun document ou client ne correspond à « {query} »</div>
            </div>
          )}

          {/* Quick links when idle */}
          {!query && (
            <>
              <div className="sp-section-label">Navigation rapide</div>
              {quickLinks.map((link) => (
                <div
                  key={link.href}
                  className="sp-item"
                  onClick={() => { router.push(link.href); onClose(); }}
                >
                  <div className="sp-icon-wrap sp-icon-quick">
                    <Command size={14} strokeWidth={2} />
                  </div>
                  <div className="sp-item-text">
                    <div className="sp-item-title">{link.label}</div>
                  </div>
                  <kbd className="sp-key">{link.shortcut}</kbd>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="sp-footer">
          <div className="sp-footer-hints">
            <div className="sp-footer-hint">
              <kbd>↑↓</kbd> <span>Naviguer</span>
            </div>
            <div className="sp-footer-hint">
              <kbd>↵</kbd> <span>Ouvrir</span>
            </div>
            <div className="sp-footer-hint">
              <kbd>Échap</kbd> <span>Fermer</span>
            </div>
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>
            Sparkline Desk
          </div>
        </div>
      </div>
    </>
  );
}
