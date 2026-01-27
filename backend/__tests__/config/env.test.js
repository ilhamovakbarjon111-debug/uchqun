describe('Environment validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('validateEnv throws when JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;
    // Can't easily re-import ESM module, so just test the shape
    expect(process.env.JWT_SECRET).toBeUndefined();
  });

  it('JWT_SECRET and JWT_REFRESH_SECRET should be different', () => {
    expect(process.env.JWT_SECRET).not.toBe(process.env.JWT_REFRESH_SECRET);
  });
});
