// PlayScene — the actual gameplay level.
// Phase 3: playable character with movement, jumping, shooting + a simple level.
import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { WeaponManager, WEAPONS } from '../weapons/Weapons';
import { EnemyManager } from '../entities/Enemy';
import { PickupManager } from '../entities/Pickup';
import { Boss } from '../entities/Boss';

const LEVEL_WIDTH = 3200;

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('Play');
  }

  create() {
    this.generateTextures();

    // World bounds for the level.
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, 720);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, 720);

    // Sky gradient background.
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1430, 0x1a1430, 0x3a2a6a, 0x0b0a14, 1);
    bg.fillRect(0, 0, LEVEL_WIDTH, 720);
    bg.setScrollFactor(0.2);

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
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#00000066',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(40);
    this.refreshWeaponHud();

    const { width } = this.scale;
    const wb = this.add
      .rectangle(width - 50, 38, 72, 40, 0x6c4dff, 0.3)
      .setStrokeStyle(2, 0x6c4dff, 0.7)
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

    // HUD: score + health bar.
    this.score = 0;
    this.scoreHud = this.add
      .text(20, 70, 'SCORE 0', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#00000066',
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
      if (player.takeDamage(10, this.time.now)) this.gameOver();
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
    if (!this.player || !this.player.active) return;

    // Keyboard reads.
    const left = this.controls.left || this.cursors.left.isDown || this.keyA.isDown;
    const right = this.controls.right || this.cursors.right.isDown || this.keyD.isDown;
    const jumpPressed =
      this.controls.jump || this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown;

    if (left) this.player.moveLeft();
    else if (right) this.player.moveRight();
    else this.player.stop();

    if (jumpPressed) this.player.jump();

    if (this.controls.fire) this.weapons.fire(this.player, this.bullets, this.time.now);

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
      this.score += 5000;
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
    this.victoryShown = true;
    this.scene.pause();
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'VICTORY!\nTAP TO RESTART', {
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '40px',
        color: '#52d9a8',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(60);
    this.input.once('pointerdown', () => this.scene.restart());
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    if (enemy.hit(1)) {
      this.score += enemy.value;
      const ex = enemy.x;
      const ey = enemy.y;
      enemy.destroy();
      this.maybeDropPickup(ex, ey);
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
    else if (pickup.type === 'gem') this.score += 250;
    pickup.destroy();
    this.refreshHud();
  }

  touchEnemy(player, enemy) {
    if (player.takeDamage(15, this.time.now)) this.gameOver();
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
  }

  gameOver() {
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
    this.input.once('pointerdown', () => this.scene.restart());
  }

  buildTouchControls() {
    const { width, height } = this.scale;
    const pad = 28;
    const size = 66;

    // Left side: movement.
    this.addCtrlButton(pad + size / 2, height - pad - size / 2, '◀', 'left', 0x6c4dff);
    this.addCtrlButton(pad + size + 24 + size / 2, height - pad - size / 2, '▶', 'right', 0x6c4dff);
    // Right side: jump + fire.
    this.addCtrlButton(width - pad - size / 2, height - pad - size / 2, '🔥', 'fire', 0xf5c451);
    this.addCtrlButton(
      width - pad - size - 24 - size / 2,
      height - pad - size / 2,
      '⤴',
      'jump',
      0x52d9a8
    );
  }

  addCtrlButton(x, y, label, key, color) {
    const size = 66;
    const bg = this.add
      .rectangle(x, y, size, size, color, 0.22)
      .setStrokeStyle(2, color, 0.7)
      .setDepth(30)
      .setScrollFactor(0);
    this.add
      .text(x, y, label, { fontSize: '26px', color: '#ffffff' })
      .setOrigin(0.5)
      .setDepth(31)
      .setScrollFactor(0);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => (this.controls[key] = true));
    bg.on('pointerup', () => (this.controls[key] = false));
    bg.on('pointerout', () => (this.controls[key] = false));
    bg.on('pointercancel', () => (this.controls[key] = false));
  }

  generateTextures() {
    if (!this.textures.exists('player')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x7c4dff);
      g.fillRect(2, 14, 32, 42); // body
      g.fillStyle(0xf5c451);
      g.fillRect(8, 0, 20, 18); // head
      g.fillStyle(0xffffff);
      g.fillRect(14, 5, 4, 4); // eye
      g.generateTexture('player', 36, 56);
      g.destroy();
    }
    if (!this.textures.exists('bullet')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xf5c451, 1);
      g.fillRoundedRect(0, 0, 14, 6, 3);
      g.generateTexture('bullet', 14, 6);
      g.destroy();
    }
    if (!this.textures.exists('ground')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x2a2540, 1);
      g.fillRect(0, 0, 64, 60);
      g.fillStyle(0x6c4dff, 1);
      g.fillRect(0, 0, 64, 6);
      g.generateTexture('ground', 64, 60);
      g.destroy();
    }
    if (!this.textures.exists('platform')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x3a2a6a, 1);
      g.fillRoundedRect(0, 0, 160, 20, 6);
      g.fillStyle(0x8a6cff, 1);
      g.fillRoundedRect(0, 0, 160, 6, 3);
      g.generateTexture('platform', 160, 20);
      g.destroy();
    }
    if (!this.textures.exists('drone')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xff5c6c, 1);
      g.fillCircle(14, 14, 14);
      g.fillStyle(0xffffff, 1);
      g.fillRect(8, 8, 4, 4);
      g.generateTexture('drone', 28, 28);
      g.destroy();
    }
    if (!this.textures.exists('walker')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xff8a3c, 1);
      g.fillRect(2, 6, 28, 26);
      g.fillStyle(0xffc36b, 1);
      g.fillRect(6, 0, 20, 10);
      g.generateTexture('walker', 32, 32);
      g.destroy();
    }
    if (!this.textures.exists('turret')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x9a6cff, 1);
      g.fillRoundedRect(2, 8, 28, 22, 4);
      g.fillStyle(0x6c4dff, 1);
      g.fillRect(12, 0, 8, 12);
      g.generateTexture('turret', 32, 30);
      g.destroy();
    }
    if (!this.textures.exists('health')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x2bd47a, 1);
      g.fillCircle(14, 14, 13);
      g.fillStyle(0xffffff, 1);
      g.fillRect(11, 5, 6, 18);
      g.fillRect(5, 11, 18, 6);
      g.generateTexture('health', 28, 28);
      g.destroy();
    }
    if (!this.textures.exists('shield')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x52d9ff, 1);
      g.beginPath();
      g.moveTo(14, 2);
      g.lineTo(25, 8);
      g.lineTo(25, 20);
      g.lineTo(14, 26);
      g.lineTo(3, 20);
      g.lineTo(3, 8);
      g.closePath();
      g.fillPath();
      g.generateTexture('shield', 28, 28);
      g.destroy();
    }
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
      g.generateTexture('gem', 28, 28);
      g.destroy();
    }
    if (!this.textures.exists('boss')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x8a2be2, 1);
      g.fillCircle(48, 48, 46);
      g.fillStyle(0xff5c6c, 1);
      g.fillCircle(34, 38, 9);
      g.fillCircle(62, 38, 9);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(34, 38, 4);
      g.fillCircle(62, 38, 4);
      g.fillStyle(0x4a1a7a, 1);
      g.fillTriangle(48, 48, 30, 64, 66, 64);
      g.generateTexture('boss', 96, 96);
      g.destroy();
    }
  }
}