import { NextResponse } from 'next/server';
import { HttpError } from './auth';

export function ok(data: unknown, init?: number) { return NextResponse.json(data, { status: init ?? 200 }); }
export function fail(status: number, error: string, message?: string) { return NextResponse.json({ error, message }, { status }); }
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try { return await fn(...args); } catch (e) {
      if (e instanceof HttpError) return fail(e.status, e.code);
      console.error('[api]', e);
      return fail(500, 'server_error', '일시적인 오류입니다. 잠시 후 다시 시도하세요.');
    }
  };
}
export async function body<T>(req: Request): Promise<T> { try { return await req.json() as T; } catch { return {} as T; } }
