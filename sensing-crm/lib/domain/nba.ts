import type { Activity, Lead, Order, Signal } from './types';
import { MODALITY_PRODUCTS } from './types';
import { addDays, daysBetween } from '../time';

export interface Rec { action_type: string; action_label: string; product_family: string; channel: string; due_date: string; priority: number; basis_signal_ids: number[]; basis_text: string }
export interface NbaInput { grade: '고' | '중' | '저'; orders: Order[]; activities: Activity[]; signals: Signal[]; leads: Lead[]; today: string }

export const ACTION_LABELS: Record<string, string> = {
  exec_review: '경영진 리뷰 미팅·장기 공급계약 제안',
  tech_comparison: '비교 기술자료 전달·기술 세미나 초청',
  supply_proposal: '증설 라인 소모품 공급 제안',
  follow_up: '예정 후속 연락',
  process_dev: '공정개발 지원 제안',
  equipment_demo: '장비 데모 제안',
};

function topFamily(orders: Order[]): string {
  const m = new Map<string, number>();
  for (const o of orders) m.set(o.product_family, (m.get(o.product_family) ?? 0) + o.amount_krw);
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '실험실 소모품';
}

/** 11.7 표 A — 조건 충족 행동을 우선순위순으로 최대 3건 */
export function recommend({ grade, orders, activities, signals, leads, today }: NbaInput): Rec[] {
  const out: Rec[] = [];
  const confirmed = activities.filter(a => a.status === 'confirmed').sort((a, b) => b.meeting_date.localeCompare(a.meeting_date));
  if (grade === '고') {
    out.push({ action_type: 'exec_review', action_label: ACTION_LABELS.exec_review, product_family: topFamily(orders), channel: '방문', due_date: addDays(today, 3), priority: 1, basis_signal_ids: [], basis_text: '이탈위험 등급 고' });
  }
  const comp = confirmed.filter(a => a.meeting_date >= addDays(today, -90) && (a.competitors?.length ?? 0) > 0);
  if (comp.length) {
    const fam = comp[0].products?.[0] ?? topFamily(orders);
    out.push({ action_type: 'tech_comparison', action_label: ACTION_LABELS.tech_comparison, product_family: fam, channel: '이메일', due_date: addDays(today, 7), priority: 2, basis_signal_ids: [], basis_text: `최근 90일 경쟁사 언급 ${comp.reduce((s, a) => s + (a.competitors?.length ?? 0), 0)}회 (${[...new Set(comp.flatMap(a => a.competitors ?? []))].join(', ')})` });
  }
  const exp = signals.filter(s => ['증설', '수주'].includes(s.signal_type) && s.published_at.slice(0, 10) >= addDays(today, -30)).sort((a, b) => b.published_at.localeCompare(a.published_at));
  if (exp.length) {
    out.push({ action_type: 'supply_proposal', action_label: ACTION_LABELS.supply_proposal, product_family: '세포배양 배지·일회용 백', channel: '방문', due_date: addDays(today, 7), priority: 3, basis_signal_ids: exp.map(s => s.id), basis_text: exp[0].title });
  }
  const next = confirmed.find(a => a.next_contact_date && daysBetween(today, a.next_contact_date) >= 0 && daysBetween(today, a.next_contact_date) <= 7);
  if (next) {
    out.push({ action_type: 'follow_up', action_label: ACTION_LABELS.follow_up, product_family: next.products?.[0] ?? topFamily(orders), channel: '전화', due_date: next.next_contact_date!, priority: 4, basis_signal_ids: [], basis_text: `${next.meeting_date} 미팅의 다음 접촉 예정일` });
  }
  const accepted = leads.filter(l => l.status === 'accepted' && (l.decided_at ?? l.created_at).slice(0, 10) >= addDays(today, -60));
  const sigById = new Map(signals.map(s => [s.id, s]));
  const clin = accepted.find(l => sigById.get(l.signal_id)?.source_type === 'clinical');
  if (clin) {
    out.push({ action_type: 'process_dev', action_label: ACTION_LABELS.process_dev, product_family: (MODALITY_PRODUCTS[clin.modality ?? '기타'] ?? MODALITY_PRODUCTS['기타']).join('·'), channel: '이메일+방문', due_date: addDays(today, 14), priority: 5, basis_signal_ids: [clin.signal_id], basis_text: `임상 리드 수락: ${clin.modality ?? ''} ${clin.stage ?? ''}`.trim() });
  }
  const ntis = accepted.find(l => sigById.get(l.signal_id)?.source_type === 'ntis');
  if (ntis) {
    out.push({ action_type: 'equipment_demo', action_label: ACTION_LABELS.equipment_demo, product_family: (MODALITY_PRODUCTS[ntis.modality ?? '기타'] ?? MODALITY_PRODUCTS['기타']).join('·'), channel: '방문', due_date: addDays(today, 30), priority: 6, basis_signal_ids: [ntis.signal_id], basis_text: `국가 과제 리드 수락: ${ntis.modality ?? ''}`.trim() });
  }
  return out.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

export function templateExplanation(r: Rec): string {
  return `${r.basis_text} 때문에 ${r.due_date}까지 ${r.channel}로 ${r.action_label}을(를) 권합니다.`;
}
