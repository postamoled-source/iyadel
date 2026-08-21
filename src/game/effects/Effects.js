// Effects — particle bursts, screen flash and camera shake for game "juice".
import Phaser from 'phaser';

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.ensureTextures();
  }

  ensureTextures() {
    if (!this.scene.textures.exists('fx_spark')) {
      const g = this.scene.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('fx_spark', 8, 8);
      g.destroy();
    }
  }

  burst(x, y, color, count = 12, speed = 200) {
    const emitter = this.scene.add.particles(x, y, 'fx_spark', {
      speed: { min: speed * 0.3, max: speed },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 },
      lifespan: 450,
      blendMode: 'ADD',
      quantity: count,
      tint: color,
      emitting: false,
    });
    emitter.setDepth(20).explode(count);
    this.scene.time.delayedCall(550, () => emitter.destroy());
  }

  flash(color = 0xffffff) {
    const f = this.scene.add
      .rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, color, 0.35)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(55);
    this.scene.tweens.add({
      targets: f,
      alpha: 0,
      duration: 140,
      onComplete: () => f.destroy(),
    });
  }

  shake(intensity = 0.01, duration = 200) {
    this.scene.cameras.main.shake(duration, intensity);
  }
}