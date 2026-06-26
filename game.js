(() => {
'use strict';

const D = [
  {name:'北方',dx:0,dz:-1}, {name:'東北方',dx:1,dz:-1},
  {name:'東方',dx:1,dz:0}, {name:'東南方',dx:1,dz:1},
  {name:'南方',dx:0,dz:1}, {name:'西南方',dx:-1,dz:1},
  {name:'西方',dx:-1,dz:0}, {name:'西北方',dx:-1,dz:-1}
];

const levels = [
  {
    size:4,weather:'🌤️ 晴朗城市',sky:0xbfeeff,ground:0x79d86f,start:[0,3],
    missions:[
      {target:'學校',icon:'🏫',people:'👦📖👧',theme:'school',route:[2,2,0,2,0],reveal:2}
    ]
  },
  {
    size:5,weather:'🌦️ 微雨公園',sky:0xaed8eb,ground:0x62c878,start:[0,4],
    missions:[
      {target:'公園',icon:'🌳',people:'👦⚽👧',theme:'park',route:[1,2],reveal:1},
      {target:'圖書館',icon:'📚',people:'👧📚👦',theme:'library',route:[0,2,0],reveal:1}
    ]
  },
  {
    size:5,weather:'🍂 秋日街道',sky:0xf3cf9b,ground:0x87c96b,start:[0,4],
    missions:[
      {target:'超級市場',icon:'🛒',people:'👦🛒👩',theme:'market',route:[2,2,0],reveal:1},
      {target:'巴士站',icon:'🚌',people:'👧🚌👦',theme:'bus',route:[1,2,0],reveal:1}
    ]
  },
  {
    size:6,weather:'🌤️ 城市任務',sky:0xc8ecff,ground:0x70cf72,start:[0,5],
    missions:[
      {target:'公園',icon:'🌳',people:'👦⚽👧',theme:'park',route:[1,2],reveal:1},
      {target:'圖書館',icon:'📚',people:'👧📚👦',theme:'library',route:[0,2,0],reveal:1},
      {target:'學校',icon:'🏫',people:'👦📖👧',theme:'school',route:[6,0,2],reveal:1}
    ]
  },
  {
    size:6,weather:'🌧️ 雨中城市',sky:0x8fb5c8,ground:0x5ebd70,start:[0,5],
    missions:[
      {target:'超級市場',icon:'🛒',people:'👦🛒👩',theme:'market',route:[2,2,0],reveal:1},
      {target:'巴士站',icon:'🚌',people:'👧🚌👦',theme:'bus',route:[1,2,0],reveal:1},
      {target:'屋企',icon:'🏠',people:'👨‍👩‍👧‍👦',theme:'home',route:[6,0],reveal:1}
    ]
  },
  {
    size:7,weather:'🌲 森林黃昏',sky:0xf0a876,ground:0x4f9f63,start:[0,6],
    missions:[
      {target:'公園',icon:'🌳',people:'👦⚽👧',theme:'park',route:[1,2],reveal:1},
      {target:'學校',icon:'🏫',people:'👦📖👧',theme:'school',route:[0,2,0],reveal:1},
      {target:'圖書館',icon:'📚',people:'👧📚👦',theme:'library',route:[2,0],reveal:1},
      {target:'屋企',icon:'🏠',people:'👨‍👩‍👧‍👦',theme:'home',route:[6,0,2],reveal:1}
    ]
  },
  {
    size:7,weather:'🌙 星光夜城',sky:0x253957,ground:0x48765f,start:[0,6],
    missions:[
      {target:'超級市場',icon:'🛒',people:'👦🛒👩',theme:'market',route:[2,2,0],reveal:1},
      {target:'巴士站',icon:'🚌',people:'👧🚌👦',theme:'bus',route:[1,2,0],reveal:1},
      {target:'博物館',icon:'🏛️',people:'👦🖼️👧',theme:'museum',route:[6,0,2],reveal:1},
      {target:'麵包店',icon:'🥐',people:'👩‍🍳🥖👦',theme:'bakery',route:[0,2],reveal:1}
    ]
  },
  {
    size:7,weather:'🎉 節日街區',sky:0xd7b2f4,ground:0x6fca72,start:[0,6],
    missions:[
      {target:'公園',icon:'🌳',people:'👦⚽👧',theme:'park',route:[1,2],reveal:0},
      {target:'圖書館',icon:'📚',people:'👧📚👦',theme:'library',route:[0,2,0],reveal:0},
      {target:'超級市場',icon:'🛒',people:'👦🛒👩',theme:'market',route:[2,0],reveal:0},
      {target:'博物館',icon:'🏛️',people:'👦🖼️👧',theme:'museum',route:[6,0,2],reveal:0},
      {target:'屋企',icon:'🏠',people:'👨‍👩‍👧‍👦',theme:'home',route:[2],reveal:0}
    ]
  }
];

let renderer,scene,camera,boardGroup,player,weatherGroup,clock,northGuide,goalMarker;
let levelIndex=0,score=0,selected=[],avatar='boy',travelling=false;
let currentMissionIndex=0,missionLayout=[],missionStartCell=[0,0],resultAction='retry';
let tileSize=2.25,level,orientation=0,boardRotation=0;
let planningZoom=1,pinchStartDistance=0,pinchStartZoom=1;
let orbitYaw=.72,orbitPitch=.72,draggingView=false,lastDragX=0,lastDragY=0;
let travelLookYaw=0,travelLookPitch=0,travelViewMode='first';
const Y_AXIS=new THREE.Vector3(0,1,0);
const $=id=>document.getElementById(id);

function initThree(){
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  $('scene').appendChild(renderer.domElement);
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0xbfeeff);
  scene.fog=new THREE.Fog(0xbfeeff,24,65);
  camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.08,150);
  clock=new THREE.Clock();
  scene.add(new THREE.HemisphereLight(0xffffff,0x496b52,2.2));
  const sun=new THREE.DirectionalLight(0xffffff,2.5);
  sun.position.set(-14,22,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.left=-25;sun.shadow.camera.right=25;sun.shadow.camera.top=25;sun.shadow.camera.bottom=-25;
  scene.add(sun);
  window.addEventListener('resize',onResize,{passive:true});
  renderer.setAnimationLoop(render);
  setupMapControls();
}

function onResize(){
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
  if(!travelling)setPlanningCamera();
}

function disposeObject(root){
  root?.traverse(o=>{
    o.geometry?.dispose?.();
    if(o.material){
      (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.map?.dispose?.();m.dispose?.();});
    }
  });
}

