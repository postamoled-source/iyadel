// Pickup + PickupManager — collectible power-ups (Phase 6).
import Phaser from 'phaser';

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, type);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.type = type;
    this.body.setAllowGravity(false);
    this.setCollideWorldBounds(false);
    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }
}

export class PickupManager {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group();
  }

  spawn(type, x, y) {
    const p = new Pickup(this.scene, x, y, type);
    this.group.add(p);
    return p;
  }
}