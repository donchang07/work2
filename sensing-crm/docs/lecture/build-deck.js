const pptxgen = require('pptxgenjs');
const { applyTheme } = require('/root/.claude/skills/synced/473c5e6a-9821-4271-807d-8c6d94bde4ac_3427aff3-eb2f-49c9-b15d-5c8bce5a8aa3/pptx/scripts/apply_theme.js');

const THEME = {
  name: 'Sensing CRM Apple',
  headFontFace: 'Pretendard',
  bodyFontFace: 'Pretendard',
  colors: {
    dk1: '1D1D1F', lt1: 'FFFFFF', dk2: '6E6E73', lt2: 'F5F5F7',
    accent1: '0071E3', accent2: 'C00012', accent3: '8F4000', accent4: '1D7533', accent5: '6E3CBC', accent6: 'D2D2D7',
    hlink: '0071E3', folHlink: '6E3CBC',
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
pres.title = '놓친 이탈 고객, 가람제약을 되찾아라';
pres.author = '장동인';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const W = 13.333, M = 0.6;

// ---------- layouts
pres.defineSlideMaster({
  title: 'DARK', background: { color: C.text1 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', align: 'left', x: M, y: 2.3, w: W - 2 * M, h: 1.8, fontSize: 48, bold: true, color: C.background1, valign: 'bottom', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', align: 'left', x: M, y: 4.3, w: W - 2 * M, h: 1.6, fontSize: 20, color: C.accent6, valign: 'top', margin: 0 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'SECTION', background: { color: C.background2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', align: 'left', x: M, y: 2.6, w: W - 2 * M, h: 1.3, fontSize: 54, bold: true, color: C.text1, valign: 'bottom', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', align: 'left', x: M, y: 4.05, w: W - 2 * M, h: 1.0, fontSize: 22, color: C.text2, valign: 'top', margin: 0 }, text: '' } },
  ],
  slideNumber: { x: W - M - 0.6, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.text2, align: 'right' },
});
pres.defineSlideMaster({
  title: 'CONTENT', background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', align: 'left', x: M, y: 0.45, w: W - 2 * M, h: 0.85, fontSize: 34, bold: true, color: C.text1, valign: 'top', margin: 0 }, text: '' } },
    { text: { text: 'Sensing CRM · 교육용 데모 · 합성 데이터', options: { x: M, y: 6.95, w: 6, h: 0.3, fontSize: 10, color: C.text2, margin: 0 } } },
  ],
  slideNumber: { x: W - M - 0.6, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.text2, align: 'right' },
});

// ---------- helpers
let n = 0;
const id = p => `${p}-${++n}`;
const text = (s, t, o) => s.addText(t, { isTextBox: true, margin: 0, objectName: id('txt'), ...o });
const card = (s, x, y, w, h, fill = C.background2) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.18, fill: { color: fill }, line: { type: 'none' }, objectName: id('card') });
const circle = (s, x, y, d, fill, lineColor) => s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: fill ? { color: fill } : { type: 'none' }, line: lineColor ? { color: lineColor, width: 2.5 } : { type: 'none' }, objectName: id('circle') });
const numDot = (s, x, y, label, fill = C.accent1) => { circle(s, x, y, 0.5, fill); text(s, label, { x, y, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: C.background1, align: 'center', valign: 'middle' }); };
const stat = (s, x, y, w, big, label, color = C.text1, size = 54) => {
  text(s, big, { x, y, w, h: 1.0, fontSize: size, bold: true, color, valign: 'bottom' });
  text(s, label, { x, y: y + 1.08, w, h: 0.75, fontSize: 15, color: C.text2, valign: 'top' });
};
const lead = (s, t, y = 1.32) => text(s, t, { x: M, y, w: W - 2 * M, h: 0.5, fontSize: 18, color: C.text2 });
const chartText = { catAxisLabelFontFace: '+mn-lt', valAxisLabelFontFace: '+mn-lt', dataLabelFontFace: '+mn-lt', legendFontFace: '+mn-lt', titleFontFace: '+mn-lt',
  catAxisLabelColor: HEX.dk2, valAxisLabelColor: HEX.dk2, dataLabelColor: HEX.dk1, catAxisLabelFontSize: 12, valAxisLabelFontSize: 11, dataLabelFontSize: 12, legendFontSize: 12, legendColor: HEX.dk2 };

// 1. 표지
pres.addSection({ title: '시작' });
let s = pres.addSlide({ masterName: 'DARK', sectionTitle: '시작' });
s.addText('놓친 이탈 고객,\n가람제약을 되찾아라', { placeholder: 'title' });
s.addText([{ text: '자동화 · 예측 · 시뮬레이션 · 최적화로 본 제약·바이오 마켓 센싱 AI', options: { breakLine: true } }, { text: 'Sensing CRM 강의 데모 · 장동인', options: { fontSize: 16 } }], { placeholder: 'body' });
s.addNotes('오늘은 가상의 생명과학 기업 한국법인 영업 조직이 이탈 고객 한 곳을 놓쳤다가 AI로 되찾는 이야기를 따라갑니다. 문제가 무엇이었는지, 어떻게 발견했는지, 어떻게 해결했는지 순서로 보겠습니다. 모든 데이터는 합성 데이터입니다.');

// 2. 핵심 메시지
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '시작' });
s.addText('모델은 그대로였다. 정보 한 건이 판정을 바꿨다', { placeholder: 'title' });
lead(s, '오늘 시연에서 확인할 세 개의 숫자');
const kx = [M, M + 4.15, M + 8.3];
[['4 / 6', '자동화 50% 조직이 찾아낸\n실제 이탈 고객 수', C.text1], ['56 → 61', '미팅 노트 한 건 뒤 가람제약\n이탈위험 점수(중→고)', C.accent2], ['17→100%', '자동화 0%→100%일 때\n이탈 탐지 재현율', C.accent1]].forEach(([b, l, c], i) => {
  card(s, kx[i], 2.25, 3.85, 3.9);
  stat(s, kx[i] + 0.35, 2.85, 3.25, b, l, c, 46);
});
s.addNotes('결론부터 말씀드립니다. 이 세 숫자가 오늘의 전부입니다. 같은 규칙, 같은 모델에서 CRM에 들어온 정보만 달라졌을 때 무엇이 바뀌는지 보겠습니다.');

