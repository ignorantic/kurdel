import { describe, it, expect, expectTypeOf } from 'vitest';

import type { ActionResult } from 'src/http/types.js';
import type { HttpContext } from 'src/http/http-context.js';
import { route, ROUTE_META, type RouteParams } from 'src/http/route.js';

type Deps = { n: number };

describe('route(meta)(handler) typing + metadata', () => {
  it('preserves function reference and attaches meta', () => {
    const meta = { method: 'GET' as const, path: '/:id' as const };
    const fn = async (
      _: HttpContext<Deps, unknown, RouteParams<typeof meta.path>>
    ): Promise<ActionResult> => ({ kind: 'empty', status: 204 });

    const wrapped = route(meta)(fn);

    // та же ссылка
    expect(wrapped).toBe(fn);
    // мета навешена
    expect((wrapped as any)[ROUTE_META]).toEqual(meta);
  });

  it('narrows ctx.params from path', () => {
    const meta = { method: 'GET' as const, path: '/u/:uid/post/:pid' as const };

    const fn = route(meta)(async ctx => {
      // типобезопасные параметры
      expectTypeOf(ctx.params.uid).toEqualTypeOf<string>();
      expectTypeOf(ctx.params.pid).toEqualTypeOf<string>();
      return { kind: 'empty', status: 204 } as const;
    });

    // @ts-expect-error — param name mismatch should be an error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _bad = route(meta)(async (ctx: HttpContext<Deps, unknown, { wrong: string }>) => {
      return { kind: 'empty', status: 204 } as const;
    });

    expect(typeof fn).toBe('function');
  });
});
