import * as THREE from 'three';
import { Engine } from '@/game3d/core/Engine';
import { Input } from '@/game3d/core/Input';
import { Level } from '@/game3d/world/Level';
import { Player } from '@/game3d/player/Player';
import { WeaponManager, WEAPONS as WEAPONS_DEF } from '@/game3d/combat/Weapons';
import { Projectiles } from '@/game3d/combat/Projectiles';
import { EnemyManager } from '@/game3d/enemies/Enemy';
import { IronTitan } from '@/game3d/bosses/IronTitan';
import { VFX } from '@/game3d/vfx/VFX';
import { Audio } from '@/game3d/audio/Audio';
import { HUD } from '@/game3d/ui/HUD';
import { SaveManager } from '@/game3d/save/SaveManager';

// Main orchestrator — wires every system and drives the game loop.
export class IyadelGame3D {
  constructor(container) {
    this.container = container;
    this.engine = new Engine(container);
    this.input = new Input();
    this.level = new Level(this.engine.scene);
    this.player = new Player(this.engine.scene);
    this.weapons = new WeaponManager();
    this.projectiles = new Projectiles(this.engine.scene);
    this.enemies = new EnemyManager(this.engine.scene);
    this.boss = null; this.bossSpawned = false;
    this.vfx = new VFX(this.engine.scene, this.engine.camera);
    this.audio = new Audio();
    this.hud = new HUD(container, this.input, {
      onStart: () => this.start(),
      onRestart: () => this.start(),
    });

    this.state = 'menu';
    this.score = 0; this.combo = 0; this._comboTimer = 0;
    this.kills = 0; this.killsToBoss = 16; this.maxAlive = 6;
    this.spawnCd = 0;
    this.grenadeCd = 0; this.missileCd = 0;
    this.objective = 'Survive the waves';
    this.save = SaveManager.load();

    this.engine.onUpdate = (dt) => this.update(dt);
    this.hud.showStart(this.save.highScore);
  }

  start() {
    this._enterImmersive();
    this.player.reset();
    this.enemies.clear();
    this.projectiles.clear();
    this.vfx.clear();
    if (this.boss) { this.engine.scene.remove(this.boss.group); this.boss = null; }
    this.bossSpawned = false;
    this.score = 0; this.combo = 0; this._comboTimer = 0;
    this.kills = 0; this.spawnCd = 0.5; this.grenadeCd = 0; this.missileCd = 0;
    this.objective = 'Survive the waves';
    this.engine.scene.background.setHex(0x8fb6e0);
    this.engine.scene.fog.color.setHex(0x8fb6e0);
    this.state = 'playing';
    this.hud.hideStart();
    this.hud.hideEnd();
    this.audio.startMusic('combat');
  }

  update(dt) {
    if (this.state === 'menu') { this.vfx.update(dt); this._idleCamera(dt); return; }
    if (this.state !== 'playing') { this.vfx.update(dt); this._idleCamera(dt); return; }

    const { input, player, weapons, projectiles, enemies, vfx, audio } = this;
    this.grenadeCd -= dt; this.missileCd -= dt; this._comboTimer -= dt;
    if (this._comboTimer <= 0 && this.combo > 0) this.combo = 0;

    if (input.consume('switch')) { weapons.next(); audio.sfx('ui'); }
    if (input.consume('reload')) this._reload();
    if (input.consume('dodge')) player.dodge(input, audio);
    if (input.consume('ability')) player.ability(enemies.enemies, this.boss, vfx, audio);
    if (input.consume('grenade') && this.grenadeCd <= 0) this._throwGrenade();
    if (input.consume('missile') && this.missileCd <= 0) this._fireMissile();

    weapons.update(dt);
    if (input.held.fire && !player.dead) {
      weapons.fire(player.getMuzzle(), player.facing.clone(), projectiles, vfx, audio);
    }

    player.update(dt, input, this.level, vfx, audio, {});

    this._spawnLogic(dt);

    const ctx = {
      enemies: enemies.enemies, boss: this.boss, player, projectiles, level: this.level, vfx, audio,
      onKill: (e) => this._onKill(e), onBossKill: () => this._onBossKill(),
      onPlayerHit: () => this._onPlayerHit(),
    };
    projectiles.update(dt, ctx);
    enemies.update(dt, ctx);
    if (this.boss) this.boss.update(dt, ctx);
    vfx.update(dt);

    this._camera(dt);
    this._updateHud();

    if (player.dead) this._gameOver();
    if (this.bossSpawned && this.boss && this.boss.dead) this._victory();
  }

