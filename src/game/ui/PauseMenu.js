// PauseMenu — overlay shown while gameplay is soft-paused (physics frozen, update gated).
export class PauseMenu {
  constructor(scene) {
    this.scene = scene;
    this.shown = false;
  }

  toggle() {
    this.shown ? this.hide() : this.show();
  }

  show() {
    if (this.shown) return;
    this.shown = true;
    this.scene.paused = true;
    this.scene.physics.world.pause();
    if (this.scene.soundOn) stopMusic();

    const { width, height } = this.scene.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.bg = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(70);
    this.box = this.scene.add
      .rectangle(cx, cy, 280, 280, 0x1a1430, 0.95)
      .setStrokeStyle(2, 0x6c4dff, 0.8)
      .setScrollFactor(0)
      .setDepth(71);
    this.title = this.scene.add
      .text(cx, cy - 90, 'PAUSED', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '30px',
        color: '#f5c451',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(72);

    this._btn(cx, cy - 30, 'RESUME', () => this.hide());
    this._btn(cx, cy + 20, 'RESTART', () => this.scene.scene.restart());

    this.soundBtn = this.scene.add
      .text(cx, cy + 70, this._soundLabel(), {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '20px',
        color: '#52d9a8',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(72)
      .setInteractive({ useHandCursor: true });
    this.soundBtn.on('pointerdown', () => {
      this.scene.toggleMute();
      this.soundBtn.setText(this._soundLabel());
    });
  }

  hide() {
    if (!this.shown) return;
    this.shown = false;
    this.scene.paused = false;
    this.scene.physics.world.resume();
    if (this.scene.soundOn) startMusic('iyadel');
    [this.bg, this.box, this.title, this.soundBtn, ...(this.btns || [])].forEach((o) => o && o.destroy());
    this.btns = [];
  }

  _btn(x, y, label, onClick) {
    const t = this.scene.add
      .text(x, y, label, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '20px',
        color: '#e6e1ff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(72)
      .setInteractive({ useHandCursor: true });
    t.on('pointerdown', onClick);
    (this.btns = this.btns || []).push(t);
    return t;
  }

  _soundLabel() {
    return 'SOUND: ' + (this.scene.soundOn ? 'ON' : 'OFF');
  }
}

// Local imports to avoid circular coupling with the scene's audio setup.
import { startMusic, stopMusic } from '@/lib/game-music';