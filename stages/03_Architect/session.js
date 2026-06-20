/**
 * DeepFlow — Session Orchestrator
 *
 * Wires the GuillotineStateMachine, TimerController, and SyncService
 * into a single cohesive session controller. This is the main entry
 * point that UI layers (Phase 4) will import and interact with.
 *
 * Usage:
 *   import { DeepFlowSession } from './session.js';
 *
 *   const session = new DeepFlowSession({
 *     supabaseUrl: 'https://xxx.supabase.co',
 *     supabaseKey: 'eyJ...',
 *     durationSeconds: 1500,
 *     targetWords: 300,
 *     graceTokens: 3,
 *     onTick: (data) => updateUI(data),
 *     onTransition: (entry) => handleStateChange(entry),
 *     onSyncStatus: (status) => updateSyncBadge(status),
 *   });
 *
 *   session.start();          // → idle → writing
 *   session.keystroke(text);  // record typing activity + word count
 *   session.useGraceToken();  // rescue from guillotine
 *   session.giveUp();         // abandon a guillotined session
 *   session.reset();          // return to idle after completion
 *   session.destroy();        // clean up timers and listeners
 */

import { GuillotineStateMachine, EVENTS, STATES } from './state_machine.js';
import { TimerController } from './timer_logic.js';
import { SyncService } from './sync_service.js';

export class DeepFlowSession {
  /**
   * @param {object} opts
   * @param {string}   opts.supabaseUrl
   * @param {string}   opts.supabaseKey
   * @param {number}   opts.durationSeconds  — session length (default 1500 = 25 min)
   * @param {number}   opts.targetWords      — word target for the session
   * @param {number}   opts.graceTokens      — starting grace tokens
   * @param {number}   opts.idleThresholdMs  — idle warning threshold (default 5000)
   * @param {number}   opts.guillotineThresholdMs — guillotine fuse (default 10000)
   * @param {Function} opts.onTick           — called every tick with timer data
   * @param {Function} opts.onTransition     — called on state transitions
   * @param {Function} opts.onSyncStatus     — called when sync status changes
   * @param {Storage}  opts.storage          — localStorage-compatible store
   */
  constructor(opts = {}) {
    // ── State Machine ────────────────────────────────────────
    this.machine = new GuillotineStateMachine({
      graceTokens: opts.graceTokens ?? 3,
      targetWords: opts.targetWords ?? 0,
      durationSeconds: opts.durationSeconds ?? 1500,
    });

    // ── Timer Controller ─────────────────────────────────────
    this.timer = new TimerController(this.machine, {
      idleThresholdMs: opts.idleThresholdMs ?? 5_000,
      guillotineThresholdMs: opts.guillotineThresholdMs ?? 10_000,
      onTick: opts.onTick ?? null,
    });

    // ── Sync Service ─────────────────────────────────────────
    this.sync = new SyncService({
      supabaseUrl: opts.supabaseUrl,
      supabaseKey: opts.supabaseKey,
      storage: opts.storage ?? null,
    });

    // ── Session metadata ─────────────────────────────────────
    this._sessionId = null;
    this._userId = null;
    this._text = '';

    // ── External callbacks ───────────────────────────────────
    if (opts.onTransition) {
      this.machine.on('transition', opts.onTransition);
    }
    if (opts.onSyncStatus) {
      this.sync.onStatusChange(opts.onSyncStatus);
    }

    // ── Internal: persist on important transitions ───────────
    this.machine.on('transition', (entry) => this._onTransition(entry));
  }

  // ── Public API ───────────────────────────────────────────────

  /** Start a new writing session. */
  start(userId) {
    this._userId = userId;
    this._sessionId = crypto.randomUUID();
    this._text = '';
    this.machine.send(EVENTS.START);
    this.timer.start();
  }

  /**
   * Record a keystroke event and update the draft.
   * @param {string} fullText — the complete current text in the editor
   */
  keystroke(fullText) {
    this._text = fullText;
    const wordCount = this._countWords(fullText);

    // Update the machine context
    this.machine.send(EVENTS.KEYSTROKE, { wordsWritten: wordCount });

    // Reset idle timer
    this.timer.keystroke();

    // Save draft locally (debounced sync to Supabase)
    this.sync.saveDraftLocally(this._sessionId, fullText, wordCount);
  }

  /** Spend a grace token to rescue a guillotined session. */
  useGraceToken() {
    const ok = this.machine.send(EVENTS.USE_GRACE_TOKEN);
    if (ok && this._userId) {
      // Sync the decremented token count to the server
      this.sync.updateProfile(this._userId, {
        grace_tokens: this.machine.ctx.graceTokens,
      });
    }
    return ok;
  }

  /** Abandon a guillotined session. */
  giveUp() {
    this.machine.send(EVENTS.GIVE_UP);
    this._finishSession();
  }

  /** Reset after a completed or abandoned session. */
  reset() {
    this.machine.send(EVENTS.RESET);
  }

  /** Get the current state. */
  get state() {
    return this.machine.state;
  }

  /** Get the current context. */
  get context() {
    return { ...this.machine.ctx };
  }

  /** Get the session ID. */
  get sessionId() {
    return this._sessionId;
  }

  /** Clean up all resources. */
  destroy() {
    this.timer.destroy();
    this.sync.destroy();
  }

  // ── Internal ─────────────────────────────────────────────────

  /** @private Handle state transitions for persistence logic. */
  _onTransition(entry) {
    const { to } = entry;

    // When session completes, persist everything
    if (to === STATES.COMPLETED) {
      this._finishSession();
    }

    // When guillotined, persist the session record
    if (to === STATES.GUILLOTINED) {
      this._finishSession();
    }
  }

  /** @private Flush draft and save the session record to Supabase. */
  async _finishSession() {
    // Force-flush any pending draft sync
    await this.sync.flush(this._sessionId);

    const ctx = this.machine.ctx;
    const now = new Date().toISOString();

    const session = {
      id: this._sessionId,
      user_id: this._userId,
      started_at: ctx.sessionStartedAt
        ? new Date(ctx.sessionStartedAt).toISOString()
        : now,
      ended_at: now,
      duration_seconds: ctx.durationSeconds,
      target_words: ctx.targetWords,
      words_written: ctx.wordsWritten,
      guillotine_triggered: ctx.guillotineTriggered,
      grace_token_used: ctx.graceTokenUsed,
      status: this.machine.sessionStatus,
    };

    await this.sync.saveSession(session);

    // If session was guillotined, silently backup to Graveyard (Tiered Vault)
    if (this._userId && (ctx.guillotineTriggered || session.status === 'guillotined')) {
      const wordCount = this._countWords(this._text);
      await this.sync.saveToGraveyard(this._sessionId, this._userId, this._text, wordCount);
    }

    // Update profile last_active_at
    if (this._userId) {
      await this.sync.updateProfile(this._userId, {
        last_active_at: now,
      });
    }
  }

  /** @private Simple word counter. */
  _countWords(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }
}

// Re-export for convenience
export { STATES, EVENTS } from './state_machine.js';
export { SYNC_STATUS } from './sync_service.js';