  _spawnLogic(dt) {
    this.spawnCd -= dt;
    if (this.bossSpawned) return;
    if (this.kills >= this.killsToBoss) {
      this.bossSpawned = true;
      this.boss = new IronTitan(this.engine.scene, new THREE.Vector3(0, 0, -34));
      this.audio.stopMusic();
      this.audio.startMusic('boss');
      this.objective = 'Defeat IRON TITAN';
      this.vfx.shakeCam(0.9, 0.6);
      return;
    }
    if (this.enemies.aliveCount < this.maxAlive && this.spawnCd <= 0) {
      this.enemies.spawn(this._pickType(), this._spawnPoint());
      this.spawnCd = 1.1;
    }
  }
  _pickType() {
    const k = this.kills;
    if (k < 4) return 'grunt';
    if (k < 9) return Math.random() < 0.5 ? 'grunt' : 'striker';
    const r = Math.random();
    return r < 0.4 ? 'grunt' : r < 0.75 ? 'striker' : 'gunner';
  }
  _spawnPoint() {
    const ang = Math.random() * Math.PI * 2;
    const r = 22 + Math.random() * 16;
    const p = new THREE.Vector3(Math.cos(ang) * r, 0, this.player.pos.z - r);
    p.x = Math.max(-45, Math.min(45, p.x));
    p.z = Math.max(-45, Math.min(40, p.z));
    return p;
  }
  _throwGrenade() {
    this.grenadeCd = 2.5;
    const origin = this.player.pos.clone().add(this.player.facing.clone().multiplyScalar(1.2)).add(new THREE.Vector3(0, 1.4, 0));
    this.projectiles.spawnGrenade(origin, this.player.facing.clone(), 65);
    this.audio.sfx('grenade');
  }
  _fireMissile() {
    this.missileCd = 4;
    const origin = this.player.pos.clone().add(this.player.facing.clone().multiplyScalar(1.2)).add(new THREE.Vector3(0, 1.5, 0));
    const m = this.projectiles.spawnMissile(origin, this.player.facing.clone(), 0, 30, 0xff7a2c, 5, 90);
    if (m) { m.owner = 'player'; m.target = this._nearestTarget(); m.homing = !!m.target; }
    this.audio.sfx('missile');
  }
  _nearestTarget() {
    let best = null; let bd = 60;
    for (const e of this.enemies.enemies) {
      const d = e.pos.distanceTo(this.player.pos);
      if (d < bd) { bd = d; best = e; }
    }
    if (this.boss && !this.boss.dead) { const d = this.boss.pos.distanceTo(this.player.pos); if (d < bd) best = this.boss; }
    return best;
  }
  _reload() {
    const s = this.weapons.state[this.weapons.current];
    const w = this.weapons.constructor; // not used
    const def = WEAPONS_DEF[this.weapons.current];
    if (s.ammo !== Infinity && s.ammo < def.max && s.reloading <= 0 && def.reload) s.reloading = def.reload;
  }
  _onKill(e) {
    const mult = 1 + this.combo * 0.12;
    this.score += Math.round((e.value || 100) * mult);
    this.combo++; this._comboTimer = 4.5;
    this.kills++;
    SaveManager.addXp(12);
  }
  _onBossKill() {
    this.score += 5000;
    this.kills++;
  }
  _onPlayerHit() { this.combo = 0; }
  _camera(dt) {
    const dist = this.input.held.sprint ? 10.5 : 8.5;
    const t = this.player.pos.clone()
      .add(this.player.facing.clone().multiplyScalar(-dist))
      .add(new THREE.Vector3(0, 5, 0));
    this.engine.camera.position.lerp(t, 0.09);
    if (this.engine.camera.position.y < 2.2) this.engine.camera.position.y = 2.2;
    const look = this.player.pos.clone()
      .add(this.player.facing.clone().multiplyScalar(5))
      .add(new THREE.Vector3(0, 1.4, 0));
    this.engine.camera.lookAt(look);
  }
  _idleCamera(dt) {
    // slow orbit while in end screens
    const t = performance.now() * 0.0003;
    this.engine.camera.position.set(Math.cos(t) * 9, 5, this.player.pos.z + Math.sin(t) * 9);
    this.engine.camera.lookAt(this.player.pos.x, this.player.pos.y + 1.2, this.player.pos.z - 2);
  }
  _updateHud() {
    const wi = this.weapons.info();
    this.hud.update({
      score: this.score, combo: this.combo, objective: this.objective,
      hp: this.player.hp, maxHp: this.player.maxHp, armor: this.player.armor,
      weapon: wi.name, ammo: wi.ammo, maxAmmo: wi.max,
      abilityReady: this.player.abilityCd <= 0, abilityCd: this.player.abilityCd,
      boss: this.boss ? { hp: this.boss.hp, max: this.boss.maxHp, phase: this.boss.phase } : null,
    });
  }
  _gameOver() {
    this.state = 'gameover';
    this.audio.stopMusic();
    this.audio.sfx('gameover');
    const best = SaveManager.saveRun(Math.round(this.score), false);
    this.hud.showGameOver(Math.round(this.score), best);
  }
  _victory() {
    this.state = 'victory';
    this.audio.stopMusic();
    this.audio.sfx('victory');
    const best = SaveManager.saveRun(Math.round(this.score), true);
    this.hud.showVictory(Math.round(this.score), best);
  }
  resize() { this.engine.resize(); }
  setRotated(v) { this.hud.setRotated(v); }
  _enterImmersive() {
    try {
      const el = this.container.parentElement || this.container;
      const fs = el.requestFullscreen || el.webkitRequestFullscreen;
      if (fs) { const p = fs.call(el); if (p && p.catch) p.catch(() => {}); }
    } catch (e) { /* fullscreen not available */ }
  }
  _exitImmersive() {
    try {
      if (document.fullscreenElement) { const p = document.exitFullscreen(); if (p && p.catch) p.catch(() => {}); }
    } catch (e) {}
  }
  destroy() {
    this._exitImmersive();
    this.engine.dispose();
    this.input.dispose();
    this.hud.dispose();
    this.audio.stopMusic();
  }
}