// ---------- click-step slide helper
const ROLE = { admin: ['관리자 창', C.accent5], kam: ['KAM 창', C.accent1], prep: ['준비', C.text2] };
const IW = 7.4, IH = IW / 1.6, IX = W - M - IW, IY = 1.95, LW = IX - M - 0.35;
function clickSlide({ section, title, role, path, steps, img, alt, notes, foot, extra }) {
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText(title, { placeholder: 'title' });
  const [rl, rc] = ROLE[role];
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 1.33, w: 1.3, h: 0.4, rectRadius: 0.2, fill: { color: rc }, line: { type: 'none' }, objectName: id('role') });
  text(s, rl, { x: M, y: 1.33, w: 1.3, h: 0.4, fontSize: 13, bold: true, color: C.background1, align: 'center', valign: 'middle' });
  text(s, [{ text: '메뉴  ', options: { color: C.text2 } }, { text: path, options: { bold: true, color: C.text1 } }], { x: M + 1.5, y: 1.33, w: 10, h: 0.4, fontSize: 15, valign: 'middle' });
  const top = 2.0, bottom = extra ? extra.y - 0.1 : (foot ? 5.75 : 6.55);
  const gap = Math.min(1.05, (bottom - top) / steps.length);
  steps.forEach(([act, chk], i) => {
    const y = top + i * gap;
    circle(s, M, y, 0.4, C.text1);
    text(s, String(i + 1), { x: M, y, w: 0.4, h: 0.4, fontSize: 13, bold: true, color: C.background1, align: 'center', valign: 'middle' });
    const runs = [{ text: act, options: { bold: true, color: C.text1, fontSize: 15, breakLine: !!chk } }];
    if (chk) runs.push({ text: chk, options: { color: C.text2, fontSize: 12.5 } });
    text(s, runs, { x: M + 0.55, y: y - 0.03, w: LW - 0.55, h: gap - 0.05, valign: 'top', paraSpaceAfter: 2 });
  });
  if (foot) { card(s, M, 5.85, LW, 0.75); text(s, foot, { x: M + 0.2, y: 5.85, w: LW - 0.4, h: 0.75, fontSize: 13, bold: true, color: C.text1, valign: 'middle' }); }
  if (extra) extra.draw(s);
  s.addImage({ path: 'img/' + img + '.jpg', x: IX, y: IY, w: IW, h: IH, altText: alt, objectName: id('shot') });
  s.addShape(pres.shapes.RECTANGLE, { x: IX, y: IY, w: IW, h: IH, fill: { type: 'none' }, line: { color: C.accent6, width: 1 }, objectName: id('frame') });
  text(s, '빨간 테두리 = 누를 곳 · 확인할 곳', { x: IX, y: IY + IH + 0.05, w: IW, h: 0.3, fontSize: 10, color: C.text2, align: 'right' });
  s.addNotes(notes);
  return s;
}
const MEMO = '구매팀 이 과장 미팅. 오늘 공시된 원부자재 공급사 재선정 건 확인 요청. 관심 제품은 크로마토그래피 레진, 질량분석기. 베타바이오텍 제품과 비교 평가 중이라고 언급함. 납기 지연이 반복되어 불만을 표시함. 전반적으로 반응이 좋지 않았음. 다음 단계: 구매 담당자와 계약 조건을 협의한다. 다음 접촉 YYYY-MM-DD 예정.';

// 3. 시연 준비
clickSlide({ section: '시작', title: '시연 준비: 브라우저 창 두 개, 시작 상태 확인', role: 'prep', path: '터미널 → 브라우저 → 데이터 운영',
  steps: [
    ['터미널: npm run db:seed → npm run start', '처음 한 번은 그 전에 npm run build. 접속 http://localhost:3000'],
    ['일반 창 = 관리자', 'admin@demo.local / demo1234'],
    ['시크릿 창 = KAM', 'kam1@demo.local / demo1234'],
    ['리허설 뒤에는 관리자 창 「데이터 운영」 → 「데모 데이터 초기화」 → 「초기화」', '로그인은 유지된다. KAM 창 위험 고객에서 가람제약 56점 · 중이면 준비 끝'],
  ], img: 'r0-reset-confirm', alt: '데이터 운영 화면의 데모 데이터 초기화 확인 창',
  notes: '강의 10분 전에 준비합니다. 관리자와 KAM은 보이는 메뉴와 데이터 범위가 다르므로 창을 두 개 띄웁니다. 시크릿 창을 쓰면 로그인이 섞이지 않습니다. 리허설을 했다면 반드시 초기화하고 가람제약이 56점 중인지 확인합니다.' });

// 4. 화면 지도
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '시작' });
s.addText('화면 지도: 어느 창에서 어느 메뉴를 쓰는가', { placeholder: 'title' });
lead(s, '왼쪽 메뉴만 쓰면 된다. 관리자 창에는 아래쪽 「관리자」 구역에 메뉴 두 개가 더 있다');
const mapCol = (x, w, head, color, rows) => {
  card(s, x, 2.0, w, 4.6);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.35, y: 2.25, w: 1.4, h: 0.42, rectRadius: 0.21, fill: { color }, line: { type: 'none' }, objectName: id('role') });
  text(s, head, { x: x + 0.35, y: 2.25, w: 1.4, h: 0.42, fontSize: 13, bold: true, color: C.background1, align: 'center', valign: 'middle' });
  rows.forEach(([m, d], i) => {
    const y = 2.95 + i * 0.52;
    text(s, m, { x: x + 0.35, y, w: 2.3, h: 0.45, fontSize: 15, bold: true, color: C.text1, valign: 'middle' });
    text(s, d, { x: x + 2.65, y, w: w - 2.95, h: 0.45, fontSize: 13, color: C.text2, valign: 'middle' });
  });
};
mapCol(M, 6.9, 'KAM 창', C.accent1, [['오늘의 브리핑', '단서 ① · 고객 360으로 들어가는 입구'], ['리드 인박스', '① 자동화 — 리드 수락'], ['미팅 노트', '① 자동화 — 메모 구조화·확정'], ['고객', '④ 최적화 — 가람제약 → 추천 전체 보기'], ['위험 고객', '단서 ② · ② 예측'], ['다음 행동', '④ 최적화 — 채택·거절'], ['데이터 품질', '(담당 고객 기준 값)']]);
mapCol(M + 7.2, 4.93, '관리자 창', C.accent5, [['데이터 품질', '단서 ③ · 고객명 통합'], ['품질-성과 실험실', '③ 시뮬레이션'], ['데이터 운영', '신호 수집 · 리드 변환 · 초기화']]);
s.addNotes('화면 이름이 슬라이드마다 왼쪽 위에 나옵니다. 파란 배지는 KAM 창, 보라 배지는 관리자 창입니다. 데이터 품질은 두 창 모두에 있지만, KAM 창은 담당 고객만 계산하므로 값이 다릅니다. 시연에서는 관리자 창 값을 씁니다.');

