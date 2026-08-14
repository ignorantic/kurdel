import { Sha256ApiKeyHasher } from '../src/index.js';

describe('Sha256ApiKeyHasher', () => {
  it('produces a deterministic SHA-256 digest', () => {
    const hasher = new Sha256ApiKeyHasher();

    expect(hasher.hash('demo-key')).toBe(
      'c48a01f49fd0f2cc404bc3cbbc80e91457a3d41bb429a695243de4c61794155c'
    );
    expect(hasher.hash('demo-key')).not.toBe('demo-key');
  });
});
