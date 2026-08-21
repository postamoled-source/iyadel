// MainMenu — title screen with difficulty selection, best score and play.
import Phaser from 'phaser';
import { SaveManager } from '../save/SaveManager';
import { DEFS } from '../systems/Achievements';

export class MainMenu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1430, 0x1a1430, 0x3a2a6a, 0x0b0a14, 1);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, height * 0.2, 'IYADEL', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '72px',
        fontStyle: 'bold',
        color: '#f5c451',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height * 0.2 + 60, 'Neo-Pulse', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '22px',
        color: '#a89ce0',
      })
      .setOrigin(0.5);
    this.bestText = this.add
      .text(width / 2, height * 0.2 + 110, 'BEST  ' + SaveManager.load().highScore, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '20px',
        color: '#52d9a8',
      })
      .setOrigin(0.5);
    const unlocked = SaveManager.load().unlocked || [];
    this.add
      .text(width / 2, height * 0.2 + 140, 'ACHIEVEMENTS  ' + unlocked.length + '/' + DEFS.length, {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '14px',
        color: '#a89ce0',
      })
      .setOrigin(0.5);

    // Difficulty selector.
    this.add
      .text(width / 2, height * 0.5 - 50, 'DIFFICULTY', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '16px',
        color: '#a89ce0',
      })
      .setOrigin(0.5);
    this.diff = this.game.registry.get('difficulty') || 'normal';
    this.diffBtns = {};
    const opts = [
      ['easy', 'EASY', 0x52d9a8],
      ['normal', 'NORMAL', 0xf5c451],
      ['hard', 'HARD', 0xff5c6c],
    ];
    const spacing = 150;
    opts.forEach(([key, label], i) => {
      const t = this.add
        .text(width / 2 + (i - 1) * spacing, height * 0.5, label, {
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontSize: '22px',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => {
        this.diff = key;
        this.game.registry.set('difficulty', key);
        this.refreshDiff();
      });
      this.diffBtns[key] = t;
    });
    this.refreshDiff();

    // Play.
    const play = this.add
      .text(width / 2, height * 0.72, '▶ PLAY', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '34px',
        color: '#ffffff',
        backgroundColor: '#6c4dff',
        padding: { x: 28, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    play.on('pointerdown', () => this.scene.start('Play'));

    this.add
      .text(width / 2, height - 40, 'TAP PLAY OR PRESS ENTER', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '14px',
        color: '#6f6a8a',
      })
      .setOrigin(0.5);
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Play'));

    SaveManager.pullRemote().then((r) => {
      if (r != null) this.bestText.setText('BEST  ' + SaveManager.load().highScore);
    });
  }

  refreshDiff() {
    Object.entries(this.diffBtns).forEach(([k, t]) => {
      t.setColor(k === this.diff ? '#ffffff' : '#777777');
    });
  }
}