// =================================================================
// 섹션 01 (문제)
// 3. 섹션 01
pres.addSection({ title: '01 문제' });
s = pres.addSlide({ masterName: 'SECTION', sectionTitle: '01 문제' });
s.addText('01  문제', { placeholder: 'title' });
s.addText('이탈 고객이 있는데, 시스템에는 보이지 않는다', { placeholder: 'body' });
s.addNotes('첫 번째, 무엇이 문제였는지입니다.');

// 4. 시장 맥락
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '01 문제' });
s.addText('한 고객의 이탈이 곧 매출 위기인 시장', { placeholder: 'title' });
lead(s, '바이오 원부자재 시장은 고객이 집중되고, 경쟁사의 국내 생산이 늘고 있다');
[['1.63조 원', '글로벌 원부자재 4개사의\n한국 합산 매출'], ['약 80%', '그중 단일 대형 CDMO에서\n나오는 비중'], ['약 95%', '한국 바이오 원부자재의\n수입 의존도']].forEach(([b, l], i) => { card(s, kx[i], 2.25, 3.85, 2.9); stat(s, kx[i] + 0.4, 2.65, 3.1, b, l, i === 1 ? C.accent2 : C.text1, 46); });
text(s, '→ 고객 이탈 신호를 남보다 먼저 감지하는 마켓 센싱이 영업 조직의 핵심 과제', { x: M, y: 5.45, w: W - 2 * M, h: 0.5, fontSize: 18, bold: true, color: C.text1 });
text(s, '출처: 바이오북, GlobalData 발표 인용 (2026-10-08). 앱 안의 고객·주문·활동 데이터는 모두 합성 데이터', { x: M, y: 6.05, w: W - 2 * M, h: 0.35, fontSize: 11, color: C.text2 });
s.addNotes('배경입니다. 원부자재 빅4의 한국 매출 약 1조 6천억 원 가운데 80%가 한 CDMO에서 나옵니다. 머크, 사토리우스 같은 경쟁사가 국내에 생산 거점을 짓고 있어 가격·공급 경쟁도 거세집니다. 고객 한 곳의 이탈 신호를 놓치면 그대로 매출 위기입니다.');

// 5. 문제 정의
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '01 문제' });
s.addText('실제 이탈 고객 6곳 중 2곳이 보이지 않았다', { placeholder: 'title' });
lead(s, '데이터 자동화 50% 수준의 조직을 재현한 시드 데이터 기준');
const six = [['해오름바이오솔루션', 77, true], ['태솔에너지', 63, true], ['빛길소재', 62, true], ['아라바이오프로세스', 61, true], ['가람제약', 56, false], ['늘봄제약', 55, false]];
six.forEach(([name, sc, hit], i) => {
  const x = M + 0.15 + i * 2.05, y = 2.45;
  circle(s, x + 0.25, y, 1.4, hit ? C.accent1 : null, hit ? null : C.accent2);
  text(s, String(sc), { x: x + 0.25, y, w: 1.4, h: 1.4, fontSize: 30, bold: true, color: hit ? C.background1 : C.accent2, align: 'center', valign: 'middle' });
  text(s, name, { x, y: y + 1.55, w: 1.9, h: 0.4, fontSize: 14, bold: true, color: C.text1, align: 'center' });
  text(s, hit ? '고위험 탐지' : '‘중’으로 숨음', { x, y: y + 1.95, w: 1.9, h: 0.35, fontSize: 13, color: hit ? C.accent1 : C.accent2, align: 'center' });
});
card(s, M, 5.25, W - 2 * M, 1.2);
text(s, [{ text: '이번 시연의 주인공: ', options: { bold: true } }, { text: '가람제약 — 실제로는 공급사 교체를 검토 중인 이탈 고객이지만, 이탈위험 점수는 56점(중). 고위험 기준(60점)에 4점 모자라 영업의 관심 목록에서 빠져 있었다.' }],
  { x: M + 0.35, y: 5.4, w: W - 2 * M - 0.7, h: 0.9, fontSize: 16, color: C.text1, valign: 'middle' });
s.addNotes('파란 원 4곳은 시스템이 고위험으로 잡은 이탈 고객입니다. 빨간 테두리 2곳, 가람제약과 늘봄제약은 실제로 이탈 중인데 중간 등급으로 숨어 있습니다. 오늘은 가람제약을 따라갑니다.');

// 6. 왜 보이지 않나
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '01 문제' });
s.addText('더 위험한 것: 틀리지 않고, 조용히 놓친다', { placeholder: 'title' });
lead(s, '자동화 50% 조직의 이탈 예측 성과');
card(s, M, 2.25, 5.9, 3.6); stat(s, M + 0.5, 2.75, 5, '100%', '정밀도\n고위험이라고 한 고객은 모두 실제 이탈', C.accent1, 72);
card(s, M + 6.2, 2.25, 5.9, 3.6); stat(s, M + 6.7, 2.75, 5, '67%', '재현율\n실제 이탈 고객 중 찾아낸 비율 (4/6)', C.accent2, 72);
text(s, '틀린 경고가 없으니 현업은 문제를 느끼지 못한다. 놓친 고객은 경고 없이 빠져나간다.', { x: M, y: 6.1, w: W - 2 * M, h: 0.5, fontSize: 17, bold: true, color: C.text1 });
s.addNotes('여기가 핵심입니다. 데이터 품질이 낮으면 시스템이 거짓 경보를 내는 게 아닙니다. 그냥 못 봅니다. 정밀도는 100%라 현업은 시스템을 신뢰하지만, 재현율은 67%라 이탈 고객 셋 중 하나를 놓칩니다.');



// =================================================================
pres.addSection({ title: '02 발견' });
s = pres.addSlide({ masterName: 'SECTION', sectionTitle: '02 발견' });
s.addText('02  발견', { placeholder: 'title' });
s.addText('세 개의 단서가 같은 곳을 가리켰다', { placeholder: 'body' });
s.addNotes('두 번째, 이 문제를 어떻게 발견했는지입니다. 세 화면을 차례로 엽니다.');

