(() => {
'use strict';

let thirdPersonActive = false;
let sceneRef = null;
let cameraRef = null;
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

function setCameraFov(value) {
  if (!cameraRef || cameraRef.fov === value) return;
  cameraRef.fov = value;
  cameraRef.updateProjectionMatrix();
}

function updateThirdPersonCamera() {
  if (!thirdPersonActive || !travellingNow() || !sceneRef || !cameraRef) return;

  if (!playerRef || !playerRef.parent) playerRef = findPlayer(sceneRef);
  if (!playerRef) return;

  playerRef.visible = true;

  const yaw = playerRef.rotation.y;
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
  const side = new THREE.Vector3(-forward.z, 0, forward.x).normalize();
  const playerWorld = new THREE.Vector3();
  playerRef.getWorldPosition(playerWorld);

  // 真正第三身追蹤：鏡頭保持在角色後上方，略為偏側，方便看到前路。
  const desiredPosition = playerWorld.clone()
    .addScaledVector(forward, -3.8)
    .addScaledVector(side, 0.35);
  desiredPosition.y += 2.55;

  if (snapCameraOnNextFrame) {
    cameraRef.position.copy(desiredPosition);
    snapCameraOnNextFrame = false;
  } else {
    cameraRef.position.lerp(desiredPosition, 0.28);
  }

  const lookTarget = playerWorld.clone().addScaledVector(forward, 1.35);
  lookTarget.y += 1.05;
  cameraRef.lookAt(lookTarget);
  setCameraFov(58);

  const badge = document.getElementById('viewBadge');
  if (badge) badge.textContent = '🕹️ 第三身視角';
}

function patchRenderer() {
  if (!window.THREE?.WebGLRenderer || THREE.WebGLRenderer.prototype.__thirdViewPatched) return;

  const originalRender = THREE.WebGLRenderer.prototype.render;
  THREE.WebGLRenderer.prototype.render = function patchedRender(scene, camera) {
    sceneRef = scene;
    cameraRef = camera;
    updateThirdPersonCamera();
    return originalRender.call(this, scene, camera);
  };
  THREE.WebGLRenderer.prototype.__thirdViewPatched = true;
}

function activateButton(button) {
  document.querySelectorAll('.viewModeBtn').forEach(item => {
    item.classList.toggle('active', item === button);
  });
}

function deactivateThirdPerson() {
  thirdPersonActive = false;
  snapCameraOnNextFrame = false;
  if (travellingNow()) setCameraFov(68);
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
      if (!travellingNow()) {
        deactivateThirdPerson();
        playerRef = null;
      }
    });
    observer.observe(controls, {attributes:true, attributeFilter:['class']});
  }
}

patchRenderer();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindControls, {once:true});
} else {
  bindControls();
}
})();
