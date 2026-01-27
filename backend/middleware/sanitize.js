import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Recursively sanitize all string values in an object.
 */
function sanitize(obj) {
  if (typeof obj === 'string') {
    return purify.sanitize(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = sanitize(value);
    }
    return cleaned;
  }
  return obj;
}

/**
 * Express middleware that sanitizes all string fields in req.body.
 */
export const sanitizeBody = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  next();
};
