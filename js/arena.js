import * as THREE from 'three';

let scene, camera, renderer;
let playerMesh, enemyMesh;
let playerGroup = new THREE.Group();
let enemyGroup = new THREE.Group();
let arenaGroup = new THREE.Group();
let powerUpGroup = new THREE.Group();
let animFrameId = null;
let isAnimating = false;

let projectiles = [];
let enemyTimer = null;
let powerUpSpawnTimer = null;
let onPlayerShootCb = null, onEnemyHitCb = null, onPlayerHitCb = null;
let onSuperReadyCb = null;
let containerEl = null;

let isReloading = false;
let playerAmmo = 3, maxAmmo = 3;
let ammoRegenTimer = null;
let superCharge = 0;
let isSuperReady = false;

const AMMO_REGEN_TIME = 1200;
const ENEMY_SHOOT_INTERVAL = 2000;
const POWERUP_SPAWN_INTERVAL = 12000;

export function setArenaCallbacks(cb) {
  onPlayerShootCb = cb.onPlayerShoot || null;
  onEnemyHitCb = cb.onEnemyHit || null;
  onPlayerHitCb = cb.onPlayerHit || null;
  onSuperReadyCb = cb.onSuperReady || null;
}

export function setReloading(v) { isReloading = v; }

export function setAmmo(n) {
  playerAmmo = Math.min(maxAmmo, Math.max(0, n));
  updateAmmoUI();
}
export function getAmmo() { return playerAmmo; }
export function spendAmmo() { playerAmmo = Math.max(0, playerAmmo - 1); updateAmmoUI(); }
export function getSuperCharge() { return superCharge; }
export function setSuperCharge(v) {
  superCharge = Math.min(100, Math.max(0, v));
  isSuperReady = superCharge >= 100;
  updateSuperUI();
}
export function addSuperCharge(v) {
  setSuperCharge(superCharge + v);
}
export function getIsSuperReady() { return isSuperReady; }
export function useSuper() { isSuperReady = false; superCharge = 0; updateSuperUI(); }

function updateAmmoUI() {
  const el = document.getElementById('ammo-display');
  if (!el) return;
  const dots = '🔵'.repeat(playerAmmo) + '⚪'.repeat(maxAmmo - playerAmmo);
  el.textContent = dots;
}
function updateSuperUI() {
  const fill = document.getElementById('super-fill');
  const label = document.getElementById('super-bar-label');
  if (!fill) return;
  fill.style.width = superCharge + '%';
  if (label) label.textContent = isSuperReady ? '💥 מוכן!' : '💥 ' + superCharge + '%';
}

export function startAmmoRegen() {
  stopAmmoRegen();
  function tick() {
    if (!isReloading && playerAmmo < maxAmmo) {
      playerAmmo = Math.min(maxAmmo, playerAmmo + 1);
      updateAmmoUI();
    }
    ammoRegenTimer = setTimeout(tick, AMMO_REGEN_TIME);
  }
  tick();
}
export function stopAmmoRegen() {
  if (ammoRegenTimer) { clearTimeout(ammoRegenTimer); ammoRegenTimer = null; }
}

export function initArena(container) {
  let w = container.clientWidth;
  let h = container.clientHeight;
  if (w < 10 || h < 10) {
    w = window.innerWidth;
    h = window.innerHeight;
  }
  w = Math.max(w, 1);
  h = Math.max(h, 1);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0F0724);
  scene.fog = new THREE.Fog(0x0F0724, 15, 25);

  camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
  camera.position.set(6, 5, 8);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  containerEl = container;
  container.style.cursor = 'crosshair';
  container.addEventListener('click', onCanvasClick);

  setupLights();
  buildArena();

  scene.add(arenaGroup);
  scene.add(playerGroup);
  scene.add(enemyGroup);
  scene.add(powerUpGroup);

  window.addEventListener('resize', onResize);
  startAnimLoop();

  return { scene, camera, renderer };
}

