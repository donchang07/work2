import type { Account, Activity, Alias, Dataset, FeedItem, Lead, Order, Signal } from './types';
import { COMPETITORS, MODALITY_PRODUCTS } from './types';
import { mulberry32, keyed, int, pick, type Rng } from '../rng';
import { addDays, isoAt, monthOf } from '../time';
import { matchOrg } from './names';

// [이름, 영문, 약칭, 세그먼트, 담당(1=kam1,2=kam2,3=admin), 정답 이탈]
const ACCOUNTS: [string, string, string, string, number, number][] = [
  ['송도바이오로직스', 'Songdo Biologics', 'SDBL', 'CDMO', 1, 0],
  ['해오름바이오솔루션', 'Haeorum Bio Solutions', 'HRBS', 'CDMO', 1, 1],
  ['미래CDMO', 'Mirae CDMO', 'MRC', 'CDMO', 1, 0],
  ['인천바이오팜', 'Incheon Biopharm', 'ICBP', 'CDMO', 1, 0],
  ['한빛셀테라퓨틱스', 'Hanbit Cell Therapeutics', 'HBCT', '바이오텍', 1, 0],
  ['누리진바이오', 'Nurigene Bio', 'NRGB', '바이오텍', 1, 0],
  ['온새미로바이오', 'Onsaemiro Bio', 'OSMB', '바이오텍', 1, 0],
  ['별빛바이오', 'Byeolbit Bio', 'BBB', '바이오텍', 1, 0],
  ['가람제약', 'Garam Pharm', 'GRP', '제약', 1, 1],
  ['보람약품', 'Boram Pharmaceutical', 'BRP', '제약', 1, 0],
  ['한결제약', 'Hangyeol Pharm', 'HGP', '제약', 1, 0],
  ['서울바이오연구원', 'Seoul Bio Institute', 'SBI', '대학·연구소', 1, 0],
  ['청라바이오텍', 'Cheongna Biotech', 'CNBT', 'CDMO', 2, 0],
  ['아라바이오프로세스', 'Ara Bioprocess', 'ARBP', 'CDMO', 2, 1],
  ['다온항체연구소', 'Daon Antibody Lab', 'DAL', '바이오텍', 2, 0],
  ['이음유전자', 'Ieum Genetics', 'IEG', '바이오텍', 2, 0],
  ['세움RNA', 'Seum RNA', 'SRNA', '바이오텍', 2, 0],
  ['초록면역', 'Chorok Immune', 'CRI', '바이오텍', 2, 0],
  ['새솔파마', 'Saesol Pharma', 'SSP', '제약', 2, 0],
  ['늘봄제약', 'Neulbom Pharm', 'NBP', '제약', 2, 1],
  ['단비약품', 'Danbi Pharmaceutical', 'DBP', '제약', 2, 0],
  ['한국첨단의생명대학교', 'Korea Advanced Biomedical University', 'KABU', '대학·연구소', 2, 0],
  ['중앙생명과학연구소', 'Central Life Science Institute', 'CLSI', '대학·연구소', 2, 0],
  ['미르의과학원', 'Mir Medical Science Institute', 'MMSI', '대학·연구소', 2, 0],
  ['은하반도체', 'Eunha Semiconductor', 'EHS', '반도체·배터리', 3, 0],
  ['빛길소재', 'Bitgil Materials', 'BGM', '반도체·배터리', 3, 1],
  ['큰별배터리', 'Keunbyeol Battery', 'KBB', '반도체·배터리', 3, 0],
  ['온누리케미칼', 'Onnuri Chemical', 'ONC', '반도체·배터리', 3, 0],
  ['태솔에너지', 'Taesol Energy', 'TSE', '반도체·배터리', 3, 1],
  ['하람디스플레이소재', 'Haram Display Materials', 'HDM', '반도체·배터리', 3, 0],
];
export const NO_ORDER_ACCOUNT = '미르의과학원';

