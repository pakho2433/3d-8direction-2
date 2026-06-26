import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { heroes } from '../data/heroes.js';
import { enemies, bosses } from '../data/enemies.js';
import { equipmentCatalog } from '../data/equipment.js';
import { generatePixelAssets } from '../utils/PixelFactory.js';
export class PreloadScene extends Phaser.Scene {
  constructor(){super('PreloadScene');}
  create(){
    const {width,height}=this.scale;
    this.add.rectangle(width/2,height/2,width,height,0x080d16);
    this.add.text(width/2,height/2-65,'PIXEL IDLE RPG',{fontFamily:'monospace',fontStyle:'bold',fontSize:'38px',color:'#f4c65e',stroke:'#000',strokeThickness:6}).setOrigin(.5);
    const bar=this.add.rectangle(width/2-220,height/2+10,0,24,0x4da3ff).setOrigin(0,.5);
    this.add.rectangle(width/2,height/2+10,448,32,0x101826).setStrokeStyle(3,0x526481);
    const label=this.add.text(width/2,height/2+52,'Generating original pixel assets…',{fontFamily:'monospace',fontSize:'14px',color:'#b8c3d6'}).setOrigin(.5);
    let progress=0;
    this.time.addEvent({delay:60,repeat:9,callback:()=>{progress+=.1;bar.width=440*progress;if(progress>=.5&&progress<.6){generatePixelAssets(this,{heroes,enemies,bosses,equipmentCatalog});label.setText('Preparing heroes, monsters and effects…');}if(progress>=.999)this.scene.start('MainMenuScene');}});
  }
}