function setupLights() {
  const ambient = new THREE.AmbientLight(0x4040a0, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
  dirLight.position.set(5, 10, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  const d = 8;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 15;
  scene.add(dirLight);
  const fill = new THREE.DirectionalLight(0x8888ff, 0.4);
  fill.position.set(-3, 4, -2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x8B5CF6, 0.3);
  rim.position.set(0, -2, 6);
  scene.add(rim);
  const hemi = new THREE.HemisphereLight(0x8B5CF6, 0x10B981, 0.4);
  scene.add(hemi);
}

function buildArena() {
  const half = 3.5;
  const matA = new THREE.MeshStandardMaterial({ color: 0x4C1D95, roughness: 0.3, metalness: 0.15 });
  const matB = new THREE.MeshStandardMaterial({ color: 0x6D28D9, roughness: 0.3, metalness: 0.15 });
  for (let x = -half; x < half; x++) {
    for (let z = -half; z < half; z++) {
      const isEven = (Math.floor(x) + Math.floor(z)) % 2 === 0;
      const tile = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.08, 0.92), isEven ? matA : matB);
      tile.position.set(x + 0.5, -0.04, z + 0.5);
      tile.receiveShadow = true;
      arenaGroup.add(tile);
    }
  }
  const glowMat = new THREE.MeshStandardMaterial({ color: 0x8B5CF6, emissive: 0x8B5CF6, emissiveIntensity: 0.3, transparent: true, opacity: 0.3 });
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2 + i * 0.8, 0.03, 8, 32), glowMat.clone());
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    ring.material.opacity = 0.1 + i * 0.05;
    arenaGroup.add(ring);
  }
}

export function createCharacterMesh(config, isPlayer = true) {
  const group = new THREE.Group();
  const bodyColor = new THREE.Color(config.color || '#8B5CF6');
  const headColor = new THREE.Color(config.headColor || '#FBBF24');
  const darkColor = bodyColor.clone().multiplyScalar(0.7);
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.25, metalness: 0.15 });
  const headMat = new THREE.MeshStandardMaterial({ color: headColor, roughness: 0.35, metalness: 0.05 });
  const darkMat = new THREE.MeshStandardMaterial({ color: darkColor, roughness: 0.3, metalness: 0.1 });

  const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.15, 0.4), darkMat);
  lFoot.position.set(-0.2, 0.075, 0.05); lFoot.castShadow = true; group.add(lFoot);
  const rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.15, 0.4), darkMat);
  rFoot.position.set(0.2, 0.075, -0.05); rFoot.castShadow = true; group.add(rFoot);

  const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.35, 0.3), darkMat);
  lLeg.position.set(-0.2, 0.325, 0.05); group.add(lLeg);
  const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.35, 0.3), darkMat);
  rLeg.position.set(0.2, 0.325, -0.05); group.add(rLeg);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.45), bodyMat);
  body.position.set(0, 0.775, 0); body.castShadow = true; group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), headMat);
  head.position.set(0, 1.34, 0); head.castShadow = true; group.add(head);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, emissive: 0xffffff, emissiveIntensity: 0.1 });
  const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), eyeMat);
  lEye.position.set(-0.13, 1.4, 0.25); group.add(lEye);
  const rEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), eyeMat);
  rEye.position.set(0.13, 1.4, 0.25); group.add(rEye);

  const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.2), bodyMat);
  lArm.position.set(-0.45, 0.8, 0); lArm.castShadow = true; group.add(lArm);
  const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.2), bodyMat);
  rArm.position.set(0.45, 0.8, 0); rArm.castShadow = true; group.add(rArm);

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.35), new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.3, metalness: 0.6 }));
  belt.position.set(0, 0.55, 0); group.add(belt);

  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.2, metalness: 0.8 }));
  crown.position.set(0, 1.6, 0); group.add(crown);

  if (!isPlayer) group.scale.x = -1;
  group.scale.set(0.5, 0.5, 0.5);
  return group;
}

export function positionCharacters(playerChar, enemyChar) {
  clearGroups();
  playerMesh = createCharacterMesh(playerChar, true);
  playerMesh.position.set(-1.8, 0, 0);
  playerGroup.add(playerMesh);
  enemyMesh = createCharacterMesh(enemyChar, false);
  enemyMesh.position.set(1.8, 0, 0);
  enemyGroup.add(enemyMesh);
}

function clearGroups() {
  while (playerGroup.children.length) playerGroup.remove(playerGroup.children[0]);
  while (enemyGroup.children.length) enemyGroup.remove(enemyGroup.children[0]);
  playerMesh = null; enemyMesh = null;
}

function onCanvasClick() {
  if (isReloading) return;
  if (playerAmmo <= 0) return;

  spendAmmo();
  const from = new THREE.Vector3(-1.8, 0.8, 0);
  const to = new THREE.Vector3(1.8, 0.8, 0);
  fireBullet(from, to, () => {
    if (onEnemyHitCb) onEnemyHitCb(1);
  });
}

