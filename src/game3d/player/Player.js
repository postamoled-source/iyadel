import * as THREE from 'three';

// IYADEL — anime-military soldier, procedural animation, locomotion + state.
export class Player {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.pos = new THREE.Vector3(0, 0, 18);
    this.facing = new THREE.Vector3(0, 0, -1);
    this.radius = 0.7;
    this.maxHp = 100; this.hp = 100; this.armor = 25;
    this.speed = 9; this.sprintMul = 1.55;
    this.jumpVel = 11; this.gravity = 26;
    this.y = 0; this.vy = 0; this.onGround = true;
    this.dodgeTime = 0; this.dodgeCd = 0; this.dodgeDir = new THREE.Vector3();
    this.invuln = 0;
    this.abilityCd = 0; this.abilityMax = 14;
    this.shootCd = 0;
    this.walkPhase = 0;
    this.dead = false;
    this._build();
    scene.add(this.group);
  }
  _mat(color, rough = 0.7, metal = 0.1) {
    return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
  }
  _build() {
    const skin = this._mat(0xe8b890, 0.6);
    const green = this._mat(0x4a8a3a);
    const khaki = this._mat(0x7a6a3a);
    const dark = this._mat(0x2a1a12, 0.5);
    const accent = this._mat(0x3aa852, 0.5);
    const hair = this._mat(0x1a1410, 0.5);

    this.torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.6), green);
    this.torso.position.y = 1.5; this.torso.castShadow = true;
    this.group.add(this.torso);

    const vest = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.5, 0.65), dark);
    vest.position.y = 1.65; this.group.add(vest);

    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.55), skin);
    this.head.position.y = 2.35; this.head.castShadow = true;
    this.group.add(this.head);

    this.hair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.25, 0.6), hair);
    this.hair.position.y = 2.6; this.group.add(this.hair);
    const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), hair);
    tail1.position.set(0.32, 2.2, 0); this.group.add(tail1);
    const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.16), hair);
    tail2.position.set(-0.32, 2.2, 0); this.group.add(tail2);
    this.bandana = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.16, 0.58), accent);
    this.bandana.position.y = 2.5; this.group.add(this.bandana);

    this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.9, 0.32), khaki);
    this.leftLeg.position.set(-0.26, 0.7, 0); this.leftLeg.castShadow = true; this.group.add(this.leftLeg);
    this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.9, 0.32), khaki);
    this.rightLeg.position.set(0.26, 0.7, 0); this.rightLeg.castShadow = true; this.group.add(this.rightLeg);

    this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.85, 0.26), green);
    this.leftArm.position.set(-0.62, 1.5, 0); this.leftArm.castShadow = true; this.group.add(this.leftArm);
    this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.85, 0.26), green);
    this.rightArm.position.set(0.62, 1.5, 0); this.rightArm.castShadow = true; this.group.add(this.rightArm);

    // Rifle held in right hand, pointing forward (-z)
    this.gun = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.9), dark);
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.5), this._mat(0x444444, 0.4, 0.6));
    barrel.position.z = -0.6;
    this.gun.add(body); this.gun.add(barrel);
    this.gun.position.set(0.6, 1.4, -0.35);
    this.group.add(this.gun);
    this.muzzlePos = new THREE.Vector3();
  }
  getMuzzle() {
    // World-space muzzle position (front of gun).
    const m = new THREE.Vector3(0.6, 1.4, -0.8);
    m.applyMatrix4(this.group.matrixWorld);
    return m;
  }
  update(dt, input, level, vfx, audio, ctx) {
    if (this.dead) return;
    this.shootCd -= dt; this.dodgeCd -= dt; this.invuln -= dt; this.abilityCd -= dt;

    // Movement input.
    let ix = (input.held.right ? 1 : 0) - (input.held.left ? 1 : 0);
    let iz = (input.held.up ? 1 : 0) - (input.held.down ? 1 : 0); // up = -z (toward enemies)
    let moving = ix !== 0 || iz !== 0;
    const sprint = input.held.sprint;
    const spd = this.speed * (sprint ? this.sprintMul : 1);

    if (this.dodgeTime > 0) {
      this.dodgeTime -= dt;
      this.pos.addScaledVector(this.dodgeDir, 16 * dt);
    } else if (moving) {
      const dir = new THREE.Vector3(ix, 0, -iz).normalize();
      this.pos.addScaledVector(dir, spd * dt);
      this.facing.lerp(dir, 0.2);
      this.facing.normalize();
      this.walkPhase += dt * (sprint ? 16 : 11);
    } else {
      this.walkPhase = 0;
    }
    level.resolve(this.pos, this.radius);

    // Jump.
    if (input.held.jump && this.onGround) { this.vy = this.jumpVel; this.onGround = false; audio.sfx('jump'); }
    this.vy -= this.gravity * dt;
    this.y += this.vy * dt;
    if (this.y <= 0) { this.y = 0; this.vy = 0; this.onGround = true; }

    // Apply transform.
    this.group.position.set(this.pos.x, this.y, this.pos.z);
    const targetRot = Math.atan2(this.facing.x, this.facing.z) + Math.PI; // face -z forward
    this.group.rotation.y = this._lerpAngle(this.group.rotation.y, targetRot, 0.2);

    // Procedural limb animation.
    if (moving) {
      const s = Math.sin(this.walkPhase) * (sprint ? 0.9 : 0.6);
      this.leftLeg.rotation.x = s;
      this.rightLeg.rotation.x = -s;
      this.leftArm.rotation.x = -s * 0.7;
      this.rightArm.rotation.x = s * 0.4;
      this.torso.position.y = 1.5 + Math.abs(Math.sin(this.walkPhase)) * 0.06;
    } else {
      this.leftLeg.rotation.x *= 0.8; this.rightLeg.rotation.x *= 0.8;
      this.leftArm.rotation.x *= 0.8; this.rightArm.rotation.x *= 0.8;
    }
    // Aim pose: raise right arm slightly forward when firing.
    if (input.held.fire) this.rightArm.rotation.x = -0.9;

    if (this.invuln > 0 && Math.floor(this.invuln * 20) % 2 === 0) {
      this.torso.material.emissive.setHex(0xff3333);
    } else {
      this.torso.material.emissive.setHex(0x000000);
    }
  }
  _lerpAngle(a, b, t) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  }
  dodge(input, audio) {
    if (this.dodgeCd > 0 || this.dead) return false;
    let ix = (input.held.right ? 1 : 0) - (input.held.left ? 1 : 0);
    let iz = (input.held.up ? 1 : 0) - (input.held.down ? 1 : 0);
    this.dodgeDir.set(ix, 0, -iz).normalize();
    if (this.dodgeDir.lengthSq() === 0) this.dodgeDir.copy(this.facing);
    this.dodgeTime = 0.28; this.dodgeCd = 0.7; this.invuln = 0.32;
    audio.sfx('dodge');
    return true;
  }
  ability(enemies, boss, vfx, audio) {
    if (this.abilityCd > 0 || this.dead) return false;
    this.abilityCd = this.abilityMax;
    const center = this.pos.clone();
    vfx.ring(center, 0x6cf0ff, 9);
    vfx.shakeCam(0.4, 0.3);
    audio.sfx('ability');
    const R = 9;
    enemies.forEach((e) => {
      if (e.dead) return;
      const d = e.pos.distanceTo(center);
      if (d < R) { e.takeDamage(40, vfx, audio); e.knockback(center, 6); }
    });
    if (boss && !boss.dead) {
      const d = boss.pos.distanceTo(center);
      if (d < R) boss.takeDamage(60, vfx, audio);
    }
    return true;
  }
  takeDamage(amount, vfx, audio) {
    if (this.invuln > 0 || this.dodgeTime > 0 || this.dead) return false;
    if (this.armor > 0) {
      const a = Math.min(this.armor, amount * 0.6);
      this.armor -= a; amount -= a;
    }
    this.hp -= amount;
    this.invuln = 0.5;
    vfx.shakeCam(0.3, 0.2);
    audio.sfx('hurt');
    if (this.hp <= 0) { this.hp = 0; this.dead = true; audio.sfx('gameover'); }
    return true;
  }
  heal(amount) { this.hp = Math.min(this.maxHp, this.hp + amount); }
  addArmor(amount) { this.armor = Math.min(100, this.armor + amount); }
  reset() {
    this.pos.set(0, 0, 18); this.facing.set(0, 0, -1);
    this.hp = this.maxHp; this.armor = 25; this.y = 0; this.vy = 0;
    this.dead = false; this.invuln = 0; this.dodgeTime = 0; this.abilityCd = 0;
    this.group.position.copy(this.pos); this.group.rotation.y = 0;
  }
}