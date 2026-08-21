import * as THREE from 'three';
import { Pool } from '@/game3d/core/Pool';

// Bullets, missiles (explode), grenades (arc + explode). Player & enemy owned.
export class Projectiles {
  constructor(scene) {
    this.scene = scene;
    this.pool = new Pool(
      () => this._mk(),
      (b) => { b.mesh.visible = false; b.explode = 0; b.gravity = 0; b.homing = false; },
      48
    );
  }
  _mk() {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), new THREE.MeshBasicMaterial({ color: 0xfff0a0 }));
    mesh.visible = false;
    this.scene.add(mesh);
    return { mesh, vel: new THREE.Vector3(), pos: new THREE.Vector3(), life: 0, dmg: 0, owner: 'player', radius: 0.45, explode: 0, color: 0xfff0a0, gravity: 0, homing: false, target: null };
  }
  spawnBullet(origin, dir, dmg, speed, owner, color, life) {
    const b = this.pool.acquire();
    b.mesh.material.color.setHex(color);
    b.mesh.geometry.scale(1, 1, 1);
    b.mesh.position.copy(origin);
    b.pos.copy(origin);
    b.vel.copy(dir).multiplyScalar(speed);
    b.life = life; b.dmg = dmg; b.owner = owner; b.radius = 0.45; b.explode = 0;
    b.color = color; b.gravity = 0; b.homing = false;
    b.mesh.visible = true; b.mesh.scale.set(1, 1, 1);
  }
  spawnMissile(origin, dir, dmg, speed, color, explode, actualDmg) {
    const b = this.pool.acquire();
    b.mesh.material.color.setHex(color);
    b.mesh.position.copy(origin);
    b.pos.copy(origin);
    b.vel.copy(dir).multiplyScalar(speed);
    b.life = 3; b.dmg = actualDmg || 0; b.owner = 'player'; b.radius = 0.6; b.explode = explode;
    b.color = color; b.gravity = 0; b.homing = true; b.target = null;
    b.mesh.visible = true; b.mesh.scale.set(2, 2, 2);
    return b;
  }
  spawnGrenade(origin, dir, dmg) {
    const b = this.pool.acquire();
    b.mesh.material.color.setHex(0x6c4dff);
    b.mesh.position.copy(origin);
    b.pos.copy(origin);
    b.vel.copy(dir).multiplyScalar(16);
    b.vel.y = 7;
    b.life = 2.4; b.dmg = dmg; b.owner = 'player'; b.radius = 0.4; b.explode = 5;
    b.color = 0x6c4dff; b.gravity = 18; b.homing = false;
    b.mesh.visible = true; b.mesh.scale.set(1.6, 1.6, 1.6);
  }
  spawnEnemyBullet(origin, dir, dmg, speed, color) {
    const b = this.pool.acquire();
    b.mesh.material.color.setHex(color || 0xff5c6c);
    b.mesh.position.copy(origin);
    b.pos.copy(origin);
    b.vel.copy(dir).multiplyScalar(speed);
    b.life = 3; b.dmg = dmg; b.owner = 'enemy'; b.radius = 0.4; b.explode = 0;
    b.color = color || 0xff5c6c; b.gravity = 0; b.homing = false;
    b.mesh.visible = true; b.mesh.scale.set(1.2, 1.2, 1.2);
  }
  update(dt, ctx) {
    const { enemies, boss, player, level, vfx, audio, onKill, onBossKill } = ctx;
    this.pool.forEach((b) => {
      b.life -= dt;
      if (b.homing && b.target && !b.target.dead) {
        const desired = b.target.pos.clone().add(new THREE.Vector3(0, 1, 0)).sub(b.pos).normalize();
        b.vel.lerp(desired.multiplyScalar(b.vel.length()), 0.08);
      }
      if (b.gravity) b.vel.y -= b.gravity * dt;
      b.pos.addScaledVector(b.vel, dt);
      b.mesh.position.copy(b.pos);
      if (b.homing || b.gravity || b.explode > 0) vfx.trail(b.pos, b.color);

      let hit = b.life <= 0;
      let hitEnemy = null;

      // Enemy bullets hit player; player bullets hit enemies/boss.
      if (b.owner === 'enemy' && player && !player.dead) {
        if (b.pos.distanceTo(player.pos.clone().add(new THREE.Vector3(0, 1, 0))) < player.radius + b.radius) {
          if (player.takeDamage(b.dmg, vfx, audio)) ctx.onPlayerHit && ctx.onPlayerHit();
          hit = true;
        }
      }
      if (b.owner === 'player') {
        for (const e of enemies) {
          if (e.dead) continue;
          if (b.pos.distanceTo(e.pos.clone().add(new THREE.Vector3(0, 1, 0))) < e.radius + b.radius) { hitEnemy = e; break; }
        }
        if (!hitEnemy && boss && !boss.dead) {
          if (b.pos.distanceTo(boss.pos.clone().add(new THREE.Vector3(0, 3, 0))) < boss.radius + b.radius) hitEnemy = boss;
        }
        if (hitEnemy) {
          hitEnemy.takeDamage(b.dmg, vfx, audio);
          if (hitEnemy !== boss && hitEnemy.dead) onKill && onKill(hitEnemy);
          if (hitEnemy === boss && boss.dead) onBossKill && onBossKill();
          hit = true;
        }
        // Destructibles
        for (const d of level.destructibles) {
          if (b.pos.distanceTo(d.pos) < 0.8 + b.radius) {
            const ex = level.damageDestructible(d.mesh, b.dmg, vfx, audio);
            if (ex) this._explode(ex, ctx);
            hit = true; break;
          }
        }
        // Level box colliders
        if (!hit) {
          for (const c of level.colliders) {
            if (c.type === 'box') {
              const dx = Math.abs(b.pos.x - c.mesh.position.x) - c.half.x;
              const dz = Math.abs(b.pos.z - c.mesh.position.z) - c.half.z;
              if (dx < b.radius && dz < b.radius && b.pos.y < c.mesh.position.y + c.half.y && b.pos.y > c.mesh.position.y - c.half.y) {
                vfx.impact(b.pos, 0xffe08a); hit = true; break;
              }
            }
          }
        }
        // Ground
        if (b.gravity && b.pos.y <= 0.3) hit = true;
      }
      if (hit) {
        if (b.explode > 0) this._explode({ pos: b.pos.clone(), radius: b.explode, damage: b.dmg || 50 }, ctx);
        else vfx.impact(b.pos, b.color);
        this.pool.release(b);
      }
    });
  }
  _explode(ex, ctx) {
    const { enemies, boss, player, vfx, audio, onKill, onBossKill } = ctx;
    vfx.explosion(ex.pos, ex.radius, 0xff7a2c);
    audio.sfx('explosion');
    const R = ex.radius;
    enemies.forEach((e) => {
      if (e.dead) return;
      const d = e.pos.distanceTo(ex.pos);
      if (d < R) { e.takeDamage(ex.damage * (1 - d / R), vfx, audio); if (e.dead) onKill && onKill(e); }
    });
    if (boss && !boss.dead) {
      const d = boss.pos.distanceTo(ex.pos);
      if (d < R) { boss.takeDamage(ex.damage * (1 - d / R), vfx, audio); if (boss.dead) onBossKill && onBossKill(); }
    }
    if (player && !player.dead && ex.pos.distanceTo(player.pos) < R) {
      if (player.takeDamage(ex.damage * 0.4, vfx, audio)) ctx.onPlayerHit && ctx.onPlayerHit();
    }
    for (const dd of [...ctx.level.destructibles]) {
      if (dd.pos.distanceTo(ex.pos) < R) {
        const r = ctx.level.damageDestructible(dd.mesh, ex.damage, vfx, audio);
        if (r) this._explode(r, ctx);
      }
    }
  }
  clear() { this.pool.clear(); }
}