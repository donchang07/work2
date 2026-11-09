import { buildTruth } from '../lib/seed';
import { runLab } from '../lib/domain/lab';
import { seoulDate } from '../lib/time';
const today = process.argv[2] || seoulDate();
const { truth } = buildTruth(today);
console.table(runLab(truth, today).map(p => ({ r: p.ratio, quality: p.quality, comp: p.completeness, acc: p.accuracy, time: p.timeliness, cons: p.consistency, uniq: p.uniqueness, recall: p.recall, precision: p.precision, nba: p.nba_hit, high: p.highCount })));
