// Parallax — layered depth background: sunset ruined city (Metal Soldier style).
import Phaser from 'phaser';

export function buildParallax(scene, width, height) {
  // Far ruined skyline silhouettes (destroyed buildings, broken tops).
  const far = scene.make.graphics({ add: false });
  far.fillStyle(0x6a4a3a, 0.85);
  let fx = 0;
  while (fx < width) {
    const bw = Phaser.Math.Between(70, 150);
    const bh = Phaser.Math.Between(120, 260);
    const top = height - bh - 40;
    far.fillRect(fx, top, bw, bh);
    // broken/jagged top
    far.fillRect(fx, top - Phaser.Math.Between(8, 28), bw * 0.4, 12);
    far.fillRect(fx + bw * 0.5, top - Phaser.Math.Between(4, 20), bw * 0.3, 10);
    // empty windows
    far.fillStyle(0x2a1a12, 0.5);
    for (let wy = top + 20; wy < height - 60; wy += 26) {
      for (let wx = fx + 8; wx < fx + bw - 10; wx += 18) {
        if (Math.random() > 0.5) far.fillRect(wx, wy, 8, 12);
      }
    }
    far.fillStyle(0x6a4a3a, 0.85);
    fx += bw + Phaser.Math.Between(6, 30);
  }
  far.generateTexture('parallax_far', width, height);
  far.destroy();
  scene.add.image(width / 2, height / 2, 'parallax_far').setScrollFactor(0.35).setDepth(1);

  // Mid layer: closer damaged buildings + rubble.
  const mid = scene.make.graphics({ add: false });
  mid.fillStyle(0x4a3a2e, 0.95);
  let mx = 0;
  while (mx < width) {
    const bw = Phaser.Math.Between(90, 180);
    const bh = Phaser.Math.Between(180, 340);
    const top = height - bh - 10;
    mid.fillRect(mx, top, bw, bh);
    mid.fillRect(mx, top - Phaser.Math.Between(10, 30), bw * 0.5, 14);
    mid.fillStyle(0x1a1410, 0.6);
    for (let wy = top + 16; wy < height - 30; wy += 30) {
      for (let wx = mx + 10; wx < mx + bw - 14; wx += 22) {
        mid.fillRect(wx, wy, 10, 14);
      }
    }
    mid.fillStyle(0x4a3a2e, 0.95);
    mx += bw + Phaser.Math.Between(10, 40);
  }
  mid.generateTexture('parallax_mid', width, height);
  mid.destroy();
  scene.add.image(width / 2, height / 2, 'parallax_mid').setScrollFactor(0.55).setDepth(2);

  // Ground haze band.
  const haze = scene.make.graphics({ add: false });
  haze.fillStyle(0xb5683c, 0.35);
  haze.fillRect(0, height - 90, width, 90);
  haze.generateTexture('parallax_haze', width, height);
  haze.destroy();
  scene.add.image(width / 2, height / 2, 'parallax_haze').setScrollFactor(0.7).setDepth(3);
}