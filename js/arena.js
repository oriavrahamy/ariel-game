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
let onPlayerShootCb = null, onEnemyHitCb = null, onPlayerHitCb = null;
let onAmmoEmptyCb = null;
let isReloading = false;
let playerAmmo = 6, maxAmmo = 6;
let enemyFireInterval = 2000;
let containerEl = null;

export function setArenaCallbacks(cb) {
  onPlayerShootCb = cb.onPlayerShoot || null;
  onEnemyHitCb = cb.onEnemyHit || null;
  onPlayerHitCb = cb.onPlayerHit || null;
  onAmmoEmptyCb = cb.onAmmoEmpty || null;
}

export function setReloading(v) { isReloading = v; }

export function setPlayerAmmo(ammo) {
  playerAmmo = ammo;
  const el = document.getElementById('ammo-display');
  if (el) el.textContent = '🔫 ' + ammo + '/' + maxAmmo;
}

export function setMaxAmmo(v) {
  maxAmmo = v;
  document.getElementById('ammo-display') && (document.getElementById('ammo-display').textContent = '🔫 ' + playerAmmo + '/' + maxAmmo);
}

const COLORS = {
  floorA: 0x4C1D95,
  floorB: 0x6D28D9,
  floorBorder: 0x2D1B69,
  wall: 0x1A0D3B,
  glow: 0x8B5CF6
};

export function initArena(container) {
  const w = Math.max(container.clientWidth, 1);
  const h = Math.max(container.clientHeight, 1);

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

  setupLights();
  buildArena();

  scene.add(arenaGroup);
  scene.add(playerGroup);
  scene.add(enemyGroup);
  scene.add(powerUpGroup);

  containerEl = container;
  container.style.cursor = 'crosshair';
  container.addEventListener('click', onCanvasClick);

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
  const arenaSize = 7;
  const tileSize = 1;
  const half = arenaSize / 2;

  const matA = new THREE.MeshStandardMaterial({ color: COLORS.floorA, roughness: 0.3, metalness: 0.15 });
  const matB = new THREE.MeshStandardMaterial({ color: COLORS.floorB, roughness: 0.3, metalness: 0.15 });

  for (let x = -half; x < half; x++) {
    for (let z = -half; z < half; z++) {
      const isEven = (Math.floor(x) + Math.floor(z)) % 2 === 0;
      const mat = isEven ? matA : matB;
      const tile = new THREE.Mesh(new THREE.BoxGeometry(tileSize * 0.92, 0.08, tileSize * 0.92), mat);
      tile.position.set(x + 0.5, -0.04, z + 0.5);
      tile.receiveShadow = true;
      arenaGroup.add(tile);
    }
  }

  const borderMat = new THREE.MeshStandardMaterial({ color: COLORS.floorBorder, roughness: 0.5, metalness: 0.3 });
  for (let i = -half - 0.5; i <= half - 0.5; i++) {
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(1, 0.12, 0.15), borderMat);
    bar1.position.set(i, 0, -half - 0.45);
    arenaGroup.add(bar1);

    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(1, 0.12, 0.15), borderMat);
    bar2.position.set(i, 0, half - 0.55);
    arenaGroup.add(bar2);

    const bar3 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 1), borderMat);
    bar3.position.set(-half - 0.45, 0, i);
    arenaGroup.add(bar3);

    const bar4 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 1), borderMat);
    bar4.position.set(half - 0.55, 0, i);
    arenaGroup.add(bar4);
  }

  const glowMat = new THREE.MeshStandardMaterial({ color: COLORS.glow, emissive: COLORS.glow, emissiveIntensity: 0.3, roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.4 });

  const glowRings = [];
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5 + i * 0.7, 0.03, 8, 32), glowMat.clone());
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    ring.material.opacity = 0.15 + i * 0.05;
    arenaGroup.add(ring);
    glowRings.push(ring);
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

  const footGeom = new THREE.BoxGeometry(0.28, 0.15, 0.4);
  const lFoot = new THREE.Mesh(footGeom, darkMat);
  lFoot.position.set(-0.2, 0.075, 0.05);
  lFoot.castShadow = true;
  group.add(lFoot);

  const rFoot = new THREE.Mesh(footGeom.clone(), darkMat);
  rFoot.position.set(0.2, 0.075, -0.05);
  rFoot.castShadow = true;
  group.add(rFoot);

  const legGeom = new THREE.BoxGeometry(0.22, 0.35, 0.3);
  const lLeg = new THREE.Mesh(legGeom, darkMat);
  lLeg.position.set(-0.2, 0.325, 0.05);
  group.add(lLeg);

  const rLeg = new THREE.Mesh(legGeom.clone(), darkMat);
  rLeg.position.set(0.2, 0.325, -0.05);
  group.add(rLeg);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.45), bodyMat);
  body.position.set(0, 0.775, 0);
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), headMat);
  head.position.set(0, 1.34, 0);
  head.castShadow = true;
  group.add(head);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, emissive: 0xffffff, emissiveIntensity: 0.1 });
  const eyeGeom = new THREE.SphereGeometry(0.07, 6, 6);
  const lEye = new THREE.Mesh(eyeGeom, eyeMat);
  lEye.position.set(-0.13, 1.4, 0.25);
  group.add(lEye);
  const rEye = new THREE.Mesh(eyeGeom.clone(), eyeMat);
  rEye.position.set(0.13, 1.4, 0.25);
  group.add(rEye);

  const armGeom = new THREE.BoxGeometry(0.16, 0.45, 0.2);
  const lArm = new THREE.Mesh(armGeom, bodyMat);
  lArm.position.set(-0.45, 0.8, 0);
  lArm.castShadow = true;
  group.add(lArm);
  lArm.userData.isLeftArm = true;

  const rArm = new THREE.Mesh(armGeom.clone(), bodyMat);
  rArm.position.set(0.45, 0.8, 0);
  rArm.castShadow = true;
  group.add(rArm);
  rArm.userData.isRightArm = true;

  const beltMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.3, metalness: 0.6 });
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.35), beltMat);
  belt.position.set(0, 0.55, 0);
  group.add(belt);

  const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x2D1B69, roughness: 0.3, metalness: 0.3 });
  const shoulderGeom = new THREE.SphereGeometry(0.12, 6, 6);
  const lShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
  lShoulder.position.set(-0.4, 1.0, 0);
  group.add(lShoulder);
  const rShoulder = new THREE.Mesh(shoulderGeom.clone(), shoulderMat);
  rShoulder.position.set(0.4, 1.0, 0);
  group.add(rShoulder);

  const crownMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.2, metalness: 0.8 });
  const crown = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.1), crownMat);
  crown.position.set(0, 1.6, 0);
  group.add(crown);

  if (!isPlayer) {
    group.scale.x = -1;
  }

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
  playerMesh = null;
  enemyMesh = null;
}

