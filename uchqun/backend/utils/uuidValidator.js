// Basic UUID v4 regex pattern
const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4
 * @param {string} value - The value to validate
 * @returns {boolean} - True if the value is a valid UUID v4, false otherwise
 */
export const isUUID = (value) => {
  return typeof value === 'string' && uuidV4Pattern.test(value);
};



