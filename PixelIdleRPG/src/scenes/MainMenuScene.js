import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
export class MainMenuScene extends Phaser.Scene {
  constructor(){super('MainMenuScene');}
  create(){
    const {width,height}=this.scale;this.cameras.main.setBackgroundColor('#101a28');
    const bg=this.add.graphics();bg.fillGradientStyle(0x376ea0,0x376ea0,0x6ba06b,0x6ba06b,1);bg.fillRect(0,0,width,height);bg.fillStyle(0x294831,1);for(let x=0;x<width;x+=80)bg.fillRect(x,360+(x%160),70,220);bg.fillStyle(0x71553a,1);bg.fillRect(0,550,width,170);
    this.add.text(width/2,160,'PIXEL IDLE RPG',{fontFamily:'monospace',fontSize:'58px',fontStyle:'bold',color:'#f8d36a',stroke:'#24180a',strokeThickness:10}).setOrigin(.5);
    this.add.text(width/2,235,'AUTO BATTLE · HERO GROWTH · EQUIPMENT SYNTHESIS',{fontFamily:'monospace',fontSize:'17px',color:'#ffffff',stroke:'#000',strokeThickness:4}).setOrigin(.5);
    const fighter=this.add.image(width/2-115,475,'hero-fighter-idle-0').setScale(3.4),mage=this.add.image(width/2+30,475,'hero-mage-idle-1').setScale(3.4),healer=this.add.image(width/2+165,475,'hero-healer-idle-0').setScale(3.4);
    this.tweens.add({targets:[fighter,mage,healer],y:'-=8',duration:850,yoyo:true,repeat:-1,ease:'Sine.easeInOut',stagger:120});
    const start=this.add.text(width/2,625,'▶ START ADVENTURE',{fontFamily:'monospace',fontSize:'25px',fontStyle:'bold',color:'#3b2605',backgroundColor:'#f1bf54',padding:{left:24,right:24,top:13,bottom:13}}).setOrigin(.5).setInteractive({useHandCursor:true});
    start.on('pointerdown',()=>{this.registry.get('audio').play('button');this.registry.get('audio').startMusic('battle');this.registry.get('ui').showShell(true);this.scene.start('BattleScene');});
    this.registry.get('ui').showShell(false);
  }
}
