#!/usr/bin/env node
// 정본 PRD → 읽기용 HTML (Pretendard, 목차, ID 링크). pandoc 사용. 직접 편집하지 않는다.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const [src = 'docs/PRD.md', out = 'docs/PRD.html'] = process.argv.slice(2);
const css = fs.readFileSync(new URL('./prd.css', import.meta.url), 'utf8');
const header = `<style>${css}</style>`;
const hdr = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'prd-')), 'header.html');
fs.writeFileSync(hdr, header);
let html = execFileSync('pandoc', [src, '-f', 'gfm', '-t', 'html5', '-s', '--toc', '--toc-depth=2',
  '--metadata', 'title=Sensing CRM PRD', '--metadata', 'lang=ko', '-H', hdr], { encoding: 'utf8' });
// 정의 행에 앵커, 본문 참조에 링크
const defined = new Set();
html = html.replace(/<td>((?:SCR-\d{3}-EL-\d{2})|FR-\d{3}|SC-\d{3}|NG-\d{2}|NAV-\d{2})<\/td>/g, (m, id) => {
  if (defined.has(id)) return m; defined.add(id); return `<td id="${id}" class="id-anchor">${id}</td>`;
});
html = html.replace(/<h3 id="[^"]*">((SCR|DATA)-\d{3})/g, (m, id) => { defined.add(id); return m.replace(/id="[^"]*"/, `id="${id}"`); });
html = html.replace(/(<td>|, |· | |\()((?:SCR-\d{3}-EL-\d{2})|SCR-\d{3}|FR-\d{3}|SC-\d{3}|DATA-\d{3}|NG-\d{2}|NAV-\d{2})(?=[^\d<]*<)/g,
  (m, pre, id) => defined.has(id) ? `${pre}<a href="#${id}">${id}</a>` : m);
fs.writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB, anchors ${defined.size})`);