function clearScene(){
  if(boardGroup){scene.remove(boardGroup);disposeObject(boardGroup);}
  if(weatherGroup){scene.remove(weatherGroup);disposeObject(weatherGroup);}
  boardGroup=new THREE.Group();scene.add(boardGroup);
  northGuide=null;goalMarker=null;
}

function mat(color,rough=.8,metal=.05){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});}
function box(w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.castShadow=true;m.receiveShadow=true;return m;}
function cyl(r1,r2,h,color,segments=16){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat(color));m.castShadow=true;m.receiveShadow=true;return m;}

function worldPos(x,z,y=0){
  const half=(level.size-1)*tileSize/2;
  const v=new THREE.Vector3(x*tileSize-half,y,z*tileSize-half);
  return v.applyAxisAngle(Y_AXIS,boardRotation);
}

function routeCells(startCell,directions){
  let x=startCell[0],z=startCell[1];
  const cells=[[x,z]];
  for(const idx of directions){x+=D[idx].dx;z+=D[idx].dz;cells.push([x,z]);}
  return cells;
}

function computeMissionLayout(){
  let start=[...level.start];
  return level.missions.map(mission=>{
    const cells=routeCells(start,mission.route);
    const target=[...cells[cells.length-1]];
    const item={start:[...start],target,cells};
    start=target;
    return item;
  });
}

function getMission(){return level.missions[currentMissionIndex];}
function getTargetCell(){return missionLayout[currentMissionIndex].target;}
function getFullAnswer(){const m=getMission();return [...m.route.slice(0,m.reveal),...selected];}
function maxRouteSteps(){return Math.max(getMission().route.length+10,level.size*3);}

function routeStatus(directions){
  const cells=routeCells(missionStartCell,directions);
  let outOfBounds=false;
  for(const [x,z] of cells){if(x<0||z<0||x>=level.size||z>=level.size){outOfBounds=true;break;}}
  const end=cells[cells.length-1],target=getTargetCell();
  return {cells,end,target,outOfBounds,atTarget:!outOfBounds&&end[0]===target[0]&&end[1]===target[1]};
}

