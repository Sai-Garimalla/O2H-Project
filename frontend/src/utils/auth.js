/**
 * auth.js — Secure token management utility
 *
 * Single source of truth for JWT storage, retrieval, and expiry checking.
 * Never logs tokens to the console.
 */

const STORAGE_KEY = 'user';

/**
 * Decodes the payload of a JWT (no signature verification — that's the server's job).
 * Used only to check the expiry claim (exp) client-side.
 */
const decodePayload = (token) => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(base64);
        return JSON.parse(json);
    } catch {
        return null;
    }
};

/**
 * Returns the stored user object, or null if nothing is stored.
 */
export const getStoredUser = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

/**
 * Returns the JWT string, or null.
 */
export const getToken = () => {
    const user = getStoredUser();
    return user?.token ?? null;
};

/**
 * Checks whether the stored token is still valid (not expired).
 * Returns false if: no token, malformed token, or past expiry.
 */
export const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;

    const payload = decodePayload(token);
    if (!payload || !payload.exp) return false;

    // exp is in seconds; Date.now() is in ms
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp > nowSec;
};

/**
 * Persists the user object (including token) to localStorage.
 */
export const setStoredUser = (userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
};

/**
 * Clears all auth data from localStorage.
 */
export const clearStoredUser = () => {
    localStorage.removeItem(STORAGE_KEY);
};
