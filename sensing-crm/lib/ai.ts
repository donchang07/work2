import { ruleExtract, ruleSummary, type Extracted } from './domain/extract';
import { COMPETITORS, PRODUCT_FAMILIES } from './domain/types';
import { templateExplanation, type Rec } from './domain/nba';

export type AiMode = 'live' | 'mock' | 'fail' | 'off';
const g = globalThis as unknown as { __aiMode?: AiMode };
export function setAiMode(m: AiMode | undefined) { g.__aiMode = m; }
export function aiMode(): AiMode {
  if (g.__aiMode) return g.__aiMode;
  const env = process.env.AI_MODE as AiMode | undefined;
  if (env && ['live', 'mock', 'fail', 'off'].includes(env)) return env;
  return process.env.ANTHROPIC_API_KEY ? 'live' : 'mock';
}
export function aiStatusLabel(): string {
  const m = aiMode();
  return m === 'live' ? 'AI: 연결됨(Claude)' : m === 'mock' ? 'AI: 모의 응답' : 'AI: 꺼짐(규칙 기반)';
}
const MODEL = () => process.env.AI_MODEL || 'claude-sonnet-5-5';

async function callClaude(system: string, user: string, maxTokens = 800): Promise<string> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 10_000, maxRetries: 0 });
  const res = await client.messages.create({ model: MODEL(), max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] });
  return res.content.map(c => (c.type === 'text' ? c.text : '')).join('');
}
function withTimeout<T>(p: Promise<T>, ms = 10_000): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

export interface ExtractResult extends Extracted { method: 'claude' | 'rule'; confidence: number; failed: boolean }

/** AI-1 미팅 메모 구조화 */
export async function extractNote(note: string, accountName: string): Promise<ExtractResult> {
  const mode = aiMode();
  const fallback = (failed: boolean): ExtractResult => ({ ...ruleExtract(note), method: 'rule', confidence: 0.5, failed });
  if (mode === 'off') return fallback(false);
  if (mode === 'fail') return fallback(true);
  if (mode === 'mock') return { ...ruleExtract(note), method: 'claude', confidence: 0.9, failed: false };
  try {
    const text = await withTimeout(callClaude(
      `당신은 제약·바이오 영업 CRM 비서입니다. 미팅 메모에서 정보를 추출해 JSON만 출력합니다. 제품군은 다음 중에서만 고릅니다: ${PRODUCT_FAMILIES.join(', ')}. 경쟁사는 다음 중에서만 고릅니다: ${COMPETITORS.join(', ')}.`,
      `고객: ${accountName}\n메모:\n${note}\n\n다음 키를 가진 JSON 하나만 출력하세요: needs(string|null), products(string[]), competitors(string[]), complaints(string|null), next_step(string|null), next_contact_date("YYYY-MM-DD"|null), sentiment("긍정"|"중립"|"부정"), confidence(0~1).`));
    const j = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const ok = ['긍정', '중립', '부정'].includes(j.sentiment) && Array.isArray(j.products) && Array.isArray(j.competitors);
    if (!ok) throw new Error('schema');
    return {
      needs: j.needs ?? null, products: j.products.filter((p: string) => PRODUCT_FAMILIES.includes(p)), competitors: j.competitors.filter((c: string) => COMPETITORS.includes(c)),
      complaints: j.complaints ?? null, next_step: j.next_step ?? null, next_contact_date: /^\d{4}-\d{2}-\d{2}$/.test(j.next_contact_date ?? '') ? j.next_contact_date : null,
      sentiment: j.sentiment, method: 'claude', confidence: Math.min(1, Math.max(0, Number(j.confidence) || 0.8)), failed: false,
    };
  } catch (e) {
    console.error('[ai] extract failed:', (e as Error).message);
    return fallback(true);
  }
}

/** AI-2 신호 요약 */
export async function summarize(title: string, body: string): Promise<{ text: string; method: 'ai' | 'rule' }> {
  const mode = aiMode();
  if (mode === 'off' || mode === 'fail') return { text: ruleSummary(title, body), method: 'rule' };
  if (mode === 'mock') {
    const ss = body.split(/(?<=다\.)\s*/).filter(Boolean).slice(0, 3).map(s => '· ' + (s.length > 60 ? s.slice(0, 59) + '…' : s));
    return { text: ss.join('\n'), method: 'ai' };
  }
  try {
    const t = await withTimeout(callClaude('제약·바이오 영업 담당자를 위한 시장 신호 요약가입니다. 3줄, 각 줄 60자 이내, 각 줄은 "· "로 시작합니다. 요약만 출력합니다.', `제목: ${title}\n본문: ${body}`, 300));
    return { text: t.trim().split('\n').slice(0, 3).join('\n'), method: 'ai' };
  } catch { return { text: ruleSummary(title, body), method: 'rule' }; }
}

/** AI-3 추천 근거 설명 */
export async function explain(rec: Rec, accountName: string): Promise<{ text: string; method: 'ai' | 'rule' }> {
  const mode = aiMode();
  if (mode !== 'live') return { text: templateExplanation(rec), method: mode === 'mock' ? 'ai' : 'rule' };
  try {
    const t = await withTimeout(callClaude('영업 코치입니다. 1~2문장 한국어로 왜 이 행동을 해야 하는지 설명만 출력합니다.', `고객: ${accountName}\n행동: ${rec.action_label}\n제품군: ${rec.product_family}\n채널: ${rec.channel}\n기한: ${rec.due_date}\n근거: ${rec.basis_text}`, 200));
    return { text: t.trim(), method: 'ai' };
  } catch { return { text: templateExplanation(rec), method: 'rule' }; }
}
