// Player — the playable character (iyadel protagonist).
// Uses arcade physics: horizontal movement, gravity jump, facing direction for shooting.
import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setGravityY(1500);
    this.speed = 260;
    this.jumpVel = 680;
    this.facing = 1; // 1 = right, -1 = left
    this.canShoot = true;
    this.fireCooldown = 240;
    this.maxHp = 100;
    this.hp = 100;
    this.invulnUntil = 0;
    this.shieldUntil = 0;
  }

  takeDamage(d, time) {
    if (time < this.shieldUntil) return false;
    if (time < this.invulnUntil) return false;
    this.hp -= d;
    this.invulnUntil = time + 900;
    this.setTint(0xff5c6c);
    this.scene.time.delayedCall(220, () => this.clearTint());
    return this.hp <= 0;
  }

  moveLeft() {
    this.setVelocityX(-this.speed);
    this.facing = -1;
    this.flipX = true;
  }

  moveRight() {
    this.setVelocityX(this.speed);
    this.facing = 1;
    this.flipX = false;
  }

  stop() {
    this.setVelocityX(0);
  }

  jump() {
    if (this.body.blocked.down || this.body.touching.down) {
      this.setVelocityY(-this.jumpVel);
    }
  }
}