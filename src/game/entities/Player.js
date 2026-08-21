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