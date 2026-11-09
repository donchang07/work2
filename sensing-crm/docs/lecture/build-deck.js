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

// =================================================================
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

// =================================================================
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
// 7. 섹션 02
pres.addSection({ title: '02 발견' });
s = pres.addSlide({ masterName: 'SECTION', sectionTitle: '02 발견' });
s.addText('02  발견', { placeholder: 'title' });
s.addText('세 개의 단서가 같은 곳을 가리켰다', { placeholder: 'body' });
s.addNotes('두 번째, 이 문제를 어떻게 발견했는지입니다.');

// 8. 단서1 브리핑
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '02 발견' });
s.addText('단서 ① 아침 브리핑에 뜬 경쟁사 평가 신호', { placeholder: 'title' });
lead(s, 'A-1 자동화: 공시·뉴스 피드를 수집해 담당 고객별로 요약한 오늘의 브리핑');
card(s, M, 2.2, 7.4, 3.6, C.background1);
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 2.2, w: 7.4, h: 3.6, rectRadius: 0.18, fill: { type: 'none' }, line: { color: C.accent6, width: 1 }, objectName: 'brief-frame' });
text(s, '가람제약', { x: M + 0.4, y: 2.5, w: 2, h: 0.45, fontSize: 18, bold: true, color: C.text1 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 2.0, y: 2.55, w: 1.25, h: 0.38, rectRadius: 0.19, fill: { color: 'FBE5E7' }, line: { type: 'none' }, objectName: 'badge-threat' });
text(s, '경쟁사평가', { x: M + 2.0, y: 2.55, w: 1.25, h: 0.38, fontSize: 12, bold: true, color: C.accent2, align: 'center', valign: 'middle' });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 6.0, y: 2.55, w: 1.05, h: 0.38, rectRadius: 0.19, fill: { color: 'EFE8F8' }, line: { type: 'none' }, objectName: 'badge-ai' });
text(s, 'AI 요약', { x: M + 6.0, y: 2.55, w: 1.05, h: 0.38, fontSize: 12, bold: true, color: C.accent5, align: 'center', valign: 'middle' });
text(s, '가람제약, 원부자재 공급사 재선정 검토', { x: M + 0.4, y: 3.15, w: 6.6, h: 0.5, fontSize: 20, bold: true, color: C.text1 });
text(s, '· 가람제약이 주요 원부자재 공급사를 재선정하는 절차에 들어갔다\n· 가격과 납기 안정성을 중점적으로 본다', { x: M + 0.4, y: 3.8, w: 6.6, h: 1.0, fontSize: 15, color: C.text2 });
text(s, '출처 보기 · 수집 오전 08:30', { x: M + 0.4, y: 5.1, w: 4, h: 0.4, fontSize: 12, color: C.text2 });
numDot(s, M + 7.9, 2.3, '!', C.accent2);
text(s, '오늘 아침 공시', { x: M + 8.55, y: 2.3, w: 3.5, h: 0.5, fontSize: 18, bold: true, color: C.text1, valign: 'middle' });
text(s, '그런데 위험 점수는 여전히 ‘중’.\n신호는 들어왔지만 판정에 반영될 정보가 부족했다.', { x: M + 7.9, y: 3.0, w: 4.2, h: 1.6, fontSize: 16, color: C.text2 });
s.addNotes('KAM이 출근하면 브리핑에 가람제약의 공급사 재선정 검토 공시가 떠 있습니다. 사람이 매일 공시를 읽지 않아도 시스템이 가져다줍니다. 그런데 이상합니다. 이런 신호가 있는데 위험 점수는 여전히 중간입니다.');

