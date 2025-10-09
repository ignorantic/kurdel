import { describe, it, expect } from 'vitest';

import { RuntimeControllerResolver } from 'src/http/runtime-controller-resolver.js';
import { FakeContainer } from './fake-container.js';

class Sample {
  constructor(public name: string) {}
}

describe('ControllerResolverImpl', () => {
  it('resolves from request scope first, then falls back to root', () => {
    const root = new FakeContainer();
    const scope = root.createScope();

    root.set(Sample as any, new Sample('root'));
    (scope as any).set(Sample as any, new Sample('scope'));

    const resolver = new RuntimeControllerResolver(root as any);

    const a = resolver.resolve(Sample as any, scope as any);
    expect(a.name).toBe('scope');

    const scope2 = root.createScope();
    const b = resolver.resolve(Sample as any, scope2 as any);
    expect(b.name).toBe('root');
  });
});