function fireBullet(from, to, onHit) {
  const isEnemy = from.x > 0;
  const mat = new THREE.MeshStandardMaterial({
    color: isEnemy ? 0xFF1744 : 0xFFD600,
    emissive: isEnemy ? 0xFF1744 : 0xFFD600,
    emissiveIntensity: 1.5, transparent: true, opacity: 1
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), mat);
  mesh.position.copy(from);
  scene.add(mesh);
  const startTime = performance.now();
  projectiles.push({ mesh, startPos: from.clone(), endPos: to.clone(), startTime, duration: 300, onHit, hit: false });
}

function animateProjectiles() {
  const now = performance.now();
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    const t = Math.min((now - p.startTime) / p.duration, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    p.mesh.position.lerpVectors(p.startPos, p.endPos, eased);
    const scale = 1 + Math.sin(t * Math.PI * 6) * 0.3;
    p.mesh.scale.set(scale, scale, scale);
    p.mesh.material.opacity = 1 - t * 0.3;
    if (t >= 1) {
      if (!p.hit) { p.hit = true; if (p.onHit) p.onHit(); }
      scene.remove(p.mesh); p.mesh.material.dispose(); p.mesh.geometry.dispose();
      projectiles.splice(i, 1);
    }
  }
}

export function startEnemyAI() {
  stopEnemyAI();
  function scheduleShot() {
    if (isReloading) { enemyTimer = setTimeout(scheduleShot, 500); return; }
    const delay = ENEMY_SHOOT_INTERVAL * (0.5 + Math.random());
    enemyTimer = setTimeout(() => {
      if (isReloading) { scheduleShot(); return; }
      const from = new THREE.Vector3(1.8, 0.8, 0);
      const to = new THREE.Vector3(-1.8, 0.8, 0);
      fireBullet(from, to, () => { if (onPlayerHitCb) onPlayerHitCb(1); });
      scheduleShot();
    }, delay);
  }
  scheduleShot();
}

export function stopEnemyAI() {
  if (enemyTimer) { clearTimeout(enemyTimer); enemyTimer = null; }
}

// ===== POWER-UP SPAWN =====
let powerUpMeshInstance = null;
export let onPowerUpCollected = null;

export function startPowerUpSpawning(callback) {
  onPowerUpCollected = callback;
  stopPowerUpSpawning();
  schedulePowerUp();
}
function schedulePowerUp() {
  if (isReloading) { powerUpSpawnTimer = setTimeout(schedulePowerUp, 2000); return; }
  powerUpSpawnTimer = setTimeout(() => {
    if (isReloading) { schedulePowerUp(); return; }
    spawnPowerUpPickup();
  }, POWERUP_SPAWN_INTERVAL * (0.5 + Math.random()));
}
export function stopPowerUpSpawning() {
  if (powerUpSpawnTimer) { clearTimeout(powerUpSpawnTimer); powerUpSpawnTimer = null; }
  removePowerUpPickup();
}

function spawnPowerUpPickup() {
  removePowerUpPickup();
  const types = ['ammo', 'super', 'heal', 'damage'];
  const type = types[Math.floor(Math.random() * types.length)];
  const colors = { ammo: 0xFFD600, super: 0x8B5CF6, heal: 0x00E676, damage: 0xFF1744 };

  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: colors[type], emissive: colors[type], emissiveIntensity: 0.8,
    transparent: true, opacity: 0.9
  });
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), mat);
  group.add(core);

  const ringMat = new THREE.MeshStandardMaterial({
    color: colors[type], emissive: colors[type], emissiveIntensity: 0.4,
    transparent: true, opacity: 0.5, side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 6, 24), ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const xPos = (Math.random() - 0.5) * 3;
  const zPos = (Math.random() - 0.5) * 3;
  group.position.set(xPos, 0.5, zPos);
  group.userData = { type, spawnTime: performance.now() };
  group.name = 'powerUpPickup';
  group.scale.set(0, 0, 0);

  powerUpGroup.add(group);
  powerUpMeshInstance = group;
}

function removePowerUpPickup() {
  if (powerUpMeshInstance) {
    powerUpGroup.remove(powerUpMeshInstance);
    powerUpMeshInstance = null;
  }
}

