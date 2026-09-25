'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  dotColor?: string;
}

interface FilterDropdownProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export function FilterDropdown({
  label,
  icon,
  value,
  options,
  onChange,
  id,
  placeholder,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const isFiltered = value !== 'all' && value !== '';

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('all');
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`filter-dropdown-container ${isFiltered ? 'is-filtered' : ''} ${isOpen ? 'is-open' : ''}`}
      id={id}
    >
      <button
        type="button"
        className="filter-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="trigger-icon">{icon}</span>
        <span className="trigger-label">{label} :</span>
        <span className="trigger-value">
          {selectedOption ? selectedOption.label : placeholder || 'Sélectionner'}
        </span>
        {selectedOption?.count !== undefined && (
          <span className="trigger-count">({selectedOption.count})</span>
        )}

        {isFiltered ? (
          <span
            className="trigger-clear-btn"
            onClick={handleClear}
            title="Réinitialiser ce filtre"
            role="button"
            tabIndex={0}
          >
            <X size={12} strokeWidth={2.5} />
          </span>
        ) : (
          <ChevronDown
            size={13}
            strokeWidth={2}
            className={`trigger-chevron ${isOpen ? 'open' : ''}`}
          />
        )}
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu" role="listbox">
          <div className="filter-dropdown-menu-inner">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`filter-dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="item-left">
                    {option.dotColor && (
                      <span
                        className="item-dot"
                        style={{ backgroundColor: option.dotColor }}
                      />
                    )}
                    {option.icon && <span className="item-icon">{option.icon}</span>}
                    <span className="item-label">{option.label}</span>
                  </div>

                  <div className="item-right">
                    {option.count !== undefined && (
                      <span className="item-count">{option.count}</span>
                    )}
                    {isSelected && (
                      <Check size={13} strokeWidth={2.5} className="item-check" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
