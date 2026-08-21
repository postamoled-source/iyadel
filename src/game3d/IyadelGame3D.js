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
    this.grenades = [];
    this.missiles = [];
    this.grenadeCd = 0;
    this.missileCd = 0;
    this.sprint = false;
    this.walkPhase = 0;
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
    this.running = true;
    this.animate = this.animate.bind(this);
    this.raf = requestAnimationFrame(this.animate);

    this._onResize = this._onResize.bind(this);
    this.ro = new ResizeObserver(this._onResize);
    this.ro.observe(container);
    this._onResize();
  }

  _skyTexture() {
    const c = document.createElement('canvas');
    c.width = 4; c.height = 256;
    const ctx = c.getContext('2d');
    const grd = ctx.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#ffd98a');
    grd.addColorStop(0.45, '#f2a868');
    grd.addColorStop(1, '#7a3a1a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 4, 256);
    return new THREE.CanvasTexture(c);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = this._skyTexture();
    this.scene.fog = new THREE.Fog(0x8a3a1a, 22, 64);
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
      new THREE.MeshStandardMaterial({ color: 0x6e4e2e, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    // Grid lines for depth perception.
    const grid = new THREE.GridHelper(200, 50, 0x3a2410, 0x4a2e18);
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
    const jacket = new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.65 });
    const jacketDark = new THREE.MeshStandardMaterial({ color: 0x244a24, roughness: 0.7 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xf0c8a0, roughness: 0.6 });
    const hair = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.8 });
    const band = new THREE.MeshStandardMaterial({ color: 0xff5c6c, emissive: 0x551111, emissiveIntensity: 0.5, roughness: 0.5 });
    const boot = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.6 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.35, metalness: 0.7 });
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.6 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x2a4a8a, emissive: 0x223366, emissiveIntensity: 0.6 });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.72, 6, 12), jacket);
    torso.position.y = 1.12; torso.castShadow = true; g.add(torso);
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.42), jacketDark);
    vest.position.set(0, 1.12, 0.04); vest.castShadow = true; g.add(vest);
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.4), boot);
    belt.position.y = 0.8; g.add(belt);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.22), jacketDark);
    pack.position.set(0, 1.15, -0.34); pack.castShadow = true; g.add(pack);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20), skin);
    head.position.y = 1.84; head.castShadow = true; g.add(head);
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.18, 0.5), hair);
    fringe.position.set(0, 1.98, 0.04); g.add(fringe);
    const tailL = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 8), hair);
    tailL.position.set(-0.32, 1.96, -0.18); tailL.rotation.z = 0.5; g.add(tailL);
    const tailR = tailL.clone(); tailR.position.x = 0.32; tailR.rotation.z = -0.5; g.add(tailR);
    const headband = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 8, 20), band);
    headband.position.set(0, 1.9, 0.02); headband.rotation.x = Math.PI / 2; g.add(headband);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), eyeMat);
    eyeL.position.set(-0.1, 1.84, 0.27); g.add(eyeL);
    const eyeR = eyeL.clone(); eyeR.position.x = 0.1; g.add(eyeR);

    const armGroupL = new THREE.Group(); armGroupL.position.set(-0.52, 1.4, 0);
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.5, 4, 8), jacket);
    armL.position.y = -0.28; armL.castShadow = true; armGroupL.add(armL);
    const gloveL = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), boot);
    gloveL.position.y = -0.55; armGroupL.add(gloveL);
    g.add(armGroupL);

    const armGroupR = new THREE.Group(); armGroupR.position.set(0.52, 1.4, 0.2);
    const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.5, 4, 8), jacket);
    armR.position.y = -0.28; armR.rotation.x = -1.0; armR.castShadow = true; armGroupR.add(armR);
    const gloveR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), boot);
    gloveR.position.set(0, -0.5, 0.3); armGroupR.add(gloveR);
    const rifle = new THREE.Group();
    const rbody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.7), gunMat); rifle.add(rbody);
    const rbarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), metal);
    rbarrel.rotation.x = Math.PI / 2; rbarrel.position.set(0, 0.02, 0.5); rifle.add(rbarrel);
    const rmag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.12), gunMat);
    rmag.position.set(0, -0.16, -0.1); rifle.add(rmag);
    rifle.position.set(0, -0.45, 0.45); rifle.rotation.x = -0.2;
    armGroupR.add(rifle);
    g.add(armGroupR);

    const legGroupL = new THREE.Group(); legGroupL.position.set(-0.2, 0.82, 0);
    const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.55, 4, 8), jacketDark);
    legL.position.y = -0.35; legL.castShadow = true; legGroupL.add(legL);
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.4), boot);
    bootL.position.set(0, -0.7, 0.06); legGroupL.add(bootL);
    g.add(legGroupL);

    const legGroupR = new THREE.Group(); legGroupR.position.set(0.2, 0.82, 0);
    const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.55, 4, 8), jacketDark);
    legR.position.y = -0.35; legR.castShadow = true; legGroupR.add(legR);
    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.4), boot);
    bootR.position.set(0, -0.7, 0.06); legGroupR.add(bootR);
    g.add(legGroupR);

    this.parts = { torso, armL: armGroupL, armR: armGroupR, legL: legGroupL, legR: legGroupR };
    this.playerParts = [torso, vest, belt, pack, head, fringe, tailL, tailR, headband, eyeL, eyeR, armL, gloveL, armR, gloveR, rbody, rbarrel, rmag, legL, bootL, legR, bootR];
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

    // D-Pad (bottom-left): directional movement buttons.
    this.dir = { up: false, down: false, left: false, right: false };
    const ds = 56, g = 4, ox = 14, oy = 14;
    const dirBtn = (label, cx, cy, key) => {
      const b = document.createElement('div');
      b.style.cssText = `position:absolute;left:${cx}px;bottom:${cy}px;width:${ds}px;height:${ds}px;border-radius:14px;background:rgba(108,77,255,.55);border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;color:#fff;pointer-events:auto;touch-action:none;cursor:pointer;`;
      b.textContent = label;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); this.dir[key] = true; });
      b.addEventListener('pointerup', () => (this.dir[key] = false));
      b.addEventListener('pointercancel', () => (this.dir[key] = false));
      b.addEventListener('pointerleave', () => (this.dir[key] = false));
      root.appendChild(b);
    };
    dirBtn('▲', ox + ds + g, oy + 2 * (ds + g), 'up');
    dirBtn('◄', ox, oy + ds + g, 'left');
    dirBtn('►', ox + 2 * (ds + g), oy + ds + g, 'right');
    dirBtn('▼', ox + ds + g, oy, 'down');

    // Action cluster (bottom-right): FIRE, JUMP, GRENADE, MISSILE.
    const fire = this._ctrlButton('FIRE', 84, 16, 16, '#f5a331', 16);
    fire.addEventListener('pointerdown', () => (this.firing = true));
    fire.addEventListener('pointerup', () => (this.firing = false));
    fire.addEventListener('pointercancel', () => (this.firing = false));
    fire.addEventListener('pointerleave', () => (this.firing = false));
    root.appendChild(fire);

    const jump = this._ctrlButton('JUMP', 64, 28, 108, '#3aa852', 13);
    jump.addEventListener('pointerdown', () => (this.jumpQueued = true));
    root.appendChild(jump);

    const grenade = this._ctrlButton('GREN', 60, 104, 20, '#6c4dff', 12);
    grenade.addEventListener('pointerdown', () => this._throwGrenade());
    root.appendChild(grenade);

    const missile = this._ctrlButton('MISS', 60, 104, 92, '#ff5c6c', 12);
    missile.addEventListener('pointerdown', () => this._fireMissile());
    root.appendChild(missile);

    // RUN toggle (left, above D-pad).
    const run = document.createElement('div');
    run.style.cssText = 'position:absolute;left:72px;bottom:202px;width:54px;height:54px;border-radius:50%;background:rgba(245,195,81,.3);border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;color:#fff;pointer-events:auto;touch-action:none;cursor:pointer;';
    run.textContent = 'RUN';
    run.addEventListener('pointerdown', () => {
      this.sprint = !this.sprint;
      run.style.background = this.sprint ? 'rgba(245,195,81,.85)' : 'rgba(245,195,81,.3)';
    });
    root.appendChild(run);
    this.runBtn = run;

    // Start overlay.
    const start = document.createElement('div');
    start.style.cssText =
      'position:absolute;inset:0;background:rgba(20,12,6,.72);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;pointer-events:auto;cursor:pointer;';
    start.innerHTML = `<div style="font-size:40px;font-weight:bold;color:#fff3c4;letter-spacing:4px;text-shadow:0 4px 0 #6a3a1a;">IYADEL 3D</div>
      <div style="font-size:14px;color:#ffe0b0;">NEO-PULSE RUN &amp; GUN</div>
      <div style="margin-top:18px;font-size:16px;color:#fff;background:#3a2a12;padding:10px 22px;border-radius:999px;border:2px solid #fff3c4;">TAP TO START</div>
      <div style="margin-top:14px;font-size:11px;color:#ffe0b0;opacity:.85;text-align:center;line-height:1.6;">Joystick / WASD = move &nbsp;•&nbsp; FIRE = shoot<br>GREN = grenade &nbsp;•&nbsp; MISS = missile &nbsp;•&nbsp; RUN = sprint<br>JUMP / F = jump &nbsp;•&nbsp; G = grenade &nbsp;•&nbsp; R = missile</div>`;
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

  _ctrlButton(label, size, bottom, right, color, fontSize) {
    const b = document.createElement('div');
    b.style.cssText = `position:absolute;right:${right}px;bottom:${bottom}px;width:${size}px;height:${size}px;border-radius:50%;background:${color}cc;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:${fontSize}px;font-weight:bold;color:#fff;pointer-events:auto;touch-action:none;cursor:pointer;text-align:center;`;
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
      if (e.code === 'KeyG') this._throwGrenade();
      if (e.code === 'KeyR') this._fireMissile();
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.sprint = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    };
    this._ku = (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') this.firing = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.sprint = false;
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
    const armor = new THREE.MeshStandardMaterial({ color: 0x3a3036, roughness: 0.5, metalness: 0.5 });
    const armorDark = new THREE.MeshStandardMaterial({ color: 0x241c22, roughness: 0.6, metalness: 0.4 });
    const red = new THREE.MeshStandardMaterial({ color: 0xff3b3b, emissive: 0xff0000, emissiveIntensity: 1.3, roughness: 0.4 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.3, metalness: 0.8 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.5), armor);
    torso.position.y = 1.15; torso.castShadow = true; g.add(torso);
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.56), armorDark);
    chest.position.set(0, 1.25, 0.02); g.add(chest);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), red);
    core.position.set(0, 1.25, 0.3); g.add(core);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.36), armor);
    head.position.y = 1.66; head.castShadow = true; g.add(head);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 0.02), red);
    visor.position.set(0, 1.66, 0.19); g.add(visor);
    const shL = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), armor);
    shL.position.set(-0.5, 1.42, 0); g.add(shL);
    const shR = shL.clone(); shR.position.x = 0.5; g.add(shR);
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.45, 4, 8), armorDark);
    armL.position.set(-0.5, 1.0, 0.1); armL.castShadow = true; g.add(armL);
    const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.45, 4, 8), armorDark);
    armR.position.set(0.5, 1.0, 0.1); armR.castShadow = true; g.add(armR);
    const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8), metal);
    cannon.rotation.x = Math.PI / 2; cannon.position.set(0.5, 1.0, 0.5); g.add(cannon);
    const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 4, 8), armorDark);
    legL.position.set(-0.2, 0.45, 0); legL.castShadow = true; g.add(legL);
    const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 4, 8), armorDark);
    legR.position.set(0.2, 0.45, 0); legR.castShadow = true; g.add(legR);
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.42), armor);
    bootL.position.set(-0.2, 0.12, 0.06); g.add(bootL);
    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.42), armor);
    bootR.position.set(0.2, 0.12, 0.06); g.add(bootR);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), metal);
    ant.position.set(0.2, 1.95, 0); g.add(ant);

    const ang = Math.random() * Math.PI * 2;
    const r = 22;
    g.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
    this.scene.add(g);
    this.enemies.push({ obj: g, hp: 3, speed: 3.0 + Math.min(2.2, this.score * 0.0008), parts: { legL, legR, visor } });
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

  _explode(x, y, z, radius, dmg, color) {
    this._pop(x, y, z, color);
    this._pop(x, y, z, 0xfff3c4);
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies[j];
      if (e.obj.position.distanceTo(new THREE.Vector3(x, y, z)) < radius) {
        e.hp -= dmg;
        if (e.hp <= 0) {
          this._pop(e.obj.position.x, e.obj.position.y, e.obj.position.z, 0xff8a3c);
          this.scene.remove(e.obj);
          this.enemies.splice(j, 1);
          this.score += 100;
          playEnemyDie();
        }
      }
    }
  }

  _throwGrenade() {
    if (this.grenadeCd > 0 || this.over || !this.started) return;
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x3aa852, emissive: 0x115422, emissiveIntensity: 0.6 })
    );
    m.castShadow = true;
    m.position.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0)).add(this.facing.clone().multiplyScalar(0.7));
    const vel = this.facing.clone().multiplyScalar(9);
    vel.y = 6.5;
    this.scene.add(m);
    this.grenades.push({ obj: m, vel, life: 0 });
    this.grenadeCd = 1.1;
    playShoot();
  }

  _fireMissile() {
    if (this.missileCd > 0 || this.over || !this.started) return;
    const m = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.13, 0.7, 6, 10),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, emissive: 0xff5c6c, emissiveIntensity: 0.8 })
    );
    m.castShadow = true;
    m.position.copy(this.playerPos).add(new THREE.Vector3(0, 1.3, 0)).add(this.facing.clone().multiplyScalar(0.8));
    m.rotation.x = Math.PI / 2;
    this.scene.add(m);
    this.missiles.push({ obj: m, vel: this.facing.clone().multiplyScalar(30), life: 0 });
    this.missileCd = 2.2;
    playShoot();
  }

  update(dt) {
    // Movement input (D-pad + keyboard).
    let ix = 0, iz = 0;
    if (this.dir.left) ix -= 1;
    if (this.dir.right) ix += 1;
    if (this.dir.up) iz += 1;
    if (this.dir.down) iz -= 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) iz += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) iz -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) ix -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) ix += 1;
    const len = Math.hypot(ix, iz);
    if (len > 1) { ix /= len; iz /= len; }
    const speed = this.sprint ? 11 : 7;
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
    // Procedural walk animation.
    const moving = Math.hypot(ix, iz) > 0.1 && this.onGround;
    if (moving) {
      this.walkPhase += dt * (this.sprint ? 16 : 10);
      const sw = Math.sin(this.walkPhase) * (this.sprint ? 0.7 : 0.45);
      this.parts.legL.rotation.x = sw;
      this.parts.legR.rotation.x = -sw;
      this.parts.armL.rotation.x = -sw * 0.5;
      this.player.position.y = this.playerPos.y + Math.abs(Math.sin(this.walkPhase)) * 0.05;
    } else {
      this.parts.legL.rotation.x *= 0.8;
      this.parts.legR.rotation.x *= 0.8;
      this.parts.armL.rotation.x *= 0.8;
    }
    this.parts.armR.rotation.x = this.firing ? -0.7 : 0;

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

    // Grenades (lobbed, area damage).
    this.grenadeCd = Math.max(0, this.grenadeCd - dt);
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const gr = this.grenades[i];
      gr.vel.y -= 20 * dt;
      gr.obj.position.add(gr.vel.clone().multiplyScalar(dt));
      gr.obj.rotation.x += dt * 8;
      gr.life += dt;
      if (gr.obj.position.y <= 0.25 || gr.life > 2.5) {
        this._explode(gr.obj.position.x, 0.5, gr.obj.position.z, 3.4, 3, 0xff8a3c);
        this.scene.remove(gr.obj);
        this.grenades.splice(i, 1);
      }
    }

    // Missiles (homing, large area damage).
    this.missileCd = Math.max(0, this.missileCd - dt);
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      let near = null, nd = 999;
      for (const e of this.enemies) { const d = e.obj.position.distanceTo(m.obj.position); if (d < nd) { nd = d; near = e; } }
      if (near && nd < 26) {
        const dir = near.obj.position.clone().sub(m.obj.position).normalize().multiplyScalar(30);
        m.vel.lerp(dir, 0.08);
      }
      m.obj.position.add(m.vel.clone().multiplyScalar(dt));
      if (m.vel.lengthSq() > 0.01) m.obj.lookAt(m.obj.position.clone().add(m.vel));
      m.life += dt;
      let hit = false;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        if (m.obj.position.distanceTo(this.enemies[j].obj.position) < 1.2) {
          this._explode(m.obj.position.x, m.obj.position.y, m.obj.position.z, 2.6, 5, 0xff5c6c);
          this.scene.remove(m.obj); this.missiles.splice(i, 1); hit = true; break;
        }
      }
      if (!hit && (m.life > 3 || m.obj.position.y < 0)) { this.scene.remove(m.obj); this.missiles.splice(i, 1); }
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
      e.obj.position.y = 0;
      e.obj.rotation.y = Math.atan2(-d.x, -d.z);
      if (e.parts) {
        const sw = Math.sin(performance.now() * 0.008) * 0.5;
        e.parts.legL.rotation.x = sw;
        e.parts.legR.rotation.x = -sw;
      }
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
    this.grenades.forEach((g) => this.scene.remove(g.obj));
    this.missiles.forEach((m) => this.scene.remove(m.obj));
    this.enemies = [];
    this.bullets = [];
    this.fx = [];
    this.grenades = [];
    this.missiles = [];
    this.grenadeCd = 0;
    this.missileCd = 0;
    this.hp = 100;
    this.score = 0;
    this.spawnTimer = 1.2;
    this.invuln = 0;
    this.playerPos.set(0, 0, 0);
    this.vy = 0;
    this.facing.set(0, 0, 1);
    this.player.position.copy(this.playerPos);
    this.player.rotation.y = 0;
    this.parts.legL.rotation.x = 0;
    this.parts.legR.rotation.x = 0;
    this.parts.armL.rotation.x = 0;
    this.parts.armR.rotation.x = 0;
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