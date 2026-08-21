// PlayScene — the actual gameplay level.
// Phase 3: playable character with movement, jumping, shooting + a simple level.
import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { WeaponManager, WEAPONS } from '../weapons/Weapons';
import { EnemyManager } from '../entities/Enemy';
import { PickupManager } from '../entities/Pickup';
import { Boss } from '../entities/Boss';
import {
  playShoot, playJump, playEnemyHit, playEnemyDie, playHurt,
  playPickup, playBossHit, playBossDie, playVictory, playGameOver, setSfxMuted,
} from '@/lib/game-sounds';
import { startMusic, stopMusic } from '@/lib/game-music';
import { SaveManager } from '../save/SaveManager';
import { Effects } from '../effects/Effects';
import { buildParallax } from '../effects/Parallax';
import { PauseMenu } from '../ui/PauseMenu';
import { Achievements } from '../systems/Achievements';

const LEVEL_WIDTH = 3200;

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('Play');
  }

  create() {
    this.generateTextures();
    const DIFF = {
      easy: { dmg: 0.6, score: 0.8 },
      normal: { dmg: 1, score: 1 },
      hard: { dmg: 1.5, score: 1.3 },
    };
    this.diff = { ...DIFF[this.game.registry.get('difficulty')] || DIFF.normal };
    this.level = this.game.registry.get('level') || 1;
    this.diff.dmg *= 1 + (this.level - 1) * 0.18;
    this.diff.score *= 1 + (this.level - 1) * 0.12;

    // World bounds for the level.
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, 720);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, 720);

    // Sunset sky gradient (warm Metal Soldier palette).
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xf2b97a, 0xf2b97a, 0xe6a868, 0xb5683c, 1);
    bg.fillRect(0, 0, LEVEL_WIDTH, 720);
    bg.setScrollFactor(0.2);
    // Big low sun, fixed on screen with a soft glow.
    const sunX = this.scale.width - 120;
    const sunY = 130;
    this.add.circle(sunX, sunY, 110, 0xfff3c4, 0.18).setScrollFactor(0).setDepth(1);
    this.add.circle(sunX, sunY, 78, 0xfff3c4, 0.95).setScrollFactor(0).setDepth(1);
    buildParallax(this, LEVEL_WIDTH, 720);

    // Ground + platforms (static group).
    this.platforms = this.physics.add.staticGroup();
    const groundY = 660;
    for (let x = 0; x < LEVEL_WIDTH; x += 64) {
      this.platforms.create(x + 32, groundY, 'ground').refreshBody();
    }
    this.platforms.create(420, 520, 'platform').refreshBody();
    this.platforms.create(820, 430, 'platform').refreshBody();
    this.platforms.create(1200, 360, 'platform').refreshBody();
    this.platforms.create(1700, 480, 'platform').refreshBody();
    this.platforms.create(2200, 380, 'platform').refreshBody();
    this.platforms.create(2700, 470, 'platform').refreshBody();

    // Player.
    this.player = new Player(this, 120, 500);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    // Bullets (physics group, no gravity).
    this.bullets = this.physics.add.group();
    this.bullets.runChildUpdate = false;

    // Weapons system (Phase 4).
    this.weapons = new WeaponManager(this);
    this.input.keyboard.on('keydown-ONE', () => this.switchWeapon('pulse'));
    this.input.keyboard.on('keydown-TWO', () => this.switchWeapon('spread'));
    this.input.keyboard.on('keydown-THREE', () => this.switchWeapon('rapid'));

    this.weaponHud = this.add
      .text(20, 18, '', {
        fontFamily: 'Courier New, monospace',
        fontStyle: 'bold',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#00000099',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(40);
    this.refreshWeaponHud();

    const { width } = this.scale;
    const wb = this.add
      .rectangle(width - 50, 38, 76, 42, 0x6c4dff, 0.55)
      .setStrokeStyle(3, 0xffffff, 0.95)
      .setDepth(40)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    wb.on('pointerdown', () => this.cycleWeapon());
    this.add
      .text(width - 50, 38, 'SWAP', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(41)
      .setScrollFactor(0);

    // Enemies (Phase 5).
    this.enemyMgr = new EnemyManager(this);
    this.enemyMgr.spawn('walker', 720, 400);
    this.enemyMgr.spawn('walker', 1500, 300);
    this.enemyMgr.spawn('drone', 1000, 180);
    this.enemyMgr.spawn('drone', 2000, 150);
    this.enemyMgr.spawn('turret', 1240, 330);
    this.enemyMgr.spawn('turret', 2720, 430);
    // Extra enemies scale with level (Phase 14).
    for (let i = 1; i < this.level; i++) {
      this.enemyMgr.spawn('walker', 600 + i * 180, 400);
      this.enemyMgr.spawn('drone', 900 + i * 220, 180);
      if (i % 2 === 0) this.enemyMgr.spawn('turret', 1400 + i * 150, 330);
    }

    // Pickups (Phase 6).
    this.pickups = new PickupManager(this);
    this.pickups.spawn('gem', 430, 480);
    this.pickups.spawn('gem', 830, 390);
    this.pickups.spawn('gem', 1210, 320);
    this.pickups.spawn('health', 1710, 440);
    this.pickups.spawn('shield', 2210, 340);
    this.pickups.spawn('gem', 2710, 430);
    this.pickups.spawn('health', 3050, 600);
    this.shieldRing = this.add
      .circle(0, 0, 42)
      .setStrokeStyle(3, 0x52d9ff, 1)
      .setDepth(5)
      .setVisible(false);
    this.physics.add.overlap(this.player, this.pickups.group, (p, pk) =>
      this.collectPickup(p, pk)
    );

    // Boss (Phase 7) — spawns when the player reaches the end of the level.
    this.boss = null;
    this.bossSpawned = false;
    this.bossBar = null;
    this.bossBarBg = null;
    this.victoryShown = false;

    // Visual polish (Phase 10).
    this.effects = new Effects(this);
    // Achievements (Phase 13).
    this.achievements = new Achievements(this);

    // Audio (Phase 8).
    this.soundOn = true;
    setSfxMuted(false);
    startMusic('iyadel');
    this.muteBtn = this.add
      .text(this.scale.width - 24, 24, '🔊', { fontSize: '24px' })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(50)
      .setInteractive({ useHandCursor: true });
    this.muteBtn.on('pointerdown', () => this.toggleMute());
    const pb = this.add
      .text(this.scale.width - 70, 24, '⏸', { fontSize: '24px' })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(50)
      .setInteractive({ useHandCursor: true });
    pb.on('pointerdown', () => this.pauseMenu.toggle());
    this.paused = false;
    this.pauseMenu = new PauseMenu(this);
    this.input.keyboard.on('keydown-ESC', () => this.pauseMenu.toggle());
    this.input.keyboard.on('keydown-P', () => this.pauseMenu.toggle());
    this.events.once('shutdown', () => stopMusic());

    // HUD: score + health bar.
    this.score = 0;
    this.scoreHud = this.add
      .text(20, 70, 'SCORE 0', {
        fontFamily: 'Courier New, monospace',
        fontStyle: 'bold',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#00000099',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(40);
    this.bestScore = SaveManager.load().highScore;
    this.bestHud = this.add
      .text(20, 100, 'BEST ' + this.bestScore, {
        fontFamily: 'Courier New, monospace',
        fontStyle: 'bold',
        fontSize: '14px',
        color: '#52d9a8',
        backgroundColor: '#00000099',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(40);
    this.levelHud = this.add
      .text(20, 130, 'LEVEL ' + this.level, {
        fontFamily: 'Courier New, monospace',
        fontStyle: 'bold',
        fontSize: '14px',
        color: '#a89ce0',
        backgroundColor: '#00000099',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(40);
    this.add
      .rectangle(24, 50, 164, 16, 0x000000, 0.45)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(40);
    this.hpBar = this.add
      .rectangle(24, 50, 160, 12, 0x52d9a8)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(41);

    // Collisions.
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.bullets, this.platforms, (bullet) => bullet.destroy());
    this.physics.add.collider(this.enemyMgr.ground, this.platforms);
    this.physics.add.collider(this.enemyMgr.enemyBullets, this.platforms, (b) => b.destroy());
    this.physics.add.collider(this.bullets, this.enemyMgr.ground, (bullet, enemy) =>
      this.hitEnemy(bullet, enemy)
    );
    this.physics.add.collider(this.bullets, this.enemyMgr.air, (bullet, enemy) =>
      this.hitEnemy(bullet, enemy)
    );
    this.physics.add.collider(this.player, this.enemyMgr.ground, (player, enemy) =>
      this.touchEnemy(player, enemy)
    );
    this.physics.add.collider(this.player, this.enemyMgr.air, (player, enemy) =>
      this.touchEnemy(player, enemy)
    );
    this.physics.add.overlap(this.player, this.enemyMgr.enemyBullets, (player, b) => {
      b.destroy();
      if (player.takeDamage(Math.round(10 * this.diff.dmg), this.time.now)) this.gameOver();
      else { playHurt(); this.effects.shake(0.01, 120); }
      this.refreshHud();
    });

    // Controls state shared by keyboard + on-screen buttons.
    this.controls = { left: false, right: false, jump: false, fire: false };

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey('W');
    this.keyA = this.input.keyboard.addKey('A');
    this.keyD = this.input.keyboard.addKey('D');
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.buildTouchControls();
  }

  update() {
    if (this.paused) return;
    if (!this.player || !this.player.active) return;

    // Keyboard reads.
    const left = this.controls.left || this.cursors.left.isDown || this.keyA.isDown;
    const right = this.controls.right || this.cursors.right.isDown || this.keyD.isDown;
    const jumpPressed =
      this.controls.jump || this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown;

    if (left) this.player.moveLeft();
    else if (right) this.player.moveRight();
    else this.player.stop();

    if (jumpPressed && this.player.jump()) playJump();

    if (this.controls.fire && this.weapons.fire(this.player, this.bullets, this.time.now)) playShoot();

    this.enemyMgr.update(this.player, this.time.now);
    if (!this.bossSpawned && this.player.x > 2800) this.spawnBoss();
    if (this.boss && this.boss.alive) this.boss.update(this.player, this.time.now);
    else if (this.boss && !this.boss.alive && !this.victoryShown) this.victory();
    this.bossBarRefresh();
    this.shieldRing.setVisible(this.time.now < this.player.shieldUntil);
    this.shieldRing.setPosition(this.player.x, this.player.y);
    this.refreshHud();
  }

  spawnBoss() {
    this.bossSpawned = true;
    this.boss = new Boss(this, 3100, 220, this.enemyMgr.enemyBullets);
    this.physics.add.collider(this.bullets, this.boss, (b, boss) => this.hitBoss(b, boss));
    this.physics.add.overlap(this.player, this.boss, (p, boss) => this.touchEnemy(p, boss));
    const { width } = this.scale;
    this.bossBarBg = this.add
      .rectangle(width / 2, 30, 528, 18, 0x000000, 0.5)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(42);
    this.bossBar = this.add
      .rectangle(width / 2 - 260, 30, 520, 12, 0xff5c6c)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(43);
    const warn = this.add
      .text(width / 2, 80, '⚠ WARNING ⚠', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '26px',
        color: '#ff5c6c',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(44)
      .setAlpha(0);
    this.tweens.add({
      targets: warn,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 500,
      onComplete: () => warn.destroy(),
    });
  }

  hitBoss(bullet, boss) {
    bullet.destroy();
    if (boss.hit(2)) {
      boss.kill();
      this.score += Math.round(5000 * this.diff.score);
      this.effects.burst(boss.x, boss.y, 0xff5c6c, 40, 320);
      this.effects.shake(0.02, 350);
      this.effects.flash(0xff5c6c);
      playBossDie();
      this.achievements.onBossKill();
    } else {
      this.effects.burst(bullet.x, bullet.y, 0x9a6cff, 6, 120);
      playBossHit();
    }
    this.refreshHud();
  }

  bossBarRefresh() {
    if (this.boss && this.boss.alive) {
      const r = Math.max(0, this.boss.hp) / this.boss.maxHp;
      this.bossBar.width = 520 * r;
      this.bossBar.visible = true;
      this.bossBarBg.visible = true;
    } else if (this.bossBar) {
      this.bossBar.visible = false;
      this.bossBarBg.visible = false;
    }
  }

  victory() {
    this.bestScore = Math.max(this.bestScore, SaveManager.saveRun(this.score, true));
    this.achievements.onRunEnd(this.score, true);
    this.victoryShown = true;
    stopMusic();
    playVictory();
    this.scene.pause();
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'LEVEL ' + this.level + ' COMPLETE\nTAP FOR NEXT', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '38px',
        color: '#52d9a8',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(60);
    this.input.once('pointerdown', () => {
      this.game.registry.set('level', this.level + 1);
      this.scene.restart();
    });
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    const dead = enemy.hit(1);
    if (dead) {
      this.score += Math.round(enemy.value * this.diff.score);
      const ex = enemy.x;
      const ey = enemy.y;
      enemy.destroy();
      this.effects.burst(ex, ey, 0xff8a3c, 14);
      this.maybeDropPickup(ex, ey);
      playEnemyDie();
      this.achievements.onEnemyKill();
    } else {
      playEnemyHit();
    }
    this.refreshHud();
  }

  maybeDropPickup(x, y) {
    const r = Math.random();
    if (r < 0.2) this.pickups.spawn('health', x, y);
    else if (r < 0.45) this.pickups.spawn('gem', x, y);
    else if (r < 0.55) this.pickups.spawn('shield', x, y);
  }

  collectPickup(player, pickup) {
    if (pickup.type === 'health') player.hp = Math.min(player.maxHp, player.hp + 30);
    else if (pickup.type === 'shield') player.shieldUntil = this.time.now + 6000;
    else if (pickup.type === 'gem') {
      this.score += Math.round(250 * this.diff.score);
      this.achievements.onGem();
    }
    pickup.destroy();
    this.effects.burst(player.x, player.y, 0xf5c451, 10, 150);
    playPickup();
    this.refreshHud();
  }

  touchEnemy(player, enemy) {
    if (player.takeDamage(Math.round(15 * this.diff.dmg), this.time.now)) this.gameOver();
    else { playHurt(); this.effects.shake(0.012, 150); }
    this.refreshHud();
  }

  switchWeapon(key) {
    this.weapons.switchTo(key);
    this.refreshWeaponHud();
  }

  cycleWeapon() {
    this.weapons.next();
    this.refreshWeaponHud();
  }

  refreshWeaponHud() {
    const w = WEAPONS[this.weapons.current];
    this.weaponHud.setText(`⚔ ${w.name}`);
  }

  refreshHud() {
    this.refreshWeaponHud();
    const ratio = Math.max(0, this.player.hp) / this.player.maxHp;
    this.hpBar.width = 160 * ratio;
    this.hpBar.fillColor = ratio > 0.5 ? 0x52d9a8 : ratio > 0.25 ? 0xf5c451 : 0xff5c6c;
    this.scoreHud.setText('SCORE ' + this.score);
    this.bestHud.setText('BEST ' + Math.max(this.bestScore, this.score));
  }

  gameOver() {
    this.bestScore = Math.max(this.bestScore, SaveManager.saveRun(this.score, false));
    this.achievements.onRunEnd(this.score, false);
    stopMusic();
    playGameOver();
    this.scene.pause();
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'GAME OVER\nTAP TO RESTART', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '36px',
        color: '#ff5c6c',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(60);
    this.input.once('pointerdown', () => {
      this.game.registry.set('level', 1);
      this.scene.restart();
    });
  }

  toggleMute() {
    this.soundOn = !this.soundOn;
    if (this.soundOn) {
      setSfxMuted(false);
      startMusic('iyadel');
      this.muteBtn.setText('🔊');
    } else {
      setSfxMuted(true);
      stopMusic();
      this.muteBtn.setText('🔇');
    }
  }

  buildTouchControls() {
    const { width, height } = this.scale;
    const pad = 26;
    const size = 84;
    const gap = 16;
    const y = height - pad - size / 2;

    // Left side: movement.
    this.addCtrlButton(pad + size / 2, y, '◄', 'left', 0x6c4dff, size, true);
    this.addCtrlButton(pad + size + gap + size / 2, y, '►', 'right', 0x6c4dff, size, true);
    // Right side: jump + fire.
    this.addCtrlButton(width - pad - size / 2, y, 'FIRE', 'fire', 0xf5a331, size, false);
    this.addCtrlButton(width - pad - size - gap - size / 2, y, 'JUMP', 'jump', 0x3aa852, size, false);
  }

  addCtrlButton(x, y, label, key, color, size, isArrow) {
    const bg = this.add
      .rectangle(x, y, size, size, color, 0.55)
      .setStrokeStyle(3, 0xffffff, 0.95)
      .setDepth(35)
      .setScrollFactor(0);
    this.add
      .text(x, y, label, {
        fontFamily: 'Courier New, monospace',
        fontStyle: 'bold',
        fontSize: isArrow ? '34px' : '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(36)
      .setScrollFactor(0);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => (this.controls[key] = true));
    bg.on('pointerup', () => (this.controls[key] = false));
    bg.on('pointerout', () => (this.controls[key] = false));
    bg.on('pointercancel', () => (this.controls[key] = false));
  }

  generateTextures() {
    const OUT = 0x2a1a12;

    // --- Player: female soldier, green bandana, green outfit, thick outline.
    if (!this.textures.exists('player')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x5a3a22, 1); // boots
      g.fillRoundedRect(10, 54, 11, 10, 2);
      g.fillRoundedRect(27, 54, 11, 10, 2);
      g.fillStyle(0x7a6a3a, 1); // legs (khaki)
      g.fillRect(11, 38, 10, 18);
      g.fillRect(27, 38, 10, 18);
      g.fillStyle(0x4a8a3a, 1); // torso (green outfit)
      g.fillRoundedRect(12, 22, 24, 20, 4);
      g.fillStyle(0x3a2a1a, 1); // belt
      g.fillRect(12, 38, 24, 4);
      g.fillStyle(0x4a8a3a, 1); // arms
      g.fillRect(4, 26, 8, 14);
      g.fillRect(36, 23, 10, 13);
      g.fillStyle(0xe8b890, 1); // hands
      g.fillCircle(38, 36, 4);
      g.fillCircle(8, 40, 4);
      g.fillStyle(0xe8b890, 1); // head
      g.fillRoundedRect(16, 6, 16, 18, 4);
      g.fillStyle(0x1a1410, 1); // hair + pigtails
      g.fillRect(15, 4, 18, 6);
      g.fillRect(12, 8, 4, 14);
      g.fillRect(34, 8, 4, 14);
      g.fillStyle(0x3aa852, 1); // bandana
      g.fillRect(15, 9, 18, 5);
      g.fillRect(36, 10, 5, 3);
      g.fillStyle(0x2a1a12, 1); // eye
      g.fillRect(25, 16, 3, 3);
      g.lineStyle(2, OUT, 1); // outlines
      g.strokeRoundedRect(12, 22, 24, 20, 4);
      g.strokeRoundedRect(16, 6, 16, 18, 4);
      g.strokeRect(11, 38, 10, 18);
      g.strokeRect(27, 38, 10, 18);
      g.strokeRect(4, 26, 8, 14);
      g.strokeRect(36, 23, 10, 13);
      g.generateTexture('player', 48, 64);
      g.destroy();
    }

    // --- Bullet: golden glowing capsule.
    if (!this.textures.exists('bullet')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xf5a331, 1);
      g.fillRoundedRect(0, 1, 16, 6, 3);
      g.fillStyle(0xfff3c4, 1);
      g.fillRoundedRect(4, 2, 10, 4, 2);
      g.generateTexture('bullet', 16, 8);
      g.destroy();
    }

    // --- Ground: sandy rubble with a wooden plank top.
    if (!this.textures.exists('ground')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x8c8578, 1);
      g.fillRect(0, 10, 64, 50);
      g.fillStyle(0xa69d91, 1);
      for (let i = 0; i < 10; i++) g.fillRect(Phaser.Math.Between(2, 58), Phaser.Math.Between(14, 56), 6, 4);
      g.fillStyle(0x6b4a2a, 1); // wooden plank cap
      g.fillRect(0, 0, 64, 10);
      g.fillStyle(0x8a5a32, 1);
      g.fillRect(0, 0, 64, 3);
      g.lineStyle(2, OUT, 1);
      g.lineBetween(0, 10, 64, 10);
      g.generateTexture('ground', 64, 60);
      g.destroy();
    }

    // --- Platform: wooden planks with bolts.
    if (!this.textures.exists('platform')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x8a5a32, 1);
      g.fillRoundedRect(0, 0, 160, 20, 4);
      g.fillStyle(0x6b4a2a, 1);
      g.fillRect(0, 14, 160, 6);
      g.fillStyle(0xa8784a, 0.8);
      g.fillRect(0, 0, 160, 3);
      g.lineStyle(1, 0x4a2a12, 0.6);
      g.lineBetween(40, 2, 40, 18);
      g.lineBetween(80, 2, 80, 18);
      g.lineBetween(120, 2, 120, 18);
      g.fillStyle(0x3a2a1a, 1);
      g.fillCircle(10, 10, 2);
      g.fillCircle(150, 10, 2);
      g.generateTexture('platform', 160, 20);
      g.destroy();
    }

    // --- Drone: military recon drone with red lens + rotors.
    if (!this.textures.exists('drone')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x222226, 0.6);
      g.fillRect(0, 5, 32, 3);
      g.fillRect(0, 25, 32, 3);
      g.fillStyle(0x3a3a44, 1);
      g.fillRoundedRect(6, 10, 20, 13, 3);
      g.fillStyle(0xff5c6c, 1);
      g.fillCircle(16, 17, 4);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(15, 16, 1.5);
      g.lineStyle(2, 0x1a1a22, 1);
      g.strokeRoundedRect(6, 10, 20, 13, 3);
      g.generateTexture('drone', 32, 32);
      g.destroy();
    }

    // --- Walker: tan soldier with helmet.
    if (!this.textures.exists('walker')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x4a3a28, 1); // boots
      g.fillRoundedRect(8, 41, 8, 7, 2);
      g.fillRoundedRect(20, 41, 8, 7, 2);
      g.fillStyle(0x8a7a4a, 1); // legs
      g.fillRect(8, 28, 8, 15);
      g.fillRect(20, 28, 8, 15);
      g.fillStyle(0xa89070, 1); // vest
      g.fillRoundedRect(7, 16, 22, 16, 3);
      g.fillStyle(0x3a2a1a, 1); // belt
      g.fillRect(7, 30, 22, 3);
      g.fillStyle(0xa89070, 1); // arms
      g.fillRect(2, 18, 6, 12);
      g.fillRect(28, 18, 7, 10);
      g.fillStyle(0xe8b890, 1); // hands
      g.fillCircle(31, 28, 3);
      g.fillCircle(5, 30, 3);
      g.fillStyle(0xe8b890, 1); // head
      g.fillRoundedRect(11, 4, 14, 14, 3);
      g.fillStyle(0xa89070, 1); // helmet
      g.fillRoundedRect(9, 0, 18, 9, 3);
      g.fillRect(9, 6, 18, 3);
      g.fillStyle(0x2a1a12, 1); // eye
      g.fillRect(17, 11, 3, 3);
      g.lineStyle(2, OUT, 1);
      g.strokeRoundedRect(7, 16, 22, 16, 3);
      g.strokeRoundedRect(11, 4, 14, 14, 3);
      g.strokeRect(8, 28, 8, 15);
      g.strokeRect(20, 28, 8, 15);
      g.strokeRect(2, 18, 6, 12);
      g.strokeRect(28, 18, 7, 10);
      g.generateTexture('walker', 36, 48);
      g.destroy();
    }

    // --- Turret: sandbag nest + mounted gun.
    if (!this.textures.exists('turret')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xb59a6a, 1);
      g.fillRoundedRect(2, 20, 36, 14, 4);
      g.fillCircle(10, 25, 6);
      g.fillCircle(20, 23, 6);
      g.fillCircle(30, 25, 6);
      g.fillStyle(0x333333, 1);
      g.fillRect(14, 17, 12, 7);
      g.fillStyle(0x444444, 1);
      g.fillRect(17, 2, 6, 18);
      g.fillStyle(0x555555, 1);
      g.fillRect(17, 2, 3, 18);
      g.lineStyle(2, OUT, 1);
      g.strokeRoundedRect(2, 20, 36, 14, 4);
      g.strokeRect(17, 2, 6, 18);
      g.generateTexture('turret', 40, 36);
      g.destroy();
    }

    // --- Health: medkit (white cross on red).
    if (!this.textures.exists('health')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xe84a4a, 1);
      g.fillRoundedRect(2, 2, 24, 24, 4);
      g.fillStyle(0xffffff, 1);
      g.fillRect(11, 6, 6, 16);
      g.fillRect(6, 11, 16, 6);
      g.lineStyle(2, OUT, 1);
      g.strokeRoundedRect(2, 2, 24, 24, 4);
      g.generateTexture('health', 28, 28);
      g.destroy();
    }

    // --- Shield: blue emblem.
    if (!this.textures.exists('shield')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x52a8ff, 1);
      g.beginPath();
      g.moveTo(14, 2);
      g.lineTo(25, 8);
      g.lineTo(25, 20);
      g.lineTo(14, 26);
      g.lineTo(3, 20);
      g.lineTo(3, 8);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xbfe6ff, 1);
      g.fillRect(11, 9, 6, 10);
      g.lineStyle(2, OUT, 1);
      g.strokePath();
      g.generateTexture('shield', 28, 28);
      g.destroy();
    }

    // --- Gem: golden crystal.
    if (!this.textures.exists('gem')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xf5c451, 1);
      g.beginPath();
      g.moveTo(14, 2);
      g.lineTo(26, 14);
      g.lineTo(14, 26);
      g.lineTo(2, 14);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xfff3c4, 1);
      g.fillTriangle(14, 5, 20, 13, 14, 13);
      g.lineStyle(2, OUT, 1);
      g.strokePath();
      g.generateTexture('gem', 28, 28);
      g.destroy();
    }

    // --- Boss: armored war machine (hull + turret + barrel + red core).
    if (!this.textures.exists('boss')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x2a2a2a, 1); // tracks
      g.fillRoundedRect(6, 74, 108, 22, 6);
      g.fillStyle(0x444444, 1); // wheels
      for (let i = 0; i < 6; i++) g.fillCircle(16 + i * 18, 85, 7);
      g.fillStyle(0x5a4a3a, 1); // hull
      g.fillRoundedRect(8, 40, 104, 44, 6);
      g.fillStyle(0x6a5a4a, 1); // turret
      g.fillRoundedRect(34, 14, 52, 32, 5);
      g.fillStyle(0x333333, 1); // barrel
      g.fillRect(78, 26, 44, 9);
      g.fillStyle(0x555555, 1);
      g.fillRect(78, 26, 4, 9);
      g.fillStyle(0xff5c6c, 1); // red core / weak point
      g.fillCircle(60, 30, 7);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(58, 28, 2);
      g.lineStyle(3, 0x1a1410, 1);
      g.strokeRoundedRect(8, 40, 104, 44, 6);
      g.strokeRoundedRect(34, 14, 52, 32, 5);
      g.strokeRect(78, 26, 44, 9);
      g.generateTexture('boss', 120, 100);
      g.destroy();
    }
  }
}