'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'light' | 'dark';
}

export function Skeleton({ className = '', variant = 'light', style, ...props }: SkeletonProps) {
  const variantClass = variant === 'dark' ? 'skeleton-dark' : 'skeleton-light';
  return (
    <div
      className={`skeleton-base ${variantClass} ${className}`}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Premium Skeleton for the main Executive Dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="skeleton-page-container">
      {/* Hero Card Skeleton */}
      <div className="skeleton-hero-card">
        <div className="skeleton-hero-top">
          <Skeleton variant="dark" style={{ width: 140, height: 12, borderRadius: 6 }} />
          <Skeleton variant="dark" style={{ width: 100, height: 26, borderRadius: 14 }} />
        </div>
        <div style={{ marginTop: 24 }}>
          <Skeleton variant="dark" style={{ width: '55%', height: 32, borderRadius: 8, marginBottom: 12 }} />
          <Skeleton variant="dark" style={{ width: '40%', height: 16, borderRadius: 6 }} />
        </div>
        <div className="skeleton-hero-metrics">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-hero-metric-box">
              <Skeleton variant="dark" style={{ width: 70, height: 10, borderRadius: 4, marginBottom: 8 }} />
              <Skeleton variant="dark" style={{ width: 110, height: 22, borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Create Grid Skeleton */}
      <div className="quick-grid" style={{ marginTop: 20 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="quick-card" style={{ cursor: 'default' }}>
            <Skeleton style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton style={{ width: '60%', height: 13, borderRadius: 4 }} />
              <Skeleton style={{ width: '85%', height: 10, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-grid" style={{ marginTop: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Skeleton style={{ width: 90, height: 11, borderRadius: 4 }} />
              <Skeleton style={{ width: 28, height: 28, borderRadius: 8 }} />
            </div>
            <Skeleton style={{ width: '70%', height: 24, borderRadius: 6, marginBottom: 8 }} />
            <Skeleton style={{ width: '45%', height: 10, borderRadius: 4 }} />
          </div>
        ))}
      </div>

      {/* Split Panels */}
      <div className="split-panels" style={{ marginTop: 20 }}>
        {/* Left Recent Documents Panel */}
        <div className="panel span-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <Skeleton style={{ width: 140, height: 16, borderRadius: 5, marginBottom: 6 }} />
              <Skeleton style={{ width: 90, height: 11, borderRadius: 4 }} />
            </div>
            <Skeleton style={{ width: 80, height: 28, borderRadius: 8 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="skeleton-table-row">
                <Skeleton style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <Skeleton style={{ width: '35%', height: 13, borderRadius: 4 }} />
                  <Skeleton style={{ width: '55%', height: 10, borderRadius: 4 }} />
                </div>
                <Skeleton style={{ width: 70, height: 20, borderRadius: 6, flexShrink: 0 }} />
                <Skeleton style={{ width: 80, height: 14, borderRadius: 4, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Followup Invoices Panel */}
        <div className="panel">
          <div style={{ marginBottom: 20 }}>
            <Skeleton style={{ width: 130, height: 16, borderRadius: 5, marginBottom: 6 }} />
            <Skeleton style={{ width: 180, height: 11, borderRadius: 4 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-invoice-followup-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <Skeleton style={{ width: 80, height: 12, borderRadius: 4, marginBottom: 4 }} />
                    <Skeleton style={{ width: 110, height: 10, borderRadius: 4 }} />
                  </div>
                  <Skeleton style={{ width: 55, height: 18, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton style={{ width: 70, height: 14, borderRadius: 4 }} />
                  <Skeleton style={{ width: 60, height: 10, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Premium Skeleton for the Documents List View
 */
export function DocumentsSkeleton() {
  return (
    <div className="skeleton-page-container">
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Skeleton style={{ width: 140, height: 22, borderRadius: 6, marginBottom: 6 }} />
          <Skeleton style={{ width: 220, height: 12, borderRadius: 4 }} />
        </div>
        <Skeleton style={{ width: 160, height: 38, borderRadius: 10 }} />
      </div>

      {/* Toolbar filters bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <Skeleton style={{ width: 260, height: 38, borderRadius: 9 }} />
        <Skeleton style={{ width: 140, height: 38, borderRadius: 9 }} />
        <Skeleton style={{ width: 140, height: 38, borderRadius: 9 }} />
      </div>

      {/* Table Container */}
      <div className="panel" style={{ padding: '8px 16px 16px' }}>
        {/* Table header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 10px', borderBottom: '1px solid #ededeb' }}>
          <Skeleton style={{ width: 120, height: 10, borderRadius: 3 }} />
          <Skeleton style={{ width: 80, height: 10, borderRadius: 3 }} />
          <Skeleton style={{ width: 70, height: 10, borderRadius: 3 }} />
          <Skeleton style={{ width: 80, height: 10, borderRadius: 3 }} />
          <Skeleton style={{ width: 60, height: 10, borderRadius: 3 }} />
        </div>
        {/* Table rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
          <div key={row} className="skeleton-table-row">
            <Skeleton style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0 }} />
            <div style={{ flex: 1.5, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton style={{ width: '45%', height: 13, borderRadius: 4 }} />
              <Skeleton style={{ width: '70%', height: 10, borderRadius: 4 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Skeleton style={{ width: '60%', height: 12, borderRadius: 4 }} />
            </div>
            <Skeleton style={{ width: 75, height: 22, borderRadius: 6, flexShrink: 0 }} />
            <Skeleton style={{ width: 85, height: 14, borderRadius: 4, flexShrink: 0 }} />
            <Skeleton style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Premium Skeleton for Clients Directory
 */
export function ClientsSkeleton() {
  return (
    <div className="skeleton-page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <Skeleton style={{ width: 120, height: 22, borderRadius: 6, marginBottom: 6 }} />
          <Skeleton style={{ width: 180, height: 12, borderRadius: 4 }} />
        </div>
        <Skeleton style={{ width: 150, height: 38, borderRadius: 10 }} />
      </div>

      {/* Filter toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <Skeleton style={{ width: 280, height: 38, borderRadius: 9 }} />
      </div>

      {/* Clients Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Skeleton style={{ width: 40, height: 40, borderRadius: 10 }} />
                <div>
                  <Skeleton style={{ width: 110, height: 14, borderRadius: 4, marginBottom: 5 }} />
                  <Skeleton style={{ width: 70, height: 10, borderRadius: 3 }} />
                </div>
              </div>
              <Skeleton style={{ width: 24, height: 24, borderRadius: 6 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #ededeb', paddingTop: 12 }}>
              <Skeleton style={{ width: '80%', height: 11, borderRadius: 3 }} />
              <Skeleton style={{ width: '60%', height: 11, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Premium Skeleton for Finance Page
 */
export function FinanceSkeleton() {
  return (
    <div className="skeleton-page-container">
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <Skeleton style={{ width: 110, height: 22, borderRadius: 6, marginBottom: 6 }} />
        <Skeleton style={{ width: 240, height: 12, borderRadius: 4 }} />
      </div>

      {/* Financial KPIs */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card">
            <Skeleton style={{ width: 90, height: 11, borderRadius: 4, marginBottom: 12 }} />
            <Skeleton style={{ width: '75%', height: 26, borderRadius: 6, marginBottom: 8 }} />
            <Skeleton style={{ width: '50%', height: 10, borderRadius: 4 }} />
          </div>
        ))}
      </div>

      {/* Table Panel */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Skeleton style={{ width: 150, height: 16, borderRadius: 4 }} />
          <Skeleton style={{ width: 120, height: 34, borderRadius: 8 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="skeleton-table-row">
              <Skeleton style={{ width: 32, height: 32, borderRadius: 8 }} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Skeleton style={{ width: '35%', height: 13, borderRadius: 4 }} />
                <Skeleton style={{ width: '60%', height: 10, borderRadius: 4 }} />
              </div>
              <Skeleton style={{ width: 70, height: 20, borderRadius: 6 }} />
              <Skeleton style={{ width: 90, height: 14, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Premium Skeleton for Templates Catalog
 */
export function TemplatesSkeleton() {
  return (
    <div className="skeleton-page-container">
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <Skeleton style={{ width: 150, height: 22, borderRadius: 6, marginBottom: 6 }} />
        <Skeleton style={{ width: 280, height: 12, borderRadius: 4 }} />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} style={{ width: 85 + (i % 3) * 15, height: 32, borderRadius: 16 }} />
        ))}
      </div>

      {/* Template Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="panel" style={{ padding: 14, borderRadius: 16 }}>
            <Skeleton style={{ width: '100%', height: 190, borderRadius: 12, marginBottom: 12 }} />
            <Skeleton style={{ width: '65%', height: 15, borderRadius: 4, marginBottom: 6 }} />
            <Skeleton style={{ width: '90%', height: 11, borderRadius: 3, marginBottom: 14 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton style={{ width: 70, height: 18, borderRadius: 4 }} />
              <Skeleton style={{ width: 90, height: 32, borderRadius: 8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Premium Skeleton for Settings Page
 */
export function SettingsSkeleton() {
  return (
    <div className="skeleton-page-container">
      <div style={{ marginBottom: 22 }}>
        <Skeleton style={{ width: 140, height: 22, borderRadius: 6, marginBottom: 6 }} />
        <Skeleton style={{ width: 220, height: 12, borderRadius: 4 }} />
      </div>

      <div className="panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #ededeb', paddingBottom: 12, marginBottom: 20 }}>
          <Skeleton style={{ width: 90, height: 28, borderRadius: 6 }} />
          <Skeleton style={{ width: 90, height: 28, borderRadius: 6 }} />
          <Skeleton style={{ width: 90, height: 28, borderRadius: 6 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton style={{ width: 100, height: 12, borderRadius: 4, marginBottom: 8 }} />
              <Skeleton style={{ width: '100%', height: 40, borderRadius: 8 }} />
            </div>
          ))}
        </div>
        <Skeleton style={{ width: 120, height: 38, borderRadius: 10, marginTop: 24 }} />
      </div>
    </div>
  );
}

/**
 * Premium Skeleton for Document Fullscreen Editor
 */
export function EditorSkeleton() {
  return (
    <div className="editor-shell" style={{ zIndex: 1000 }}>
      {/* Topbar Skeleton */}
      <div className="editor-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton style={{ width: 36, height: 36, borderRadius: 9 }} />
          <div>
            <Skeleton style={{ width: 180, height: 16, borderRadius: 4, marginBottom: 4 }} />
            <Skeleton style={{ width: 90, height: 10, borderRadius: 3 }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Skeleton style={{ width: 85, height: 34, borderRadius: 8 }} />
          <Skeleton style={{ width: 100, height: 34, borderRadius: 8 }} />
          <Skeleton style={{ width: 110, height: 34, borderRadius: 8 }} />
        </div>
      </div>

      {/* Editor Body Split */}
      <div className="editor-layout">
        {/* Left Form Pane Skeleton */}
        <div className="editor-form-pane" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <Skeleton style={{ width: 90, height: 30, borderRadius: 8 }} />
            <Skeleton style={{ width: 90, height: 30, borderRadius: 8 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton style={{ width: '100%', height: 48, borderRadius: 10 }} />
            <Skeleton style={{ width: '100%', height: 75, borderRadius: 10 }} />
            <Skeleton style={{ width: '100%', height: 140, borderRadius: 10 }} />
          </div>
        </div>

        {/* Right Preview Sheet Skeleton */}
        <div className="editor-preview-pane">
          <div className="document-page" style={{ padding: '48px 54px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #eee' }}>
              <Skeleton style={{ width: 130, height: 28, borderRadius: 6 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                <Skeleton style={{ width: 80, height: 10, borderRadius: 3 }} />
                <Skeleton style={{ width: 110, height: 18, borderRadius: 4 }} />
                <Skeleton style={{ width: 90, height: 10, borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <Skeleton style={{ width: 30, height: 4, borderRadius: 2, marginBottom: 8 }} />
              <Skeleton style={{ width: '60%', height: 24, borderRadius: 6, marginBottom: 8 }} />
              <Skeleton style={{ width: '85%', height: 12, borderRadius: 4 }} />
            </div>
            <Skeleton style={{ width: '100%', height: 60, borderRadius: 10, marginBottom: 24 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} style={{ width: '100%', height: 36, borderRadius: 6 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Skeleton style={{ width: 220, height: 80, borderRadius: 10 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
