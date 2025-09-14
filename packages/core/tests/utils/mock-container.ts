import { vi } from 'vitest';

export function createMockContainer() {
  return {
    bind: vi.fn().mockReturnThis(),
    put: vi.fn().mockReturnThis(),
    get: vi.fn(),
    has: vi.fn(),
  };
}