// 9. 단서2 위험 근거
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '02 발견' });
s.addText('단서 ② 점수를 분해하니 ‘현장 정보’가 비어 있었다', { placeholder: 'title' });
lead(s, '가람제약 이탈위험 56점의 요인별 기여 (만점 기준: 주문 35 · 공백 20 · 경쟁사 20 · 불만 15 · 위협 10)');
s.addChart(pres.charts.BAR, [{ name: '기여 점수', labels: ['주문 감소 33%', '위협 신호 2건', '접촉 공백 40일', '불만·부정 1건', '경쟁사 언급 1회'], values: [23, 10, 8.9, 7.5, 6.7] }], {
  x: M, y: 2.0, w: 7.2, h: 4.6, barDir: 'bar', chartColors: [HEX.accent1], showValue: true, dataLabelPosition: 'outEnd', dataLabelFormatCode: '0.0',
  valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, catAxisLineShow: false, showLegend: false, barGapWidthPct: 60, catAxisOrientation: 'maxMin', ...chartText, objectName: 'chart-risk-before',
});
card(s, M + 7.6, 2.1, 4.5, 4.4);
text(s, '비어 있던 칸', { x: M + 7.95, y: 2.35, w: 3.8, h: 0.45, fontSize: 18, bold: true, color: C.text1 });
text(s, [
  { text: '경쟁사 언급 1회', options: { bold: true, breakLine: true } }, { text: '실제로는 비교 평가가 진행 중', options: { color: C.text2, breakLine: true } },
  { text: ' ', options: { breakLine: true, fontSize: 8 } },
  { text: '불만·부정 1건', options: { bold: true, breakLine: true } }, { text: '9월 미팅의 부정 반응은 확정되지 않은 초안으로 방치', options: { color: C.text2, breakLine: true } },
  { text: ' ', options: { breakLine: true, fontSize: 8 } },
  { text: '공시·주문은 꽉 참', options: { bold: true, breakLine: true } }, { text: '자동 수집되는 데이터는 이미 반영', options: { color: C.text2 } },
], { x: M + 7.95, y: 2.9, w: 3.85, h: 3.4, fontSize: 15, color: C.text1, valign: 'top' });
s.addNotes('근거 보기를 누르면 점수가 분해됩니다. 주문 감소와 위협 신호처럼 자동으로 들어오는 데이터는 이미 다 반영돼 있습니다. 비어 있는 건 경쟁사 언급과 불만, 즉 사람이 현장에서 듣고 CRM에 적어야 하는 정보입니다.');

// 10. 단서3 품질
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '02 발견' });
s.addText('단서 ③ 데이터 품질 대시보드가 원인을 짚었다', { placeholder: 'title' });
lead(s, '같은 시점 CRM 데이터 품질 지표 (관리자 전체 범위)');
[['83%', '종합'], ['82%', '완전성'], ['66%', '정확성'], ['79%', '적시성'], ['92%', '일관성'], ['97%', '유일성']].forEach(([v, l], i) => {
  const x = M + i * 2.03; card(s, x, 2.1, 1.87, 1.75);
  text(s, l, { x: x + 0.25, y: 2.3, w: 1.4, h: 0.35, fontSize: 14, color: C.text2 });
  text(s, v, { x: x + 0.25, y: 2.7, w: 1.5, h: 0.8, fontSize: 34, bold: true, color: l === '정확성' ? C.accent2 : C.text1 });
});
[['1', '정확성 66%', '사람이 확인·확정하지 않은 초안 활동이 많다 → 부정 반응·불만이 위험 점수에 반영되지 않음'], ['2', '고객명 미해소', '“가람제약사”처럼 다르게 적힌 신호가 고객에 연결되지 않음 (통합 대기열, 유사도 0.96)']].forEach(([k, h, d], i) => {
  const y = 4.25 + i * 1.15; numDot(s, M, y + 0.05, k, C.accent2);
  text(s, h, { x: M + 0.75, y, w: 3, h: 0.5, fontSize: 18, bold: true, color: C.text1, valign: 'middle' });
  text(s, d, { x: M + 3.6, y, w: 8.5, h: 0.9, fontSize: 15, color: C.text2, valign: 'top' });
});
s.addNotes('품질 대시보드를 보면 정확성이 66%로 가장 낮습니다. 미팅은 했는데 기록이 확정되지 않은 채 초안으로 남아 있다는 뜻입니다. 그리고 가람제약사처럼 표기가 다른 신호가 고객에 붙지 않았습니다. 모델이 아니라 데이터가 문제였습니다.');

// =================================================================
// 11. 섹션 03
pres.addSection({ title: '03 해결' });
s = pres.addSlide({ masterName: 'SECTION', sectionTitle: '03 해결' });
s.addText('03  해결', { placeholder: 'title' });
s.addText('자동화 → 예측 → 시뮬레이션 → 최적화', { placeholder: 'body' });
s.addNotes('세 번째, 어떻게 해결했는지입니다. AI 도입 목적 네 가지를 순서대로 씁니다.');

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

