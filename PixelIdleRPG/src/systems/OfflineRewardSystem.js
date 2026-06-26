import { MAX_OFFLINE_SECONDS, OFFLINE_RATES } from '../config.js';
import { uid } from '../utils/helpers.js';
export function calculateOfflineRewards(lastSeen,now=Date.now()){
 const elapsed=Math.max(0,Math.min(MAX_OFFLINE_SECONDS,Math.floor((now-lastSeen)/1000)));const minutes=Math.floor(elapsed/60);return{seconds:elapsed,minutes,gold:minutes*OFFLINE_RATES.gold,diamond:minutes*OFFLINE_RATES.diamond,exp:minutes*OFFLINE_RATES.exp};
}
export class OfflineRewardSystem{
 constructor(saveSystem,heroSystem){this.save=saveSystem;this.heroes=heroSystem;}
 prepare(now=Date.now()){const state=this.save.get();if(state.offline.pending)return state.offline.pending;const rewards=calculateOfflineRewards(state.offline.lastSeen||now,now);if(rewards.minutes<1){this.save.mutate(s=>{s.offline.lastSeen=now;});return null;}const pending={id:uid('offline'),...rewards,createdAt:now};this.save.mutate(s=>{s.offline.pending=pending;s.offline.lastSeen=now;});return pending;}
 claim(id){const pending=this.save.get().offline.pending;if(!pending||pending.id!==id||this.save.get().offline.lastClaimId===id)return{ok:false};this.save.mutate(state=>{state.player.gold+=pending.gold;state.player.diamond+=pending.diamond;state.offline.lastClaimId=id;state.offline.pending=null;});const levelUps=this.heroes.gainTeamExp(pending.exp);return{ok:true,rewards:pending,levelUps};}
 touch(now=Date.now()){this.save.mutate(state=>{state.offline.lastSeen=now;},{save:true});}
}
