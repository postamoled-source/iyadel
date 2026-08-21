// Weapons — multiple weapon types + manager (switch + cooldown).
// Phase 4: distinct fire behaviors per weapon.
import Phaser from 'phaser';

function spawnBullet(bullets, player, opts) {
  const { speed, tint, texture, angleDeg, scale } = opts;
  const bx = player.x + player.facing * 20;
  const by = player.y - 8;
  const b = bullets.create(bx, by, texture);
  const rad = Phaser.Math.DegToRad(angleDeg || 0);
  b.setVelocityX(player.facing * speed * Math.cos(rad));
  b.setVelocityY(speed * Math.sin(rad));
  if (tint != null) b.setTint(tint);
  if (scale) b.setScale(scale);
  b.setGravityY(0);
  b.setCollideWorldBounds(false);
  b.body.setAllowGravity(false);
  return b;
}

export const WEAPONS = {
  pulse: {
    name: 'Pulse Blaster',
    cooldown: 240,
    fire(scene, player, bullets) {
      const b = spawnBullet(bullets, player, { speed: 620, tint: 0xf5c451, texture: 'bullet' });
      scene.time.delayedCall(1200, () => b.destroy());
    },
  },
  spread: {
    name: 'Spread Shot',
    cooldown: 360,
    fire(scene, player, bullets) {
      [-12, 0, 12].forEach((a) => {
        const b = spawnBullet(bullets, player, {
          speed: 560,
          tint: 0x52d9a8,
          texture: 'bullet',
          angleDeg: a,
        });
        scene.time.delayedCall(1000, () => b.destroy());
      });
    },
  },
  rapid: {
    name: 'Rapid Laser',
    cooldown: 120,
    fire(scene, player, bullets) {
      const b = spawnBullet(bullets, player, {
        speed: 820,
        tint: 0xff5c8a,
        texture: 'bullet',
        scale: 0.7,
      });
      scene.time.delayedCall(900, () => b.destroy());
    },
  },
};

export class WeaponManager {
  constructor(scene) {
    this.scene = scene;
    this.order = ['pulse', 'spread', 'rapid'];
    this.current = 'pulse';
    this.lastFire = 0;
  }

  switchTo(key) {
    if (WEAPONS[key]) this.current = key;
  }

  next() {
    const i = this.order.indexOf(this.current);
    this.current = this.order[(i + 1) % this.order.length];
  }

  canFire(time) {
    return time - this.lastFire >= WEAPONS[this.current].cooldown;
  }

  fire(player, bullets, time) {
    if (!this.canFire(time)) return;
    WEAPONS[this.current].fire(this.scene, player, bullets);
    this.lastFire = time;
  }
}