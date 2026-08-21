// Weapon definitions + manager with ammo + auto-reload.
export const WEAPONS = {
  pulse: { name: 'PULSE', dmg: 11, rate: 0.12, speed: 70, range: 38, ammo: Infinity, max: Infinity, spread: 0.02, color: 0xfff0a0, pellets: 1 },
  rapid: { name: 'RAPID', dmg: 7, rate: 0.07, speed: 78, range: 34, ammo: 160, max: 160, spread: 0.06, color: 0x9ad0ff, pellets: 1, reload: 1.4 },
  shotgun: { name: 'SCATTER', dmg: 7, rate: 0.5, speed: 60, range: 18, ammo: 40, max: 40, spread: 0.2, color: 0xffd070, pellets: 7, reload: 1.6 },
  launcher: { name: 'AETHER', dmg: 0, rate: 0.9, speed: 36, range: 60, ammo: 12, max: 12, spread: 0, color: 0xff7a2c, pellets: 1, explode: 5, reload: 2.2 },
};

export class WeaponManager {
  constructor() {
    this.order = ['pulse', 'rapid', 'shotgun', 'launcher'];
    this.current = 'pulse';
    this.state = {};
    for (const k in WEAPONS) this.state[k] = { ammo: WEAPONS[k].ammo, reloading: 0 };
    this.cd = 0;
  }
  switchTo(k) { if (WEAPONS[k]) this.current = k; }
  next() { const i = this.order.indexOf(this.current); this.current = this.order[(i + 1) % this.order.length]; }
  info() {
    const w = WEAPONS[this.current]; const s = this.state[this.current];
    return { name: w.name, ammo: s.ammo === Infinity ? Infinity : s.ammo, max: w.max };
  }
  update(dt) {
    this.cd -= dt;
    for (const k in this.state) {
      const s = this.state[k];
      if (s.reloading > 0) { s.reloading -= dt; if (s.reloading <= 0) s.ammo = WEAPONS[k].ammo; }
    }
  }
  fire(origin, dir, projectiles, vfx, audio) {
    if (this.cd > 0) return false;
    const w = WEAPONS[this.current]; const s = this.state[this.current];
    if (s.ammo !== Infinity && s.ammo <= 0) {
      if (w.reload && s.reloading <= 0) s.reloading = w.reload;
      return false;
    }
    const life = w.range / w.speed;
    for (let i = 0; i < w.pellets; i++) {
      const d = dir.clone();
      if (w.spread > 0) {
        d.x += (Math.random() - 0.5) * w.spread;
        d.y += (Math.random() - 0.5) * w.spread;
        d.z += (Math.random() - 0.5) * w.spread;
        d.normalize();
      }
      if (this.current === 'launcher') projectiles.spawnMissile(origin, d, 0, w.speed, w.color, w.explode, w.dmg);
      else projectiles.spawnBullet(origin, d, w.dmg, w.speed, 'player', w.color, life);
    }
    vfx.muzzle(origin, dir);
    audio.sfx(this.current === 'launcher' ? 'missile' : 'shoot');
    if (s.ammo !== Infinity) s.ammo--;
    this.cd = w.rate;
    return true;
  }
}