clickSlide({ section: '02 발견', title: '단서 ① 아침 브리핑에 뜬 경쟁사 평가 신호', role: 'kam', path: '오늘의 브리핑',
  steps: [
    ['왼쪽 메뉴 「오늘의 브리핑」', '담당 고객의 오늘 신호가 카드로 모인다 (A-1)'],
    ['가람제약 카드 읽기', '「가람제약, 원부자재 공급사 재선정 검토」 · 경쟁사평가 · AI 요약'],
    ['위쪽 「고위험 고객」 타일', '1곳뿐 — 가람제약은 고위험 목록에 없다'],
  ], foot: '신호는 들어왔는데, 위험 판정은 여전히 ‘중’이다', img: 'd1-briefing', alt: '오늘의 브리핑 화면, 가람제약 카드 강조',
  notes: 'KAM이 출근하면 브리핑에 가람제약의 공급사 재선정 검토 공시가 떠 있습니다. 사람이 매일 공시를 읽지 않아도 시스템이 가져다줍니다. 그런데 위쪽 고위험 고객은 1곳뿐이고, 가람제약은 거기에 없습니다.' });

clickSlide({ section: '02 발견', title: '단서 ② 점수를 분해해 본다', role: 'kam', path: '위험 고객',
  steps: [
    ['왼쪽 메뉴 「위험 고객」', '가람제약 56점 · 중 (고위험 기준 60점)'],
    ['가람제약 행 오른쪽 끝 「근거 보기」', '요인 5개의 원값 · 정규화 · 가중치 · 기여 표'],
    ['현장 정보 두 줄을 짚는다', '경쟁사 언급 1회 +6.7 · 불만·부정 반응 1건 +7.5'],
    ['「닫기」', ''],
  ], foot: '현장에서 들은 정보 두 요인: 만점 35점 중 14점만 반영', img: 'd2b-risk-modal', alt: '가람제약 이탈위험 56점 근거 창',
  notes: '위험 고객 화면에서 가람제약의 근거 보기를 누릅니다. 주문 감소, 위협 신호처럼 시스템이 자동으로 받는 값은 잘 들어와 있습니다. 경쟁사 언급과 불만, 즉 영업 현장에서만 알 수 있는 정보가 덜 들어와 있습니다.' });

// 9. 단서2 위험 근거
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '02 발견' });
s.addText('단서 ② 분해해 보니 ‘현장 정보’가 덜 들어와 있었다', { placeholder: 'title' });
lead(s, '가람제약 이탈위험 56점의 요인별 기여 (만점 기준: 주문 35 · 공백 20 · 경쟁사 20 · 불만 15 · 위협 10)');
s.addChart(pres.charts.BAR, [{ name: '기여 점수', labels: ['주문 감소 33%', '위협 신호 2건', '접촉 공백 40일', '불만·부정 1건', '경쟁사 언급 1회'], values: [23, 10, 8.9, 7.5, 6.7] }], {
  x: M, y: 2.0, w: 7.2, h: 4.6, barDir: 'bar', chartColors: [HEX.accent1], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0',
  valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, catAxisLineShow: false, showLegend: false, barGapWidthPct: 60, catAxisOrientation: 'maxMin', ...chartText, objectName: 'chart-risk-before',
});
card(s, M + 7.6, 2.1, 4.5, 4.4);
text(s, '덜 채워진 칸', { x: M + 7.95, y: 2.35, w: 3.8, h: 0.45, fontSize: 18, bold: true, color: C.text1 });
text(s, [
  { text: '경쟁사 언급 1회', options: { bold: true, breakLine: true } }, { text: '실제로는 비교 평가가 진행 중', options: { color: C.text2, breakLine: true } },
  { text: ' ', options: { breakLine: true, fontSize: 8 } },
  { text: '불만·부정 1건', options: { bold: true, breakLine: true } }, { text: '9월 미팅의 부정 반응은 확정되지 않은 초안으로 방치', options: { color: C.text2, breakLine: true } },
  { text: ' ', options: { breakLine: true, fontSize: 8 } },
  { text: '공시·주문은 꽉 참', options: { bold: true, breakLine: true } }, { text: '자동 수집되는 데이터는 이미 반영', options: { color: C.text2 } },
], { x: M + 7.95, y: 2.9, w: 3.85, h: 3.4, fontSize: 15, color: C.text1, valign: 'top' });
s.addNotes('근거 보기를 누르면 점수가 분해됩니다. 주문 감소와 위협 신호처럼 자동으로 들어오는 데이터는 이미 다 반영돼 있습니다. 비어 있는 건 경쟁사 언급과 불만, 즉 사람이 현장에서 듣고 CRM에 적어야 하는 정보입니다.');



clickSlide({ section: '02 발견', title: '단서 ③ 데이터 품질 화면이 원인을 짚었다', role: 'admin', path: '데이터 품질',
  steps: [
    ['관리자 창 왼쪽 메뉴 「데이터 품질」', '종합 83 · 완전성 82 · 정확성 66 · 적시성 79 · 일관성 92 · 유일성 97 (%)'],
    ['가장 낮은 「정확성 66%」', '사람이 확인·확정하지 않은 초안 활동이 많다 → 부정 반응·불만이 점수에 안 들어감'],
    ['아래로 스크롤 → 오른쪽 「통합 대기열」', '“가람제약사” ↔ 가람제약 (유사도 0.96) — 다른 표기가 고객에 안 붙음'],
  ], foot: 'KAM 창의 데이터 품질은 담당 고객 기준이라 값이 다르다 (정확성 69%)', img: 'd3a-quality', alt: '데이터 품질 화면, 정확성 66% 강조',
  notes: '관리자 창의 데이터 품질 화면입니다. 정확성이 66%로 가장 낮습니다. 미팅은 했는데 기록이 확정되지 않은 채 초안으로 남아 있다는 뜻입니다. 아래 통합 대기열에는 가람제약사라는 다른 표기가 있습니다. 모델이 아니라 데이터가 문제였습니다. 참고로 KAM 창에서 같은 메뉴를 열면 담당 고객만 계산해 84, 82, 69, 83, 93, 92로 보입니다.' });

// =================================================================
pres.addSection({ title: '03 해결' });
s = pres.addSlide({ masterName: 'SECTION', sectionTitle: '03 해결' });
s.addText('03  해결', { placeholder: 'title' });
s.addText('자동화 → 예측 → 시뮬레이션 → 최적화, 클릭 순서대로', { placeholder: 'body' });
s.addNotes('세 번째, 어떻게 해결했는지입니다. 지금부터 슬라이드 순서대로 클릭하면 시연이 됩니다.');

