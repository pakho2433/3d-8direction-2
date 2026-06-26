import { skills } from './skills.js';
import fighter from './heroDefs/fighter.js';
import mage from './heroDefs/mage.js';
import gunner from './heroDefs/gunner.js';
import healer from './heroDefs/healer.js';
import holySword from './heroDefs/holySword.js';
export const heroes=Object.freeze([fighter,mage,gunner,healer,holySword].map(hero=>({...hero,skills:skills[hero.id]})));
export const heroMap=Object.fromEntries(heroes.map(hero=>[hero.id,hero]));
