import crypto from 'node:crypto';
export function hashPassword(pw: string): string {
  const salt = crypto.createHash('sha256').update('sensing-crm-seed:' + pw).digest('hex').slice(0, 32); // 시드 결정성(SC-010)을 위해 고정 salt 파생
  return `${salt}:${crypto.scryptSync(pw, salt, 32).toString('hex')}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const h = crypto.scryptSync(pw, salt, 32);
  return crypto.timingSafeEqual(h, Buffer.from(hash, 'hex'));
}
export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
export const newToken = () => crypto.randomBytes(32).toString('hex');
