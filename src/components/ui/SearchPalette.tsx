'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className="modal compact-modal"
        style={{ top: '25%', transform: 'translate(-50%, 0)', padding: '16px' }}
      >
        <div className="list-search" style={{ width: '100%', maxWidth: 'none', margin: '0 0 12px 0' }}>
          <span>⌕</span>
          <input
            ref={inputRef}
            type="search"
            placeholder="Rechercher un client, une référence, un document..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd>Échap</kbd>
        </div>

        {loading && <div style={{ padding: '16px', textAlign: 'center', color: '#999', fontSize: '11px' }}>Recherche en cours...</div>}

        {!loading && query && results.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
            Aucun résultat trouvé pour « {query} »
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '350px', overflowY: 'auto' }}>
          {results.map((item, idx) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                background: selectedIndex === idx ? '#f5f5f2' : 'transparent',
                transition: '0.15s ease',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: item.type === 'document' ? '#fff' : '#111',
                  color: item.type === 'document' ? '#111' : '#fff',
                  border: item.type === 'document' ? '1px solid #e6e6e1' : 'none',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '11px',
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>{item.title}</div>
                <div style={{ fontSize: '10px', color: '#888' }}>{item.sub}</div>
              </div>
              <span style={{ fontSize: '10px', color: '#aaa', fontWeight: 600 }}>
                {item.type === 'document' ? 'Document' : 'Client'} ↗
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
