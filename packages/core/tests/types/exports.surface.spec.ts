import { describe, it, expectTypeOf } from 'vitest';

import type { Application } from '@kurdel/core/app';
import type { Controller } from '@kurdel/core/http';
import type { Model } from '@kurdel/core/db';

describe('public exports surface', () => {
  it('app/http/db subpaths expose types', () => {
    expectTypeOf<Application>().toBeObject();
    expectTypeOf<Controller>().toBeConstructibleWith<any>();
    expectTypeOf<Model>().toBeConstructibleWith();
  });
});

