import * as THREE from 'three';

// IRON TITAN — first boss. 3 phases, missiles, ground slam, charge, rage at 30%.
export class IronTitan {
  constructor(scene, pos) {
    this.scene = scene;
    this.pos = pos.clone();
    this.radius = 2.4;
    this.maxHp = 1400; this.hp = 1400;
    this.dead = false;
    this.phase = 1;
    this.atkTimer = 2; this.action = 'idle'; this.actionTime = 0;
    this.chargeDir = new THREE.Vector3();
    this.coreFlash = 0;
    this.group = new THREE.Group();
    this._build();
    this.group.position.copy(this.pos);
    scene.add(this.group);
  }
  _mat(c, r = 0.6, m = 0.4) { return new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m }); }
  _build() {
    const hull = this._mat(0x5a4a3a);
    const dark = this._mat(0x333333, 0.5, 0.6);
    const accent = new THREE.MeshStandardMaterial({ color: 0xff5c6c, emissive: 0xff3333, emissiveIntensity: 0.8, roughness: 0.4 });
    // tracks
    const track = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.4, 3), dark);
    track.position.y = 0.8; track.castShadow = true; this.group.add(track);
    // hull
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 2.6), hull);
    body.position.y = 2.6; body.castShadow = true; this.group.add(body);
    this.body = body;
    // turret
    const turret = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 2), hull);
    turret.position.y = 4.2; turret.castShadow = true; this.group.add(turret);
    this.turret = turret;
    // barrel
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 3), dark);
    barrel.position.set(0, 4.2, -2); this.group.add(barrel);
    // shoulder weak-point nodes
    this.shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), accent);
    this.shoulderL.position.set(-2, 3.4, 0); this.group.add(this.shoulderL);
    this.shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), accent);
    this.shoulderR.position.set(2, 3.4, 0); this.group.add(this.shoulderR);
    // core
    this.core = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff5c6c, emissive: 0xff2222, emissiveIntensity: 1.2, roughness: 0.3 }));
    this.core.position.set(0, 4.2, -1.1); this.group.add(this.core);
  }
  takeDamage(amount, vfx, audio) {
    if (this.dead) return;
    this.hp -= amount;
    this.coreFlash = 0.15;
    audio.sfx('bossHit');
    if (this.hp <= this.maxHp * 0.66 && this.phase < 2) this.phase = 2;
    if (this.hp <= this.maxHp * 0.33 && this.phase < 3) this._enrage(vfx);
    if (this.hp <= 0) this.die(vfx, audio);
  }
  _enrage(vfx) {
    this.phase = 3;
    this.scene.fog.color.setHex(0x401020);
    this.scene.background.setHex(0x401020);
    vfx.shakeCam(1.0, 0.8);
  }
  die(vfx, audio) {
    this.dead = true;
    vfx.explosion(this.pos.clone().add(new THREE.Vector3(0, 3, 0)), 10, 0xff5c6c);
    vfx.explosion(this.pos.clone().add(new THREE.Vector3(1, 2, 1)), 7, 0xff8a3c);
    audio.sfx('explosion');
    this.scene.remove(this.group);
  }
  update(dt, ctx) {
    if (this.dead) return;
    const { player, projectiles, vfx, audio, level } = ctx;
    this.actionTime -= dt; this.atkTimer -= dt; this.coreFlash -= dt;
    const speedMul = this.phase === 3 ? 1.7 : this.phase === 2 ? 1.25 : 1;

    // Face player.
    const toP = player.pos.clone().sub(this.pos); toP.y = 0;
    const dist = toP.length(); const dir = toP.normalize();
    this.group.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI;

    if (this.action === 'charge') {
      this.pos.addScaledVector(this.chargeDir, 14 * speedMul * dt);
      level.resolve(this.pos, this.radius);
      if (this.pos.clone().add(new THREE.Vector3(0, 1, 0)).distanceTo(player.pos.clone().add(new THREE.Vector3(0, 1, 0))) < this.radius + player.radius) {
        if (player.takeDamage(22, vfx, audio)) ctx.onPlayerHit && ctx.onPlayerHit();
        this.action = 'idle'; this.actionTime = 0.6;
      }
      if (this.actionTime <= 0) { this.action = 'idle'; this.actionTime = 0.8; }
    } else {
      // approach slowly
      if (dist > 8) this.pos.addScaledVector(dir, 3.5 * speedMul * dt);
      level.resolve(this.pos, this.radius);
      if (this.atkTimer <= 0 && dist < 40) {
        const r = Math.random();
        if (this.phase >= 2 && r < 0.35) this._slam(vfx, audio, ctx);
        else if (r < 0.55) this._missiles(projectiles, audio, dir);
        else this._charge(dir, vfx, audio);
        this.atkTimer = (this.phase === 3 ? 1.6 : 2.6) + Math.random();
      }
    }
    this.group.position.copy(this.pos);
    // core pulse
    const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.1 + (this.coreFlash > 0 ? 0.3 : 0);
    this.core.scale.setScalar(pulse);
    this.shoulderL.scale.setScalar(1 + Math.sin(performance.now() * 0.006) * 0.1);
    this.shoulderR.scale.setScalar(1 + Math.sin(performance.now() * 0.006 + 1) * 0.1);
  }
  _missiles(projectiles, audio, dir) {
    audio.sfx('missile');
    for (let i = -1; i <= 1; i++) {
      const d = dir.clone(); d.x += i * 0.3; d.normalize();
      const b = projectiles.spawnMissile(
        this.pos.clone().add(new THREE.Vector3(0, 4, -1.5)),
        d, 0, 22, 0xff5c6c, 4, 24
      );
      if (b) b.owner = 'enemy';
    }
  }
  _slam(vfx, audio, ctx) {
    audio.sfx('explosion');
    vfx.ring(this.pos, 0xff7a2c, 10);
    vfx.shakeCam(0.8, 0.4);
    const { player } = ctx;
    const d = this.pos.distanceTo(player.pos);
    if (d < 10) if (player.takeDamage(18, vfx, audio)) ctx.onPlayerHit && ctx.onPlayerHit();
    this.action = 'idle'; this.actionTime = 0.8;
  }
  _charge(dir, vfx, audio) {
    audio.sfx('ability');
    vfx.trail(this.pos.clone().add(new THREE.Vector3(0, 2, 0)), 0xff5c6c);
    this.action = 'charge'; this.actionTime = 1.1; this.chargeDir.copy(dir);
  }
}