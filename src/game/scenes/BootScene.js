// BootScene — loads assets and shows the IYADEL boot splash.
// Phase 2 placeholder: no external assets yet, so we animate a progress bar
// and then display a "READY" state. Real preloading starts in Phase 3+.
import Phaser from 'phaser';
import { SaveManager } from '../save/SaveManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // No external assets to load yet. Simulate a short load so the bar animates.
    const { width, height } = this.scale;
    const barW = Math.min(440, width * 0.7);
    const barH = 14;
    const barX = (width - barW) / 2;
    const barY = height / 2 + 40;

    this.add.rectangle(barX, barY, barW, barH, 0x2a2540).setOrigin(0, 0.5);
    const fill = this.add.rectangle(barX, barY, 0, barH, 0xf5c451).setOrigin(0, 0.5);

    this.load.on('progress', (value) => {
      fill.width = barW * value;
    });
  }

  create() {
    const { width, height } = this.scale;

    // Title — iyadel brand colors.
    const title = this.add.text(width / 2, height / 2 - 30, 'IYADEL', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#f5c451',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 12, 'Action Run-and-Gun', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '20px',
      color: '#a89ce0',
    }).setOrigin(0.5);

    const status = this.add.text(width / 2, height / 2 + 90, 'PHASE 2 — ENGINE READY', {
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '16px',
      color: '#6f6a8a',
    }).setOrigin(0.5);

    // Subtle pulse on the title for "game feel" feedback.
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.06 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    this.tweens.add({
      targets: status,
      alpha: { from: 0.35, to: 1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    const prompt = this.add
      .text(width / 2, height - 80, 'TAP / PRESS ENTER TO START', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '18px',
        color: '#e6e1ff',
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: prompt,
      alpha: { from: 0.3, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    const best = SaveManager.load().highScore;
    const bestText = this.add
      .text(width / 2, height / 2 + 120, 'BEST  ' + best, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '16px',
        color: '#52d9a8',
      })
      .setOrigin(0.5);

    // Sync the best score from the server when signed in.
    SaveManager.pullRemote().then((remoteHigh) => {
      if (remoteHigh != null && remoteHigh !== best) bestText.setText('BEST  ' + remoteHigh);
    });

    const start = () => this.scene.start('Play');
    this.input.keyboard.once('keydown-ENTER', start);
    this.input.once('pointerdown', start);
  }
}