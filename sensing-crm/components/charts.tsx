'use client';
import { Bar, BarChart as RBarChart, CartesianGrid, Legend, Line, LineChart as RLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['var(--primary)', 'var(--ai)', 'var(--risk-mid)', 'var(--risk-low)', 'var(--risk-high)', 'var(--text-2)'];
export function LineChart({ data, xKey, series, testId, height = 240, yDomain, label }: { data: Record<string, unknown>[]; xKey: string; series: { key: string; label: string }[]; testId?: string; height?: number; yDomain?: [number, number]; label: string }) {
  return <div data-testid={testId} data-points={data.length} role="img" aria-label={label} style={{ width: '100%', height }}>
    <ResponsiveContainer><RLineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--text-2)' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
      <YAxis domain={yDomain ?? ['auto', 'auto']} tick={{ fontSize: 12, fill: 'var(--text-2)' }} tickLine={false} axisLine={false} />
      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)' }} />
      {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
      {series.map((s, i) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />)}
    </RLineChart></ResponsiveContainer></div>;
}
export function BarChart({ data, xKey, series, testId, height = 240, label, unit }: { data: Record<string, unknown>[]; xKey: string; series: { key: string; label: string }[]; testId?: string; height?: number; label: string; unit?: string }) {
  return <div data-testid={testId} data-points={data.length} role="img" aria-label={label} style={{ width: '100%', height }}>
    <ResponsiveContainer><RBarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--text-2)' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
      <YAxis tick={{ fontSize: 12, fill: 'var(--text-2)' }} tickLine={false} axisLine={false} unit={unit} />
      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)' }} />
      {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
      {series.map((s, i) => <Bar key={s.key} dataKey={s.key} name={s.label} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} isAnimationActive={false} />)}
    </RBarChart></ResponsiveContainer></div>;
}