function addTree(x,z,scale=1){
  const g=new THREE.Group();const trunk=cyl(.18,.24,1.3,0x7d4b2b);trunk.position.y=.65;
  const crown=cyl(.85,1.15,2.2,0x2fa85c,12);crown.position.y=2.05;g.add(trunk,crown);
  g.position.copy(worldPos(x,z,0));g.scale.setScalar(scale);boardGroup.add(g);
}
function addLocalTree(group,x,z,scale=.5){
  const tree=new THREE.Group();const trunk=cyl(.15,.2,1.15,0x7d4b2b);trunk.position.y=.58;
  const crown=cyl(.65,.9,1.65,0x2fa85c,12);crown.position.y=1.62;tree.add(trunk,crown);
  tree.position.set(x,0,z);tree.scale.setScalar(scale);group.add(tree);
}
function addLamp(x,z){const g=new THREE.Group();const p=cyl(.06,.08,2.1,0x425563);p.position.y=1.05;const light=box(.35,.3,.35,0xfff0ad);light.position.y=2.15;g.add(p,light);g.position.copy(worldPos(x,z,0));boardGroup.add(g);}
function addBench(x,z){const g=new THREE.Group();const seat=box(1.1,.16,.38,0xa96c39);seat.position.y=.48;const back=box(1.1,.5,.12,0x9b5c2f);back.position.set(0,.79,.13);g.add(seat,back);g.position.copy(worldPos(x,z,0));boardGroup.add(g);}
function addHouse(x,z,color=0xf5b16b){const g=new THREE.Group();const body=box(1.4,1.3,1.2,color);body.position.y=.65;const roof=new THREE.Mesh(new THREE.ConeGeometry(1.1,.8,4),mat(0xc94d4d));roof.position.y=1.7;roof.rotation.y=Math.PI/4;roof.castShadow=true;const door=box(.32,.68,.05,0x734426);door.position.set(0,.38,.625);g.add(body,roof,door);g.position.copy(worldPos(x,z,0));boardGroup.add(g);}
function addCloud(x,y,z,s=1){const g=new THREE.Group();for(const [dx,dy,sc] of [[0,0,1],[-.8,-.1,.72],[.8,-.12,.78],[.2,.35,.7]]){const q=new THREE.Mesh(new THREE.SphereGeometry(.75*sc,12,10),mat(0xffffff));q.position.set(dx,dy,0);g.add(q);}g.position.set(x,y,z);g.scale.setScalar(s);(weatherGroup||scene).add(g);return g;}

