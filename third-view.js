(() => {
'use strict';

let thirdPersonActive = false;
let playerRef = null;
let snapCameraOnNextFrame = false;

function isPlayerGroup(object) {
  if (!object?.isGroup || object.children.length !== 3) return false;
  const types = object.children.map(child => child.geometry?.type).filter(Boolean);
  const cylinderCount = types.filter(type => type === 'CylinderGeometry').length;
  const sphereCount = types.filter(type => type === 'SphereGeometry').length;
  return cylinderCount === 1 && sphereCount === 2;
}

function findPlayer(scene) {
  let found = null;
  scene?.traverse(object => {
    if (!found && isPlayerGroup(object)) found = object;
  });
  return found;
}

function travellingNow() {
  const controls = document.getElementById('travelViewControls');
  const travelHud = document.getElementById('travelHud');
  return Boolean(
    controls &&
    !controls.classList.contains('hidden') &&
    travelHud?.classList.contains('show')
  );
}

function setCameraFov(camera, value) {
  if (!camera || camera.fov === value) return;
  camera.fov = value;
  camera.updateProjectionMatrix();
}

function applyThirdPersonCamera(scene, camera) {
  if (!thirdPersonActive || !travellingNow() || !scene || !camera) return;

  if (!playerRef || !playerRef.parent) playerRef = findPlayer(scene);
  if (!playerRef) return;

  playerRef.visible = true;

  const yaw = playerRef.rotation.y;
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
  const side = new THREE.Vector3(-forward.z, 0, forward.x).normalize();
  const playerWorld = new THREE.Vector3();
  playerRef.getWorldPosition(playerWorld);

  // 第三身追蹤鏡頭：角色後上方，略為偏右，畫面可同時看到角色和前路。
  const desiredPosition = playerWorld.clone()
    .addScaledVector(forward, -3.9)
    .addScaledVector(side, 0.42);
  desiredPosition.y += 2.65;

  if (snapCameraOnNextFrame) {
    camera.position.copy(desiredPosition);
    snapCameraOnNextFrame = false;
  } else {
    camera.position.lerp(desiredPosition, 0.34);
  }

  const lookTarget = playerWorld.clone().addScaledVector(forward, 1.45);
  lookTarget.y += 1.05;
  camera.lookAt(lookTarget);
  setCameraFov(camera, 58);

  const badge = document.getElementById('viewBadge');
  if (badge) badge.textContent = '🕹️ 第三身視角';
}

// WebGLRenderer.render 是建立在 renderer 實例上，而不是 prototype。
// 所以要在 game.js 建立 renderer 前包裝建構器，才能可靠地攔截每一格畫面。
function installRendererWrapper() {
  if (!window.THREE?.WebGLRenderer || THREE.WebGLRenderer.__thirdViewWrapped) return;

  const OriginalRenderer = THREE.WebGLRenderer;

  function WrappedRenderer(...args) {
    const renderer = new OriginalRenderer(...args);
    const originalRender = renderer.render.bind(renderer);

    renderer.render = function renderWithThirdPerson(scene, camera) {
      applyThirdPersonCamera(scene, camera);
      return originalRender(scene, camera);
    };

    return renderer;
  }

  WrappedRenderer.prototype = OriginalRenderer.prototype;
  Object.setPrototypeOf(WrappedRenderer, OriginalRenderer);
  WrappedRenderer.__thirdViewWrapped = true;
  THREE.WebGLRenderer = WrappedRenderer;
}

function activateButton(button) {
  document.querySelectorAll('.viewModeBtn').forEach(item => {
    item.classList.toggle('active', item === button);
  });
}

function deactivateThirdPerson() {
  thirdPersonActive = false;
  snapCameraOnNextFrame = false;
  playerRef = null;
}

function bindControls() {
  const thirdButton = document.querySelector('.viewModeBtn[data-view="third"]');
  if (!thirdButton) return;

  thirdButton.addEventListener('click', () => {
    thirdPersonActive = true;
    playerRef = null;
    snapCameraOnNextFrame = true;
    activateButton(thirdButton);

    const badge = document.getElementById('viewBadge');
    if (badge) badge.textContent = '🕹️ 第三身視角';
  });

  document.querySelectorAll('.viewModeBtn:not([data-view="third"])').forEach(button => {
    button.addEventListener('click', () => {
      deactivateThirdPerson();
      activateButton(button);
    });
  });

  const controls = document.getElementById('travelViewControls');
  if (controls) {
    const observer = new MutationObserver(() => {
      if (!travellingNow()) deactivateThirdPerson();
    });
    observer.observe(controls, {attributes:true, attributeFilter:['class']});
  }
}

installRendererWrapper();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindControls, {once:true});
} else {
  bindControls();
}
})();
