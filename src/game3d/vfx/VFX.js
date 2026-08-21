import * as THREE from 'three';

// Pooled particle bursts, rings, muzzle flashes, screen shake.
export class VFX {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.particles = [];
    this.shakeAmt = 0;
    this.shakeTime = 0;
    this._geo = new THREE.SphereGeometry(0.18, 6, 6);
  }
  burst(pos, color = 0xffaa44, count = 12, speed = 6) {
    const geo = this._geo;
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }));
      m.position.copy(pos);
      this.scene.add(m);
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.2 + 0.2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(speed * (0.4 + Math.random()));
      this.particles.push({ mesh: m, vel: v, life: 0.6, max: 0.6, gravity: 9, sharedGeo: true });
    }
  }
  ring(pos, color = 0xff8a3c, maxR = 6) {
    const g = new THREE.RingGeometry(0.3, 0.5, 28);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.position.copy(pos);
    m.position.y += 0.15;
    this.scene.add(m);
    this.particles.push({ mesh: m, life: 0.5, max: 0.5, maxScale: maxR, ring: true });
  }
  muzzle(pos, dir) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfff3c4, transparent: true }));
    m.position.copy(pos).add(dir.clone().multiplyScalar(0.6));
    this.scene.add(m);
    this.particles.push({ mesh: m, life: 0.08, max: 0.08, fade: true });
  }
  trail(pos, color = 0xfff0c0) {
    const m = new THREE.Mesh(this._geo, new THREE.MeshBasicMaterial({ color, transparent: true }));
    m.position.copy(pos);
    this.scene.add(m);
    this.particles.push({ mesh: m, life: 0.25, max: 0.25, fade: true, sharedGeo: true });
  }
  explosion(pos, radius = 5, color = 0xff7a2c) {
    this.burst(pos, color, 26, 10);
    this.ring(pos, color, radius);
    this.shakeCam(0.7, 0.35);
  }
  impact(pos, color = 0xffe08a) { this.burst(pos, color, 6, 4); }
  shakeCam(amount, dur) {
    this.shakeAmt = Math.max(this.shakeAmt, amount);
    this.shakeTime = Math.max(this.shakeTime, dur);
  }
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        if (!p.sharedGeo) p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }
      if (p.vel) { p.mesh.position.addScaledVector(p.vel, dt); p.vel.y -= (p.gravity || 0) * dt; }
      if (p.ring) {
        const s = 1 + (1 - p.life / p.max) * p.maxScale;
        p.mesh.scale.set(s, s, s);
        p.mesh.material.opacity = p.life / p.max;
      } else if (p.fade) {
        p.mesh.material.opacity = p.life / p.max;
      } else {
        p.mesh.scale.multiplyScalar(1 - dt * 1.8);
      }
    }
    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const s = this.shakeAmt * (this.shakeTime / 0.35);
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s;
      if (this.shakeTime <= 0) this.shakeAmt = 0;
    }
  }
  clear() {
    this.particles.forEach((p) => { this.scene.remove(p.mesh); p.mesh.material.dispose(); });
    this.particles = [];
  }
}