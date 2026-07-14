/**
 * @file components/Pagination.tsx
 * Stateless pagination bar — PageBtn + PageNumbers.
 * Receives the current page, last page, and an onChange callback.
 * No data-fetching or query knowledge lives here.
 */

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React from 'react';
import type { PaginationMeta } from '@/types/reusable/data-table';

// ─── PageBtn ──────────────────────────────────────────────────────────────────

interface PageBtnProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
  active?: boolean;
}

/**
 * Single pagination button.
 * Highlighted when `active` (current page indicator).
 */
export function PageBtn({
  children,
  disabled,
  onClick,
  title,
  active
}: PageBtnProps) {
  return <button type="button" disabled={disabled} onClick={onClick} title={title} className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${active ? 'bg-brand-400 text-white' : 'hover:brand-400/50'}`} data-cy="pagination-button-title">
            {children}
        </button>;
}

// ─── PageNumbers ──────────────────────────────────────────────────────────────

interface PageNumbersProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

/**
 * Renders a windowed list of page number buttons with ellipsis.
 * Shows all pages when total ≤ 7, otherwise shows first, last, and a
 * window of ±1 around the current page.
 */
export function PageNumbers({
  current,
  total,
  onChange
}: PageNumbersProps) {
  const pages: (number | '…')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (current > 3) {
      pages.push('…');
    }
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) {
      pages.push('…');
    }
    pages.push(total);
  }
  return <>
            {pages.map((p, i) => p === '…' ? <span key={`ellipsis-${i}`} className="px-1.5 text-sm" data-cy="pagination-span-2">
                        …
                    </span> : <PageBtn key={p} active={p === current} onClick={() => onChange(p as number)} data-cy="pagination-page-btn-change">
                        {p}
                    </PageBtn>)}
        </>;
}

// ─── PaginationBar ────────────────────────────────────────────────────────────

interface PaginationBarProps {
  meta: PaginationMeta;
  page: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

/**
 * Full pagination bar: record count summary + first/prev/page-numbers/next/last.
 * Renders nothing when total is 0.
 */
export function PaginationBar({
  meta,
  page,
  loading,
  onPageChange
}: PaginationBarProps) {
  if (!meta || meta.total === 0) {
    return null;
  }
  return <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row" data-cy="pagination-div-4">
            <span className="text-sm" data-cy="pagination-span-5">
                {meta.from != null && meta.to != null ? `${meta.from}–${meta.to} of ${meta.total} records` : `${meta.total} records`}
            </span>
            <div className="flex items-center gap-0.5" data-cy="pagination-div-6">
                <PageBtn disabled={page <= 1 || loading} onClick={() => onPageChange(1)} title="First page" data-cy="pagination-page-btn-first-page">
                    <ChevronsLeft className="size-3" data-cy="pagination-chevrons-left-8" />
                </PageBtn>
                <PageBtn disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)} title="Previous page" data-cy="pagination-page-btn-previous-page">
                    <ChevronLeft className="size-3" data-cy="pagination-chevron-left-10" />
                </PageBtn>
                <PageNumbers current={page} total={meta.last_page} onChange={onPageChange} data-cy="pagination-page-numbers-page-change" />
                <PageBtn disabled={page >= meta.last_page || loading} onClick={() => onPageChange(page + 1)} title="Next page" data-cy="pagination-page-btn-next-page">
                    <ChevronRight className="size-3" data-cy="pagination-chevron-right-13" />
                </PageBtn>
                <PageBtn disabled={page >= meta.last_page || loading} onClick={() => onPageChange(meta.last_page)} title="Last page" data-cy="pagination-page-btn-last-page">
                    <ChevronsRight className="size-3" data-cy="pagination-chevrons-right-15" />
                </PageBtn>
            </div>
        </div>;
}