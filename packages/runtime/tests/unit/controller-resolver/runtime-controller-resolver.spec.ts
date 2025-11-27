import { describe, it, expect } from 'vitest';

import type { Container } from '@kurdel/ioc';

import { RuntimeControllerResolver } from 'src/http/runtime-controller-resolver.js';
import { FakeContainer } from 'tests/utils/fake-container.js';

class Sample {
  constructor(public readonly name: string) {}
}

describe('RuntimeControllerResolver', () => {
  it('prefers request scope over root container, and falls back when missing', () => {
    // Root container
    const root: Container = new FakeContainer();

    // Request scope A
    const scopeA = root.createScope();
    root.set(Sample, new Sample('root'));
    scopeA.set(Sample, new Sample('scope'));

    const resolver = new RuntimeControllerResolver(root);

    // ① Resolve from scope (shadowing root)
    const resolvedA = resolver.resolve(Sample, scopeA);
    expect(resolvedA.name).toBe('scope');

    // Request scope B — does not override
    const scopeB = root.createScope();

    // ② Falls back to root
    const resolvedB = resolver.resolve(Sample, scopeB);
    expect(resolvedB.name).toBe('root');
  });
});