export function attackAnimation(target, callback) {
  if (isAnimating) return;
  isAnimating = true;

  const attacker = target === 'enemy' ? playerGroup : enemyGroup;
  const targetGroup = target === 'enemy' ? enemyGroup : playerGroup;
  const dir = target === 'enemy' ? 1 : -1;

  const startPos = attacker.position.clone();
  const lungePos = startPos.clone().add(new THREE.Vector3(dir * 0.8, 0, 0));
  const duration = 300;
  const startTime = performance.now();

  function animateLunge(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);

    if (progress < 0.5) {
      const t = progress / 0.5;
      const ease = t * t * (3 - 2 * t);
      attacker.position.lerpVectors(startPos, lungePos, ease);
    } else {
      const t = (progress - 0.5) / 0.5;
      const ease = t * t * (3 - 2 * t);
      attacker.position.lerpVectors(lungePos, startPos, ease);
    }

    if (target === 'enemy') {
      targetGroup.position.x = Math.sin(progress * Math.PI * 4) * 0.05 * (1 - progress);
    }

    if (progress < 1) {
      requestAnimationFrame(animateLunge);
    } else {
      attacker.position.copy(startPos);
      targetGroup.position.x = 0;
      isAnimating = false;
      if (callback) callback();
    }
  }

  requestAnimationFrame(animateLunge);
}

export function damageFlash(target) {
  const mesh = target === 'player' ? playerMesh : enemyMesh;
  if (!mesh) return;

  mesh.traverse((child) => {
    if (child.isMesh && child.material) {
      const origColor = child.material.color.getHex();
      child.material.color.setHex(0xffffff);
      setTimeout(() => {
        child.material.color.setHex(origColor);
      }, 150);
    }
  });
}

const POWERUP_COLORS = {
  shield: 0x60A5FA,
  crystal: 0xFBBF24,
  double_damage: 0xEF4444
};

export function spawnPowerUpMesh(type) {
  removePowerUpMesh();
  const color = POWERUP_COLORS[type] || 0x8B5CF6;
  const group = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.6,
    roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.9
  });
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), mat);
  crystal.scale.set(1, 1.5, 1);
  group.add(crystal);

  const ringMat = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.3,
    transparent: true, opacity: 0.5, side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.025, 6, 24), ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const ring2 = ring.clone();
  ring2.rotation.x = 0;
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);

  group.position.set(0, 0.6, 0);
  group.userData = { type, spawnTime: performance.now() };
  powerUpGroup.add(group);
}