const SEG_FAMILIES: Record<string, string[]> = {
  CDMO: ['세포배양 배지', '일회용 바이오리액터 백', '크로마토그래피 레진'],
  바이오텍: ['세포치료 배지', '효소·정제 시약', '세포배양 배지'],
  제약: ['크로마토그래피 레진', '질량분석기', '실험실 소모품'],
  '대학·연구소': ['실험실 소모품', '질량분석기', '효소·정제 시약'],
  '반도체·배터리': ['전자현미경', '분광 분석기', '실험실 소모품'],
};
const SEG_BASE: Record<string, [number, number]> = { CDMO: [300, 800], 바이오텍: [50, 200], 제약: [100, 300], '대학·연구소': [20, 80], '반도체·배터리': [50, 200] };
const CONTACTS = ['공정개발팀 김 팀장', '구매팀 이 과장', '품질관리팀 박 부장', '연구소 최 책임', '생산본부 정 상무', '분석팀 윤 선임'];
const NEEDS = ['신규 생산 라인용 배지 공급 검토', '정제 공정 수율 개선 상담', '분석 장비 교체 일정 논의', '연간 소모품 단가 재협상 요청', '세포치료제 공정 자동화 검토', '신규 과제용 장비 견적 요청', '공급 안정성 확인 요청'];
const NEXT_STEPS = ['기술 자료와 견적서를 송부한다', '현장 데모 일정을 잡는다', '샘플을 제공하고 평가 결과를 받는다', '구매 담당자와 계약 조건을 협의한다', '응용 엔지니어 방문을 조율한다'];
const COMPLAINTS = ['납기 지연이 반복되어 불만을 표시함', '가격 인상에 대한 불만을 제기함', '기술 지원 응답이 느리다고 지적함'];
export const DEGRADE = {
  missing: [0.35, 0.05], competitor: [0.5, 0.05], late: [0.4, 0.05], unresolved: [0.3, 0.05], duplicate: [0.1, 0.01], unverified: [0.6, 0.1],
} as const;
export const p = (k: keyof typeof DEGRADE, r: number) => DEGRADE[k][0] * (1 - r) + DEGRADE[k][1] * r;

function noteText(a: { contact: string; needs: string; competitors: string[]; complaint: string | null; sentiment: string; next_step: string; next_contact_date: string | null; products: string[] }) {
  const parts = [`${a.contact} 미팅.`, `${a.needs}.`, `관심 제품은 ${a.products.join(', ')}.`];
  if (a.competitors.length) parts.push(`${a.competitors.join(', ')} 제품과 비교 평가 중이라고 언급함.`);
  if (a.complaint) parts.push(`${a.complaint}.`);
  parts.push(a.sentiment === '긍정' ? '전반적으로 반응이 좋았음.' : a.sentiment === '부정' ? '전반적으로 반응이 좋지 않았음.' : '반응은 무난했음.');
  parts.push(`다음 단계: ${a.next_step}.`);
  if (a.next_contact_date) parts.push(`다음 접촉 ${a.next_contact_date} 예정.`);
  return parts.join(' ');
}

