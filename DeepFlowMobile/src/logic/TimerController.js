import { EVENTS } from './GuillotineStateMachine';

const DEFAULTS = Object.freeze({
  idleThresholdMs: 5_000,
  guillotineThresholdMs: 10_000,
  tickIntervalMs: 250,
});

export class TimerController {
  constructor(machine, opts = {}) {
    this.machine = machine;
    this.idleThresholdMs = opts.idleThresholdMs ?? DEFAULTS.idleThresholdMs;
    this.guillotineThresholdMs = opts.guillotineThresholdMs ?? DEFAULTS.guillotineThresholdMs;
    this.tickIntervalMs = opts.tickIntervalMs ?? DEFAULTS.tickIntervalMs;
    this._sessionStartMs = 0;
    this._sessionDurationMs = 0;
    this._lastKeystrokeMs = 0;
    this._warningEnteredMs = 0;
    this.elapsedMs = 0;
    this.remainingMs = 0;
    this._intervalId = null;
    this._onTick = opts.onTick ?? null;
    this.machine.on('transition', (entry) => this._handleTransition(entry));
  }

  start() {
    const durationSec = this.machine.ctx.durationSeconds;
    this._sessionDurationMs = durationSec * 1000;
    this._sessionStartMs = Date.now();
    this._lastKeystrokeMs = this._sessionStartMs;
    this._warningEnteredMs = 0;
    this.elapsedMs = 0;
    this.remainingMs = this._sessionDurationMs;
    this._startLoop();
  }

  keystroke() { this._lastKeystrokeMs = Date.now(); }

  destroy() { this._stopLoop(); }

  pause() { this._stopLoop(); }

  resume() {
    const gap = Date.now() - (this._sessionStartMs + this.elapsedMs);
    this._sessionStartMs += gap;
    this._lastKeystrokeMs = Date.now();
    this._startLoop();
  }

  _startLoop() {
    if (this._intervalId) return;
    this._intervalId = setInterval(() => this._tick(), this.tickIntervalMs);
  }

  _stopLoop() {
    if (this._intervalId) { clearInterval(this._intervalId); this._intervalId = null; }
  }

  _tick() {
    const now = Date.now();
    this.elapsedMs = now - this._sessionStartMs;
    this.remainingMs = Math.max(0, this._sessionDurationMs - this.elapsedMs);
    const state = this.machine.state;
    if (this.remainingMs <= 0 && (state === 'writing' || state === 'warning')) {
      this._stopLoop();
      this.machine.send(EVENTS.SESSION_COMPLETE);
      if (this._onTick) this._onTick(this._tickData());
      return;
    }
    if (state === 'writing') {
      const idleMs = now - this._lastKeystrokeMs;
      if (idleMs >= this.idleThresholdMs) this.machine.send(EVENTS.IDLE_TIMEOUT);
    }
    if (state === 'warning' && this._warningEnteredMs > 0) {
      const warningMs = now - this._warningEnteredMs;
      if (warningMs >= this.guillotineThresholdMs) {
        this._stopLoop();
        this.machine.send(EVENTS.GUILLOTINE_TIMEOUT);
      }
    }
    if (this._onTick) this._onTick(this._tickData());
  }

  _handleTransition(entry) {
    const { to } = entry;
    if (to === 'warning') this._warningEnteredMs = Date.now();
    if (to === 'writing' && (entry.from === 'warning' || entry.from === 'saved_by_grace')) {
      this._lastKeystrokeMs = Date.now();
      this._warningEnteredMs = 0;
      if (!this._intervalId) this._startLoop();
    }
    if (to === 'guillotined' || to === 'completed' || to === 'idle') this._stopLoop();
    if (to === 'saved_by_grace') {
      this._warningEnteredMs = 0;
      this._lastKeystrokeMs = Date.now();
      if (!this._intervalId) this._startLoop();
    }
  }

  _tickData() {
    const now = Date.now();
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