// 12. 프레임
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '03 해결' });
s.addText('네 단계가 하나의 데이터 흐름으로 이어진다', { placeholder: 'title' });
lead(s, '앞 단계의 출력이 다음 단계의 입력이 된다');
const steps = [['자동화', 'A-1·A-2·A-5', '신호 수집, 리드 변환,\n미팅 메모 구조화,\n고객명 통합'], ['예측', 'P-2', '채워진 정보로\n이탈위험 재판정'], ['시뮬레이션', '실험실', '자동화 수준별\n성과를 비교해\n투자 근거 확보'], ['최적화', 'O-2', '고객별 다음 행동의\n우선순위 결정']];
steps.forEach(([h, tag, d], i) => {
  const x = M + i * 3.07;
  card(s, x, 2.15, 2.75, 3.95);
  numDot(s, x + 0.3, 2.45, String(i + 1));
  text(s, h, { x: x + 0.3, y: 3.1, w: 2.2, h: 0.55, fontSize: 24, bold: true, color: C.text1 });
  text(s, tag, { x: x + 0.3, y: 3.65, w: 2.2, h: 0.35, fontSize: 13, bold: true, color: C.accent1 });
  text(s, d, { x: x + 0.3, y: 4.15, w: 2.25, h: 1.7, fontSize: 15, color: C.text2, valign: 'top' });
  if (i < 3) text(s, '→', { x: x + 2.75, y: 3.7, w: 0.32, h: 0.5, fontSize: 22, bold: true, color: C.accent6, align: 'center' });
});
s.addNotes('자동화가 품질을 만들고, 그 위에서 예측하고, 시뮬레이션으로 투자를 설득하고, 최적화로 실행합니다. 지금부터 각 단계를 가람제약 한 고객으로 보여 드리겠습니다.');



clickSlide({ section: '03 해결', title: '① 자동화 1/6 · 신호를 모으고 리드로 바꾼다', role: 'admin', path: '데이터 운영',
  steps: [
    ['관리자 창 왼쪽 메뉴 「데이터 운영」', '아래쪽 「관리자」 구역에 있다'],
    ['「신호 수집 실행 (A-1) · 미수집 10건」', '토스트: 신호 10건을 수집했습니다(중복 5건 제외)'],
    ['「리드 변환 실행 (A-2) · 대상 4건」', '토스트: 리드 4건을 만들었습니다'],
    ['아래 「실행 로그」', '두 작업이 한 줄씩 기록된다'],
  ], img: 's1b-ops-collected', alt: '데이터 운영 화면, 신호 수집 뒤 리드 변환 버튼 강조',
  notes: '공시·뉴스·임상·국가과제 피드를 매일 사람이 읽는 대신, 버튼 한 번에 수집하고 중복을 거르고 고객에 연결합니다. 이어서 임상 승인과 국가 과제 신호를 영업 리드로 바꿉니다.' });

clickSlide({ section: '03 해결', title: '① 자동화 2/6 · 애매한 리드는 사람이 정한다', role: 'kam', path: '리드 인박스',
  steps: [
    ['KAM 창 왼쪽 메뉴 「리드 인박스」', '「검토 대기」 탭이 열려 있다'],
    ['맨 아래 「새봄바이오」 행의 「수락」', '후보 · 유사도 0.79 → 오류: 매칭할 고객을 선택하세요'],
    ['같은 행 「고객 선택」 → 「신규 고객으로 등록」', ''],
    ['다시 「수락」', '토스트: 리드를 수락했습니다'],
  ], foot: 'AI가 확신하지 못하면 사람에게 넘긴다', img: 's2b-leads-error', alt: '리드 인박스, 새봄바이오 행 고객 선택 오류',
  notes: 'AI가 확신하지 못하는 매칭은 사람에게 넘깁니다. 일부러 그냥 수락을 눌러 오류를 보여 준 뒤 신규 고객으로 등록합니다. 자동화의 핵심은 사람이 확정하는 지점을 설계하는 것입니다.' });

clickSlide({ section: '03 해결', title: '① 자동화 3/6 · 가람제약 미팅 노트로 들어간다', role: 'kam', path: '오늘의 브리핑 → 고객 360 → 미팅 노트',
  steps: [
    ['KAM 창 왼쪽 메뉴 「오늘의 브리핑」', '가람제약 카드를 찾는다'],
    ['카드 오른쪽 아래 「고객 360 보기」', '가람제약 고객 360: 56점 · 중, 마지막 접촉 40일'],
    ['오른쪽 위 파란 버튼 「미팅 노트 작성」', '고객이 가람제약으로 미리 선택된 미팅 노트 화면'],
  ], img: 's3b-360', alt: '가람제약 고객 360 화면, 미팅 노트 작성 버튼 강조',
  notes: '브리핑에서 바로 고객 360으로 들어갑니다. 마지막 접촉이 40일 전입니다. 오늘 구매팀을 만났다고 가정하고 미팅 노트를 씁니다.' });

clickSlide({ section: '03 해결', title: '① 자동화 4/6 · 메모를 붙여넣고 AI로 구조화', role: 'kam', path: '미팅 노트',
  steps: [
    ['「미팅일」 → 달력에서 오늘 날짜', '처음에는 비어 있다 (필수)'],
    ['「미팅 메모」에 아래 메모 붙여넣기', '마지막 날짜만 오늘+4일로 바꾼다'],
    ['「AI로 구조화」', '오른쪽에 7개 필드가 제안된다'],
  ], img: 's4b-note-filled', alt: '미팅 노트 화면, 메모 입력 후 AI로 구조화 버튼 강조',
  extra: { y: 5.05, draw: sl => { card(sl, M, 5.05, LW, 1.6); text(sl, MEMO, { x: M + 0.15, y: 5.12, w: LW - 0.3, h: 1.46, fontSize: 9.5, color: C.text1, valign: 'top' }); } },
  notes: '메모 원문: ' + MEMO + ' 실제 Claude 모드에서는 표현이 조금 다르게 추출될 수 있습니다. 그럴 때는 다음 장에서 사람이 고치면 되고, 그것이 사람이 확정한다는 장면이 됩니다.' });

