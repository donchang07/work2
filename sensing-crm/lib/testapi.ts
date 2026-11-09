import { fail } from './api';
export function testOnly(): Response | null { return process.env.E2E === '1' ? null : fail(404, 'not_found'); }
