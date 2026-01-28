/**
 * Basic string sanitization without jsdom/DOMPurify
 * Removes potentially dangerous HTML/script tags
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  // Remove script tags and event handlers
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim();
}

/**
 * Recursively sanitize all string values in an object.
 */
function sanitize(obj) {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
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