clickSlide({ section: '03 해결', title: '① 자동화 5/6 · 사람이 확인하고 확정한다', role: 'kam', path: '미팅 노트',
  steps: [
    ['구조화 결과 확인', '경쟁사 언급 = 베타바이오텍 · 불만 = 납기 지연 · 고객 반응 = 부정'],
    ['「니즈」 칸 끝에 한 구절 덧붙이기', '「수정됨」 표시 = 사람이 고친 필드'],
    ['아래로 스크롤 → 「확정 저장」', '최근 기록 맨 위: 가람제약 · 확정 · 수정 필드 1'],
  ], foot: 'AI 제안값과 사람 확정값을 따로 저장한다 → “수정 필드 수”가 정확성 지표의 원천', img: 's4c-note-structured', alt: '미팅 노트 구조화 결과, 경쟁사·불만 필드 강조',
  notes: 'AI가 쓴 값과 사람이 확정한 값을 따로 저장합니다. 니즈를 한 구절 고치면 수정됨 표시가 붙고, 이 수정 필드 수가 데이터 정확성 지표의 원천이 됩니다. 확정 저장 버튼은 화면 아래쪽에 있어 스크롤해야 보입니다.' });

clickSlide({ section: '03 해결', title: '① 자동화 6/6 · 다르게 적힌 고객명을 통합한다', role: 'admin', path: '데이터 품질',
  steps: [
    ['관리자 창 왼쪽 메뉴 「데이터 품질」', ''],
    ['아래로 스크롤 → 오른쪽 「통합 대기열」', ''],
    ['“가람제약사” ↔ 가람제약 카드의 「같은 고객으로 통합」', '토스트: 통합했습니다'],
    ['위로 올라가 「일관성」 확인', '91% → 93% (위협 신호는 이미 만점이라 점수는 그대로)'],
  ], img: 's5a-merge', alt: '데이터 품질 통합 대기열, 같은 고객으로 통합 버튼 강조',
  notes: '가람제약사라는 다른 표기 때문에 신호가 고객에 붙지 않았습니다. 통합하면 일관성 지표가 오르고 추세 그래프에 점이 하나 늘어납니다. 고객명 하나가 데이터 품질입니다.' });

clickSlide({ section: '03 해결', title: '② 예측 · 같은 모델, 다른 판정', role: 'kam', path: '위험 고객',
  steps: [
    ['KAM 창 왼쪽 메뉴 「위험 고객」', '이미 열려 있으면 F5로 새로고침'],
    ['위쪽 등급 필터 「고」', '고위험 2곳: 해오름바이오솔루션, 가람제약'],
    ['가람제약 「근거 보기」', '61점 · 고: 경쟁사 2회 +13.3 · 불만·부정 2건 +15 · 접촉 공백 0일 +0'],
  ], foot: '56점 · 중 → 61점 · 고. 모델은 그대로, 바뀐 것은 정보 한 건', img: 's6c-risk-modal', alt: '가람제약 이탈위험 61점 근거 창',
  notes: '위험 고객 화면으로 돌아오면 가람제약이 61점, 고위험으로 올라와 있습니다. 방금 미팅을 했으니 접촉 공백 점수는 오히려 8.9점 줄었습니다. 그래도 경쟁사 언급과 불만이 더 무거웠습니다.' });

// 14. 예측
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '03 해결' });
s.addText('② 예측 · 무엇이 점수를 바꿨나', { placeholder: 'title' });
lead(s, '미팅 노트 한 건을 확정한 뒤 가람제약 이탈위험 요인별 기여 점수');
s.addChart(pres.charts.BAR, [
  { name: '이전 (56점·중)', labels: ['주문 감소', '경쟁사 언급', '불만·부정', '위협 신호', '접촉 공백'], values: [23, 6.7, 7.5, 10, 8.9] },
  { name: '이후 (61점·고)', labels: ['주문 감소', '경쟁사 언급', '불만·부정', '위협 신호', '접촉 공백'], values: [23, 13.3, 15, 10, 0] },
], { x: M, y: 2.0, w: 7.6, h: 4.65, barDir: 'col', barGrouping: 'clustered', chartColors: [HEX.accent6, HEX.accent2], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0',
  valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: true, legendPos: 'b', barGapWidthPct: 70, ...chartText, objectName: 'chart-risk-compare' });
card(s, M + 8.0, 2.1, 4.1, 2.25);
text(s, [{ text: '56 ', options: { color: C.text2 } }, { text: '→ ', options: { color: C.accent6 } }, { text: '61', options: { color: C.accent2 } }], { x: M + 8.35, y: 2.25, w: 3.6, h: 1.1, fontSize: 60, bold: true });
text(s, '중 → 고 (고위험 기준 60점 돌파)', { x: M + 8.35, y: 3.4, w: 3.6, h: 0.6, fontSize: 15, color: C.text2 });
text(s, '방금 미팅했으니 접촉 공백 점수는 8.9점 줄었다. 그래도 경쟁사 언급(+6.6)과 불만(+7.5)이 더 컸다.\n\n모델은 바뀌지 않았다. 바뀐 것은 CRM에 들어온 정보 한 건이다.', { x: M + 8.0, y: 4.6, w: 4.1, h: 2.0, fontSize: 15, color: C.text1 });
s.addNotes('위험 고객 화면으로 돌아오면 가람제약이 61점, 고위험으로 올라와 있습니다. 재미있는 점은 미팅을 했기 때문에 접촉 공백 점수는 오히려 줄었다는 것입니다. 그래도 경쟁사 언급과 불만이라는 정보가 더 무거웠습니다.');



clickSlide({ section: '03 해결', title: '③ 시뮬레이션 · 조직 전체가 그렇다면?', role: 'admin', path: '품질-성과 실험실',
  steps: [
    ['관리자 창 왼쪽 메뉴 「품질-성과 실험실」', '아래쪽 「관리자」 구역'],
    ['오른쪽 위 「실험 실행」', '5개 데이터셋을 평가한다 (몇 초)'],
    ['결과 상자와 표 확인', '이탈 탐지 재현율 17% → 100% · 정밀도는 내내 100%'],
  ], foot: '같은 정답, 같은 규칙. 바뀐 것은 자동화 비율(데이터 품질)뿐', img: 's7b-lab-result', alt: '품질-성과 실험실 결과',
  notes: '정답 고객 30곳, 이탈 6곳은 고정하고 자동화 비율만 0%에서 100%까지 바꿔 다시 생성합니다. 운영 데이터는 바뀌지 않습니다.' });

