import { jest } from '@jest/globals';

const { sanitizeBody } = await import('../../middleware/sanitize.js');

describe('sanitizeBody middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {};
    next = jest.fn();
  });

  it('strips script tags from body strings', () => {
    req.body = { name: '<script>alert("xss")</script>Hello' };
    sanitizeBody(req, res, next);
    expect(req.body.name).toBe('Hello');
    expect(next).toHaveBeenCalled();
  });

  it('preserves clean strings', () => {
    req.body = { name: 'John Doe', age: 25 };
    sanitizeBody(req, res, next);
    expect(req.body.name).toBe('John Doe');
    expect(req.body.age).toBe(25);
  });

  it('handles nested objects', () => {
    req.body = { user: { name: '<img src=x onerror=alert(1)>Test' } };
    sanitizeBody(req, res, next);
    expect(req.body.user.name).not.toContain('onerror');
  });

  it('handles arrays', () => {
    req.body = { tags: ['<b>bold</b>', '<script>bad</script>safe'] };
    sanitizeBody(req, res, next);
    expect(req.body.tags[1]).toBe('safe');
  });

  it('calls next when body is undefined', () => {
    req.body = undefined;
    sanitizeBody(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
