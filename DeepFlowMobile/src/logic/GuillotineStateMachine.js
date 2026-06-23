export const STATES = Object.freeze({
  IDLE: 'idle',
  WRITING: 'writing',
  WARNING: 'warning',
  GUILLOTINED: 'guillotined',
  SAVED_BY_GRACE: 'saved_by_grace',
  COMPLETED: 'completed',
});

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

export class GuillotineStateMachine {
  constructor(opts = {}) {
    this._state = STATES.IDLE;
    this._listeners = new Map();
    this._history = [];
    this.ctx = {
      graceTokens: opts.graceTokens ?? 3,
      targetWords: opts.targetWords ?? 0,
      durationSeconds: opts.durationSeconds ?? 1500,
      wordsWritten: 0,
      sessionStartedAt: null,
      guillotineTriggered: false,
      graceTokenUsed: false,
    };
  }

  get state() { return this._state; }

  send(event, payload = {}) {
    const stateTransitions = TRANSITIONS[this._state];
    if (!stateTransitions) return false;
    const edge = stateTransitions[event];
    if (!edge) return false;
    if (edge.guard && !edge.guard(this.ctx)) {
      this._emit('guard_rejected', { event, state: this._state });
      return false;
    }
    const prev = this._state;
    if (edge.action) edge.action(this.ctx);
    if (event === EVENTS.START) {
      this.ctx.sessionStartedAt = Date.now();
      this.ctx.wordsWritten = 0;
      this.ctx.guillotineTriggered = false;
      this.ctx.graceTokenUsed = false;
    }
    if (event === EVENTS.GUILLOTINE_TIMEOUT) this.ctx.guillotineTriggered = true;
    if (event === EVENTS.USE_GRACE_TOKEN) this.ctx.graceTokenUsed = true;
    if (payload.wordsWritten !== undefined) this.ctx.wordsWritten = payload.wordsWritten;
    this._state = edge.target;
    const entry = { from: prev, to: this._state, event, timestamp: Date.now(), ctx: { ...this.ctx } };
    this._history.push(entry);
    this._emit('transition', entry);
    return true;
  }

  on(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(fn);
    return () => this._listeners.get(type).delete(fn);
  }

  _emit(type, data) {
    const subs = this._listeners.get(type);
    if (subs) subs.forEach((fn) => fn(data));
  }

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
