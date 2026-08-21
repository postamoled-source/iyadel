// Enemy + EnemyManager — enemy types with simple AI (Phase 5).
import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, type);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.type = type;
    this.dir = 1;
    this.hp = 1;
    this.value = 100;
    this.lastShot = 0;
    this.cooldown = 1400;

    if (type === 'drone') {
      this.speed = 90;
      this.hp = 2;
      this.value = 150;
      this.body.setAllowGravity(false);
      this.setCollideWorldBounds(true);
    } else if (type === 'walker') {
      this.speed = 70;
      this.hp = 2;
      this.value = 100;
      this.setGravityY(1500);
      this.setCollideWorldBounds(true);
    } else if (type === 'turret') {
      this.speed = 0;
      this.hp = 3;
      this.value = 200;
      this.setGravityY(1500);
      this.body.setImmovable(true);
    }
  }

  updateAI(player, time, enemyBullets, scene) {
    if (this.type === 'drone') {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const d = Math.hypot(dx, dy) || 1;
      this.setVelocityX((dx / d) * this.speed);
      this.setVelocityY((dy / d) * this.speed);
    } else if (this.type === 'walker') {
      this.setVelocityX(this.dir * this.speed);
      if (this.body.blocked.right) this.dir = -1;
      else if (this.body.blocked.left) this.dir = 1;
      this.flipX = this.dir < 0;
    } else if (this.type === 'turret') {
      this.setVelocityX(0);
      if (time - this.lastShot > this.cooldown) {
        this.lastShot = time;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const d = Math.hypot(dx, dy) || 1;
        const b = enemyBullets.create(this.x, this.y - 6, 'bullet');
        b.setTint(0xff5c6c);
        b.setVelocityX((dx / d) * 320);
        b.setVelocityY((dy / d) * 320);
        b.setGravityY(0);
        b.body.setAllowGravity(false);
        scene.time.delayedCall(2500, () => b.destroy());
      }
    }
  }

  hit(damage = 1) {
    this.hp -= damage;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => this.clearTint());
    return this.hp <= 0;
  }
}

export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.ground = scene.physics.add.group();
    this.air = scene.physics.add.group();
    this.enemyBullets = scene.physics.add.group();
  }

  spawn(type, x, y) {
    const e = new Enemy(this.scene, x, y, type);
    if (type === 'drone') this.air.add(e);
    else this.ground.add(e);
    return e;
  }

  update(player, time) {
    [...this.ground.getChildren(), ...this.air.getChildren()].forEach((e) => {
      if (e.active) e.updateAI(player, time, this.enemyBullets, this.scene);
    });
  }
}