function makeLabelSprite(text,bg='rgba(255,255,255,.96)',border='#ff3b30',color='#c9211e',fontSize=78){
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=192;const ctx=canvas.getContext('2d');
  ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(12,12,616,168,42);ctx.fill();
  ctx.lineWidth=14;ctx.strokeStyle=border;ctx.stroke();ctx.fillStyle=color;
  ctx.font=`900 ${fontSize}px "Noto Sans TC",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,320,98);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));
  sprite.scale.set(3.1,.93,1);sprite.renderOrder=20;return sprite;
}

function addLandmark(x,z,theme){
  const g=new THREE.Group();
  if(theme==='school'){
    const b=box(2.0,1.55,1.6,0xffcf68);b.position.y=.78;const roof=box(2.2,.28,1.8,0xe85b4d);roof.position.y=1.69;
    const door=box(.45,.85,.06,0x37769b);door.position.set(0,.43,.83);g.add(b,roof,door);
  }else if(theme==='park'){
    const left=cyl(.11,.13,2.05,0x3f7b4c);left.position.set(-.78,1.02,0);const right=left.clone();right.position.x=.78;
    const top=box(1.85,.26,.28,0xf1b847);top.position.set(0,1.95,0);const sign=makeLabelSprite('公園','#effff1','#2b9b50','#176c35',82);sign.position.set(0,2.63,0);sign.scale.set(2.75,1.02,1);
    g.add(left,right,top,sign);addLocalTree(g,-1.08,.2,.55);addLocalTree(g,1.08,.2,.55);
  }else if(theme==='library'){
    const b=box(2.1,1.7,1.5,0x9a8bd9);b.position.y=.85;g.add(b);for(let i=-1;i<=1;i++){const c=cyl(.12,.12,1.3,0xffffff);c.position.set(i*.55,.65,.82);g.add(c);}
  }else if(theme==='market'){
    const b=box(2.2,1.45,1.6,0x62b8d8);b.position.y=.72;const awn=box(2.3,.3,.42,0xff6d6d);awn.position.set(0,1.38,.86);g.add(b,awn);
  }else if(theme==='bus'){
    const post=cyl(.08,.08,2,0x245b89);post.position.y=1;const sign=cyl(.44,.44,.12,0x56aee3,24);sign.rotation.x=Math.PI/2;sign.position.set(0,1.7,.02);const roof=box(2.1,.16,1.0,0x6f8999);roof.position.y=1.8;g.add(post,sign,roof);
  }else if(theme==='home'){
    addHouse(x,z,0xffc778);return;
  }else if(theme==='museum'){
    const b=box(2.3,.6,1.5,0xe9e2d0);b.position.y=.3;g.add(b);for(let i=-1;i<=1;i++){const c=cyl(.13,.13,1.3,0xf7f3e8);c.position.set(i*.6,1.15,.6);g.add(c);}const roof=new THREE.Mesh(new THREE.ConeGeometry(1.7,.7,4),mat(0xc9b88d));roof.position.set(0,2,.05);roof.rotation.y=Math.PI/4;g.add(roof);
  }else{
    const b=box(2.0,1.4,1.5,0xf3a8b7);b.position.y=.7;const awn=box(2.15,.3,.42,0xffdf83);awn.position.set(0,1.32,.82);g.add(b,awn);
  }
  g.position.copy(worldPos(x,z,0));boardGroup.add(g);
}

function createStopLabel(x,z,index,target){
  const label=makeLabelSprite(`第${index+1}站 ${target}`,'rgba(255,250,223,.96)','#e5a43b','#75470b',56);
  label.position.copy(worldPos(x,z,3.55));label.scale.set(2.8,.82,1);boardGroup.add(label);
}

function addPersonMesh(color=0x2f78b7){
  const g=new THREE.Group();const body=cyl(.28,.36,.9,color);body.position.y=.9;
  const head=new THREE.Mesh(new THREE.SphereGeometry(.25,16,12),mat(0xf2b486));head.position.y=1.55;
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.265,16,8,0,Math.PI*2,0,Math.PI/2),mat(0x242d39));hair.position.y=1.61;
  g.add(body,head,hair);return g;
}

function removeFromBoard(object){if(!object)return;boardGroup.remove(object);disposeObject(object);}

function createNorthGuide(){
  removeFromBoard(northGuide);
  const start=worldPos(missionStartCell[0],missionStartCell[1],.25);
  const north=worldPos(missionStartCell[0],missionStartCell[1]-1,.25);
  const dir=north.clone().sub(start).setY(0).normalize();
  northGuide=new THREE.Group();northGuide.position.copy(start.clone().add(dir.clone().multiplyScalar(.62)));northGuide.userData.enabled=true;
  const arrow=new THREE.ArrowHelper(dir,new THREE.Vector3(0,0,0),1.6,0xff3028,.62,.4);northGuide.add(arrow);
  const glow=new THREE.PointLight(0xff3b30,2.8,4.5);glow.position.set(0,.5,0);northGuide.add(glow);
  const label=makeLabelSprite('北方');label.position.copy(dir).multiplyScalar(.8);label.position.y=1.35;label.scale.set(2.5,.94,1);northGuide.add(label);
  boardGroup.add(northGuide);player.rotation.y=Math.atan2(dir.x,dir.z);
}

function createGoalMarker(){
  removeFromBoard(goalMarker);
  const [x,z]=getTargetCell();
  goalMarker=new THREE.Group();goalMarker.position.copy(worldPos(x,z,.1));
  const ringMat=new THREE.MeshStandardMaterial({color:0x35d66f,emissive:0x1d8f48,emissiveIntensity:1.1,transparent:true,opacity:.72,roughness:.4});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.79,.13,16,44),ringMat);ring.rotation.x=Math.PI/2;
  const beacon=new THREE.PointLight(0x55ff88,2.8,5);beacon.position.y=1.4;
  const label=makeLabelSprite(`目前：${getMission().target}`,'rgba(239,255,243,.97)','#2aa85b','#176c35',62);label.position.y=4.45;label.scale.set(3.1,.9,1);
  goalMarker.add(ring,beacon,label);boardGroup.add(goalMarker);
}

function updateCompass(){
  const deg=orientation*90;
  $('needleWrap').style.transform=`translate(-50%,-50%) rotate(${deg}deg)`;
  $('nMark').style.transform=`translateX(-50%) rotate(${-deg}deg)`;
}

function updateMissionUI(){
  const mission=getMission();
  $('levelPill').textContent=`第 ${levelIndex+1} 關`;
  $('sizePill').textContent=`${level.size} × ${level.size}`;
  $('taskPill').textContent=`任務 ${currentMissionIndex+1} / ${level.missions.length}`;
  $('scorePill').textContent=`分數 ${score}`;
  $('mission').innerHTML=`第 ${currentMissionIndex+1} 站：前往 <b id="targetName">${mission.target}</b>`;
  const remaining=level.missions.length-currentMissionIndex-1;
  $('subMission').textContent=remaining>0?`完成目前景點後，尚有 ${remaining} 個景點。`:'這是本關最後一個景點。';
  $('weather').textContent=level.weather;
}

function buildLevel(){
  level=levels[levelIndex];currentMissionIndex=0;selected=[];travelling=false;resultAction='retry';
  planningZoom=1;orbitYaw=.72;orbitPitch=.72;travelLookYaw=0;travelLookPitch=0;travelViewMode='first';
  orientation=levelIndex%4;boardRotation=orientation*Math.PI/2;
  clearScene();scene.background=new THREE.Color(level.sky);scene.fog.color.setHex(level.sky);
  missionLayout=computeMissionLayout();missionStartCell=[...missionLayout[0].start];
  updateCompass();updateMissionUI();

  const base=box(level.size*tileSize+1,.5,level.size*tileSize+1,level.ground);base.position.y=-.32;base.receiveShadow=true;boardGroup.add(base);
  for(let z=0;z<level.size;z++)for(let x=0;x<level.size;x++){
    const tile=box(tileSize*.88,.12,tileSize*.88,(x+z)%2?0xfff3b8:0xfff7cf);tile.position.copy(worldPos(x,z,.02));tile.receiveShadow=true;boardGroup.add(tile);
  }
  level.missions.forEach((mission,index)=>{
    const [x,z]=missionLayout[index].target;addLandmark(x,z,mission.theme);createStopLabel(x,z,index,mission.target);
  });
  const startRing=new THREE.Mesh(new THREE.TorusGeometry(.55,.13,14,36),mat(0x35c987));startRing.rotation.x=Math.PI/2;startRing.position.copy(worldPos(level.start[0],level.start[1],.12));boardGroup.add(startRing);
  player=addPersonMesh(avatar==='girl'?0xe56ba0:0x2f78b7);player.position.copy(worldPos(level.start[0],level.start[1],.1));player.scale.setScalar(.75);boardGroup.add(player);
  createNorthGuide();createGoalMarker();
  for(let i=0;i<level.size;i+=2){addTree(i-.25,-.8,.62);if(i%4===0)addLamp(i+.35,level.size-.15);}
  if(level.size>4){addBench(level.size-.35,Math.max(1,level.size-3));addHouse(-.75,1.1,0xf2a66d);}
  createWeather();setPlanningCamera();renderPlanner();setTravelView('first');
  $('planner').classList.remove('hidden');$('travelHud').classList.remove('show');$('travelViewControls').classList.add('hidden');$('viewBadge').classList.remove('show');$('zoomPanel').classList.remove('hidden');$('pinchTip').classList.remove('hidden');updateZoomLabel();
}

function prepareCurrentMission(){
  selected=[];travelling=false;travelViewMode='first';travelLookYaw=0;travelLookPitch=0;
  missionStartCell=[...missionLayout[currentMissionIndex].start];
  player.position.copy(worldPos(missionStartCell[0],missionStartCell[1],.1));player.visible=true;
  createNorthGuide();createGoalMarker();updateMissionUI();renderPlanner();setPlanningCamera();setTravelView('first');
  $('planner').classList.remove('hidden');$('travelHud').classList.remove('show');$('travelViewControls').classList.add('hidden');$('viewBadge').classList.remove('show');$('zoomPanel').classList.remove('hidden');$('pinchTip').classList.remove('hidden');
}

function clampZoom(v){return Math.max(.48,Math.min(2.35,v));}
function updateZoomLabel(){if($('zoomPercent'))$('zoomPercent').textContent=`${Math.round(100/planningZoom)}%`;}
function setPlanningCamera(){
  if(!level||travelling)return;
  const span=level.size*tileSize,radius=span*1.48*planningZoom,flat=Math.cos(orbitPitch)*radius;
  camera.position.set(Math.sin(orbitYaw)*flat,Math.sin(orbitPitch)*radius,Math.cos(orbitYaw)*flat);
  camera.lookAt(0,0,0);camera.fov=innerWidth<650?52:45;camera.updateProjectionMatrix();player.visible=true;updateZoomLabel();
}
function setMapZoom(value){if(!level||travelling)return;planningZoom=clampZoom(value);setPlanningCamera();}
function adjustView(dx,dy){
  if(!level)return;
  if(travelling&&travelViewMode==='first'){
    travelLookYaw=Math.max(-1.3,Math.min(1.3,travelLookYaw-dx*.006));
    travelLookPitch=Math.max(-.72,Math.min(.72,travelLookPitch-dy*.005));return;
  }
  if(travelling)return;
  orbitYaw-=dx*.007;orbitPitch=Math.max(.25,Math.min(1.28,orbitPitch+dy*.006));setPlanningCamera();
}

function setupMapControls(){
  const canvas=renderer.domElement;
  $('mapZoomIn').onclick=()=>setMapZoom(planningZoom*.82);$('mapZoomOut').onclick=()=>setMapZoom(planningZoom*1.22);$('mapZoomReset').onclick=()=>{planningZoom=1;orbitYaw=.72;orbitPitch=.72;setPlanningCamera();};
  canvas.addEventListener('wheel',e=>{if(!level||travelling)return;e.preventDefault();setMapZoom(planningZoom*Math.exp(e.deltaY*.0015));},{passive:false});
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||!level)return;draggingView=true;lastDragX=e.clientX;lastDragY=e.clientY;canvas.setPointerCapture?.(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!draggingView||e.pointerType==='touch')return;const dx=e.clientX-lastDragX,dy=e.clientY-lastDragY;lastDragX=e.clientX;lastDragY=e.clientY;adjustView(dx,dy);});
  canvas.addEventListener('pointerup',()=>draggingView=false);canvas.addEventListener('pointercancel',()=>draggingView=false);
  canvas.addEventListener('touchstart',e=>{if(!level)return;if(e.touches.length===2&&!travelling){const a=e.touches[0],b=e.touches[1];pinchStartDistance=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);pinchStartZoom=planningZoom;draggingView=false;}else if(e.touches.length===1){draggingView=true;lastDragX=e.touches[0].clientX;lastDragY=e.touches[0].clientY;}},{passive:true});
  canvas.addEventListener('touchmove',e=>{if(!level)return;if(e.touches.length===2&&!travelling&&pinchStartDistance){e.preventDefault();const a=e.touches[0],b=e.touches[1],distance=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);setMapZoom(pinchStartZoom*(pinchStartDistance/Math.max(20,distance)));return;}if(e.touches.length===1&&draggingView){e.preventDefault();const t=e.touches[0],dx=t.clientX-lastDragX,dy=t.clientY-lastDragY;lastDragX=t.clientX;lastDragY=t.clientY;adjustView(dx,dy);}},{passive:false});
  canvas.addEventListener('touchend',e=>{pinchStartDistance=0;if(!e.touches.length)draggingView=false;},{passive:true});canvas.addEventListener('touchcancel',()=>{pinchStartDistance=0;draggingView=false;},{passive:true});
}

function createWeather(){
  weatherGroup=new THREE.Group();scene.add(weatherGroup);
  const count=levelIndex===4?260:levelIndex===6?120:45;const geom=new THREE.BufferGeometry();const arr=[];
  for(let i=0;i<count;i++)arr.push((Math.random()-.5)*35,Math.random()*18+2,(Math.random()-.5)*35);
  geom.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
  const snow=false;const material=new THREE.PointsMaterial({color:snow?0xffffff:0xcbefff,size:snow?.16:.08,transparent:true,opacity:snow?.9:.55});
  const pts=new THREE.Points(geom,material);pts.userData.weather=snow?'snow':'rain';weatherGroup.add(pts);
  if(levelIndex<4||levelIndex===5){addCloud(-6,12,-8,1.5);addCloud(7,14,-12,1.1);}
}

function renderPlanner(){
  const slots=$('routeSlots');slots.innerHTML='';const mission=getMission(),full=getFullAnswer(),status=routeStatus(full);
  full.forEach((d,i)=>{
    if(i){const c=document.createElement('span');c.className='connector';c.textContent='›';slots.appendChild(c);}
    const b=document.createElement('button');const isFixed=i<mission.reveal,isFinish=status.atTarget&&i===full.length-1;
    b.className='slot '+(isFixed?'fixed':isFinish?'finish':'answer');b.textContent=D[d].name;
    if(!isFixed)b.onclick=()=>removeFrom(i-mission.reveal);slots.appendChild(b);
  });
  if(full.length<maxRouteSteps()){
    if(full.length){const c=document.createElement('span');c.className='connector';c.textContent='›';slots.appendChild(c);}
    const empty=document.createElement('button');empty.className='slot empty';empty.textContent='＋ 選方向';empty.disabled=true;slots.appendChild(empty);
  }
  if(!selected.length)$('fillCount').textContent='請選擇至少一個方向';
  else if(status.atTarget)$('fillCount').textContent=`✅ 路線會到達${mission.target}`;
  else $('fillCount').textContent=`⚠️ 尚未到達${mission.target}，仍可出發測試`;
  $('confirmBtn').disabled=!selected.length||travelling;$('undoBtn').disabled=!selected.length;$('clearBtn').disabled=!selected.length;
  requestAnimationFrame(()=>{slots.scrollLeft=slots.scrollWidth;});
}

function makeDirectionButtons(){
  const el=$('directionButtons');
  D.forEach((d,i)=>{const b=document.createElement('button');b.className='dirBtn';b.textContent=d.name;b.onclick=()=>choose(i);el.appendChild(b);});
}
function choose(i){
  if(travelling)return;const full=getFullAnswer();if(full.length>=maxRouteSteps()){showToast('路線太長，請先退一步');return;}
  const status=routeStatus([...full,i]);if(status.outOfBounds){showToast('呢一步會走出地圖，請選其他方向');return;}
  selected.push(i);renderPlanner();if(status.atTarget)showToast(`呢條路線會到達${getMission().target}！`);
}
function removeFrom(i){if(travelling)return;selected.splice(i,1);renderPlanner();}
function clearAnswers(){selected=[];renderPlanner();}
function confirmRoute(){if(travelling||!selected.length)return;startTravel(getFullAnswer());}

function setTravelView(mode){
  travelViewMode=mode;
  document.querySelectorAll('.viewModeBtn').forEach(b=>b.classList.toggle('active',b.dataset.view===mode));
  player.visible=travelling&&(mode==='side'||mode==='third');
  const labels={first:'👀 第一身視角',third:'🕹️ 第三身視角',side:'🎥 側面視角'};
  $('viewBadge').textContent=labels[mode]||labels.first;
  camera.fov=mode==='third'?58:68;camera.updateProjectionMatrix();
}

function prepareTravel(){
  travelling=true;travelLookYaw=0;travelLookPitch=0;if(northGuide)northGuide.userData.enabled=false;
  $('planner').classList.add('hidden');$('zoomPanel').classList.add('hidden');$('pinchTip').classList.add('hidden');$('travelHud').classList.add('show');$('travelViewControls').classList.remove('hidden');$('viewBadge').classList.add('show');$('progressFill').style.width='0';setTravelView('first');
}

async function startTravel(answer){
  prepareTravel();const cells=routeCells(missionStartCell,answer);
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
        player.visible=true;const side=new THREE.Vector3(-forward.z,0,forward.x).normalize();camera.position.copy(travelPos).add(side.multiplyScalar(3.45));camera.position.y+=1.45;camera.lookAt(feet.x,feet.y+1.05,feet.z);
      }else if(travelViewMode==='third'){
        player.visible=true;const side=new THREE.Vector3(-forward.z,0,forward.x).normalize();const desired=feet.clone().addScaledVector(forward,-3.9).addScaledVector(side,.42);desired.y+=2.65;camera.position.lerp(desired,.34);const look=feet.clone().addScaledVector(forward,1.45);look.y+=1.05;camera.lookAt(look);
      }else{
        player.visible=false;camera.position.copy(travelPos);camera.position.y+=Math.sin(p*Math.PI*6)*.045;const dir=forward.clone().applyAxisAngle(Y_AXIS,travelLookYaw);dir.y+=Math.sin(travelLookPitch);dir.normalize();camera.lookAt(camera.position.clone().add(dir.multiplyScalar(4)));
      }
      if(p<1)requestAnimationFrame(frame);else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function showResult(answer,status){
  travelling=false;$('travelHud').classList.remove('show');$('travelViewControls').classList.add('hidden');$('viewBadge').classList.remove('show');player.visible=true;
  const mission=getMission();$('resultIcon').textContent=status.atTarget?mission.icon:'🧭❌';$('arrivalBuilding').textContent=status.atTarget?mission.icon:'❓';$('arrivalPeople').textContent=status.atTarget?mission.people:'🚶';
  if(status.atTarget){
    score+=100;$('scorePill').textContent=`分數 ${score}`;
    const hasNext=currentMissionIndex<level.missions.length-1;
    $('resultTitle').textContent=`成功到達${mission.target}！`;
    $('resultText').textContent=hasNext?`完成第 ${currentMissionIndex+1} 站。下一站是${level.missions[currentMissionIndex+1].target}。`:`你已完成本關全部 ${level.missions.length} 個景點！`;
    $('nextBtn').textContent=hasNext?'前往下一站':(levelIndex===levels.length-1?'重新挑戰':'下一關');
    resultAction=hasNext?'nextMission':'nextLevel';
  }else{
    $('resultTitle').textContent=`未能到達${mission.target}`;
    $('resultText').textContent=`角色已按照你選擇的 ${answer.length} 步走完，但最後沒有停在${mission.target}。請重新規劃。`;
    $('nextBtn').textContent='重新規劃';resultAction='retry';
  }
  $('result').classList.add('open');
}

function handleResultAction(){
  $('result').classList.remove('open');
  if(resultAction==='nextMission'){
    currentMissionIndex++;prepareCurrentMission();showToast(`下一站：${getMission().target}`);
  }else if(resultAction==='nextLevel'){
    levelIndex++;if(levelIndex>=levels.length){levelIndex=0;score=0;}buildLevel();
  }else{
    prepareCurrentMission();showToast(`重新規劃前往${getMission().target}`);
  }
}

function showToast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),1500);}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}

function render(){
  const dt=Math.min(clock.getDelta(),.04);
  if(northGuide){const blink=Math.floor(performance.now()/430)%2===0;northGuide.visible=!!northGuide.userData.enabled&&blink;}
  if(goalMarker){const k=1+Math.sin(performance.now()*.004)*.08;goalMarker.children[0]?.scale.set(k,k,k);}
  if(weatherGroup){weatherGroup.children.forEach(p=>{if(!p.geometry?.attributes?.position)return;const a=p.geometry.attributes.position;for(let i=0;i<a.count;i++){let y=a.getY(i)-dt*3;if(y<0)y=18;a.setY(i,y);}a.needsUpdate=true;});}
  renderer.render(scene,camera);
}

makeDirectionButtons();initThree();
$('undoBtn').onclick=()=>{selected.pop();renderPlanner();};$('clearBtn').onclick=clearAnswers;$('confirmBtn').onclick=confirmRoute;$('nextBtn').onclick=handleResultAction;
document.querySelectorAll('.viewModeBtn').forEach(b=>b.onclick=()=>setTravelView(b.dataset.view));
document.querySelectorAll('.avatar').forEach(b=>b.onclick=()=>{document.querySelectorAll('.avatar').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');avatar=b.dataset.avatar;});
$('startBtn').onclick=()=>{$('intro').classList.remove('open');buildLevel();};
})();