// PlayScene — the actual gameplay level.
// Phase 3: playable character with movement, jumping, shooting + a simple level.
import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { WeaponManager, WEAPONS } from '../weapons/Weapons';
import { EnemyManager } from '../entities/Enemy';

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
    this.refreshHud();
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    if (enemy.hit(1)) {
      this.score += enemy.value;
      enemy.destroy();
    }
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
  }
}