/** 정답 세계 생성 (시드 42) */
export function generateTruth(today: string, seed = 42): Dataset {
  const rng: Rng = mulberry32(seed);
  const users = [
    { id: 1, email: 'kam1@demo.local', name: '김하늘', role: 'kam' as const },
    { id: 2, email: 'kam2@demo.local', name: '이바다', role: 'kam' as const },
    { id: 3, email: 'admin@demo.local', name: '박기획', role: 'admin' as const },
  ];
  const accounts: Account[] = []; const aliases: Alias[] = []; const orders: Order[] = []; const activities: Activity[] = []; const signals: Signal[] = [];
  let actId = 1, sigId = 1;
  ACCOUNTS.forEach(([name, en, abbr, segment, owner, churn], i) => {
    const id = i + 1;
    accounts.push({ id, name, segment, owner_user_id: owner, status: 'active', merged_into_id: null, truth_churn: churn, truth_next_action: null });
    aliases.push({ account_id: id, alias: en }, { account_id: id, alias: abbr });
    const fams = SEG_FAMILIES[segment];
    if (name !== NO_ORDER_ACCOUNT) {
      const [lo, hi] = SEG_BASE[segment];
      const base = int(rng, lo, hi) * 1_000_000;
      for (let b = 11; b >= 0; b--) {
        const month = monthOf(today, b);
        const trend = churn && b <= 2 ? 0.7 : 1 + (11 - b) * 0.005;
        for (const [k, fam] of fams.slice(0, 2).entries()) {
          const share = k === 0 ? 0.65 : 0.35;
          orders.push({ account_id: id, product_family: fam, order_month: month, amount_krw: Math.round(base * share * trend * (0.95 + rng() * 0.1)) });
        }
      }
    }
    // 활동
    const n = churn ? 5 : int(rng, 3, 5);
    const dates: number[] = churn ? [40, 62, 85, 120, 160] : [int(rng, 3, 20), int(rng, 30, 60), int(rng, 70, 110), int(rng, 120, 170), 175].slice(0, n);
    const compSlots = churn ? new Set([0, 1, 2]) : (i % 5 === 2 ? new Set([0]) : new Set<number>());
    const complaintSlots = churn ? new Set([0, 1]) : new Set<number>();
    dates.forEach((ago, k) => {
      const meeting = addDays(today, -ago);
      const competitors = compSlots.has(k) ? [COMPETITORS[(i + k) % COMPETITORS.length]] : [];
      const complaint = complaintSlots.has(k) ? COMPLAINTS[(i + k) % COMPLAINTS.length] : null;
      const sentiment = complaint ? '부정' : churn ? '중립' : (rng() < 0.6 ? '긍정' : '중립');
      const nextContact = k === 0 && !churn && i % 3 === 0 ? addDays(today, int(rng, 1, 6)) : (k === 0 ? addDays(meeting, 30) : addDays(meeting, int(rng, 14, 30)));
      const products = [pick(rng, fams)];
      const fields = { contact: pick(rng, CONTACTS), needs: pick(rng, NEEDS), competitors, complaint, sentiment, next_step: pick(rng, NEXT_STEPS), next_contact_date: nextContact, products };
      activities.push({
        id: actId++, account_id: id, author_user_id: owner, meeting_date: meeting, raw_note: noteText(fields),
        needs: fields.needs, products, competitors, complaints: complaint, next_step: fields.next_step, next_contact_date: nextContact, sentiment,
        status: 'confirmed', corrected_field_count: 0, verified: 1, recorded_at: isoAt(addDays(meeting, int(rng, 0, 1)), 18), confirmed_at: isoAt(addDays(meeting, 1), 18),
      });
    });
    // 신호 (과거 90일)
    const mk = (type: string, ago: number, st: Signal['source_type'], title: string, body: string): Signal => {
      const d = addDays(today, -ago);
      return { id: sigId++, source_type: st, source_id: `${st}-${id}-${type}-${ago}`, raw_org_name: name, account_id: id, signal_type: type, title, body, url: `https://example.com/${st}/${id}-${ago}`, modality: null, stage: null, budget_krw: null, published_at: isoAt(d, 8), collected_at: isoAt(d, 9), summary: '', summary_method: 'rule' };
    };
    if (churn) {
      signals.push(mk('경쟁사평가', 25, 'news', `${name}, 경쟁사 배지 공급 평가 착수`, `${name}이(가) 주요 원부자재 공급처 다변화를 위해 경쟁사 제품 평가에 착수한 것으로 알려졌다. 업계에서는 비용 절감과 공급망 안정화가 배경이라고 본다.`));
      signals.push(mk('국산화', 55, 'news', `${name}, 국산 원부자재 실증 과제 참여`, `${name}이(가) 정부의 바이오 원부자재 국산화 실증 과제에 참여한다고 밝혔다. 과제 기간 동안 국산 제품을 공정에 시험 적용할 계획이다.`));
    }
    if (i % 4 === 0) signals.push(mk('증설', int(rng, 5, 25), 'disclosure', `${name}, 신규 생산시설 증설 결정`, `${name}이(가) 신규 생산시설 증설을 위한 투자를 결정했다고 공시했다. 증설이 끝나면 생산능력이 크게 늘어날 전망이다.`));
    if (i % 4 === 1) signals.push(mk('수주', int(rng, 35, 80), 'disclosure', `${name}, 대형 위탁생산 계약 체결`, `${name}이(가) 해외 제약사와 다년간의 위탁생산 계약을 체결했다고 공시했다.`));
    if (i % 6 === 3) signals.push(mk('인사', int(rng, 10, 70), 'news', `${name}, 생산 부문 신임 대표 선임`, `${name}이(가) 생산 부문을 총괄할 신임 대표를 선임했다.`));
  });
  return { users, accounts, aliases, orders, activities, signals, leads: [], feed: [] };
}

