import { equipmentCatalog,equipmentMap } from '../data/equipment.js';
import { RARITIES } from '../config.js';
import { choice,randomFloat,uid } from '../utils/helpers.js';
const rarityMap=Object.fromEntries(RARITIES.map(r=>[r.id,r]));
export class EquipmentSystem{
 constructor(saveSystem){this.save=saveSystem;}
 createDrop({rarity='common',level=1,templateId=null}={}){const template=templateId?equipmentMap[templateId]:choice(equipmentCatalog),r=rarityMap[rarity]||RARITIES[0],value=Math.max(1,Math.round((template.basePower+level*2.2)*r.multiplier*randomFloat(.88,1.14)));const item={uid:uid('eq'),templateId:template.id,rarity:r.id,level,quantity:1,locked:false,attack:0,defense:0,hp:0,critRate:0,critDamage:0,attackSpeed:0};if(template.mainStat==='attack')item.attack=value;if(template.mainStat==='defense')item.defense=value;if(template.mainStat==='hp')item.hp=value*7;if(template.mainStat==='critRate')item.critRate=value/1000;if(template.mainStat==='critDamage')item.critDamage=value/300;if(template.mainStat==='attackSpeed')item.attackSpeed=value/1200;return item;}
 add(item){this.save.mutate(state=>state.inventory.push(item));return item;}
 remove(uid){let removed=null;this.save.mutate(state=>{const i=state.inventory.findIndex(x=>x.uid===uid);if(i>=0)removed=state.inventory.splice(i,1)[0];});return removed;}
 get(uid){return this.save.get().inventory.find(i=>i.uid===uid)||null;}
 equip(heroId,uid){const item=this.get(uid),template=item&&equipmentMap[item.templateId],hero=this.save.get().heroes[heroId];if(!item||!template||!hero||!hero.unlocked)return{ok:false,reason:'invalid'};if(template.allowedHeroes&&!template.allowedHeroes.includes(heroId))return{ok:false,reason:'class'};this.save.mutate(state=>{for(const h of Object.values(state.heroes))for(const [slot,id] of Object.entries(h.equipment))if(id===uid)h.equipment[slot]=null;state.heroes[heroId].equipment[template.slot]=uid;});return{ok:true};}
 unequip(heroId,slot){this.save.mutate(state=>{if(state.heroes[heroId])state.heroes[heroId].equipment[slot]=null;});}
 toggleLock(uid){let value=false;this.save.mutate(state=>{const item=state.inventory.find(x=>x.uid===uid);if(item){item.locked=!item.locked;value=item.locked;}});return value;}
 sell(uid){const item=this.get(uid);if(!item||item.locked||this.isEquipped(uid))return{ok:false};const rarity=rarityMap[item.rarity],gold=Math.round((item.level*12+20)*rarity.multiplier);this.save.mutate(state=>{state.inventory=state.inventory.filter(x=>x.uid!==uid);state.player.gold+=gold;});return{ok:true,gold};}
 isEquipped(uid){return Object.values(this.save.get().heroes).some(hero=>Object.values(hero.equipment).includes(uid));}
 sortAndFilter({rarity='all',slot='all',sort='rarity'}={}){const order=Object.fromEntries(RARITIES.map((r,i)=>[r.id,i]));let items=this.save.get().inventory.filter(item=>(rarity==='all'||item.rarity===rarity)&&(slot==='all'||equipmentMap[item.templateId]?.slot===slot));items=[...items];if(sort==='rarity')items.sort((a,b)=>order[b.rarity]-order[a.rarity]||b.level-a.level);if(sort==='level')items.sort((a,b)=>b.level-a.level);if(sort==='name')items.sort((a,b)=>equipmentMap[a.templateId].name.localeCompare(equipmentMap[b.templateId].name));return items;}
}
