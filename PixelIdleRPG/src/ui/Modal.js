export class Modal {
  constructor(root){this.root=root;}
  close(){this.root.innerHTML='';}
  show({title='Notice',body='',actions=[{label:'OK',value:true,className:'gold'}],onAction=()=>{}}){
    this.root.innerHTML=`<div class="modal-backdrop"><div class="modal-card pixel-frame"><div class="modal-heading"><h3>${title}</h3><button class="pixel-btn" data-modal-close>✕</button></div><div class="modal-body">${body}</div><div class="modal-actions">${actions.map((a,i)=>`<button class="pixel-btn ${a.className||''}" data-modal-action="${i}">${a.label}</button>`).join('')}</div></div></div>`;
    this.root.querySelector('[data-modal-close]').onclick=()=>this.close();
    this.root.querySelector('.modal-backdrop').onclick=e=>{if(e.target===e.currentTarget)this.close();};
    this.root.querySelectorAll('[data-modal-action]').forEach(btn=>btn.onclick=()=>{const action=actions[Number(btn.dataset.modalAction)];onAction(action.value,action);if(action.close!==false)this.close();});
  }
  confirm({title='Confirm',body='',confirmLabel='Confirm',cancelLabel='Cancel',onConfirm=()=>{}}){this.show({title,body,actions:[{label:cancelLabel,value:false},{label:confirmLabel,value:true,className:'red'}],onAction:value=>{if(value)onConfirm();}});}
}
