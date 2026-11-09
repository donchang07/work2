import type { Activity, Signal } from './types';
import { daysBetween } from '../time';

export interface QualityMetrics { completeness: number; accuracy: number; timeliness: number; consistency: number; uniqueness: number; overall: number }
export interface QualityInput { activities: Activity[]; signals: Signal[]; accountCount: number; duplicateAccountCount: number }

const REQUIRED: (keyof Activity)[] = ['needs', 'next_step', 'sentiment', 'competitors', 'next_contact_date'];
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** 11.5 데이터 품질 지표 */
export function computeQuality({ activities, signals, accountCount, duplicateAccountCount }: QualityInput): QualityMetrics {
  const filled = activities.reduce((s, a) => s + REQUIRED.filter(k => { const v = a[k]; return v !== null && v !== undefined && v !== ''; }).length, 0);
  const completeness = activities.length ? filled / (activities.length * REQUIRED.length) : 1;
  const accuracy = activities.length ? activities.filter(a => a.verified === 1).length / activities.length : 1;
  const timeliness = activities.length ? activities.filter(a => daysBetween(a.meeting_date, a.recorded_at) <= 2).length / activities.length : 1;
  const named = signals.filter(s => s.source_type === 'disclosure' || s.source_type === 'news');
  const consistency = named.length ? named.filter(s => s.account_id !== null).length / named.length : 1;
  const uniqueness = accountCount ? 1 - duplicateAccountCount / accountCount : 1;
  const overall = (completeness + accuracy + timeliness + consistency + uniqueness) / 5;
  return { completeness: r3(completeness), accuracy: r3(accuracy), timeliness: r3(timeliness), consistency: r3(consistency), uniqueness: r3(uniqueness), overall: r3(overall) };
}

export function missingFields(a: Activity): string[] {
  const label: Record<string, string> = { needs: '니즈', next_step: '다음 단계', sentiment: '고객 반응', competitors: '경쟁사 언급', next_contact_date: '다음 접촉 예정일' };
  return REQUIRED.filter(k => { const v = a[k]; return v === null || v === undefined || v === ''; }).map(k => label[k as string]);
}
