// IYADEL 3D — a Three.js run-and-gun action game.
// Self-contained engine that mounts to a container div and renders a 3D scene
// with a controllable soldier, enemies, projectiles, and touch controls.
import * as THREE from 'three';
import { playShoot, playEnemyDie, playHurt, playGameOver, setSfxMuted } from '@/lib/game-sounds';

export class IyadelGame3D {
  constructor(container) {
    this.container = container;
    container.style.position = 'relative';
    container.style.touchAction = 'none';
    container.style.overflow = 'hidden';
    this.keys = {};
    this.move = { x: 0, y: 0 };
    this.firing = false;
    this.jumpQueued = false;
    this.started = false;
    this.over = false;
    this.muted = false;
    this.enemies = [];
    this.bullets = [];
    this.fx = [];
    this.score = 0;
    this.best = Number(localStorage.getItem('iyadel3d_best') || 0);
    this.hp = 100;
    this.maxHp = 100;
    this.spawnTimer = 1.2;
    this.fireCd = 0;
    this.invuln = 0;
    this.vy = 0;
    this.onGround = true;

    this._initScene();
    this._initLights();
    this._initWorld();
    this._initPlayer();
    this._initHud();
    this._initInput();

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    this.raf = requestAnimationFrame(this.animate);

    this._onResize = this._onResize.bind(this);
    this.ro = new ResizeObserver(this._onResize);
    this.ro.observe(container);
    this._onResize();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf2b97a);
    this.scene.fog = new THREE.Fog(0xb5683c, 28, 80);
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    this.camera.position.set(0, 12, -11);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
  }

  _initLights() {
    this.scene.add(new THREE.AmbientLight(0xffe0b0, 0.65));
    const sun = new THREE.DirectionalLight(0xfff3c4, 1.15);
    sun.position.set(22, 30, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 80;
    this.scene.add(sun);
    const disc = new THREE.Mesh(
      new THREE.SphereGeometry(5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff3c4 })
    );
    disc.position.set(45, 32, 40);
    this.scene.add(disc);
  }

  _initWorld() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x9a7a52, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    // Grid lines for depth perception.
    const grid = new THREE.GridHelper(200, 50, 0x6a4a2a, 0x7a5a3a);
    grid.position.y = 0.01;
    this.scene.add(grid);
    // Scattered crates as cover / visual interest.
    this.crates = [];
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.9 });
    const crateTopMat = new THREE.MeshStandardMaterial({ color: 0x8a5a32, roughness: 0.9 });
    for (let i = 0; i < 18; i++) {
      const s = 1 + Math.random() * 1.2;
      const c = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), crateMat);
      c.position.set((Math.random() - 0.5) * 50, s / 2, (Math.random() - 0.5) * 50);
      if (c.position.length() < 4) c.position.x += 6;
      c.castShadow = true;
      c.receiveShadow = true;
      this.scene.add(c);
      this.crates.push(c);
    }
  }

  _initPlayer() {
    const g = new THREE.Group();
    const uniform = new THREE.MeshStandardMaterial({ color: 0x4a8a3a, roughness: 0.7 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xe8b890, roughness: 0.6 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.6 });
    const helmet = new THREE.MeshStandardMaterial({ color: 0x6a5a3a, roughness: 0.6 });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.7, 4, 10), uniform);
    torso.position.y = 1.1; torso.castShadow = true; g.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 16), skin);
    head.position.y = 1.78; head.castShadow = true; g.add(head);
    const hel = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      helmet
    );
    hel.position.y = 1.84; g.add(hel);
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.5, 4, 8), uniform);
    armL.position.set(-0.5, 1.15, 0); armL.castShadow = true; g.add(armL);
    const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.5, 4, 8), uniform);
    armR.position.set(0.5, 1.15, 0.05); armR.castShadow = true; g.add(armR);
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.7), metal);
    gun.position.set(0.5, 1.15, 0.55); gun.castShadow = true; g.add(gun);
    const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.6, 4, 8), new THREE.MeshStandardMaterial({ color: 0x7a6a3a }));
    legL.position.set(-0.2, 0.45, 0); legL.castShadow = true; g.add(legL);
    const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.6, 4, 8), new THREE.MeshStandardMaterial({ color: 0x7a6a3a }));
    legR.position.set(0.2, 0.45, 0); legR.castShadow = true; g.add(legR);

    this.playerParts = [torso, head, hel, armL, armR, gun, legL, legR];
    this.player = g;
    this.playerPos = new THREE.Vector3(0, 0, 0);
    this.facing = new THREE.Vector3(0, 0, 1);
    this.scene.add(g);
  }

  _initHud() {
    const root = document.createElement('div');
    root.style.cssText =
      'position:absolute;inset:0;pointer-events:none;font-family:"Courier New",monospace;color:#fff;user-select:none;';
    this.hud = root;

    const barWrap = document.createElement('div');
    barWrap.style.cssText = 'position:absolute;left:14px;top:14px;width:46%;max-width:260px;';
    barWrap.innerHTML = `<div style="font-size:12px;font-weight:bold;opacity:.9;letter-spacing:1px;">HEALTH</div>
      <div style="margin-top:4px;height:14px;background:rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.6);border-radius:8px;overflow:hidden;">
        <div id="iy3d-hp" style="height:100%;width:100%;background:#52d9a8;transition:width .15s;"></div></div>`;
    root.appendChild(barWrap);

    const score = document.createElement('div');
    score.style.cssText =
      'position:absolute;left:14px;top:60px;font-size:16px;font-weight:bold;background:rgba(0,0,0,.4);padding:4px 10px;border-radius:6px;';
    score.id = 'iy3d-score';
    root.appendChild(score);
    this.scoreEl = score;

    const best = document.createElement('div');
    best.style.cssText =
      'position:absolute;left:14px;top:86px;font-size:12px;font-weight:bold;color:#ffe9b0;background:rgba(0,0,0,.4);padding:2px 8px;border-radius:6px;';
    best.id = 'iy3d-best';
    root.appendChild(best);
    this.bestEl = best;

    const mute = document.createElement('div');
    mute.style.cssText =
      'position:absolute;right:14px;top:14px;width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,.4);border:2px solid rgba(255,255,255,.6);display:flex;align-items:center;justify-content:center;font-size:20px;pointer-events:auto;cursor:pointer;';
    mute.textContent = '🔊';
    mute.addEventListener('pointerdown', () => this._toggleMute());
    root.appendChild(mute);
    this.muteEl = mute;

    // Joystick (bottom-left).
    const joy = document.createElement('div');
    joy.style.cssText =
      'position:absolute;left:18px;bottom:18px;width:128px;height:128px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.55);pointer-events:auto;touch-action:none;';
    const knob = document.createElement('div');
    knob.style.cssText =
      'position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:rgba(108,77,255,.75);border:2px solid #fff;';
    joy.appendChild(knob);
    root.appendChild(joy);
    this._joystick(joy, knob);

    // FIRE + JUMP buttons (bottom-right).
    const fire = this._ctrlButton('FIRE', 'right', 18, '#f5a331');
    fire.addEventListener('pointerdown', () => (this.firing = true));
    fire.addEventListener('pointerup', () => (this.firing = false));
    fire.addEventListener('pointercancel', () => (this.firing = false));
    fire.addEventListener('pointerleave', () => (this.firing = false));
    const jump = this._ctrlButton('JUMP', 'right', 100, '#3aa852');
    jump.addEventListener('pointerdown', () => (this.jumpQueued = true));
    root.appendChild(fire);
    root.appendChild(jump);

    // Start overlay.
    const start = document.createElement('div');
    start.style.cssText =
      'position:absolute;inset:0;background:rgba(20,12,6,.72);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;pointer-events:auto;cursor:pointer;';
    start.innerHTML = `<div style="font-size:40px;font-weight:bold;color:#fff3c4;letter-spacing:4px;text-shadow:0 4px 0 #6a3a1a;">IYADEL 3D</div>
      <div style="font-size:14px;color:#ffe0b0;">NEO-PULSE RUN &amp; GUN</div>
      <div style="margin-top:18px;font-size:16px;color:#fff;background:#3a2a12;padding:10px 22px;border-radius:999px;border:2px solid #fff3c4;">TAP TO START</div>
      <div style="margin-top:14px;font-size:11px;color:#ffe0b0;opacity:.8;text-align:center;line-height:1.6;">WASD / joystick = move &nbsp;•&nbsp; SPACE = fire<br>F / JUMP = jump &nbsp;•&nbsp; survive &amp; score</div>`;
    start.addEventListener('pointerdown', () => {
      start.remove();
      this.started = true;
      this.clock.getDelta();
    });
    root.appendChild(start);

    // Game over overlay.
    const over = document.createElement('div');
    over.style.cssText =
      'position:absolute;inset:0;background:rgba(20,4,4,.78);display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;pointer-events:auto;';
    over.innerHTML = `<div style="font-size:34px;font-weight:bold;color:#ff5c6c;letter-spacing:3px;">GAME OVER</div>
      <div id="iy3d-final" style="font-size:16px;color:#fff;"></div>
      <button id="iy3d-restart" style="margin-top:8px;font-size:16px;font-weight:bold;color:#fff;background:#3a2a12;padding:10px 26px;border-radius:999px;border:2px solid #fff3c4;cursor:pointer;">RESTART</button>`;
    root.appendChild(over);
    this.overEl = over;
    over.querySelector('#iy3d-restart').addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this._restart();
    });

    this.container.appendChild(root);
    this._refreshHud();
  }

  _ctrlButton(label, side, bottom, color) {
    const b = document.createElement('div');
    b.style.cssText = `position:absolute;${side}:18px;bottom:${bottom}px;width:78px;height:78px;border-radius:50%;background:${color}cc;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:bold;color:#fff;pointer-events:auto;touch-action:none;cursor:pointer;`;
    b.textContent = label;
    return b;
  }

  _joystick(base, knob) {
    const center = { x: 0, y: 0 };
    let active = false;
    const set = (clientX, clientY) => {
      let dx = clientX - center.x;
      let dy = clientY - center.y;
      const max = 50;
      const d = Math.hypot(dx, dy);
      if (d > max) { dx = (dx / d) * max; dy = (dy / d) * max; }
      knob.style.left = `calc(50% + ${dx}px)`;
      knob.style.top = `calc(50% + ${dy}px)`;
      this.move.x = dx / max;
      this.move.y = -dy / max;
    };
    const down = (e) => {
      active = true;
      const r = base.getBoundingClientRect();
      center.x = r.left + r.width / 2;
      center.y = r.top + r.height / 2;
      const t = e.touches ? e.touches[0] : e;
      set(t.clientX, t.clientY);
      e.preventDefault();
    };
    const move = (e) => {
      if (!active) return;
      const t = e.touches ? e.touches[0] : e;
      set(t.clientX, t.clientY);
      e.preventDefault();
    };
    const up = () => {
      active = false;
      this.move.x = 0;
      this.move.y = 0;
      knob.style.left = '50%';
      knob.style.top = '50%';
    };
    base.addEventListener('touchstart', down, { passive: false });
    base.addEventListener('touchmove', move, { passive: false });
    base.addEventListener('touchend', up);
    base.addEventListener('mousedown', down);
    this._joyMove = move;
    this._joyUp = up;
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  _initInput() {
    this._kd = (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') { this.firing = true; e.preventDefault(); }
      if (e.code === 'KeyF') this.jumpQueued = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    };
    this._ku = (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') this.firing = false;
    };
    window.addEventListener('keydown', this._kd);
    window.addEventListener('keyup', this._ku);
  }

  _toggleMute() {
    this.muted = !this.muted;
    setSfxMuted(this.muted);
    this.muteEl.textContent = this.muted ? '🔇' : '🔊';
  }

  _spawnEnemy() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.9), bodyMat);
    body.castShadow = true; g.add(body);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({ color: 0xff3b3b, emissive: 0xff0000, emissiveIntensity: 1.4 }));
    eye.position.set(0, 0.05, 0.46); g.add(eye);
    const rotor1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0x555555 }));
    rotor1.position.set(0, 0.4, 0); g.add(rotor1);
    const rotor2 = rotor1.clone(); rotor2.position.set(0, -0.4, 0); g.add(rotor2);
    const ang = Math.random() * Math.PI * 2;
    const r = 22;
    g.position.set(Math.cos(ang) * r, 1.1, Math.sin(ang) * r);
    this.scene.add(g);
    this.enemies.push({ obj: g, hp: 2, speed: 3.2 + Math.min(2, this.score * 0.0008), rotor: rotor1, body });
  }

  _fire() {
    const geo = new THREE.SphereGeometry(0.14, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xf5a331, emissiveIntensity: 1.2 });
    const b = new THREE.Mesh(geo, mat);
    const start = this.playerPos.clone().add(new THREE.Vector3(0, 1.15, 0)).add(this.facing.clone().multiplyScalar(0.7));
    b.position.copy(start);
    b.castShadow = true;
    this.scene.add(b);
    this.bullets.push({ obj: b, vel: this.facing.clone().multiplyScalar(42), life: 0 });
    playShoot();
  }

  _pop(x, y, z, color) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 12, 12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
    );
    m.position.set(x, y, z);
    this.scene.add(m);
    this.fx.push({ obj: m, t: 0 });
  }

  update(dt) {
    // Movement input (keyboard + joystick).
    let ix = this.move.x;
    let iz = this.move.y;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) iz += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) iz -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) ix -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) ix += 1;
    const len = Math.hypot(ix, iz);
    if (len > 1) { ix /= len; iz /= len; }
    const speed = 7;
    this.playerPos.x += ix * speed * dt;
    this.playerPos.z += iz * speed * dt;
    if (Math.hypot(ix, iz) > 0.1) {
      this.facing.set(ix, 0, iz).normalize();
      this.player.rotation.y = Math.atan2(this.facing.x, this.facing.z);
    }

    // Jump + gravity.
    if (this.jumpQueued && this.onGround) { this.vy = 7.5; this.onGround = false; }
    this.jumpQueued = false;
    this.vy -= 22 * dt;
    this.playerPos.y += this.vy * dt;
    if (this.playerPos.y <= 0) { this.playerPos.y = 0; this.vy = 0; this.onGround = true; }
    this.player.position.copy(this.playerPos);

    // Camera follow.
    const camTarget = this.playerPos.clone().add(new THREE.Vector3(0, 12, -11));
    this.camera.position.lerp(camTarget, 0.08);
    this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1, this.playerPos.z);

    // Firing.
    this.fireCd -= dt;
    if (this.firing && this.fireCd <= 0) { this._fire(); this.fireCd = 0.16; }

    // Bullets.
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.obj.position.add(b.vel.clone().multiplyScalar(dt));
      b.life += dt;
      let hit = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (b.obj.position.distanceTo(e.obj.position) < 0.9) {
          e.hp -= 1;
          this._pop(b.obj.position.x, b.obj.position.y, b.obj.position.z, 0x9a6cff);
          hit = true;
          if (e.hp <= 0) {
            this._pop(e.obj.position.x, e.obj.position.y, e.obj.position.z, 0xff8a3c);
            this.scene.remove(e.obj);
            this.enemies.splice(j, 1);
            this.score += 100;
            playEnemyDie();
          }
          break;
        }
      }
      if (hit || b.life > 2 || b.obj.position.y < 0) {
        this.scene.remove(b.obj);
        this.bullets.splice(i, 1);
      }
    }

    // Spawn enemies.
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemies.length < 9) {
      this._spawnEnemy();
      this.spawnTimer = Math.max(0.55, 1.9 - this.score * 0.0006);
    }

    // Enemies move toward player + damage.
    this.invuln -= dt;
    for (const e of this.enemies) {
      const d = e.obj.position.clone().sub(this.playerPos);
      d.y = 0;
      const dist = d.length() || 1;
      if (dist > 1.1) {
        d.divideScalar(dist);
        e.obj.position.x -= d.x * e.speed * dt;
        e.obj.position.z -= d.z * e.speed * dt;
      }
      e.obj.position.y = 1.1 + Math.sin(performance.now() * 0.005 + e.obj.position.x) * 0.18;
      e.obj.rotation.y = Math.atan2(-d.x, -d.z);
      e.rotor.rotation.y += dt * 14;
      if (dist < 1.25 && this.invuln <= 0) {
        this.hp -= 12;
        this.invuln = 1.0;
        playHurt();
        this._flashPlayer(0xff5c6c);
        if (this.hp <= 0) { this.hp = 0; this._gameOver(); }
      }
    }

    // FX pops.
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const f = this.fx[i];
      f.t += dt;
      const s = 1 + f.t * 6;
      f.obj.scale.setScalar(s);
      f.obj.material.opacity = Math.max(0, 0.9 - f.t * 3);
      if (f.t > 0.4) { this.scene.remove(f.obj); this.fx.splice(i, 1); }
    }

    this._refreshHud();
  }

  _flashPlayer(color) {
    const orig = this.playerParts.map((p) => p.material.color.clone());
    this.playerParts.forEach((p) => (p.material.color.setHex(color)));
    setTimeout(() => {
      this.playerParts.forEach((p, i) => p.material.color.copy(orig[i]));
    }, 140);
  }

  _refreshHud() {
    const hpEl = this.hud.querySelector('#iy3d-hp');
    if (hpEl) {
      hpEl.style.width = `${(this.hp / this.maxHp) * 100}%`;
      hpEl.style.background = this.hp > 50 ? '#52d9a8' : this.hp > 25 ? '#f5c451' : '#ff5c6c';
    }
    this.scoreEl.textContent = `SCORE ${this.score}`;
    this.bestEl.textContent = `BEST ${Math.max(this.best, this.score)}`;
  }

  _gameOver() {
    if (this.over) return;
    this.over = true;
    this.best = Math.max(this.best, this.score);
    localStorage.setItem('iyadel3d_best', String(this.best));
    playGameOver();
    this.overEl.style.display = 'flex';
    this.overEl.querySelector('#iy3d-final').textContent = `SCORE ${this.score}  •  BEST ${this.best}`;
  }

  _restart() {
    this.enemies.forEach((e) => this.scene.remove(e.obj));
    this.bullets.forEach((b) => this.scene.remove(b.obj));
    this.fx.forEach((f) => this.scene.remove(f.obj));
    this.enemies = [];
    this.bullets = [];
    this.fx = [];
    this.hp = 100;
    this.score = 0;
    this.spawnTimer = 1.2;
    this.invuln = 0;
    this.playerPos.set(0, 0, 0);
    this.vy = 0;
    this.facing.set(0, 0, 1);
    this.player.position.copy(this.playerPos);
    this.player.rotation.y = 0;
    this.over = false;
    this.overEl.style.display = 'none';
    this._refreshHud();
  }

  animate() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (this.started && !this.over) this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('keydown', this._kd);
    window.removeEventListener('keyup', this._ku);
    if (this._joyMove) window.removeEventListener('mousemove', this._joyMove);
    if (this._joyUp) window.removeEventListener('mouseup', this._joyUp);
    if (this.hud && this.hud.parentNode) this.hud.parentNode.removeChild(this.hud);
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
  }
}