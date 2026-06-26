(() => {
'use strict';
const D = [
  {name:'北方',dx:0,dz:-1,angle:0}, {name:'東北方',dx:1,dz:-1,angle:-Math.PI/4},
  {name:'東方',dx:1,dz:0,angle:-Math.PI/2}, {name:'東南方',dx:1,dz:1,angle:-3*Math.PI/4},
  {name:'南方',dx:0,dz:1,angle:Math.PI}, {name:'西南方',dx:-1,dz:1,angle:3*Math.PI/4},
  {name:'西方',dx:-1,dz:0,angle:Math.PI/2}, {name:'西北方',dx:-1,dz:-1,angle:Math.PI/4}
];
const levels = [
 {size:4,target:'學校',icon:'🏫',people:'👦📖👧',weather:'🌤️ 晴朗城市',sky:0xbfeeff,ground:0x79d86f,route:[2,2,0,2,0],reveal:2,start:[0,3],theme:'school'},
 {size:5,target:'公園',icon:'🌳',people:'👦⚽👧',weather:'🌦️ 微雨公園',sky:0xaed8eb,ground:0x62c878,route:[1,2,1,2,0],reveal:2,start:[0,4],theme:'park'},
 {size:6,target:'圖書館',icon:'📚',people:'👧📚👦',weather:'🍂 秋日街道',sky:0xf3cf9b,ground:0x87c96b,route:[1,2,1,2,1,0],reveal:2,start:[0,5],theme:'library'},
 {size:7,target:'超級市場',icon:'🛒',people:'👦🛒👩',weather:'🌧️ 雨中城市',sky:0x8fb5c8,ground:0x5ebd70,route:[2,1,0,2,1,2,0],reveal:1,start:[0,6],theme:'market'},
 {size:7,target:'巴士站',icon:'🚌',people:'👧🚌👦',weather:'❄️ 飄雪小鎮',sky:0xdcecff,ground:0xd8eef1,route:[1,1,2,0,2,1,0],reveal:1,start:[0,6],theme:'bus'},
 {size:8,target:'屋企',icon:'🏠',people:'👨‍👩‍👧‍👦',weather:'🌲 森林黃昏',sky:0xf0a876,ground:0x4f9f63,route:[2,1,2,0,1,2,0,1],reveal:1,start:[0,7],theme:'home'},
 {size:8,target:'博物館',icon:'🏛️',people:'👦🖼️👧',weather:'🌙 星光夜城',sky:0x253957,ground:0x48765f,route:[1,2,1,0,2,1,2,0],reveal:0,start:[0,7],theme:'museum'},
 {size:8,target:'麵包店',icon:'🥐',people:'👩‍🍳🥖👦',weather:'🎉 節日街區',sky:0xd7b2f4,ground:0x6fca72,route:[2,1,2,1,0,2,1,0],reveal:0,start:[0,7],theme:'bakery'}
];

let renderer,scene,camera,boardGroup,player,weatherGroup,clock,northGuide,goalMarker;
let levelIndex=0,score=0,selected=[],avatar='boy',travelling=false,lastTravelSucceeded=false;
let tileSize=2.25,level,orientation=0,boardRotation=0;
let planningZoom=1,pinchStartDistance=0,pinchStartZoom=1;
let orbitYaw=.72,orbitPitch=.72,draggingView=false,lastDragX=0,lastDragY=0;
let travelLookYaw=0,travelLookPitch=0,travelViewMode='first';
const Y_AXIS=new THREE.Vector3(0,1,0);
const $=id=>document.getElementById(id);

function initThree(){
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 $('scene').appendChild(renderer.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color(0xbfeeff);scene.fog=new THREE.Fog(0xbfeeff,24,65);
 camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.08,150);
 clock=new THREE.Clock();
 const hemi=new THREE.HemisphereLight(0xffffff,0x496b52,2.2);scene.add(hemi);
 const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(-14,22,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-25;sun.shadow.camera.right=25;sun.shadow.camera.top=25;sun.shadow.camera.bottom=-25;scene.add(sun);
 window.addEventListener('resize',onResize,{passive:true});
 renderer.setAnimationLoop(render);
 setupMapZoom();
}
function onResize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);if(!travelling)setPlanningCamera();}
function clearScene(){
 if(boardGroup){scene.remove(boardGroup);boardGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose&&m.dispose()})}})}
 if(weatherGroup)scene.remove(weatherGroup);boardGroup=new THREE.Group();scene.add(boardGroup);northGuide=null;goalMarker=null;
}
function mat(color,rough=.8,metal=.05){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function box(w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.castShadow=true;m.receiveShadow=true;return m;}
function cyl(r1,r2,h,color,segments=16){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat(color));m.castShadow=true;m.receiveShadow=true;return m;}
function worldPos(x,z,y=0){const half=(level.size-1)*tileSize/2;const v=new THREE.Vector3(x*tileSize-half,y,z*tileSize-half);v.applyAxisAngle(Y_AXIS,boardRotation);return v;}
function addTree(x,z,scale=1){const g=new THREE.Group();const trunk=cyl(.18,.24,1.3,0x7d4b2b);trunk.position.y=.65;const crown=cyl(.85,1.15,2.2,0x2fa85c,12);crown.position.y=2.05;g.add(trunk,crown);g.position.copy(worldPos(x,z,0));g.scale.setScalar(scale);boardGroup.add(g);}
function addLocalTree(group,x,z,scale=.5){const tree=new THREE.Group();const trunk=cyl(.15,.2,1.15,0x7d4b2b);trunk.position.y=.58;const crown=cyl(.65,.9,1.65,0x2fa85c,12);crown.position.y=1.62;tree.add(trunk,crown);tree.position.set(x,0,z);tree.scale.setScalar(scale);group.add(tree);}
function addLamp(x,z){const g=new THREE.Group();const p=cyl(.06,.08,2.1,0x425563);p.position.y=1.05;const light=box(.35,.3,.35,0xfff0ad);light.position.y=2.15;g.add(p,light);g.position.copy(worldPos(x,z,0));boardGroup.add(g);}
function addBench(x,z){const g=new THREE.Group();const seat=box(1.1,.16,.38,0xa96c39);seat.position.y=.48;const back=box(1.1,.5,.12,0x9b5c2f);back.position.set(0,.79,.13);g.add(seat,back);g.position.copy(worldPos(x,z,0));boardGroup.add(g);}
function addHouse(x,z,color=0xf5b16b){const g=new THREE.Group();const body=box(1.4,1.3,1.2,color);body.position.y=.65;const roof=new THREE.Mesh(new THREE.ConeGeometry(1.1,.8,4),mat(0xc94d4d));roof.position.y=1.7;roof.rotation.y=Math.PI/4;roof.castShadow=true;const door=box(.32,.68,.05,0x734426);door.position.set(0,.38,.625);g.add(body,roof,door);g.position.copy(worldPos(x,z,0));boardGroup.add(g);}
function addCloud(x,y,z,s=1){const g=new THREE.Group();for(const [dx,dy,sc] of [[0,0,1],[-.8,-.1,.72],[.8,-.12,.78],[.2,.35,.7]]){const q=new THREE.Mesh(new THREE.SphereGeometry(.75*sc,12,10),mat(0xffffff));q.position.set(dx,dy,0);g.add(q)}g.position.set(x,y,z);g.scale.setScalar(s);scene.add(g);return g;}
function addLandmark(x,z,theme){
 const g=new THREE.Group();
 if(theme==='school'){const b=box(2.0,1.55,1.6,0xffcf68);b.position.y=.78;const roof=box(2.2,.28,1.8,0xe85b4d);roof.position.y=1.69;const door=box(.45,.85,.06,0x37769b);door.position.set(0,.43,.83);const clockFace=cyl(.26,.26,.08,0xffffff,24);clockFace.rotation.x=Math.PI/2;clockFace.position.set(0,1.18,.86);g.add(b,roof,door,clockFace)}
 else if(theme==='park'){
   const left=cyl(.11,.13,2.05,0x3f7b4c);left.position.set(-.78,1.02,0);
   const right=left.clone();right.position.x=.78;
   const top=box(1.85,.26,.28,0xf1b847);top.position.set(0,1.95,0);
   const sign=makeLabelSprite('公園','#effff1','#2b9b50','#176c35');sign.position.set(0,2.63,0);sign.scale.set(2.75,1.02,1);
   const gateLight=new THREE.PointLight(0x72ff91,2.6,5);gateLight.position.set(0,1.4,0);
   g.add(left,right,top,sign,gateLight);addLocalTree(g,-1.08,.2,.55);addLocalTree(g,1.08,.2,.55);
   const seat=box(.95,.13,.28,0xa96c39);seat.position.set(0,.38,.68);g.add(seat);
 }
 else if(theme==='library'){const b=box(2.1,1.7,1.5,0x9a8bd9);b.position.y=.85;for(let i=-1;i<=1;i++){const c=cyl(.12,.12,1.3,0xffffff);c.position.set(i*.55,.65,.82);g.add(c)}const sign=box(1.5,.35,.08,0xffffff);sign.position.set(0,1.28,.82);g.add(b,sign)}
 else if(theme==='market'){const b=box(2.2,1.45,1.6,0x62b8d8);b.position.y=.72;const awn=box(2.3,.3,.42,0xff6d6d);awn.position.set(0,1.38,.86);g.add(b,awn)}
 else if(theme==='bus'){const post=cyl(.08,.08,2,0x245b89);post.position.y=1;const sign=cyl(.44,.44,.12,0x56aee3,24);sign.rotation.x=Math.PI/2;sign.position.set(0,1.7,.02);const roof=box(2.1,.16,1.0,0x6f8999);roof.position.y=1.8;g.add(post,sign,roof)}
 else if(theme==='home'){addHouse(x,z,0xffc778);return;}
 else if(theme==='museum'){const b=box(2.3,.6,1.5,0xe9e2d0);b.position.y=.3;for(let i=-1;i<=1;i++){const c=cyl(.13,.13,1.3,0xf7f3e8);c.position.set(i*.6,1.15,.6);g.add(c)}const roof=new THREE.Mesh(new THREE.ConeGeometry(1.7,.7,4),mat(0xc9b88d));roof.position.set(0,2,.05);roof.rotation.y=Math.PI/4;g.add(b,roof)}
 else {const b=box(2.0,1.4,1.5,0xf3a8b7);b.position.y=.7;const awn=box(2.15,.3,.42,0xffdf83);awn.position.set(0,1.32,.82);g.add(b,awn)}
 g.position.copy(worldPos(x,z,0));boardGroup.add(g);
}
function addPersonMesh(color=0x2f78b7){const g=new THREE.Group();const body=cyl(.28,.36,.9,color);body.position.y=.9;const head=new THREE.Mesh(new THREE.SphereGeometry(.25,16,12),mat(0xf2b486));head.position.y=1.55;const hair=new THREE.Mesh(new THREE.SphereGeometry(.265,16,8,0,Math.PI*2,0,Math.PI/2),mat(0x242d39));hair.position.y=1.61;g.add(body,head,hair);return g;}
function makeLabelSprite(text,bg='rgba(255,255,255,.96)',border='#ff3b30',color='#c9211e'){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;const ctx=canvas.getContext('2d');
 ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(12,12,488,168,42);ctx.fill();
 ctx.lineWidth=14;ctx.strokeStyle=border;ctx.stroke();ctx.fillStyle=color;ctx.font='900 92px "Noto Sans TC",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,98);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.scale.set(2.5,.94,1);sprite.renderOrder=20;return sprite;
}
function makeTextSprite(text){return makeLabelSprite(text);}
function createNorthGuide(){
 const start=worldPos(level.start[0],level.start[1],.25);const north=worldPos(level.start[0],level.start[1]-1,.25);
 const dir=north.clone().sub(start).setY(0).normalize();const origin=start.clone().add(dir.clone().multiplyScalar(.62));
 northGuide=new THREE.Group();northGuide.position.copy(origin);northGuide.userData.enabled=true;
 const arrow=new THREE.ArrowHelper(dir,new THREE.Vector3(0,0,0),1.6,0xff3028,.62,.4);arrow.line.material.linewidth=5;northGuide.add(arrow);
 const glow=new THREE.PointLight(0xff3b30,2.8,4.5);glow.position.set(0,.5,0);northGuide.add(glow);
 const label=makeTextSprite('北方');label.position.copy(dir).multiplyScalar(.8);label.position.y=1.35;northGuide.add(label);
 boardGroup.add(northGuide);player.rotation.y=Math.atan2(dir.x,dir.z);
}
function createGoalMarker(x,z){
 goalMarker=new THREE.Group();goalMarker.position.copy(worldPos(x,z,.1));
 const ringMat=new THREE.MeshStandardMaterial({color:0x35d66f,emissive:0x1d8f48,emissiveIntensity:1.1,transparent:true,opacity:.72,roughness:.4});
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.79,.13,16,44),ringMat);ring.rotation.x=Math.PI/2;
 const beacon=new THREE.PointLight(0x55ff88,2.8,5);beacon.position.y=1.4;
 const label=makeLabelSprite(`終點：${level.target}`,'rgba(239,255,243,.97)','#2aa85b','#176c35');label.position.y=3.25;label.scale.set(3.15,1.05,1);
 goalMarker.add(ring,beacon,label);boardGroup.add(goalMarker);
}
function routeCells(l,directions=l.route){let x=l.start[0],z=l.start[1],a=[[x,z]];for(const idx of directions){x+=D[idx].dx;z+=D[idx].dz;a.push([x,z])}return a;}
function getTargetCell(){const cells=routeCells(level);return cells[cells.length-1];}
function getFullAnswer(){return [...level.route.slice(0,level.reveal),...selected];}
function maxRouteSteps(){return Math.max(level.route.length+10,level.size*3);}
function routeStatus(directions){
 const cells=routeCells(level,directions);let outOfBounds=false;
 for(const [x,z] of cells){if(x<0||z<0||x>=level.size||z>=level.size){outOfBounds=true;break;}}
 const end=cells[cells.length-1],target=getTargetCell();
 return {cells,end,target,outOfBounds,atTarget:!outOfBounds&&end[0]===target[0]&&end[1]===target[1]};
}
function buildLevel(){
 level=levels[levelIndex];selected=[];travelling=false;lastTravelSucceeded=false;planningZoom=1;orbitYaw=.72;orbitPitch=.72;travelLookYaw=0;travelLookPitch=0;travelViewMode='first';orientation=levelIndex%4;boardRotation=orientation*Math.PI/2;
 clearScene();scene.background=new THREE.Color(level.sky);scene.fog.color.setHex(level.sky);
 $('levelPill').textContent=`第 ${levelIndex+1} 關`;$('sizePill').textContent=`${level.size} × ${level.size}`;$('scorePill').textContent=`分數 ${score}`;$('targetName').textContent=level.target;$('weather').textContent=level.weather;
 $('needle').style.transform=`translate(-50%,-50%) rotate(${orientation*90}deg)`;
 const base=box(level.size*tileSize+1,.5,level.size*tileSize+1,level.ground);base.position.y=-.32;base.receiveShadow=true;boardGroup.add(base);
 for(let z=0;z<level.size;z++)for(let x=0;x<level.size;x++){const tile=box(tileSize*.88,.12,tileSize*.88,(x+z)%2?0xfff3b8:0xfff7cf);tile.position.copy(worldPos(x,z,.02));tile.receiveShadow=true;boardGroup.add(tile)}
 const pathCells=routeCells(level);const end=pathCells[pathCells.length-1];addLandmark(end[0],end[1],level.theme);createGoalMarker(end[0],end[1]);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.13,14,36),mat(0x35c987));ring.rotation.x=Math.PI/2;ring.position.copy(worldPos(level.start[0],level.start[1],.12));boardGroup.add(ring);
 player=addPersonMesh(avatar==='girl'?0xe56ba0:0x2f78b7);player.position.copy(worldPos(level.start[0],level.start[1],.1));player.scale.setScalar(.75);boardGroup.add(player);createNorthGuide();
 for(let i=0;i<level.size;i+=2){addTree(i-.25,-.8,.62);if(i%4===0)addLamp(i+.35,level.size-.15)}
 if(level.size>4){addBench(level.size-.35,Math.max(1,level.size-3));addHouse(-.75,1.1,0xf2a66d)}
 createWeather();setPlanningCamera();renderPlanner();setTravelView('first');
 $('planner').classList.remove('hidden');$('travelHud').classList.remove('show');$('travelViewControls').classList.add('hidden');$('viewBadge').classList.remove('show');$('zoomPanel').classList.remove('hidden');$('pinchTip').classList.remove('hidden');updateZoomLabel();
}
function clampZoom(v){return Math.max(.48,Math.min(2.35,v));}
function updateZoomLabel(){if($('zoomPercent'))$('zoomPercent').textContent=`${Math.round(100/planningZoom)}%`;}
function setPlanningCamera(){
 if(!level||travelling)return;
 const span=level.size*tileSize,radius=span*1.48*planningZoom,flat=Math.cos(orbitPitch)*radius;
 camera.position.set(Math.sin(orbitYaw)*flat,Math.sin(orbitPitch)*radius,Math.cos(orbitYaw)*flat);
 camera.lookAt(0,0,0);camera.fov=innerWidth<650?52:45;camera.updateProjectionMatrix();if(player)player.visible=true;updateZoomLabel();
}
function setMapZoom(value){if(!level||travelling)return;planningZoom=clampZoom(value);setPlanningCamera();}
function adjustView(dx,dy){
 if(!level)return;
 if(travelling&&travelViewMode==='first'){travelLookYaw=Math.max(-1.3,Math.min(1.3,travelLookYaw-dx*.006));travelLookPitch=Math.max(-.72,Math.min(.72,travelLookPitch-dy*.005));return;}
 if(travelling)return;
 orbitYaw-=dx*.007;orbitPitch=Math.max(.25,Math.min(1.28,orbitPitch+dy*.006));setPlanningCamera();
}
function setupMapZoom(){
 const canvas=renderer.domElement;
 $('mapZoomIn').onclick=()=>setMapZoom(planningZoom*.82);$('mapZoomOut').onclick=()=>setMapZoom(planningZoom*1.22);$('mapZoomReset').onclick=()=>{planningZoom=1;orbitYaw=.72;orbitPitch=.72;setPlanningCamera()};
 canvas.addEventListener('wheel',e=>{if(!level||travelling)return;e.preventDefault();setMapZoom(planningZoom*Math.exp(e.deltaY*.0015))},{passive:false});
 canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||!level)return;draggingView=true;lastDragX=e.clientX;lastDragY=e.clientY;canvas.setPointerCapture?.(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!draggingView||e.pointerType==='touch')return;const dx=e.clientX-lastDragX,dy=e.clientY-lastDragY;lastDragX=e.clientX;lastDragY=e.clientY;adjustView(dx,dy)});
 canvas.addEventListener('pointerup',()=>{draggingView=false});canvas.addEventListener('pointercancel',()=>{draggingView=false});
 canvas.addEventListener('touchstart',e=>{if(!level)return;if(e.touches.length===2&&!travelling){const a=e.touches[0],b=e.touches[1];pinchStartDistance=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);pinchStartZoom=planningZoom;draggingView=false}else if(e.touches.length===1){draggingView=true;lastDragX=e.touches[0].clientX;lastDragY=e.touches[0].clientY}},{passive:true});
 canvas.addEventListener('touchmove',e=>{if(!level)return;if(e.touches.length===2&&!travelling&&pinchStartDistance){e.preventDefault();const a=e.touches[0],b=e.touches[1],distance=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);setMapZoom(pinchStartZoom*(pinchStartDistance/Math.max(20,distance)));return}if(e.touches.length===1&&draggingView){e.preventDefault();const t=e.touches[0],dx=t.clientX-lastDragX,dy=t.clientY-lastDragY;lastDragX=t.clientX;lastDragY=t.clientY;adjustView(dx,dy)}},{passive:false});
 canvas.addEventListener('touchend',e=>{pinchStartDistance=0;if(!e.touches.length)draggingView=false},{passive:true});canvas.addEventListener('touchcancel',()=>{pinchStartDistance=0;draggingView=false},{passive:true});
}
function createWeather(){weatherGroup=new THREE.Group();scene.add(weatherGroup);const count=levelIndex===3?260:levelIndex===4?190:levelIndex===6?120:45;const geom=new THREE.BufferGeometry();const arr=[];for(let i=0;i<count;i++)arr.push((Math.random()-.5)*35,Math.random()*18+2,(Math.random()-.5)*35);geom.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));const snow=levelIndex===4||levelIndex===6;const material=new THREE.PointsMaterial({color:snow?0xffffff:0xcbefff,size:snow?.16:.08,transparent:true,opacity:snow?.9:.55});const pts=new THREE.Points(geom,material);pts.userData.weather=snow?'snow':'rain';weatherGroup.add(pts);if(levelIndex<3||levelIndex===5){addCloud(-6,12,-8,1.5);addCloud(7,14,-12,1.1)}}
function renderPlanner(){
 const slots=$('routeSlots');slots.innerHTML='';const full=getFullAnswer(),status=routeStatus(full);
 full.forEach((d,i)=>{if(i){const c=document.createElement('span');c.className='connector';c.textContent='›';slots.appendChild(c)}const b=document.createElement('button');const isFixed=i<level.reveal,isFinish=status.atTarget&&i===full.length-1;b.className='slot '+(isFixed?'fixed':isFinish?'finish':'answer');b.textContent=D[d].name;if(!isFixed)b.onclick=()=>removeFrom(i-level.reveal);slots.appendChild(b)});
 if(full.length<maxRouteSteps()){if(full.length){const c=document.createElement('span');c.className='connector';c.textContent='›';slots.appendChild(c)}const empty=document.createElement('button');empty.className='slot empty';empty.textContent='＋ 選方向';empty.disabled=true;slots.appendChild(empty)}
 if(!selected.length)$('fillCount').textContent='請選擇至少一個方向';
 else if(status.atTarget)$('fillCount').textContent=`✅ 路線會到達${level.target}`;
 else $('fillCount').textContent=`⚠️ 尚未到達${level.target}，仍可出發測試`;
 $('confirmBtn').disabled=!selected.length||travelling;$('undoBtn').disabled=!selected.length;$('clearBtn').disabled=!selected.length;
 requestAnimationFrame(()=>{slots.scrollLeft=slots.scrollWidth});
}
function makeDirectionButtons(){const el=$('directionButtons');D.forEach((d,i)=>{const b=document.createElement('button');b.className='dirBtn';b.textContent=d.name;b.onclick=()=>choose(i);el.appendChild(b)});}
function choose(i){
 if(travelling)return;const full=getFullAnswer();if(full.length>=maxRouteSteps()){showToast('路線太長，請先退一步');return;}
 const test=[...full,i],status=routeStatus(test);if(status.outOfBounds){showToast('呢一步會走出地圖，請選其他方向');return;}
 selected.push(i);renderPlanner();if(status.atTarget)showToast(`呢條路線會到達${level.target}！`);
}
function removeFrom(i){if(travelling)return;selected.splice(i,1);renderPlanner();}
function clearAnswers(){selected=[];renderPlanner();}
function confirmRoute(){
 if(travelling||!selected.length)return;const answer=getFullAnswer();startTravel(answer);
}
function setTravelView(mode){
 travelViewMode=mode;
 document.querySelectorAll('.viewModeBtn').forEach(b=>b.classList.toggle('active',b.dataset.view===mode));
 if(player)player.visible=travelling&&mode==='side';
 $('viewBadge').textContent=mode==='side'?'🎥 側面視角':'👀 第一身視角';
}
function prepareTravel(){
 travelling=true;travelLookYaw=0;travelLookPitch=0;if(northGuide)northGuide.userData.enabled=false;
 $('planner').classList.add('hidden');$('zoomPanel').classList.add('hidden');$('pinchTip').classList.add('hidden');$('travelHud').classList.add('show');$('travelViewControls').classList.remove('hidden');$('viewBadge').classList.add('show');
 camera.fov=68;camera.updateProjectionMatrix();$('progressFill').style.width='0';setTravelView('first');
}
async function startTravel(answer){
 prepareTravel();const cells=routeCells(level,answer);
 for(let i=0;i<answer.length;i++){
   const from=worldPos(cells[i][0],cells[i][1],1.25),to=worldPos(cells[i+1][0],cells[i+1][1],1.25);
   $('travelText').textContent=`向${D[answer[i]].name}前進`;$('travelStep').textContent=`${i+1} / ${answer.length}`;$('progressFill').style.width=`${(i/answer.length)*100}%`;
   await walkSegment(from,to);
 }
 $('progressFill').style.width='100%';await wait(350);showResult(answer,routeStatus(answer));
}
function walkSegment(from,to){
 return new Promise(resolve=>{
   const duration=1150,begin=performance.now(),forward=to.clone().sub(from).setY(0).normalize();
   function frame(now){
     const p=Math.min(1,(now-begin)/duration),smooth=p*p*(3-2*p),travelPos=new THREE.Vector3().lerpVectors(from,to,smooth);
     const feet=travelPos.clone();feet.y=.1;player.position.copy(feet);player.rotation.y=Math.atan2(forward.x,forward.z);
     if(travelViewMode==='side'){
       player.visible=true;
       const side=new THREE.Vector3(-forward.z,0,forward.x).normalize();
       camera.position.copy(travelPos).add(side.multiplyScalar(3.45));camera.position.y+=1.45;
       camera.lookAt(feet.x,feet.y+1.05,feet.z);
     }else{
       player.visible=false;
       camera.position.copy(travelPos);camera.position.y+=Math.sin(p*Math.PI*6)*.045;
       const dir=forward.clone().applyAxisAngle(Y_AXIS,travelLookYaw);dir.y+=Math.sin(travelLookPitch);dir.normalize();
       camera.lookAt(camera.position.clone().add(dir.multiplyScalar(4)));
     }
     if(p<1)requestAnimationFrame(frame);else resolve();
   }
   requestAnimationFrame(frame);
 });
}
function showResult(answer,status){
 travelling=false;lastTravelSucceeded=status.atTarget;
 $('travelHud').classList.remove('show');$('travelViewControls').classList.add('hidden');$('viewBadge').classList.remove('show');player.visible=true;
 if(status.atTarget){
   score+=100;$('scorePill').textContent=`分數 ${score}`;
   $('resultIcon').textContent=level.icon;$('arrivalBuilding').textContent=level.icon;$('resultTitle').textContent=`成功到達${level.target}！`;
   $('resultText').textContent=`你用自己設計的 ${answer.length} 步路線成功到達終點。其他可行路線同樣會答啱。`;
   $('nextBtn').textContent=levelIndex===levels.length-1?'重新挑戰':'下一關';
 }else{
   $('resultIcon').textContent='🧭❌';$('arrivalBuilding').textContent='❓';$('resultTitle').textContent=`未能到達${level.target}`;
   $('resultText').textContent=`角色已按照你選擇的 ${answer.length} 步走完，但最後沒有停在${level.target}。請重新規劃另一條路線。`;
   $('nextBtn').textContent='重新規劃';
 }
 $('result').classList.add('open');
}
function handleResultAction(){
 const succeeded=lastTravelSucceeded;
 $('result').classList.remove('open');
 if(succeeded){levelIndex++;if(levelIndex>=levels.length){levelIndex=0;score=0}}
 buildLevel();
 if(!succeeded)showToast('請重新規劃前往終點的路線');
}
function showToast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1500);}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}
function render(){
 const dt=Math.min(clock.getDelta(),.04);
 if(northGuide){const blink=Math.floor(performance.now()/430)%2===0;northGuide.visible=!!northGuide.userData.enabled&&blink;}
 if(goalMarker){const k=1+Math.sin(performance.now()*.004)*.08;goalMarker.children[0]?.scale.set(k,k,k);}
 if(weatherGroup){weatherGroup.children.forEach(p=>{if(!p.geometry?.attributes?.position)return;const a=p.geometry.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)-(p.userData.weather==='snow'?dt*.8:dt*6);if(y<0)y=18;a.setY(i,y)}a.needsUpdate=true});if(levelIndex===6)weatherGroup.rotation.y+=dt*.03}
 renderer.render(scene,camera);
}

makeDirectionButtons();initThree();
$('undoBtn').onclick=()=>{selected.pop();renderPlanner()};$('clearBtn').onclick=clearAnswers;$('confirmBtn').onclick=confirmRoute;$('nextBtn').onclick=handleResultAction;
document.querySelectorAll('.viewModeBtn').forEach(b=>b.onclick=()=>setTravelView(b.dataset.view));
document.querySelectorAll('.avatar').forEach(b=>b.onclick=()=>{document.querySelectorAll('.avatar').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');avatar=b.dataset.avatar});
$('startBtn').onclick=()=>{$('intro').classList.remove('open');buildLevel()};
})();