export function checkPowerUpCollect(playerPos) {
  if (!powerUpMeshInstance || isReloading) return null;
  const pos = powerUpMeshInstance.position;
  const dist = playerPos.distanceTo(pos);
  if (dist < 0.8) {
    const type = powerUpMeshInstance.userData.type;
    removePowerUpPickup();
    if (onPowerUpCollected) onPowerUpCollected(type);
    schedulePowerUp();
    return type;
  }
  return null;
}

export function damageFlash(target) {
  const mesh = target === 'player' ? playerMesh : enemyMesh;
  if (!mesh) return;
  mesh.traverse((child) => {
    if (child.isMesh && child.material) {
      const orig = child.material.color.getHex();
      child.material.color.setHex(0xffffff);
      setTimeout(() => child.material.color.setHex(orig), 120);
    }
  });
}

const POWERUP_COLORS = { shield: 0x60A5FA, crystal: 0xFBBF24, double_damage: 0xEF4444 };

export function spawnPowerUpMesh(type) {
  removePowerUpMesh();
  const color = POWERUP_COLORS[type] || 0x8B5CF6;
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.9 });
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), mat);
  crystal.scale.set(1, 1.5, 1);
  group.add(crystal);
  const ringMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.025, 6, 24), ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  const ring2 = ring.clone();
  ring2.rotation.x = 0; ring2.rotation.y = Math.PI / 4;
  group.add(ring2);
  group.position.set(0, 0.6, 0);
  group.userData = { type, spawnTime: performance.now() };
  powerUpGroup.add(group);
}

export function removePowerUpMesh() {
  while (powerUpGroup.children.length) {
    const c = powerUpGroup.children[0];
    if (c.name === 'powerUpPickup') { powerUpGroup.remove(c); powerUpMeshInstance = null; continue; }
    powerUpGroup.remove(c);
  }
}

function onResize() {
  if (!renderer || !camera) return;
  const c = renderer.domElement.parentElement;
  if (!c) return;
  camera.aspect = c.clientWidth / c.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(c.clientWidth, c.clientHeight);
}

let cameraAngle = 0;
let shakeOffsetX = 0, shakeOffsetY = 0;

function startAnimLoop() {
  function loop() {
    animFrameId = requestAnimationFrame(loop);
    cameraAngle += 0.005;

    if (playerGroup.children.length) {
      playerGroup.children[0].position.y = Math.sin(cameraAngle * 3) * 0.02;
      playerGroup.children[0].rotation.y = Math.sin(cameraAngle) * 0.05;
    }
    if (enemyGroup.children.length) {
      enemyGroup.children[0].position.y = Math.sin(cameraAngle * 3 + Math.PI) * 0.02;
      enemyGroup.children[0].rotation.y = Math.sin(cameraAngle + Math.PI) * 0.05;
    }

    arenaGroup.children.forEach(child => {
      if (child.isMesh && child.geometry.type === 'TorusGeometry') {
        child.rotation.z = cameraAngle * 0.4;
      }
    });

    if (powerUpMeshInstance) {
      const pu = powerUpMeshInstance;
      pu.rotation.y += 0.03;
      pu.position.y = 0.5 + Math.sin(cameraAngle * 3) * 0.15;
      const scale = 0.8 + Math.sin(cameraAngle * 2) * 0.2;
      pu.scale.set(scale, scale, scale);
    }

    animateProjectiles();

    shakeOffsetX *= 0.85;
    shakeOffsetY *= 0.85;

    camera.position.set(6 * Math.sin(cameraAngle) + shakeOffsetX, 4.5 + shakeOffsetY, 8 * Math.cos(cameraAngle));
    camera.lookAt(0, 0.5, 0);

    renderer.render(scene, camera);
  }
  loop();
}

export function shakeCamera(intensity = 0.05, duration = 150) {
  let frames = 0;
  const maxFrames = Math.ceil(duration / 16);
  function doShake() {
    if (frames >= maxFrames) return;
    const decay = 1 - frames / maxFrames;
    shakeOffsetX += (Math.random() - 0.5) * intensity * decay;
    shakeOffsetY += (Math.random() - 0.5) * intensity * decay;
    frames++;
    requestAnimationFrame(doShake);
  }
  doShake();
}

export function cleanup() {
  stopEnemyAI(); stopPowerUpSpawning(); stopAmmoRegen();
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
  }
  scene = null; camera = null; renderer = null;
}
