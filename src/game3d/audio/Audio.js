// Lightweight Web Audio synth for SFX + procedural music (no external assets).
export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.musicTimer = null;
  }
  _ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.45;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  tone(freq, dur, type = 'square', vol = 0.2, slideTo = null) {
    if (this.muted) return;
    this._ensure();
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur);
  }
  sfx(name) {
    switch (name) {
      case 'shoot': this.tone(880, 0.07, 'square', 0.12, 320); break;
      case 'grenade': this.tone(140, 0.35, 'sawtooth', 0.28, 40); break;
      case 'missile': this.tone(220, 0.45, 'sawtooth', 0.22, 70); break;
      case 'explosion': this.tone(70, 0.6, 'sawtooth', 0.4, 28); break;
      case 'hit': this.tone(440, 0.05, 'square', 0.1, 220); break;
      case 'enemyDie': this.tone(320, 0.2, 'sawtooth', 0.18, 90); break;
      case 'hurt': this.tone(160, 0.2, 'square', 0.22, 70); break;
      case 'jump': this.tone(300, 0.14, 'sine', 0.14, 620); break;
      case 'pickup': this.tone(600, 0.1, 'sine', 0.14, 920); break;
      case 'melee': this.tone(200, 0.12, 'sawtooth', 0.2, 120); break;
      case 'dodge': this.tone(420, 0.12, 'sine', 0.12, 700); break;
      case 'ability': this.tone(500, 0.3, 'triangle', 0.2, 900); break;
      case 'bossHit': this.tone(240, 0.1, 'square', 0.2, 160); break;
      case 'ui': this.tone(500, 0.05, 'sine', 0.1); break;
      case 'victory': this._jingle([523, 659, 784, 1046]); break;
      case 'gameover': this._jingle([420, 360, 300, 200], 0.3, 'sawtooth'); break;
    }
  }
  _jingle(notes, dur = 0.15, type = 'sine') {
    notes.forEach((n, i) => setTimeout(() => this.tone(n, dur, type, 0.2), i * 130));
  }
  toggle() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.45;
    return this.muted;
  }
  startMusic(track = 'combat') {
    this._ensure();
    if (this.musicTimer) return;
    const seq = track === 'boss' ? [110, 130, 165, 130, 98, 130] : [140, 176, 210, 176, 158, 176];
    let i = 0;
    this.musicTimer = setInterval(() => {
      if (this.muted) return;
      const f = seq[i % seq.length];
      this.tone(f, 0.5, 'triangle', 0.05);
      if (i % 4 === 0) this.tone(f / 2, 0.6, 'sine', 0.05);
      i++;
    }, 430);
  }
  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
}