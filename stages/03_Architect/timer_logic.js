/**
 * DeepFlow — Timer & Idle Detection Logic
 *
 * Manages three concurrent countdown concerns:
 *   1. Session timer   — total writing time remaining (e.g. 25 min)
 *   2. Idle detector   — fires after N seconds of no keystrokes
 *   3. Guillotine fuse — fires after M seconds in WARNING state
 *
 * All timers use requestAnimationFrame + performance.now() in the
 * browser, or setInterval fallback in Node / test environments.
 */

import { EVENTS } from './state_machine.js';

// ── Defaults ─────────────────────────────────────────────────────
const DEFAULTS = Object.freeze({
  idleThresholdMs: 5_000,       // 5 s of no keystrokes → WARNING
  guillotineThresholdMs: 10_000, // 10 s in WARNING → GUILLOTINED
  tickIntervalMs: 250,           // resolution of the timer loop
});

// ── Timer Controller ─────────────────────────────────────────────
export class TimerController {
  /**
   * @param {import('./state_machine.js').GuillotineStateMachine} machine
   * @param {object} opts
   */
  constructor(machine, opts = {}) {
    this.machine = machine;
    this.idleThresholdMs = opts.idleThresholdMs ?? DEFAULTS.idleThresholdMs;
    this.guillotineThresholdMs = opts.guillotineThresholdMs ?? DEFAULTS.guillotineThresholdMs;
    this.tickIntervalMs = opts.tickIntervalMs ?? DEFAULTS.tickIntervalMs;

    // Internal timestamps
    this._sessionStartMs = 0;
    this._sessionDurationMs = 0;
    this._lastKeystrokeMs = 0;
    this._warningEnteredMs = 0;

    // Elapsed / remaining (updated every tick)
    this.elapsedMs = 0;
    this.remainingMs = 0;

    // Timer handle
    this._intervalId = null;

    // External tick callback (for UI updates)
    this._onTick = opts.onTick ?? null;

    // Listen for state transitions to manage internal clocks
    this.machine.on('transition', (entry) => this._handleTransition(entry));
  }

  // ── Public API ───────────────────────────────────────────────

  /** Start the session timer. Call after machine.send(EVENTS.START). */
  start() {
    const durationSec = this.machine.ctx.durationSeconds;
    this._sessionDurationMs = durationSec * 1000;
    this._sessionStartMs = this._now();
    this._lastKeystrokeMs = this._sessionStartMs;
    this._warningEnteredMs = 0;
    this.elapsedMs = 0;
    this.remainingMs = this._sessionDurationMs;

    this._startLoop();
  }

  /** Record a keystroke (resets the idle timer). */
  keystroke() {
    this._lastKeystrokeMs = this._now();
  }

  /** Tear down all timers. */
  destroy() {
    this._stopLoop();
  }

  /** Pause the session timer (e.g. app backgrounded). */
  pause() {
    this._stopLoop();
  }

  /** Resume after a pause. */
  resume() {
    // Adjust timestamps so the gap doesn't count as idle
    const gap = this._now() - (this._sessionStartMs + this.elapsedMs);
    this._sessionStartMs += gap;
    this._lastKeystrokeMs = this._now();
    this._startLoop();
  }

  // ── Internal tick loop ───────────────────────────────────────

  /** @private */
  _startLoop() {
    if (this._intervalId) return;
    this._intervalId = setInterval(() => this._tick(), this.tickIntervalMs);
  }

  /** @private */
  _stopLoop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /** @private */
  _tick() {
    const now = this._now();
    this.elapsedMs = now - this._sessionStartMs;
    this.remainingMs = Math.max(0, this._sessionDurationMs - this.elapsedMs);

    const state = this.machine.state;

    // 1. Session complete?
    if (this.remainingMs <= 0 && (state === 'writing' || state === 'warning')) {
      this._stopLoop();
      this.machine.send(EVENTS.SESSION_COMPLETE);
      if (this._onTick) this._onTick(this._tickData());
      return;
    }

    // 2. Currently WRITING — check for idle
    if (state === 'writing') {
      const idleMs = now - this._lastKeystrokeMs;
      if (idleMs >= this.idleThresholdMs) {
        this.machine.send(EVENTS.IDLE_TIMEOUT);
        // _warningEnteredMs will be set in _handleTransition
      }
    }

    // 3. Currently WARNING — check for guillotine
    if (state === 'warning' && this._warningEnteredMs > 0) {
      const warningMs = now - this._warningEnteredMs;
      if (warningMs >= this.guillotineThresholdMs) {
        this._stopLoop();
        this.machine.send(EVENTS.GUILLOTINE_TIMEOUT);
      }
    }

    // 4. Broadcast tick
    if (this._onTick) this._onTick(this._tickData());
  }

  // ── State-transition side-effects ────────────────────────────

  /** @private */
  _handleTransition(entry) {
    const { to } = entry;

    if (to === 'warning') {
      this._warningEnteredMs = this._now();
    }

    if (to === 'writing' && (entry.from === 'warning' || entry.from === 'saved_by_grace')) {
      // User resumed — reset idle baseline
      this._lastKeystrokeMs = this._now();
      this._warningEnteredMs = 0;
      if (!this._intervalId) this._startLoop();
    }

    if (to === 'guillotined' || to === 'completed' || to === 'idle') {
      this._stopLoop();
    }

    if (to === 'saved_by_grace') {
      // Restart the loop — user gets another chance
      this._warningEnteredMs = 0;
      this._lastKeystrokeMs = this._now();
      if (!this._intervalId) this._startLoop();
    }
  }

  // ── Helpers ──────────────────────────────────────────────────

  /** @private High-res timestamp (ms). */
  _now() {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.timeOrigin + performance.now();
    }
    return Date.now();
  }

  /** @private Build tick payload for the UI. */
  _tickData() {
    const now = this._now();
    return {
      state: this.machine.state,
      elapsedMs: this.elapsedMs,
      remainingMs: this.remainingMs,
      idleSinceMs: now - this._lastKeystrokeMs,
      warningSinceMs: this._warningEnteredMs > 0 ? now - this._warningEnteredMs : 0,
      graceTokens: this.machine.ctx.graceTokens,
    };
  }
}
