/**
 * sanitize.js — Frontend input sanitization utility
 *
 * Strips HTML/script tags, trims whitespace, and enforces max length.
 * Use on ALL user-supplied strings before sending them to the API.
 */

const MAX_LENGTHS = {
    name:        100,
    email:       254,   // RFC 5321 max email length
    password:    128,
    title:       200,
    description: 2000,
    default:     500,
};

/**
 * Strips HTML/script injection attempts and normalizes a string.
 * @param {string} str - Raw user input
 * @param {string} [field='default'] - Field name key for max-length lookup
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str, field = 'default') => {
    if (typeof str !== 'string') return '';
    const maxLen = MAX_LENGTHS[field] ?? MAX_LENGTHS.default;
    return str
        .trim()
        // Remove HTML tags (prevents stored XSS if ever accidentally rendered as HTML)
        .replace(/<[^>]*>/g, '')
        // Remove null bytes
        .replace(/\0/g, '')
        // Collapse multiple whitespace chars into single space
        .replace(/\s+/g, ' ')
        // Enforce max length
        .slice(0, maxLen);
};

/**
 * Sanitizes an entire form data object.
 * @param {Object} data - Key-value pairs of form fields
 * @returns {Object} New object with all string values sanitized
 */
export const sanitizeFormData = (data) => {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        result[key] = typeof value === 'string' ? sanitizeString(value, key) : value;
    }
    return result;
};
