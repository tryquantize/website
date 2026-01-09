/**
 * Secure Search Session Manager
 * Handles encrypted storage of search parameters with one-time use tokens
 */

const SEARCH_STORAGE_KEY = 'q-search-sessions';
const SESSION_EXPIRY_MS = 120000; // 2 minutes

interface SearchSession {
    id: string;
    query: string;
    types: string[];
    locations: string[];
    webSearch: boolean;
    model: string;
    timestamp: number;
    used: boolean;
}

// Simple obfuscation (not encryption, but makes casual inspection harder)
function encode(data: string): string {
    try {
        return btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g,
            (_, p1) => String.fromCharCode(parseInt('0x' + p1))));
    } catch {
        return btoa(data);
    }
}

function decode(data: string): string {
    try {
        return decodeURIComponent(atob(data).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    } catch {
        try {
            return atob(data);
        } catch {
            return '';
        }
    }
}

// Generate cryptographically random ID
function generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Get all sessions
function getSessions(): Record<string, SearchSession> {
    try {
        const stored = sessionStorage.getItem(SEARCH_STORAGE_KEY);
        if (!stored) return {};
        return JSON.parse(decode(stored));
    } catch {
        return {};
    }
}

// Save sessions
function saveSessions(sessions: Record<string, SearchSession>): void {
    try {
        sessionStorage.setItem(SEARCH_STORAGE_KEY, encode(JSON.stringify(sessions)));
    } catch {
        // Storage full or unavailable
    }
}

// Clean up expired sessions
function cleanupSessions(): void {
    const sessions = getSessions();
    const now = Date.now();
    let changed = false;

    for (const id of Object.keys(sessions)) {
        if (now - sessions[id].timestamp > SESSION_EXPIRY_MS || sessions[id].used) {
            delete sessions[id];
            changed = true;
        }
    }

    if (changed) {
        saveSessions(sessions);
    }
}

/**
 * Create a new search session and return the secure ID
 */
export function createSearchSession(params: {
    query: string;
    types: string[];
    locations: string[];
    webSearch: boolean;
    model?: string;
}): string {
    cleanupSessions();

    const id = generateSecureId();
    const session: SearchSession = {
        id,
        query: params.query,
        types: params.types,
        locations: params.locations,
        webSearch: params.webSearch,
        model: params.model || 'GPT-4o Mini',
        timestamp: Date.now(),
        used: false
    };

    const sessions = getSessions();
    sessions[id] = session;
    saveSessions(sessions);

    return id;
}

/**
 * Retrieve and consume a search session (one-time use)
 */
export function consumeSearchSession(id: string): SearchSession | null {
    cleanupSessions();

    const sessions = getSessions();
    const session = sessions[id];

    if (!session) {
        return null;
    }

    // Check if already used
    if (session.used) {
        return null;
    }

    // Check if expired
    if (Date.now() - session.timestamp > SESSION_EXPIRY_MS) {
        delete sessions[id];
        saveSessions(sessions);
        return null;
    }

    // Mark as used
    session.used = true;
    sessions[id] = session;
    saveSessions(sessions);

    return session;
}

/**
 * Validate a session exists and is valid (without consuming)
 */
export function validateSession(id: string): boolean {
    const sessions = getSessions();
    const session = sessions[id];

    if (!session || session.used) {
        return false;
    }

    if (Date.now() - session.timestamp > SESSION_EXPIRY_MS) {
        return false;
    }

    return true;
}

/**
 * Store search results for retrieval on results page
 */
export function storeSearchResults(id: string, results: any): void {
    try {
        const key = `q-results-${id}`;
        sessionStorage.setItem(key, encode(JSON.stringify(results)));
    } catch {
        // Storage full
    }
}

/**
 * Retrieve search results
 */
export function getSearchResults(id: string): any | null {
    try {
        const key = `q-results-${id}`;
        const stored = sessionStorage.getItem(key);
        if (!stored) return null;
        return JSON.parse(decode(stored));
    } catch {
        return null;
    }
}

/**
 * Clear search results
 */
export function clearSearchResults(id: string): void {
    try {
        sessionStorage.removeItem(`q-results-${id}`);
    } catch {
        // Ignore
    }
}
