import Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.esm.js';
import { GAME_WIDTH,GAME_HEIGHT } from './config.js';
import { appState } from './appState.js';
import { AppUI } from './appUI.js';
import { PixelBattleScene } from './PixelBattleScene.js';
class SimpleAudio{
 constructor(){this.ctx=null;this.muted=false;}
 ensure(){if(this.ctx)return this.ctx;const C=window.AudioContext||window.webkitAudioContext;if(C)this.ctx=new C();return this.ctx;}
 play(name='button'){const ctx=this.ensure();if(!ctx||this.muted)return;const map={button:[520,.05,'square'],attack:[180,.08,'sawtooth'],hit:[110,.06,'square'],victory:[660,.35,'triangle'],defeat:[150,.45,'sawtooth'],chest:[440,.3,'triangle'],boss:[80,.55,'sawtooth']},[freq,duration,type]=map[name]||map.button,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.14,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration+.02);}
}
appState.load();
const ui=new AppUI(appState),audio=new SimpleAudio();
const config={type:Phaser.AUTO,parent:'game-container',width:GAME_WIDTH,height:GAME_HEIGHT,backgroundColor:'#0b111c',pixelArt:true,antialias:false,roundPixels:true,render:{pixelArt:true,antialias:false,roundPixels:true,powerPreference:'high-performance'},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:GAME_WIDTH,height:GAME_HEIGHT},input:{activePointers:3},scene:[PixelBattleScene],callbacks:{preBoot(game){game.registry.set('appState',appState);game.registry.set('appUI',ui);game.registry.set('audio',audio);}}};
const game=new Phaser.Game(config);
document.addEventListener('pointerdown',()=>audio.ensure(),{once:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){appState.save();game.loop.sleep();}else game.loop.wake();});
addEventListener('beforeunload',()=>appState.save());
setTimeout(()=>ui.showOffline(),700);
window.PixelIdleRPG={game,state:appState,ui};
