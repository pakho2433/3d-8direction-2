export class SideMenu{
 constructor(root,{modal,audio}){this.root=root;this.modal=modal;this.audio=audio;this.items=[['Shop','▣',false],['Events','🎁',true],['Pass','♛',true],['Quests','▤',true],['Mail','✉',false],['Rank','🏆',false]];this.render();}
 render(){
  this.root.innerHTML='<div class="side-menu pixel-frame">'+this.items.map(([name,icon,notice])=>'<button class="side-btn" data-side="'+name+'"><span class="side-icon">'+icon+'</span><span>'+name+'</span>'+(notice?'<span class="notif">!</span>':'')+'</button>').join('')+'</div>';
  this.root.querySelectorAll('[data-side]').forEach(btn=>btn.onclick=()=>{this.audio.play('button');const name=btn.dataset.side;const text={Shop:'Offline shop uses game currency.',Events:'Boss Rush event is active.',Pass:'Complete stages to earn pass progress.',Quests:'Win battles, synthesize equipment and defeat a Boss.',Mail:'No mail available.',Rank:'Best chapter is saved on this device.'}[name];this.modal.show({title:name,body:'<p>'+text+'</p>'});});
 }
}
