'use client';
import React, { useEffect, useId } from 'react';

type TI = { testId?: string };
export function PageHeader({ title, sub, actions, testId }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode } & TI) {
  return <div className="page-header" data-testid={testId}><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{actions && <div className="row">{actions}</div>}</div>;
}
export function Button({ variant = 'primary', loading, children, testId, small, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'text' | 'destructive'; loading?: boolean; small?: boolean } & TI) {
  return <button type="button" {...p} data-testid={testId} data-loading={loading ? 'true' : undefined} aria-busy={loading || undefined} disabled={p.disabled || loading} className={`btn btn-${variant}${small ? ' btn-sm' : ''} ${p.className ?? ''}`}>{loading && <span className="spinner" aria-hidden />}{children}</button>;
}
export function IconButton({ label, children, testId, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string } & TI) {
  return <button type="button" {...p} aria-label={label} data-testid={testId} className={`icon-btn ${p.className ?? ''}`}>{children}</button>;
}
function Field({ label, error, children, id, errorTestId }: { label: string; error?: string | null; children: React.ReactNode; id: string; errorTestId?: string }) {
  return <div className="field"><label htmlFor={id}>{label}</label>{children}{error && <span className="field-error" id={`${id}-err`} data-testid={errorTestId} role="alert">{error}</span>}</div>;
}
type InputP = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { label: string; error?: string | null; onChange: (v: string) => void; errorTestId?: string } & TI;
function makeInput(type: string) {
  return function Input({ label, error, onChange, testId, errorTestId, ...p }: InputP) {
    const id = useId();
    return <Field label={label} error={error} id={id} errorTestId={errorTestId}><input id={id} type={type} className="input" {...p} data-testid={testId} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} onChange={e => onChange(e.target.value)} /></Field>;
  };
}
export const TextField = makeInput('text');
export const PasswordField = makeInput('password');
export const SearchField = makeInput('search');
export const DateField = makeInput('date');
export function TextArea({ label, error, onChange, testId, errorTestId, ...p }: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & { label: string; error?: string | null; onChange: (v: string) => void; errorTestId?: string } & TI) {
  const id = useId();
  return <Field label={label} error={error} id={id} errorTestId={errorTestId}><textarea id={id} className="textarea" {...p} data-testid={testId} aria-invalid={error ? true : undefined} onChange={e => onChange(e.target.value)} /></Field>;
}
export function Select({ label, value, options, onChange, testId, error, errorTestId, placeholder, hideLabel, disabled }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; error?: string | null; errorTestId?: string; placeholder?: string; hideLabel?: boolean; disabled?: boolean } & TI) {
  const id = useId();
  const sel = <select id={id} className="select" value={value} data-testid={testId} disabled={disabled} aria-label={hideLabel ? label : undefined} aria-invalid={error ? true : undefined} onChange={e => onChange(e.target.value)}>{placeholder !== undefined && <option value="">{placeholder}</option>}{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
  if (hideLabel) return <div className="field">{sel}{error && <span className="field-error" data-testid={errorTestId} role="alert">{error}</span>}</div>;
  return <Field label={label} error={error} id={id} errorTestId={errorTestId}>{sel}</Field>;
}
export function SegmentedControl({ value, options, onChange, testId, label }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; label: string } & TI) {
  return <div className="seg" role="group" aria-label={label} data-testid={testId}>{options.map(o => <button type="button" key={o.value} aria-pressed={value === o.value} data-value={o.value} onClick={() => onChange(o.value)}>{o.label}</button>)}</div>;
}
export function Tabs({ value, tabs, onChange, testId }: { value: string; tabs: { value: string; label: string; count?: number }[]; onChange: (v: string) => void } & TI) {
  return <div className="tabs" role="tablist" data-testid={testId}>{tabs.map(t => <button type="button" role="tab" key={t.value} aria-selected={value === t.value} data-value={t.value} onClick={() => onChange(t.value)}>{t.label}{t.count !== undefined && <span className="badge">{t.count}</span>}</button>)}</div>;
}
export function Badge({ tone, children, testId, title }: { tone?: 'primary' | 'high' | 'mid' | 'low' | 'ai' | 'warning'; children: React.ReactNode; title?: string } & TI) {
  return <span className={`badge ${tone ?? ''}`} data-testid={testId} title={title}>{children}</span>;
}
export function Tag({ children, testId }: { children: React.ReactNode } & TI) { return <span className="tag" data-testid={testId}>{children}</span>; }
export function Card({ children, testId, className, title, ...rest }: { children: React.ReactNode; className?: string; title?: React.ReactNode } & TI & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>) {
  return <section className={`card ${className ?? ''}`} data-testid={testId} {...rest}>{title && <h2>{title}</h2>}{children}</section>;
}
export function StatTile({ label, value, sub, testId, onClick, subTone }: { label: string; value: React.ReactNode; sub?: React.ReactNode; onClick?: () => void; subTone?: 'up' | 'down' } & TI) {
  const Comp = onClick ? 'button' : 'div';
  return <Comp className={`card stat${onClick ? ' clickable' : ''}`} data-testid={testId} onClick={onClick} style={onClick ? { textAlign: 'left', border: 0, font: 'inherit' } : undefined}>
    <div className="label">{label}</div><div className="value" data-role="value">{value}</div>{sub !== undefined && <div className={`sub ${subTone ?? 'muted'}`}>{sub}</div>}</Comp>;
}
export const gradeTone = (g: string) => (g === '고' ? 'high' : g === '중' ? 'mid' : 'low') as 'high' | 'mid' | 'low';
export function ScoreBar({ score, testId }: { score: number } & TI) {
  const tone = score >= 60 ? 'var(--risk-high)' : score >= 35 ? 'var(--risk-mid)' : 'var(--risk-low)';
  return <div className="scorebar" data-testid={testId} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label="점수"><div className="track"><div className="fill" style={{ width: `${score}%`, background: tone }} /></div><span className="num" style={{ width: 28, textAlign: 'right' }}>{score}</span></div>;
}
export interface Col<T> { key: string; header: string; render: (r: T) => React.ReactNode; align?: 'r' }
export function DataTable<T>({ rows, cols, testId, rowKey, onRowClick, rowTestId, mobile }: { rows: T[]; cols: Col<T>[]; rowKey: (r: T) => string | number; onRowClick?: (r: T) => void; rowTestId?: string; mobile?: (r: T) => React.ReactNode } & TI) {
  return <div data-testid={testId}>
    <div className={`table-wrap${mobile ? ' dt-desktop' : ''}`}><table className="dt"><thead><tr>{cols.map(c => <th key={c.key} className={c.align}>{c.header}</th>)}</tr></thead>
      <tbody>{rows.map(r => <tr key={rowKey(r)} data-testid={rowTestId} data-row-id={rowKey(r)} className={onRowClick ? 'clickable' : undefined} onClick={onRowClick ? () => onRowClick(r) : undefined} tabIndex={onRowClick ? 0 : undefined} onKeyDown={onRowClick ? e => { if (e.key === 'Enter') onRowClick(r); } : undefined}>{cols.map(c => <td key={c.key} className={c.align}>{c.render(r)}</td>)}</tr>)}</tbody></table></div>
    {mobile && <div className="mobile-cards">{rows.map(r => <div key={rowKey(r)} className="card" data-row-id={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined}>{mobile(r)}</div>)}</div>}
  </div>;
}
export function Timeline({ items, testId }: { items: { key: string; date: string; icon: string; text: React.ReactNode }[] } & TI) {
  return <ul className="timeline" data-testid={testId}>{items.map(i => <li key={i.key}><span className="date">{i.date}</span><span aria-hidden>{i.icon}</span><span>{i.text}</span></li>)}</ul>;
}
export function DiffField({ label, aiValue, value, onChange, testId, error, required, type = 'text', options }: { label: string; aiValue: string; value: string; onChange: (v: string) => void; error?: string | null; required?: boolean; type?: 'text' | 'date' | 'select'; options?: string[] } & TI) {
  const id = useId();
  const changed = value !== aiValue;
  return <div className="diff" data-testid={testId} data-field={label} data-changed={changed ? 'true' : 'false'}>
    <div className="row" style={{ justifyContent: 'space-between' }}><label htmlFor={id} style={{ fontSize: 13, fontWeight: 600 }}>{label}{required && ' *'}</label>{changed && <Tag>수정됨</Tag>}</div>
    <div className="ai-val">AI 제안: {aiValue || '—'}</div>
    {type === 'select' ? <select id={id} className="select" value={value} onChange={e => onChange(e.target.value)} aria-invalid={error ? true : undefined}><option value="">선택</option>{options!.map(o => <option key={o} value={o}>{o}</option>)}</select>
      : <input id={id} className="input" type={type} value={value} onChange={e => onChange(e.target.value)} aria-invalid={error ? true : undefined} />}
    {error && <span className="field-error" role="alert">{error}</span>}
  </div>;
}
export function Modal({ title, children, actions, testId, onClose }: { title: string; children: React.ReactNode; actions: React.ReactNode; onClose: () => void } & TI) {
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);
  return <div className="modal-back" onClick={onClose}><div className="modal" role="dialog" aria-modal="true" aria-label={title} data-testid={testId} onClick={e => e.stopPropagation()}><h2>{title}</h2>{children}<div className="actions">{actions}</div></div></div>;
}
export function Toast({ message, testId, onDone }: { message: string; onDone: () => void } & TI) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [message, onDone]);
  return <div className="toast" role="status" data-testid={testId}>{message}</div>;
}
export function ErrorBanner({ message, tone = 'error', onRetry, testId }: { message: string; tone?: 'error' | 'warning' | 'info'; onRetry?: () => void } & TI) {
  return <div className={`banner ${tone}`} role={tone === 'error' ? 'alert' : 'status'} data-testid={testId}><span>{message}</span>{onRetry && <Button variant="secondary" small onClick={onRetry} testId={testId ? `${testId}-RETRY` : undefined}>다시 시도</Button>}</div>;
}
export function FieldError({ message, testId }: { message: string } & TI) { return <span className="field-error" role="alert" data-testid={testId}>{message}</span>; }
export function EmptyState({ message, icon = '○', action, testId }: { message: string; icon?: string; action?: React.ReactNode } & TI) {
  return <div className="empty" data-testid={testId}><div className="icon" aria-hidden>{icon}</div><div>{message}</div>{action && <div style={{ marginTop: 16 }}>{action}</div>}</div>;
}
export function Skeleton({ height = 80, count = 3 }: { height?: number; count?: number }) {
  return <div className="stack" data-state="loading" aria-busy="true">{Array.from({ length: count }, (_, i) => <div key={i} className="skeleton" style={{ height }} />)}</div>;
}
