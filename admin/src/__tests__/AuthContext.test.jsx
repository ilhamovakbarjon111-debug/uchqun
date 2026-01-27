import { describe, it, expect } from 'vitest';

describe('AuthContext', () => {
  it('module can be imported', async () => {
    const mod = await import('../context/AuthContext');
    expect(mod.AuthProvider).toBeDefined();
    expect(mod.useAuth).toBeDefined();
  });
});
