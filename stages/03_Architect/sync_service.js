/**
 * DeepFlow — Supabase Sync Service
 *
 * Handles local-first persistence (localStorage / in-memory fallback)
 * with debounced synchronization to the Supabase REST API.
 *
 * Design principles:
 *   - Never lose a draft: write locally first, then sync.
 *   - Debounce syncs to avoid hammering the API (default 5 s).
 *   - Expose clear status events so the UI can show sync indicators.
 */

// ── Sync States ──────────────────────────────────────────────────
export const SYNC_STATUS = Object.freeze({
  IDLE: 'idle',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  ERROR: 'error',
  OFFLINE: 'offline',
});

// ── SyncService Class ────────────────────────────────────────────
export class SyncService {
  /**
   * @param {object} opts
   * @param {string} opts.supabaseUrl   — e.g. "https://xxx.supabase.co"
   * @param {string} opts.supabaseKey   — anon / publishable key
   * @param {number} opts.debounceMs    — sync debounce interval (default 5000)
   * @param {Storage|null} opts.storage — localStorage-compatible object (null = in-memory)
   */
  constructor(opts = {}) {
    this.supabaseUrl = opts.supabaseUrl;
    this.supabaseKey = opts.supabaseKey;
    this.debounceMs = opts.debounceMs ?? 5_000;
    this.storage = opts.storage ?? new MemoryStorage();

    this._status = SYNC_STATUS.IDLE;
    this._listeners = new Set();
    this._debounceTimer = null;
    this._authToken = null; // set after user login
  }

  // ── Auth ─────────────────────────────────────────────────────

  /** Set the user's JWT for authenticated requests. */
  setAuthToken(token) {
    this._authToken = token;
  }

  // ── Status ───────────────────────────────────────────────────

  get status() {
    return this._status;
  }

  onStatusChange(fn) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  /** @private */
  _setStatus(s) {
    this._status = s;
    this._listeners.forEach((fn) => fn(s));
  }

  // ── Local Draft Persistence ──────────────────────────────────

  /**
   * Save draft content locally and schedule a debounced remote sync.
   * @param {string} sessionId
   * @param {string} content
   * @param {number} wordCount
   */
  saveDraftLocally(sessionId, content, wordCount) {
    const draft = {
      sessionId,
      content,
      wordCount,
      updatedAt: new Date().toISOString(),
      synced: false,
    };
    this.storage.setItem(`draft:${sessionId}`, JSON.stringify(draft));

    // Schedule debounced sync
    this._scheduleSyncDraft(sessionId);
  }

  /** Retrieve the local draft for a session. */
  getLocalDraft(sessionId) {
    const raw = this.storage.getItem(`draft:${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  }

  // ── Session Persistence ──────────────────────────────────────

  /**
   * Persist a completed / guillotined session to Supabase.
   * @param {object} session — matches writing_sessions schema
   */
  async saveSession(session) {
    // Always save locally first
    this.storage.setItem(`session:${session.id}`, JSON.stringify(session));

    return this._upsertRemote('writing_sessions', session);
  }

  /**
   * Silently backup a guillotined or abandoned draft to the graveyard.
   * @param {string} sessionId
   * @param {string} userId
   * @param {string} content
   * @param {number} wordCount
   */
  async saveToGraveyard(sessionId, userId, content, wordCount) {
    const payload = {
      session_id: sessionId,
      user_id: userId,
      content,
      word_count: wordCount,
      deleted_at: new Date().toISOString(),
    };

    // Save locally first
    this.storage.setItem(`graveyard:${sessionId}`, JSON.stringify(payload));

    // Sync to Supabase graveyard
    return this._upsertRemote('graveyard', payload);
  }

  /**
   * Update a user profile (e.g. decrement grace tokens).
   * @param {string} userId
   * @param {object} patch — partial profile update
   */
  async updateProfile(userId, patch) {
    return this._patchRemote('profiles', userId, patch);
  }

  // ── Debounced Draft Sync ─────────────────────────────────────

  /** @private */
  _scheduleSyncDraft(sessionId) {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._syncDraft(sessionId);
    }, this.debounceMs);
  }

  /** @private */
  async _syncDraft(sessionId) {
    const draft = this.getLocalDraft(sessionId);
    if (!draft || draft.synced) return;

    const payload = {
      id: this._uuidFromSession(sessionId),
      session_id: sessionId,
      content: draft.content,
      word_count: draft.wordCount,
      updated_at: draft.updatedAt,
    };

    const ok = await this._upsertRemote('drafts', payload);
    if (ok) {
      draft.synced = true;
      this.storage.setItem(`draft:${sessionId}`, JSON.stringify(draft));
    }
  }

  /** Force-flush any pending draft sync immediately. */
  async flush(sessionId) {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
      this._debounceTimer = null;
    }
    if (sessionId) {
      await this._syncDraft(sessionId);
    }
  }

  // ── Supabase REST Helpers ────────────────────────────────────

  /** @private */
  async _upsertRemote(table, row) {
    if (!this.supabaseUrl || !this.supabaseKey) {
      this._setStatus(SYNC_STATUS.OFFLINE);
      return false;
    }

    const url = `${this.supabaseUrl}/rest/v1/${table}`;
    const headers = this._headers();
    headers['Prefer'] = 'resolution=merge-duplicates';

    this._setStatus(SYNC_STATUS.SYNCING);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(row),
      });

      if (res.ok || res.status === 201 || res.status === 409) {
        this._setStatus(SYNC_STATUS.SYNCED);
        return true;
      }

      console.error(`[SyncService] upsert ${table} failed:`, res.status, await res.text());
      this._setStatus(SYNC_STATUS.ERROR);
      return false;
    } catch (err) {
      console.error(`[SyncService] upsert ${table} error:`, err);
      this._setStatus(SYNC_STATUS.ERROR);
      return false;
    }
  }

  /** @private */
  async _patchRemote(table, id, patch) {
    if (!this.supabaseUrl || !this.supabaseKey) {
      this._setStatus(SYNC_STATUS.OFFLINE);
      return false;
    }

    const url = `${this.supabaseUrl}/rest/v1/${table}?id=eq.${id}`;
    this._setStatus(SYNC_STATUS.SYNCING);

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: this._headers(),
        body: JSON.stringify(patch),
      });

      if (res.ok) {
        this._setStatus(SYNC_STATUS.SYNCED);
        return true;
      }

      console.error(`[SyncService] patch ${table} failed:`, res.status, await res.text());
      this._setStatus(SYNC_STATUS.ERROR);
      return false;
    } catch (err) {
      console.error(`[SyncService] patch ${table} error:`, err);
      this._setStatus(SYNC_STATUS.ERROR);
      return false;
    }
  }

  /** @private */
  _headers() {
    const h = {
      'Content-Type': 'application/json',
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this._authToken || this.supabaseKey}`,
    };
    return h;
  }

  /** @private Deterministic UUID derivation from session ID for drafts. */
  _uuidFromSession(sessionId) {
    // For now, use the sessionId directly as the draft ID.
    // A production implementation would derive a v5 UUID.
    return sessionId;
  }

  // ── Destroy ──────────────────────────────────────────────────

  destroy() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._listeners.clear();
  }
}

// ── In-Memory Storage Fallback ───────────────────────────────────
export class MemoryStorage {
  constructor() {
    this._store = new Map();
  }
  getItem(key) {
    return this._store.get(key) ?? null;
  }
  setItem(key, value) {
    this._store.set(key, value);
  }
  removeItem(key) {
    this._store.delete(key);
  }
  clear() {
    this._store.clear();
  }
}
