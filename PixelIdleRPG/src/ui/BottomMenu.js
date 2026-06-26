import { bus } from '../utils/EventBus.js';
import { EVENT_NAMES } from '../config.js';
export class BottomMenu {
  constructor(root,{audio}){this.root=root;this.audio=audio;this.items=[['Town','🏰','TownScene'],['Heroes','🧙','HeroScene'],['Bag','🎒','InventoryScene'],['Battle','⚔','BattleScene'],['Dungeon','🌀','TownScene'],['Guild','🛡','TownScene']];this.active='BattleScene';this.render();}
  setActive(scene){this.active=scene;this.render();}
  render(){this.root.innerHTML=`<div class="bottom-menu pixel-frame">${this.items.map(([name,icon,scene])=>`<button class="bottom-btn ${scene===this.active?'active':''}" data-scene="${scene}" data-name="${name}"><span class="nav-icon">${icon}</span><span>${name}</span></button>`).join('')}</div>`;this.root.querySelectorAll('[data-scene]').forEach(btn=>btn.onclick=()=>{this.audio.play('button');bus.emit(EVENT_NAMES.NAVIGATE,{scene:btn.dataset.scene,name:btn.dataset.name});});}
}