export function removePowerUpMesh() {
  while (powerUpGroup.children.length) {
    powerUpGroup.remove(powerUpGroup.children[0]);
  }
}

function onCanvasClick() {
  if (isReloading || !onPlayerShootCb) return;
  if (playerAmmo <= 0) {
    if (onAmmoEmptyCb) onAmmoEmptyCb();
    return;
  }
  onPlayerShootCb();
  playerAmmo = Math.max(0, playerAmmo - 1);
  setPlayerAmmo(playerAmmo);
  const from = new THREE.Vector3(-1.8, 0.8, 0);
  const to = new THREE.Vector3(1.8, 0.8, 0);
  fireBullet(from, to, () => {
    if (onEnemyHitCb) onEnemyHitCb(1);
  });
  if (playerAmmo <= 0 && onAmmoEmptyCb) setTimeout(() => onAmmoEmptyCb(), 400);
}

function bulletMat() {
  return new THREE.MeshStandardMaterial({
    color: 0xFFD600, emissive: 0xFFD600, emissiveIntensity: 1.5,
    transparent: true, opacity: 1
  });
}
function enemyBulletMat() {
  return new THREE.MeshStandardMaterial({
    color: 0xFF1744, emissive: 0xFF1744, emissiveIntensity: 1.5,
    transparent: true, opacity: 1
  });
}

function fireBullet(from, to, onHit) {
  const isEnemy = from.x > 0;
  const mat = isEnemy ? enemyBulletMat() : bulletMat();
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), mat);
  mesh.position.copy(from);
  scene.add(mesh);

  const startTime = performance.now();
  const duration = 300;
  const startPos = from.clone();
  const endPos = to.clone();

  projectiles.push({ mesh, startPos, endPos, startTime, duration, onHit, hit: false });
}

export function startEnemyAI() {
  stopEnemyAI();
  function scheduleShot() {
    if (isReloading || !onPlayerHitCb) {
      enemyTimer = setTimeout(scheduleShot, 500);
      return;
    }
    const delay = 1500 + Math.random() * 2000;
    enemyTimer = setTimeout(() => {
      if (isReloading) { scheduleShot(); return; }
      const from = new THREE.Vector3(1.8, 0.8, 0);
      const to = new THREE.Vector3(-1.8, 0.8, 0);
      fireBullet(from, to, () => {
        if (onPlayerHitCb) onPlayerHitCb(1);
      });
      scheduleShot();
    }, delay);
  }
  scheduleShot();
}

export function stopEnemyAI() {
  if (enemyTimer) { clearTimeout(enemyTimer); enemyTimer = null; }
}

function animateProjectiles() {
  const now = performance.now();
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    const elapsed = now - p.startTime;
    const t = Math.min(elapsed / p.duration, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    p.mesh.position.lerpVectors(p.startPos, p.endPos, eased);
    const scale = 1 + Math.sin(t * Math.PI * 6) * 0.3;
    p.mesh.scale.set(scale, scale, scale);
    p.mesh.material.opacity = 1 - t * 0.3;
    if (t >= 1) {
      if (!p.hit) {
        p.hit = true;
        if (p.onHit) p.onHit();
      }
      scene.remove(p.mesh);
      p.mesh.material.dispose();
      p.mesh.geometry.dispose();
      projectiles.splice(i, 1);
    }
  }
}

function onResize() {
  if (!renderer || !camera) return;
  const container = renderer.domElement.parentElement;
  if (!container) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
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

    arenaGroup.children.forEach((child) => {
      if (child.isMesh && child.geometry.type === 'TorusGeometry') {
        child.rotation.z = cameraAngle * 0.4 + (child.position.x * 0.5);
      }
    });

    if (powerUpGroup.children.length) {
      const pu = powerUpGroup.children[0];
      pu.rotation.y += 0.025;
      pu.rotation.x = Math.sin(cameraAngle * 2) * 0.1;
      pu.position.y = 0.6 + Math.sin(cameraAngle * 4) * 0.15;
      pu.children.forEach(c => {
        if (c.isMesh && c.geometry.type === 'TorusGeometry') {
          c.rotation.z = cameraAngle * 0.5;
        }
      });
    }

    animateProjectiles();

    shakeOffsetX *= 0.85;
    shakeOffsetY *= 0.85;

    const baseX = 6 * Math.sin(cameraAngle);
    const baseZ = 8 * Math.cos(cameraAngle);
    camera.position.set(baseX + shakeOffsetX, 4.5 + shakeOffsetY, baseZ);
    camera.lookAt(0, 0.5, 0);

    renderer.render(scene, camera);
  }

  loop();
}

export function shakeCamera(intensity = 0.05, duration = 200) {
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
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  }
  scene = null;
  camera = null;
  renderer = null;
}
