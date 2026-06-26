import { bus } from '../utils/EventBus.js';
import { EVENT_NAMES } from '../config.js';
export class Toast {
  constructor(root){this.root=root;this.timer=0;bus.on(EVENT_NAMES.TOAST,message=>this.show(message));}
  show(message,duration=1800){clearTimeout(this.timer);this.root.innerHTML=`<div class="toast pixel-frame">${String(message)}</div>`;requestAnimationFrame(()=>this.root.firstElementChild?.classList.add('show'));this.timer=setTimeout(()=>{this.root.firstElementChild?.classList.remove('show');setTimeout(()=>this.root.innerHTML='',220);},duration);}
}
