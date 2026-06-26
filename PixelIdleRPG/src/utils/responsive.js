import { UI_BREAKPOINT } from '../config.js';
export const isCompact=()=>innerWidth<UI_BREAKPOINT||innerHeight<430;
export const isPortraitPhone=()=>innerWidth<700&&innerHeight>innerWidth;
export function installResponsiveHooks(callback){
 const run=()=>callback({compact:isCompact(),portrait:isPortraitPhone(),width:innerWidth,height:innerHeight});
 addEventListener('resize',run,{passive:true});
 addEventListener('orientationchange',run,{passive:true});
 run();
 return()=>{removeEventListener('resize',run);removeEventListener('orientationchange',run);};
}