// 13. 자동화
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '03 해결' });
s.addText('① 자동화: 빈칸을 사람 손 없이 채운다', { placeholder: 'title' });
lead(s, '데이터 운영 · 리드 인박스 · 미팅 노트 · 데이터 품질 화면');
const auto = [['A-1', '신호 수집', '피드 15건 중 새 신호 10건 적재, 중복 5건 제외, 고객 자동 연결'], ['A-2', '리드 변환', '임상 승인·국가 과제 4건 → 리드. 애매한 매칭은 사람이 선택'], ['A-5', '미팅 노트', '메모 한 단락 → 7개 필드 추출. 경쟁사 “베타바이오텍”, 불만 “납기 지연”, 반응 “부정”'], ['품질', '고객명 통합', '“가람제약사” ↔ 가람제약 통합 승인 → 일관성 지표 상승']];
auto.forEach(([tag, h, d], i) => {
  const y = 2.05 + i * 1.08;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: 1.0, h: 0.5, rectRadius: 0.25, fill: { color: C.accent1 }, line: { type: 'none' }, objectName: id('tag') });
  text(s, tag, { x: M, y, w: 1.0, h: 0.5, fontSize: 14, bold: true, color: C.background1, align: 'center', valign: 'middle' });
  text(s, h, { x: M + 1.25, y, w: 2.2, h: 0.5, fontSize: 18, bold: true, color: C.text1, valign: 'middle' });
  text(s, d, { x: M + 3.45, y, w: 8.6, h: 0.5, fontSize: 15, color: C.text2, valign: 'middle' });
});
card(s, M, 6.25, W - 2 * M, 0.55);
text(s, 'AI 제안값과 사람이 확정한 값을 따로 저장 → “수정 필드 수”가 정확성 지표의 원천이 된다', { x: M + 0.35, y: 6.25, w: W - 2 * M - 0.7, h: 0.55, fontSize: 15, bold: true, color: C.text1, valign: 'middle' });
s.addNotes('신호 수집 버튼 한 번에 10건, 리드 변환으로 4건이 들어옵니다. 핵심은 미팅 노트입니다. KAM이 메모를 붙여 넣으면 AI가 경쟁사, 불만, 고객 반응을 뽑아냅니다. 사람은 확인하고 확정만 누릅니다. 애매한 리드 매칭처럼 AI가 확신하지 못하는 곳은 사람에게 넘깁니다.');

// 14. 예측
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '03 해결' });
s.addText('② 예측: 같은 모델, 다른 판정', { placeholder: 'title' });
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

// 15. 시뮬레이션
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '03 해결' });
s.addText('③ 시뮬레이션: 조직 전체가 그렇다면?', { placeholder: 'title' });
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

// 16. 최적화
s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: '03 해결' });
s.addText('④ 최적화: 내일 무엇부터 할지가 바뀌었다', { placeholder: 'title' });
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
// 17. 클로징
pres.addSection({ title: '맺음' });
s = pres.addSlide({ masterName: 'DARK', sectionTitle: '맺음' });
s.addText('AI 도입 순서는\n모델이 아니라 데이터 흐름이다', { placeholder: 'title' });
s.addText([{ text: '자동화로 품질을 만들고 → 예측하고 → 시뮬레이션으로 설득하고 → 최적화로 실행한다', options: { breakLine: true } }, { text: '여러분 조직의 CRM은 자동화 몇 % 수준입니까? 지금 이탈 고객 몇 곳을 놓치고 있을까요?', options: { color: C.background1, bold: true } }], { placeholder: 'body' });
s.addNotes('정리합니다. AI 도입은 좋은 모델을 고르는 일이 아니라 데이터가 흐르는 길을 만드는 일입니다. 마지막 질문을 드립니다. 여러분 조직의 CRM은 자동화 몇 퍼센트 수준이고, 지금 몇 곳을 놓치고 있을까요?');

(async () => {
  const out = 'sensing-crm-demo.pptx';
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('wrote', out);
})();
