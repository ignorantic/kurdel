import { describe, it, expectTypeOf } from 'vitest';
import type { RouteParams } from 'src/http/index.js';

describe('RouteParams<> inference', () => {
  it('infers single param', () => {
    type P = RouteParams<'/:id'>;
    expectTypeOf<P>().toEqualTypeOf<{ id: string }>();
  });

  it('infers multiple params', () => {
    type P = RouteParams<'/users/:uid/post/:pid'>;
    expectTypeOf<P>().toEqualTypeOf<{ uid: string; pid: string }>();
  });

  it('keeps {} when no params', () => {
    type P = RouteParams<'/users'>;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    expectTypeOf<P>().toEqualTypeOf<{}>();
  });
});
