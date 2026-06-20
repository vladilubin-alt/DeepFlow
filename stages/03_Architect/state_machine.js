/**
 * DeepFlow — Forgiving Guillotine State Machine
 *
 * States:
 *   idle        → User has not started a session
 *   writing     → User is actively typing within a timed session
 *   warning     → User stopped typing; idle countdown is ticking
 *   guillotined → Idle timeout expired; session is "cut"
 *   saved_by_grace → User spent a Grace Token to rescue the session
 *   completed   → User reached the target duration successfully
 *
 * Deterministic rule: every transition is triggered by an explicit event;
 * no probabilistic or AI-driven branching is allowed in state logic.
 */

// ── State constants ──────────────────────────────────────────────
export const STATES = Object.freeze({
  IDLE: 'idle',
  WRITING: 'writing',
  WARNING: 'warning',
  GUILLOTINED: 'guillotined',
  SAVED_BY_GRACE: 'saved_by_grace',
  COMPLETED: 'completed',
});

// ── Event constants ──────────────────────────────────────────────
export const EVENTS = Object.freeze({
  START: 'start',
  KEYSTROKE: 'keystroke',
  IDLE_TIMEOUT: 'idle_timeout',
  GUILLOTINE_TIMEOUT: 'guillotine_timeout',
  USE_GRACE_TOKEN: 'use_grace_token',
  GIVE_UP: 'give_up',
  SESSION_COMPLETE: 'session_complete',
  RESET: 'reset',
});

// ── Transition table ─────────────────────────────────────────────
// Map<currentState, Map<event, { target, guard?, action? }>>
const TRANSITIONS = {
  [STATES.IDLE]: {
    [EVENTS.START]: { target: STATES.WRITING },
  },
  [STATES.WRITING]: {
    [EVENTS.IDLE_TIMEOUT]: { target: STATES.WARNING },
    [EVENTS.SESSION_COMPLETE]: { target: STATES.COMPLETED },
  },
  [STATES.WARNING]: {
    [EVENTS.KEYSTROKE]: { target: STATES.WRITING },
    [EVENTS.GUILLOTINE_TIMEOUT]: { target: STATES.GUILLOTINED },
  },
  [STATES.GUILLOTINED]: {
    [EVENTS.USE_GRACE_TOKEN]: {
      target: STATES.SAVED_BY_GRACE,
      guard: (ctx) => ctx.graceTokens > 0,
      action: (ctx) => { ctx.graceTokens -= 1; },
    },
    [EVENTS.GIVE_UP]: { target: STATES.IDLE },
  },
  [STATES.SAVED_BY_GRACE]: {
    [EVENTS.KEYSTROKE]: { target: STATES.WRITING },
  },
  [STATES.COMPLETED]: {
    [EVENTS.RESET]: { target: STATES.IDLE },
  },
};

// ── State Machine Class ──────────────────────────────────────────
export class GuillotineStateMachine {
  /**
   * @param {object} opts
   * @param {number} opts.graceTokens    — starting grace tokens (default 3)
   * @param {number} opts.targetWords    — target word count for the session
   * @param {number} opts.durationSeconds — target session duration in seconds
   */
  constructor(opts = {}) {
    this._state = STATES.IDLE;
    this._listeners = new Map();
    this._history = [];

    // Session context — mutable, passed to guards & actions
    this.ctx = {
      graceTokens: opts.graceTokens ?? 3,
      targetWords: opts.targetWords ?? 0,
      durationSeconds: opts.durationSeconds ?? 1500, // 25 min default
      wordsWritten: 0,
      sessionStartedAt: null,
      guillotineTriggered: false,
      graceTokenUsed: false,
    };
  }

  /** Current state (read-only). */
  get state() {
    return this._state;
  }

  /** Full transition history for debugging / analytics. */
  get history() {
    return [...this._history];
  }

  // ── Event dispatch ───────────────────────────────────────────
  /**
   * Send an event to the machine. Returns `true` if a transition
   * occurred, `false` if the event was ignored.
   */
  send(event, payload = {}) {
    const stateTransitions = TRANSITIONS[this._state];
    if (!stateTransitions) return false;

    const edge = stateTransitions[event];
    if (!edge) return false;

    // Evaluate optional guard
    if (edge.guard && !edge.guard(this.ctx)) {
      this._emit('guard_rejected', { event, state: this._state });
      return false;
    }

    const prev = this._state;

    // Execute optional side-effect
    if (edge.action) {
      edge.action(this.ctx);
    }

    // Apply context mutations from payload
    if (event === EVENTS.START) {
      this.ctx.sessionStartedAt = Date.now();
      this.ctx.wordsWritten = 0;
      this.ctx.guillotineTriggered = false;
      this.ctx.graceTokenUsed = false;
    }

    if (event === EVENTS.GUILLOTINE_TIMEOUT) {
      this.ctx.guillotineTriggered = true;
    }

    if (event === EVENTS.USE_GRACE_TOKEN) {
      this.ctx.graceTokenUsed = true;
    }

    if (payload.wordsWritten !== undefined) {
      this.ctx.wordsWritten = payload.wordsWritten;
    }

    // Transition
    this._state = edge.target;

    const entry = {
      from: prev,
      to: this._state,
      event,
      timestamp: Date.now(),
      ctx: { ...this.ctx },
    };
    this._history.push(entry);

    this._emit('transition', entry);
    return true;
  }

  // ── Observable ───────────────────────────────────────────────
  /**
   * Subscribe to machine events.
   * @param {'transition'|'guard_rejected'} type
   * @param {Function} fn
   * @returns {Function} unsubscribe handle
   */
  on(type, fn) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    this._listeners.get(type).add(fn);
    return () => this._listeners.get(type).delete(fn);
  }

  /** @private */
  _emit(type, data) {
    const subs = this._listeners.get(type);
    if (subs) subs.forEach((fn) => fn(data));
  }

  // ── Snapshot / Hydrate ───────────────────────────────────────
  /** Serialize the machine for persistence. */
  snapshot() {
    return {
      state: this._state,
      ctx: { ...this.ctx },
      history: this._history,
    };
  }

  /** Restore from a snapshot. */
  static hydrate(snap) {
    const m = new GuillotineStateMachine();
    m._state = snap.state;
    m.ctx = { ...snap.ctx };
    m._history = snap.history ?? [];
    return m;
  }

  // ── Convenience helpers for session summary ──────────────────
  /** Derive the Supabase `status` enum value from the current state. */
  get sessionStatus() {
    const map = {
      [STATES.IDLE]: null,
      [STATES.WRITING]: 'active',
      [STATES.WARNING]: 'active',
      [STATES.GUILLOTINED]: 'guillotined',
      [STATES.SAVED_BY_GRACE]: 'saved_by_grace',
      [STATES.COMPLETED]: 'completed',
    };
    return map[this._state] ?? null;
  }
}