// 15. 시뮬레이션
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '03 해결' });
s.addText('③ 시뮬레이션 · 자동화 비율별 성과', { placeholder: 'title' });
lead(s, '같은 정답 고객 30곳(이탈 6곳)을 자동화 비율만 바꿔 다시 생성하고 같은 규칙으로 평가 (시드 42)');
const ratios = ['0%', '25%', '50%', '75%', '100%'];
s.addChart(pres.charts.LINE, [
  { name: '종합 품질', labels: ratios, values: [69, 76, 84, 89, 96] },
  { name: '이탈 탐지 재현율', labels: ratios, values: [17, 33, 67, 83, 100] },
  { name: '추천 적중률', labels: ratios, values: [46, 54, 75, 88, 100] },
  { name: '정밀도', labels: ratios, values: [100, 100, 100, 100, 100] },
], { x: M, y: 2.0, w: 7.8, h: 4.7, chartColors: [HEX.dk2, HEX.accent2, HEX.accent1, HEX.accent6], lineSize: 3, lineDataSymbol: 'circle', lineDataSymbolSize: 8,
  valAxisMinVal: 0, valAxisMaxVal: 100, valAxisMajorUnit: 25, valGridLine: { color: 'E8E8ED', size: 0.75 }, catGridLine: { style: 'none' }, showLegend: true, legendPos: 'b',
  showCatAxisTitle: true, catAxisTitle: 'CRM 데이터 자동화 비율', catAxisTitleFontSize: 12, catAxisTitleColor: HEX.dk2, catAxisTitleFontFace: '+mn-lt', ...chartText, objectName: 'chart-lab' });
card(s, M + 8.2, 2.1, 3.9, 4.5);
text(s, '이탈 탐지 재현율', { x: M + 8.55, y: 2.35, w: 3.3, h: 0.4, fontSize: 15, color: C.text2 });
text(s, [{ text: '17%', options: { color: C.text2 } }, { text: ' → ', options: { color: C.accent6 } }, { text: '100%', options: { color: C.accent2 } }], { x: M + 8.55, y: 2.75, w: 3.4, h: 0.95, fontSize: 32, bold: true });
text(s, '수기 입력 조직은 이탈 고객 6곳 중 1곳만 본다.\n\n정밀도는 내내 100%. 품질이 낮아도 경고는 틀리지 않고, 그냥 놓친다.\n\n지금 시연 데이터(50%)에서 가람제약은 놓친 2곳 중 하나였다.', { x: M + 8.55, y: 3.85, w: 3.35, h: 2.6, fontSize: 14, color: C.text1 });
s.addNotes('품질-성과 실험실입니다. 정답은 고정하고 자동화 비율만 바꿉니다. 수기 입력 수준이면 이탈 고객 6곳 중 1곳만 보이고, 완전 자동화면 6곳을 다 봅니다. 정밀도는 변하지 않습니다. 자동화 투자의 ROI는 모델 성능이 아니라 여기서 나옵니다. 범위 설명: 이것은 데이터 품질 시나리오 시뮬레이션이며, 가격·경쟁사 생산 같은 사업 시뮬레이션은 다음 단계 과제입니다.');



clickSlide({ section: '03 해결', title: '④ 최적화 1/2 · 가람제약의 다음 행동을 채택한다', role: 'kam', path: '고객 → 가람제약 → 다음 행동',
  steps: [
    ['KAM 창 왼쪽 메뉴 「고객」 → 가람제약 행 클릭', '가람제약 고객 360'],
    ['오른쪽 「다음 행동 1순위」 카드의 「추천 전체 보기 (3)」', '가람제약만 걸러진 다음 행동 화면'],
    ['맨 위 「경영진 리뷰 미팅·장기 공급계약 제안」의 「채택」', '최우선 · 방문 · 3일 내 → 토스트: 채택했습니다'],
  ], img: 's8c-actions', alt: '다음 행동 추천 화면, 1순위 채택 버튼 강조',
  notes: '2막 전에는 1순위가 기술자료 이메일이었습니다. 위험 등급이 바뀌자 3일 내 경영진 방문이 맨 위로 올라왔습니다.' });

clickSlide({ section: '03 해결', title: '④ 최적화 2/2 · 거절에도 사유를 남긴다', role: 'kam', path: '다음 행동',
  steps: [
    ['다음 카드(비교 기술자료)의 「거절」', '거절 사유 선택 칸이 나타난다'],
    ['사유 없이 다시 「거절」', '오류: 거절 사유를 선택하세요'],
    ['사유 「시점 부적절」 선택 → 「거절」', '토스트: 거절했습니다'],
    ['위쪽 「채택」 탭', '채택한 경영진 리뷰 미팅이 옮겨져 있다'],
  ], foot: '채택·거절과 그 사유가 다시 데이터가 된다', img: 's8d-reject-error', alt: '다음 행동 화면, 거절 사유 필수 오류',
  notes: '채택·거절과 그 사유가 다시 데이터가 됩니다. 다음 추천의 품질을 올리는 피드백 루프입니다.' });

// 16. 최적화
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '03 해결' });
s.addText('④ 최적화 · 내일 무엇부터 할지가 바뀌었다', { placeholder: 'title' });
lead(s, '가람제약 다음 행동 추천 (고객당 상위 3개, 우선순위순)');
const col = (x, head, items, accent) => {
  card(s, x, 2.1, 5.85, 3.95);
  text(s, head, { x: x + 0.4, y: 2.3, w: 5, h: 0.45, fontSize: 16, bold: true, color: accent });
  items.forEach(([p, a, d], i) => {
    const y = 2.95 + i * 0.98;
    numDot(s, x + 0.4, y, String(i + 1), i === 0 ? accent : C.accent6);
    text(s, a, { x: x + 1.05, y: y - 0.05, w: 4.6, h: 0.45, fontSize: 16, bold: i === 0, color: C.text1 });
    text(s, d, { x: x + 1.05, y: y + 0.38, w: 4.6, h: 0.4, fontSize: 13, color: C.text2 });
  });
};
col(M, '이전 (위험 ‘중’)', [[1, '비교 기술자료 전달·기술 세미나', '이메일 · 7일 내'], [2, '증설 라인 소모품 공급 제안', '방문 · 7일 내']], C.text2);
text(s, '→', { x: M + 5.85, y: 3.6, w: 0.4, h: 0.6, fontSize: 26, bold: true, color: C.accent6, align: 'center' });
col(M + 6.25, '이후 (위험 ‘고’)', [[1, '경영진 리뷰 미팅·장기 공급계약 제안', '방문 · 3일 내 · 최우선'], [2, '비교 기술자료 전달·기술 세미나', '이메일 · 7일 내'], [3, '증설 라인 소모품 공급 제안', '방문 · 7일 내']], C.accent2);
text(s, '한정된 영업 시간을 어디에 먼저 쓸지 시스템이 정하고, 채택·거절과 그 사유가 다시 데이터가 된다', { x: M, y: 6.25, w: W - 2 * M, h: 0.5, fontSize: 16, bold: true, color: C.text1 });
s.addNotes('위험 등급이 바뀌자 추천 1순위가 기술자료 이메일에서 3일 안에 경영진을 찾아가는 장기계약 제안으로 바뀌었습니다. KAM이 채택하면 그 결정과 거절 사유가 다시 데이터가 되어 다음 추천을 개선합니다. 범위 설명: 고객별 행동 후보를 규칙으로 우선순위화하는 단계이고, 영업 인력 배치 같은 수리 최적화는 다음 과제입니다.');