/** 임상·과제 리드 원천과 오늘자 피드 */
export function generatePipeline(ds: Dataset, today: string): { history: FeedItem[]; todayItems: FeedItem[] } {
  const acc = (n: string) => ds.accounts.find(a => a.name === n)!;
  const clinical = (sid: string, org: string, modality: string, stage: string, ago: number): FeedItem => ({ source_type: 'clinical', source_id: sid, org_name: org, type: '임상', title: `${org} ${modality} 후보물질 ${stage} 임상시험 승인`, body: `${org}의 ${modality} 후보물질에 대한 ${stage} 임상시험계획이 승인되었다. 공정 개발과 스케일업 수요가 예상된다.`, url: `https://example.com/clinical/${sid}`, published_at: isoAt(addDays(today, -ago), 10), modality, stage, budget_krw: null });
  const ntis = (sid: string, org: string, modality: string, budget: number, ago: number): FeedItem => ({ source_type: 'ntis', source_id: sid, org_name: org, type: '과제', title: `${org} 국가 연구과제 선정 (${modality})`, body: `${org}이(가) ${modality} 분야 국가 연구개발 과제에 선정되었다. 총 연구비는 ${(budget / 1e8).toFixed(0)}억 원 규모다.`, url: `https://example.com/ntis/${sid}`, published_at: isoAt(addDays(today, -ago), 11), modality, stage: null, budget_krw: budget });
  const news = (sid: string, org: string, type: string, title: string, body: string): FeedItem => ({ source_type: type === '증설' || type === '수주' || type === '공시' ? 'disclosure' : 'news', source_id: sid, org_name: org, type, title, body, url: `https://example.com/feed/${sid}`, published_at: isoAt(today, 7) });
  const history: FeedItem[] = [
    clinical('clin-h1', acc('한빛셀테라퓨틱스').name, '세포·유전자치료', '1상', 30),
    clinical('clin-h2', acc('세움RNA').name, 'mRNA·핵산', '2상', 45),
    ntis('ntis-h1', acc('중앙생명과학연구소').name, '저분자', 1_200_000_000, 25),
    ntis('ntis-h2', acc('큰별배터리').name, '소재·배터리', 3_000_000_000, 40),
    clinical('clin-h3', '다온항체연구센터', '항체', '1상', 12),
    clinical('clin-h4', '새봄바이오', '백신', '1상', 8),
    ntis('ntis-h3', '한국바이오공학원', '기타', 800_000_000, 6),
    clinical('clin-h5', acc('누리진바이오').name, '항체', '3상', 4),
  ];
  const todayItems: FeedItem[] = [
    news('today-1', '송도바이오로직스', '증설', '송도바이오로직스, 제4 생산동 착공', '송도바이오로직스가 제4 생산동 착공식을 열었다. 완공 후 연간 생산능력이 크게 늘어난다.'),
    news('today-2', '가람제약', '경쟁사평가', '가람제약, 원부자재 공급사 재선정 검토', '가람제약이 주요 원부자재 공급사를 재선정하는 절차에 들어갔다. 가격과 납기 안정성을 중점적으로 본다.'),
    news('today-3', '누리진바이오', '인사', '누리진바이오, 신임 CTO 영입', '누리진바이오가 글로벌 제약사 출신 신임 최고기술책임자를 영입했다.'),
    news('today-4', '청라바이오텍', '수주', '청라바이오텍, 항체의약품 위탁생산 수주', '청라바이오텍이 해외 바이오텍과 항체의약품 위탁생산 계약을 맺었다.'),
    news('today-5', '은하반도체', '공시', '은하반도체, 분석센터 신설', '은하반도체가 차세대 공정 분석센터를 신설한다고 공시했다.'),
    news('today-6', '해오름바이오', '국산화', '해오름바이오, 국산 배지 시험 도입', '해오름바이오가 국산 세포배양 배지를 일부 공정에 시험 도입한다.'),
    news('today-7', '아라바이오프로세스', '경쟁사평가', '아라바이오프로세스, 경쟁사 레진 비교 평가', '아라바이오프로세스가 정제 공정용 레진을 경쟁사 제품과 비교 평가 중이다.'),
    news('today-8', 'Seum RNA', '증설', 'Seum RNA, mRNA 생산설비 확충', 'Seum RNA가 mRNA 생산설비 확충 계획을 발표했다.'),
    news('today-9', '보람약품', '공시', '보람약품, 분기 실적 공시', '보람약품이 분기 실적을 공시했다. 매출이 전년 대비 늘었다.'),
    news('today-10', '단비약품', '인사', '단비약품, 품질본부장 교체', '단비약품이 품질본부장을 교체했다.'),
    news('today-11', '빛길소재', '국산화', '빛길소재, 국산 분석장비 도입 협약', '빛길소재가 국산 분석장비 도입 협약을 체결했다.'),
    clinical('clin-t1', '이음유전자', '세포·유전자치료', '1상', 0),
    clinical('clin-t2', '다온 항체연구원', '항체', '2상', 0),
    ntis('ntis-t1', '서울바이오연구원', '기타', 600_000_000, 0),
    ntis('ntis-t2', '미래소재연구원', '소재·배터리', 2_000_000_000, 0),
  ];
  return { history, todayItems };
}

