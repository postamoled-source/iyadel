import * as THREE from 'three';

// Neo City (World 1): ground, cover crates, destructible barrels, skyline decor.
export class Level {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];   // { type, mesh, half|radius }
    this.destructibles = [];
    this.groundY = 0;
    this.playerStart = new THREE.Vector3(0, 0, 18);
    this.bounds = 55;
    this._build();
  }
  _build() {
    const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x554433, 0.85);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff0d8, 1.25);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -70; sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70; sun.shadow.camera.bottom = -70;
    sun.shadow.camera.far = 160;
    this.scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.MeshStandardMaterial({ color: 0x6b7a5a, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Road strip
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 120),
      new THREE.MeshStandardMaterial({ color: 0x8a8a96, roughness: 0.95 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    road.position.z = -20;
    road.receiveShadow = true;
    this.scene.add(road);

    const cover = new THREE.MeshStandardMaterial({ color: 0x556b6b, roughness: 0.85 });
    const crates = [
      [-9, 0, -2, 2.2, 2, 2.2], [9, 0, -4, 2.2, 2, 2.2],
      [-5, 0, -22, 3, 2, 3], [6, 0, -20, 2, 2, 2],
      [-12, 0, -34, 4, 2.6, 2.4], [11, 0, -30, 2.4, 2, 2.4],
      [-3, 0, -44, 3, 2, 3], [4, 0, -46, 2, 2, 2],
    ];
    crates.forEach((c) => this._box(c[0], c[1] + c[4] / 2, c[2], c[3], c[4], c[5], cover, true));

    const barrelMat = new THREE.MeshStandardMaterial({ color: 0xc05a2a, roughness: 0.6, metalness: 0.3 });
    [[-6, 0, -10], [10, 0, -14], [-2, 0, -28], [3, 0, -38], [-9, 0, -40]].forEach((p) =>
      this._barrel(p[0], p[1] + 1, p[2], barrelMat)
    );

    this._skyline();
  }
  _box(x, y, z, w, h, d, mat, collide) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    this.scene.add(m);
    if (collide) this.colliders.push({ type: 'box', mesh: m, half: new THREE.Vector3(w / 2, h / 2, d / 2) });
    return m;
  }
  _barrel(x, y, z, mat) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2, 12), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    this.scene.add(m);
    this.destructibles.push({ mesh: m, hp: 18, pos: m.position, radius: 0.8 });
    this.colliders.push({ type: 'barrel', mesh: m, radius: 0.8 });
  }
  _skyline() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x46566a, roughness: 1 });
    for (let i = 0; i < 26; i++) {
      const h = 10 + Math.random() * 32;
      const m = new THREE.Mesh(new THREE.BoxGeometry(6, h, 6), mat);
      const ang = Math.random() * Math.PI * 2;
      const r = 65 + Math.random() * 70;
      m.position.set(Math.cos(ang) * r, h / 2, Math.sin(ang) * r);
      this.scene.add(m);
    }
  }
  // Circle-vs-colliders push-out for character movement.
  resolve(pos, radius) {
    for (const c of this.colliders) {
      if (c.type === 'box') {
        const dx = pos.x - c.mesh.position.x;
        const dz = pos.z - c.mesh.position.z;
        const px = c.half.x + radius;
        const pz = c.half.z + radius;
        if (Math.abs(dx) < px && Math.abs(dz) < pz) {
          const ox = px - Math.abs(dx);
          const oz = pz - Math.abs(dz);
          if (ox < oz) pos.x += Math.sign(dx || 1) * ox;
          else pos.z += Math.sign(dz || 1) * oz;
        }
      } else if (c.type === 'barrel') {
        const d = Math.hypot(pos.x - c.mesh.position.x, pos.z - c.mesh.position.z);
        const min = radius + c.radius;
        if (d > 0 && d < min) {
          const ov = min - d;
          pos.x += ((pos.x - c.mesh.position.x) / d) * ov;
          pos.z += ((pos.z - c.mesh.position.z) / d) * ov;
        }
      }
    }
    pos.x = Math.max(-this.bounds, Math.min(this.bounds, pos.x));
    pos.z = Math.max(-this.bounds, Math.min(this.bounds, pos.z));
  }
  damageDestructible(mesh, amount, vfx, audio) {
    const d = this.destructibles.find((x) => x.mesh === mesh);
    if (!d) return null;
    d.hp -= amount;
    if (d.hp <= 0) {
      vfx.explosion(d.pos, 5.5, 0xff7a2c);
      audio.sfx('explosion');
      this.scene.remove(d.mesh);
      this.colliders = this.colliders.filter((c) => c.mesh !== d.mesh);
      this.destructibles = this.destructibles.filter((x) => x !== d);
      return { pos: d.pos.clone(), radius: 6, damage: 65 };
    }
    return null;
  }
  reset() {
    // (Destructibles consumed during play stay consumed for the run.)
  }
}