// Achievements — milestone tracking with in-game unlock toasts, persisted locally.
import { SaveManager } from '../save/SaveManager';

export const DEFS = [
  { id: 'first_blood', name: 'First Blood', desc: 'Defeat your first enemy' },
  { id: 'centurion', name: 'Centurion', desc: 'Defeat 100 enemies' },
  { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Destroy the boss' },
  { id: 'sharpshooter', name: 'Sharpshooter', desc: 'Score 5000 in one run' },
  { id: 'survivor', name: 'Survivor', desc: 'Complete a run victorious' },
  { id: 'hoarder', name: 'Collector', desc: 'Collect 50 gems' },
];

export class Achievements {
  constructor(scene) {
    this.scene = scene;
    this.unlocked = SaveManager.load().unlocked || [];
  }

  _check(id, cond) {
    if (cond && !this.unlocked.includes(id)) {
      this.unlocked.push(id);
      SaveManager.unlock(id);
      this._toast(id);
    }
  }

  onEnemyKill() {
    const k = SaveManager.addKill();
    this._check('first_blood', k >= 1);
    this._check('centurion', k >= 100);
  }

  onGem() {
    const g = SaveManager.addGem();
    this._check('hoarder', g >= 50);
  }

  onBossKill() {
    this._check('boss_slayer', true);
  }

  onRunEnd(score, won) {
    this._check('sharpshooter', score >= 5000);
    if (won) this._check('survivor', true);
  }

  _toast(id) {
    const def = DEFS.find((d) => d.id === id);
    if (!def) return;
    const { width } = this.scene.scale;
    const t = this.scene.add
      .text(width / 2, 150, '🏆 ' + def.name + ' unlocked', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#6c4dff',
        padding: { x: 14, y: 7 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(60)
      .setAlpha(0);
    this.scene.tweens.add({
      targets: t,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1800,
      onComplete: () => t.destroy(),
    });
  }
}