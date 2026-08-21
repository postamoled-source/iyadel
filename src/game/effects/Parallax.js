// Parallax — layered depth background (stars, neon grid, distant skyline).
import Phaser from 'phaser';

export function buildParallax(scene, width, height) {
  // Far star field (slowest layer).
  for (let i = 0; i < 70; i++) {
    scene.add
      .circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.8),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.6)
      )
      .setScrollFactor(0.3)
      .setDepth(1);
  }

  // Distant skyline silhouettes.
  const skyline = scene.make.graphics({ add: false });
  skyline.fillStyle(0x140e2a, 1);
  let sx = 0;
  while (sx < width) {
    const bw = Phaser.Math.Between(60, 140);
    const bh = Phaser.Math.Between(80, 220);
    skyline.fillRect(sx, height - bh - 60, bw, bh);
    sx += bw + Phaser.Math.Between(10, 40);
  }
  skyline.generateTexture('parallax_skyline', width, height);
  skyline.destroy();
  scene.add.image(width / 2, height / 2, 'parallax_skyline').setScrollFactor(0.4).setDepth(1);

  // Mid neon grid.
  const grid = scene.make.graphics({ add: false });
  grid.lineStyle(1, 0x6c4dff, 0.15);
  for (let x = 0; x <= width; x += 80) grid.lineBetween(x, 0, x, height);
  for (let y = 0; y <= height; y += 80) grid.lineBetween(0, y, width, y);
  grid.generateTexture('parallax_grid', width, height);
  grid.destroy();
  scene.add.image(width / 2, height / 2, 'parallax_grid').setScrollFactor(0.5).setDepth(2);
}