/** 피드 항목 → 신호 (해소 포함) */
export function feedToSignal(item: FeedItem, id: number, ds: Pick<Dataset, 'accounts' | 'aliases'>, collectedAt: string, summary: { text: string; method: 'ai' | 'rule' }): Signal {
  const m = matchOrg(item.org_name, ds.accounts, ds.aliases);
  return {
    id, source_type: item.source_type, source_id: item.source_id, raw_org_name: item.org_name, account_id: m.exact ? m.account_id : null,
    signal_type: item.type, title: item.title, body: item.body, url: item.url, modality: item.modality ?? null, stage: item.stage ?? null, budget_krw: item.budget_krw ?? null,
    published_at: item.published_at, collected_at: collectedAt, summary: summary.text, summary_method: summary.method,
  };
}

/** 임상·과제 신호 → 리드 (FR-016) */
export function signalToLead(sig: Signal, id: number, ds: Pick<Dataset, 'accounts' | 'aliases'>, adminId: number, createdAt: string): Lead {
  const m = matchOrg(sig.raw_org_name, ds.accounts, ds.aliases);
  const owner = m.account_id ? ds.accounts.find(a => a.id === m.account_id)!.owner_user_id : (m.candidates[0] ? ds.accounts.find(a => a.id === m.candidates[0].account_id)!.owner_user_id : adminId);
  const fields = [sig.modality, sig.stage ?? (sig.source_type === 'ntis' ? 'n/a' : null), sig.budget_krw ?? (sig.source_type === 'clinical' ? 1 : null)];
  const completeness = fields.filter(x => x !== null).length / fields.length;
  return {
    id, signal_id: sig.id, org_name: sig.raw_org_name, matched_account_id: m.status === 'auto' ? m.account_id : null, match_score: m.score, match_status: m.status,
    candidate_ids: m.candidates.map(c => c.account_id), modality: sig.modality, stage: sig.stage, budget_krw: sig.budget_krw,
    recommended_products: MODALITY_PRODUCTS[sig.modality ?? '기타'] ?? MODALITY_PRODUCTS['기타'], confidence: Math.round((m.score * 0.7 + completeness * 0.3) * 100) / 100,
    status: 'pending', reject_reason: null, assignee_user_id: owner, decided_by: null, decided_at: null, created_at: createdAt,
  };
}

