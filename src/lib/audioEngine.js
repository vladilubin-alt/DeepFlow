const AudioEngine = {
  ctx: null,
  leftOsc: null,
  rightOsc: null,
  gainNode: null,
  leftPanner: null,
  rightPanner: null,
  mode: 'off',
  state: 'idle',

  async start(mode) {
    if (mode === 'off') { this.stop(); return; }
    if (this.ctx && this.mode === mode) return;
    this.stop();

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') await this.ctx.resume();

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.08;
      this.gainNode.connect(this.ctx.destination);

      this.leftPanner = this.ctx.createStereoPanner();
      this.leftPanner.pan.value = -1;
      this.rightPanner = this.ctx.createStereoPanner();
      this.rightPanner.pan.value = 1;

      const baseFreq = mode === 'alpha' ? 200 : 220;
      const beatFreq = mode === 'alpha' ? 6 : 14;

      this.leftOsc = this.ctx.createOscillator();
      this.leftOsc.type = 'sine';
      this.leftOsc.frequency.value = baseFreq;
      this.leftOsc.connect(this.leftPanner);
      this.leftPanner.connect(this.gainNode);
      this.leftOsc.start();

      this.rightOsc = this.ctx.createOscillator();
      this.rightOsc.type = 'sine';
      this.rightOsc.frequency.value = baseFreq + beatFreq;
      this.rightOsc.connect(this.rightPanner);
      this.rightPanner.connect(this.gainNode);
      this.rightOsc.start();

      this.mode = mode;
    } catch (e) {
      console.warn('[AudioEngine] start error:', e.message);
    }
  },

  stop() {
    try { this.leftOsc?.stop(); } catch {}
    try { this.rightOsc?.stop(); } catch {}
    try { this.ctx?.close(); } catch {}
    this.leftOsc = null;
    this.rightOsc = null;
    this.gainNode = null;
    this.leftPanner = null;
    this.rightPanner = null;
    this.ctx = null;
    this.mode = 'off';
  },

  setGain(value, rampSec = 0.3) {
    if (!this.gainNode || !this.ctx) return;
    try {
      this.gainNode.gain.linearRampToValueAtTime(value, this.ctx.currentTime + rampSec);
    } catch {}
  },

  updateState(sessionState) {
    this.state = sessionState;
    switch (sessionState) {
      case 'warning':
        this.setGain(0.14, 0.3);
        break;
      case 'guillotined':
      case 'completed':
        this.setGain(0, 1);
        setTimeout(() => this.stop(), 1100);
        break;
      default:
        this.setGain(0.08, 0.3);
    }
  },

  isRunning() {
    return this.mode !== 'off' && this.ctx !== null;
  },
};

export default AudioEngine;
