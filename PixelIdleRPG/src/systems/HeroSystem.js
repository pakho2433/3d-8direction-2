import { heroMap,heroes } from '../data/heroes.js';
import { MAX_PARTY_SIZE } from '../config.js';
export const expToNext=level=>Math.floor(70*Math.pow(level,1.32));
export class HeroSystem{
 constructor(saveSystem){this.save=saveSystem;}
 getState(id){return this.save.get().heroes[id];}
 getStats(id){const def=heroMap[id],state=this.getState(id);if(!def||!state)return null;const growth=1+(state.level-1)*.105;const stats={...def.base,hp:Math.round(def.base.hp*growth),mp:Math.round(def.base.mp*(1+(state.level-1)*.025)),attack:Math.round(def.base.attack*growth),defense:Math.round(def.base.defense*growth)};for(const itemId of Object.values(state.equipment)){const item=this.save.get().inventory.find(x=>x.uid===itemId);if(!item)continue;stats.attack+=item.attack||0;stats.defense+=item.defense||0;stats.hp+=item.hp||0;stats.critRate+=item.critRate||0;stats.critDamage+=item.critDamage||0;stats.attackSpeed+=item.attackSpeed||0;}return stats;}
 power(id){const s=this.getStats(id);return s?Math.round(s.hp*.2+s.attack*3+s.defense*2+s.critRate*100+s.attackSpeed*40):0;}
 teamPower(){return this.save.get().party.reduce((sum,id)=>sum+this.power(id),0);}
 gainExp(id,amount){let levels=0;this.save.mutate(state=>{const hero=state.heroes[id];if(!hero)return;hero.exp+=Math.max(0,Math.floor(amount));while(hero.exp>=expToNext(hero.level)){hero.exp-=expToNext(hero.level);hero.level++;levels++;}});return levels;}
 gainTeamExp(amount){return this.save.get().party.map(id=>({id,levels:this.gainExp(id,amount)}));}
 unlockByChapter(chapter){const unlocked=[];this.save.mutate(state=>{for(const def of heroes){if(!state.heroes[def.id].unlocked&&chapter>=def.unlockChapter){state.heroes[def.id].unlocked=true;unlocked.push(def.id);}}});return unlocked;}
 setParty(ids){const valid=[...new Set(ids)].filter(id=>this.save.get().heroes[id]?.unlocked).slice(0,MAX_PARTY_SIZE);if(!valid.length)return false;this.save.mutate(state=>{state.party=valid;});return true;}
 toggleParty(id){const state=this.save.get();if(!state.heroes[id]?.unlocked)return{ok:false,reason:'locked'};const party=[...state.party],index=party.indexOf(id);if(index>=0){if(party.length===1)return{ok:false,reason:'minimum'};party.splice(index,1);}else{if(party.length>=MAX_PARTY_SIZE)return{ok:false,reason:'maximum'};party.push(id);}this.setParty(party);return{ok:true,party};}
}
