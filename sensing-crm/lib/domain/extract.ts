import { COMPETITORS, PRODUCT_FAMILIES } from './types';

export interface Extracted { needs: string | null; products: string[]; competitors: string[]; complaints: string | null; next_step: string | null; next_contact_date: string | null; sentiment: '긍정' | '중립' | '부정' }

const sentences = (t: string) => t.split(/(?<=[.!?。])\s+|\n+/).map(s => s.trim()).filter(Boolean);
const strip = (s: string) => s.replace(/[.。]\s*$/, '').trim();

/** 규칙 기반 추출기 (AI-1 대체) */
export function ruleExtract(note: string): Extracted {
  const ss = sentences(note);
  const products = PRODUCT_FAMILIES.filter(p => note.includes(p));
  const competitors = COMPETITORS.filter(c => note.includes(c));
  const complaintS = ss.find(s => /불만|지적|지연|항의|문제/.test(s));
  const nextS = ss.find(s => /다음 단계|예정|검토하기로|하기로/.test(s) && !/다음 접촉/.test(s));
  const date = note.match(/다음 접촉\s*(\d{4}-\d{2}-\d{2})/)?.[1] ?? note.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
  const neg = /좋지 않|부정적|불만|실망|어렵다/.test(note), pos = /좋았|긍정|만족|호의/.test(note);
  const needsS = ss.find(s => !/미팅\.?$/.test(s) && !/관심 제품|다음 단계|다음 접촉|반응/.test(s) && s !== complaintS);
  return {
    needs: needsS ? strip(needsS) : null,
    products, competitors,
    complaints: complaintS ? strip(complaintS) : null,
    next_step: nextS ? strip(nextS.replace(/^다음 단계\s*[:：]\s*/, '')) : null,
    next_contact_date: date,
    sentiment: neg ? '부정' : pos ? '긍정' : '중립',
  };
}

export function ruleSummary(title: string, body: string): string {
  const t = body.replace(/\s+/g, ' ').trim();
  return t.length > 120 ? t.slice(0, 120) + '…' : t;
}
