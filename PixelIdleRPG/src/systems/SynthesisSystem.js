import { RARITIES } from '../config.js';
import { equipmentMap } from '../data/equipment.js';
const rarityMap=Object.fromEntries(RARITIES.map(r=>[r.id,r]));
export class SynthesisSystem{
 constructor(saveSystem,equipmentSystem){this.save=saveSystem;this.equipment=equipmentSystem;this.busy=false;}
 getSelected(){return this.save.get().synthesis.selected.map(uid=>this.equipment.get(uid)).filter(Boolean);}
 clear(){this.save.mutate(state=>{state.synthesis.selected=[];});}
 toggle(uid){if(this.busy)return false;const item=this.equipment.get(uid);if(!item||item.locked||this.equipment.isEquipped(uid))return false;this.save.mutate(state=>{const list=state.synthesis.selected;const i=list.indexOf(uid);if(i>=0)list.splice(i,1);else if(list.length<9)list.push(uid);});return true;}
 autoSelect(rarity,slot=null){const candidates=this.save.get().inventory.filter(item=>item.rarity===rarity&&!item.locked&&!this.equipment.isEquipped(item.uid)&&(slot===null||equipmentMap[item.templateId]?.slot===slot)).slice(0,9);this.save.mutate(state=>{state.synthesis.selected=candidates.map(i=>i.uid);});return candidates.length;}
 preview(){const selected=this.getSelected();if(selected.length!==9)return{ok:false,reason:'count',selected};const rarity=selected[0].rarity;if(!selected.every(item=>item.rarity===rarity))return{ok:false,reason:'rarity',selected};const current=rarityMap[rarity];if(!current?.next)return{ok:false,reason:'max',selected};return{ok:true,current,next:rarityMap[current.next],cost:current.cost,selected};}
 synthesize(){if(this.busy)return{ok:false,reason:'busy'};const preview=this.preview();if(!preview.ok)return preview;if(this.save.get().player.gold<preview.cost)return{ok:false,reason:'gold',cost:preview.cost};this.busy=true;try{const avgLevel=Math.max(1,Math.round(preview.selected.reduce((s,i)=>s+i.level,0)/9)),templateId=preview.selected[0].templateId,result=this.equipment.createDrop({rarity:preview.next.id,level:avgLevel,templateId}),ids=new Set(preview.selected.map(i=>i.uid));this.save.mutate(state=>{state.player.gold-=preview.cost;state.inventory=state.inventory.filter(item=>!ids.has(item.uid));state.inventory.push(result);state.synthesis.selected=[];});return{ok:true,result,cost:preview.cost};}finally{this.busy=false;}}
}
