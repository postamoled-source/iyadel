import * as THREE from 'three';

// Enemy types for the vertical slice: grunt, striker (fast melee), gunner (ranged).
const TYPES = {
  grunt: { hp: 30, speed: 5, radius: 0.7, detect: 30, attackRange: 2.2, dmg: 8, atkCd: 0.9, value: 100, color: 0x8a7a4a },
  striker: { hp: 22, speed: 8.5, radius: 0.6, detect: 34, attackRange: 2.0, dmg: 12, atkCd: 0.7, value: 160, color: 0x9a4a4a },
  gunner: { hp: 28, speed: 3.5, radius: 0.7, detect: 32, attackRange: 24, dmg: 9, atkCd: 1.8, value: 180, color: 0x4a5a8a, ranged: true },
};

class Enemy {
  constructor(scene, type, pos) {
    this.scene = scene; this.type = type; const t = TYPES[type];
    this.pos = pos.clone(); this.radius = t.radius; this.hp = t.hp; this.maxHp = t.hp;
    this.speed = t.speed; this.dmg = t.dmg; this.atkCd = 0; this.atkInterval = t.atkCd;
    this.detect = t.detect; this.attackRange = t.attackRange; this.value = t.value;
    this.ranged = t.ranged; this.dead = false; this.state = 'patrol';
    this.stun = 0; this.knock = new THREE.Vector3();
    this.group = new THREE.Group();
    this._build(t.color);
    this.group.position.copy(this.pos);
    scene.add(this.group);
  }
  _mat(c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }); }
  _build(color) {
    const body = this._mat(color);
    const dark = this._mat(0x2a1a12);
    const skin = this._mat(0xe8b890, 0.6);
    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.55), body);
    this.torso.position.y = 1.4; this.torso.castShadow = true; this.group.add(this.torso);
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skin);
    this.head.position.y = 2.0; this.group.add(this.head);
    this.helmet = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.3, 0.56), dark);
    this.helmet.position.y = 2.18; this.group.add(this.helmet);
    this.legL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.8, 0.28), body);
    this.legL.position.set(-0.24, 0.4, 0); this.legL.castShadow = true; this.group.add(this.legL);
    this.legR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.8, 0.28), body);
    this.legR.position.set(0.24, 0.4, 0); this.legR.castShadow = true; this.group.add(this.legR);
    this.armL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.8, 0.24), body);
    this.armL.position.set(-0.56, 1.4, 0); this.group.add(this.armL);
    this.armR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.8, 0.24), body);
    this.armR.position.set(0.56, 1.4, 0); this.group.add(this.armR);
    if (this.ranged) {
      this.gun = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.7), dark);
      this.gun.position.set(0.56, 1.4, -0.4); this.group.add(this.gun);
    }
    this.phase = Math.random() * 6;
  }
  takeDamage(amount, vfx, audio) {
    if (this.dead) return;
    this.hp -= amount;
    vfx.impact(this.pos.clone().add(new THREE.Vector3(0, 1.2, 0)), 0xff8a3c);
    audio.sfx('hit');
    this.stun = 0.15;
    if (this.hp <= 0) this.die(vfx, audio);
  }
  knockback(from, force) {
    const d = this.pos.clone().sub(from).setY(0).normalize();
    this.knock.addScaledVector(d, force);
  }
  die(vfx, audio) {
    this.dead = true;
    vfx.burst(this.pos.clone().add(new THREE.Vector3(0, 1, 0)), 0xff8a3c, 14);
    audio.sfx('enemyDie');
    this.scene.remove(this.group);
  }
  update(dt, ctx) {
    if (this.dead) return;
    const { player, projectiles, vfx, audio, level } = ctx;
    this.atkCd -= dt; this.stun -= dt;
    if (this.knock.lengthSq() > 0.1) {
      this.pos.addScaledVector(this.knock, dt); this.knock.multiplyScalar(0.85);
    }
    const toPlayer = player.pos.clone().sub(this.pos); toPlayer.y = 0;
    const dist = toPlayer.length();
    const dir = toPlayer.normalize();

    if (this.stun <= 0 && !player.dead) {
      if (dist < this.detect) this.state = 'chase'; else this.state = 'patrol';
      if (this.state === 'chase') {
        if (this.ranged) {
          // Keep distance, strafe, shoot.
          if (dist > this.attackRange * 0.8) this.pos.addScaledVector(dir, this.speed * dt);
          else if (dist < this.attackRange * 0.4) this.pos.addScaledVector(dir, -this.speed * dt);
          if (this.atkCd <= 0 && dist < this.attackRange) {
            const aim = player.pos.clone().add(new THREE.Vector3(0, 1.2, 0)).sub(this.pos.clone().add(new THREE.Vector3(0, 1.4, 0))).normalize();
            projectiles.spawnEnemyBullet(this.pos.clone().add(new THREE.Vector3(0, 1.4, 0)), aim, this.dmg, 26, 0xff5c6c);
            audio.sfx('shoot'); this.atkCd = this.atkInterval;
          }
        } else {
          if (dist > this.attackRange) this.pos.addScaledVector(dir, this.speed * dt);
          else if (this.atkCd <= 0) {
            if (player.takeDamage(this.dmg, vfx, audio)) ctx.onPlayerHit && ctx.onPlayerHit();
            this.atkCd = this.atkInterval;
          }
        }
      } else {
        // idle patrol: small drift
        this.pos.x += Math.sin(this.phase + performance.now() * 0.0004) * 0.4 * dt;
      }
    }
    level.resolve(this.pos, this.radius);
    this.group.position.copy(this.pos);
    this.group.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI;
    // walk anim
    if (this.state === 'chase') {
      this.phase += dt * 10;
      const s = Math.sin(this.phase) * 0.6;
      this.legL.rotation.x = s; this.legR.rotation.x = -s;
    } else {
      this.legL.rotation.x *= 0.8; this.legR.rotation.x *= 0.8;
    }
  }
}

export class EnemyManager {
  constructor(scene) { this.scene = scene; this.enemies = []; this.toSpawn = []; }
  spawn(type, pos) { const e = new Enemy(this.scene, type, pos); this.enemies.push(e); return e; }
  get list() { return this.enemies; }
  update(dt, ctx) {
    for (const e of this.enemies) e.update(dt, ctx);
    this.enemies = this.enemies.filter((e) => !e.dead);
  }
  forEach(fn) { this.enemies.forEach(fn); }
  clear() { this.enemies.forEach((e) => this.scene.remove(e.group)); this.enemies = []; }
  get aliveCount() { return this.enemies.length; }
}