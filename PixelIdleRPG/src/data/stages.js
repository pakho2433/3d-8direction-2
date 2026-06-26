import { enemies, bosses } from './enemies.js';
const formations=[['goblin','wolf'],['goblin','goblinArcher'],['wolf','wolf','goblin'],['skeleton','goblinWarrior'],['goblinArcher','armoredWolf'],['skeleton','darkMage'],['goblinWarrior','goblinArcher','wolf'],['skeletonKnight','skeleton'],['darkMage','armoredWolf','skeleton']];
export function getStageDefinition(chapter,stage){
 const c=Math.max(1,Math.floor(chapter));const s=Math.max(1,Math.min(10,Math.floor(stage)));const globalIndex=(c-1)*10+s;const hpScale=Math.pow(1.12,globalIndex-1);const attackScale=Math.pow(1.08,globalIndex-1);
 if(s===10){const boss=bosses[(c-1)%bosses.length];return{chapter:c,stage:s,boss:true,background:(c-1)%3,enemies:[{id:boss.id,hpScale,attackScale}],title:`Chapter ${c} - Boss`};}
 const ids=formations[(globalIndex-1)%formations.length];return{chapter:c,stage:s,boss:false,background:(c-1)%3,enemies:ids.map((id,index)=>({id,hpScale:hpScale*(1+index*.05),attackScale:attackScale*(1+index*.03)})),title:`Chapter ${c} - Stage ${s}/10`};
}
export function getStageNodes(chapter,currentStage,maxStage){return Array.from({length:10},(_,i)=>({stage:i+1,boss:i===9,current:i+1===currentStage,unlocked:i+1<=maxStage||chapter<1}));}
