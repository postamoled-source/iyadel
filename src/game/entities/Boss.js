// Boss — multi-phase boss fight (Phase 7).
import Phaser from 'phaser';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, bullets) {
    super(scene, x, y, 'boss');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.bullets = bullets;
    this.maxHp = 60;
    this.hp = 60;
    this.alive = true;
    this.lastShot = 0;
    this.body.setAllowGravity(false);
    this.setCollideWorldBounds(true);
    this.body.setImovable(true);
    scene.tweens.add({
      targets: this,
      scale: 1.06,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  get phase() {
    const r = this.hp / this.maxHp;
    if (r > 0.66) return 1;
    if (r > 0.33) return 2;
    return 3;
  }

  update(player, time) {
    if (!this.alive) return;
    const dy = player.y - this.y;
    this.setVelocityY(Math.sign(dy) * 55);
    this.setVelocityX(Math.sin(time / 650) * 40);
    const phase = this.phase;
    const cd = phase === 1 ? 1100 : phase === 2 ? 700 : 450;
    if (time - this.lastShot > cd) {
      this.lastShot = time;
      if (phase === 1) this.spread(player, 5, 220);
      else if (phase === 2) this.spiral(time, 8, 200);
      else this.rapid(player, 3, 280);
    }
  }

  spread(player, count, speed) {
    const base = Math.atan2(player.y - this.y, player.x - this.x);
    for (let i = 0; i < count; i++) {
      const a = base + (i - (count - 1) / 2) * 0.18;
      this.fire(Math.cos(a) * speed, Math.sin(a) * speed);
    }
  }

  spiral(time, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = (time / 300 + (i * Math.PI * 2) / count) % (Math.PI * 2);
      this.fire(Math.cos(a) * speed, Math.sin(a) * speed);
    }
  }

  rapid(player, count, speed) {
    const base = Math.atan2(player.y - this.y, player.x - this.x);
    for (let i = 0; i < count; i++) {
      const a = base + (Math.random() - 0.5) * 0.12;
      this.fire(Math.cos(a) * speed, Math.sin(a) * speed);
    }
  }

  fire(vx, vy) {
    const b = this.bullets.create(this.x, this.y, 'bullet');
    b.setTint(0xff5c6c);
    b.setVelocity(vx, vy);
    b.setGravityY(0);
    b.body.setAllowGravity(false);
    this.scene.time.delayedCall(4000, () => b.destroy());
  }

  hit(d) {
    if (!this.alive) return false;
    this.hp -= d;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => this.clearTint());
    return this.hp <= 0;
  }

  kill() {
    this.alive = false;
    this.destroy();
  }
}