/** 11.9 열화 — 공통 난수(항목 키 고정)로 r 증가 시 열화 집합이 단조 감소 */
export function degrade(truth: Dataset, r: number, seed = 42, opts: { forceDup?: number[] } = {}): Dataset {
  const u = (key: string) => keyed(seed, key);
  const accounts: Account[] = truth.accounts.map(a => ({ ...a, primary_id: a.id }));
  const orders = truth.orders.map(o => ({ ...o }));
  const activities: Activity[] = truth.activities.map(a => {
    const x: Activity = { ...a, products: a.products ? [...a.products] : null, competitors: a.competitors ? [...a.competitors] : null };
    for (const f of ['needs', 'next_step', 'sentiment', 'next_contact_date', 'complaints'] as const) {
      if (u(`miss:${a.id}:${f}`) < p('missing', r)) (x as unknown as Record<string, unknown>)[f] = null;
    }
    if (u(`miss:${a.id}:competitors`) < p('missing', r)) x.competitors = null;
    else if ((x.competitors?.length ?? 0) > 0 && u(`comp:${a.id}`) < p('competitor', r)) x.competitors = [];
    if (u(`late:${a.id}`) < p('late', r)) x.recorded_at = isoAt(addDays(a.meeting_date, 3 + Math.floor(u(`lated:${a.id}`) * 7)), 18);
    if (u(`unver:${a.id}`) < p('unverified', r)) { x.status = 'draft'; x.verified = 0; x.confirmed_at = null; }
    return x;
  });
  const signals: Signal[] = truth.signals.map(s => {
    if ((s.source_type === 'disclosure' || s.source_type === 'news') && s.account_id && u(`unres:${s.id}`) < p('unresolved', r)) {
      const acc = truth.accounts.find(a => a.id === s.account_id)!;
      return { ...s, account_id: null, raw_org_name: variantName(acc.name) };
    }
    return { ...s };
  });
  let dupId = 1000;
  for (const a of truth.accounts) {
    if (u(`dup:${a.id}`) < p('duplicate', r) || opts.forceDup?.includes(a.id)) {
      const id = dupId++;
      accounts.push({ ...a, id, name: `${a.name} 구매본부`, truth_churn: a.truth_churn, primary_id: a.id });
      activities.filter(x => x.account_id === a.id).forEach((x, k) => { if (k % 2 === 0) x.account_id = id; });
      orders.filter(o => o.account_id === a.id).forEach(o => { if (o.order_month.endsWith('1') || o.order_month.endsWith('3') || o.order_month.endsWith('5') || o.order_month.endsWith('7') || o.order_month.endsWith('9')) o.account_id = id; });
    }
  }
  return { ...truth, accounts, orders, activities, signals, leads: truth.leads.map(l => ({ ...l })) };
}
export function variantName(name: string): string { return name.length > 5 ? name.slice(0, name.length - 2) : name + '사'; }