// =================================================================
// 클로징
// 17. 클로징
pres.addSection({ title: '맺음' });
s = pres.addSlide({ masterName: 'DARK', sectionTitle: '맺음' });
s.addText('AI 도입 순서는\n모델이 아니라 데이터 흐름이다', { placeholder: 'title' });
s.addText([{ text: '자동화로 품질을 만들고 → 예측하고 → 시뮬레이션으로 설득하고 → 최적화로 실행한다', options: { breakLine: true } }, { text: '여러분 조직의 CRM은 자동화 몇 % 수준입니까? 지금 이탈 고객 몇 곳을 놓치고 있을까요?', options: { color: C.background1, bold: true } }], { placeholder: 'body' });
s.addNotes('정리합니다. AI 도입은 좋은 모델을 고르는 일이 아니라 데이터가 흐르는 길을 만드는 일입니다. 마지막 질문을 드립니다. 여러분 조직의 CRM은 자동화 몇 퍼센트 수준이고, 지금 몇 곳을 놓치고 있을까요?');



// =================================================================
pres.addSection({ title: '부록' });
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '부록' });
s.addText('부록 · 한 장 클릭 체크리스트', { placeholder: 'title' });
const hd = (t) => ({ text: t, options: { bold: true, color: C.text2, fill: { color: C.background2 } } });
const RW = { kam: ['KAM', C.accent1], admin: ['관리자', C.accent5] };
const rows = [
  ['0', 'kam', '위험 고객', '가람제약 「근거 보기」 → 「닫기」', '56점 · 중'],
  ['1', 'kam', '오늘의 브리핑', '가람제약 카드 확인', '공급사 재선정 검토'],
  ['2', 'admin', '데이터 품질', '지표 · 통합 대기열 확인', '정확성 66%, “가람제약사”'],
  ['3', 'admin', '데이터 운영', '「신호 수집 실행」 → 「리드 변환 실행」', '신호 10건 · 리드 4건'],
  ['4', 'kam', '리드 인박스', '새봄바이오 「수락」 → 고객 선택 「신규 고객으로 등록」 → 「수락」', '리드를 수락했습니다'],
  ['5', 'kam', '오늘의 브리핑', '가람제약 「고객 360 보기」 → 「미팅 노트 작성」', '고객 = 가람제약'],
  ['6', 'kam', '미팅 노트', '미팅일 = 오늘, 메모 붙여넣기 → 「AI로 구조화」', '7필드 제안'],
  ['7', 'kam', '미팅 노트', '니즈 한 구절 수정 → 「확정 저장」', '확정 · 수정 1'],
  ['8', 'admin', '데이터 품질', '“가람제약사” 「같은 고객으로 통합」', '일관성 91 → 93%'],
  ['9', 'kam', '위험 고객', '「고」 필터 → 가람제약 「근거 보기」', '61점 · 고'],
  ['10', 'admin', '품질-성과 실험실', '「실험 실행」', '재현율 17 → 100%'],
  ['11', 'kam', '고객 → 가람제약', '「추천 전체 보기」 → 1순위 「채택」', '경영진 리뷰 미팅'],
  ['12', 'kam', '다음 행동', '「거절」 → 사유 없이 「거절」 → 사유 선택 → 「거절」 → 「채택」 탭', '사유 필수 오류'],
  ['초기화', 'admin', '데이터 운영', '「데모 데이터 초기화」 → 「초기화」', '56점 · 중으로 복귀'],
];
const tbl = [[hd('#'), hd('창'), hd('왼쪽 메뉴'), hd('누를 것'), hd('확인할 것')]].concat(rows.map(([n, r, m, a, c]) => [
  { text: n, options: { color: C.text2 } }, { text: RW[r][0], options: { bold: true, color: RW[r][1] } }, { text: m, options: { bold: true } }, { text: a }, { text: c, options: { color: C.text2 } }]));
s.addTable(tbl, { x: M, y: 1.4, w: W - 2 * M, colW: [0.75, 0.9, 1.9, 5.65, 2.93], fontSize: 11.5, color: C.text1, rowH: 0.34, valign: 'middle', border: { type: 'solid', pt: 0.5, color: HEX.accent6 }, margin: [0.03, 0.08, 0.03, 0.08], objectName: 'checklist' });
s.addNotes('인쇄해서 노트북 옆에 두고 쓰는 한 장 요약입니다. 번호 순서대로 누르면 25분 시연이 끝납니다. 끝나면 초기화합니다.');

clickSlide({ section: '부록', title: '부록 · 다시 처음부터 하려면', role: 'admin', path: '데이터 운영',
  steps: [
    ['관리자 창 왼쪽 메뉴 「데이터 운영」', ''],
    ['오른쪽 「데모 데이터 초기화」', '확인 창이 뜬다'],
    ['확인 창의 빨간 「초기화」', '실행 로그: 초기화했습니다. 로그인은 유지된다'],
    ['KAM 창 「위험 고객」에서 확인', '가람제약 56점 · 중이면 시작 상태'],
  ], foot: '날짜가 바뀐 다음 날에는 터미널에서 npm run db:seed 후 서버를 다시 시작', img: 'r0-reset-confirm', alt: '데모 데이터 초기화 확인 창',
  notes: '같은 날 다시 시연할 때는 초기화 버튼이면 충분합니다. 날짜가 바뀌면 브리핑이 비어 보일 수 있으니 시드를 다시 만들고 서버를 재시작합니다.' });

(async () => {
  const out = 'sensing-crm-demo.pptx';
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('wrote', out);
})();
