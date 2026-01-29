import crypto from 'crypto';

export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const verifyCsrfToken = (req, res, next) => {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for Bearer token auth (mobile clients)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  // Skip if no cookie auth present (no session to protect)
  if (!req.cookies?.accessToken && !req.cookies?.refreshToken) {
    return next();
  }

  // Skip for multipart/form-data (file uploads) - CSRF token may not be properly sent
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.csrfToken;

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};
