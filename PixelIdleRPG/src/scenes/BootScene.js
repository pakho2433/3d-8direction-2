import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
export class BootScene extends Phaser.Scene {
  constructor(){super('BootScene');}
  create(){this.cameras.main.setBackgroundColor('#080d16');this.scene.start('PreloadScene');}
}
