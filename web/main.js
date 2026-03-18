import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = (id) => document.getElementById(id);

function setLoading(visible, text = 'Loading…') {
  $('loading').classList.toggle('hidden', !visible);
  $('loading-text').textContent = text;
}

function showError(msg) {
  const el = $('error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => (el.style.display = 'none'), 5000);
}

function parseItemSlug() {
  // Hash route: #/i/<slug>
  const h = (location.hash || '').replace(/^#/, '');
  const parts = h.split('/').filter(Boolean);
  if (parts.length >= 2 && parts[0] === 'i') return parts[1];

  // Back-compat: ?qr=<slug>
  const qp = new URLSearchParams(location.search);
  return qp.get('qr');
}

async function loadItems() {
  const res = await fetch('/items.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load items.json (${res.status})`);
  return await res.json();
}

function money(price) {
  if (price == null || price === '') return '';
  const n = Number(price);
  return Number.isFinite(n) ? `₹${n.toFixed(0)}` : String(price);
}

function showCard(item) {
  $('name').textContent = item.name ?? item.slug;
  $('desc').textContent = item.description ?? '';
  $('price').textContent = item.price != null ? money(item.price) : '';
  $('card').style.display = 'block';
}

function showNotFound(slug) {
  $('card').style.display = 'block';
  $('name').textContent = 'Item not found';
  $('desc').textContent = slug ? `No menu item for slug: ${slug}` : 'Scan a QR code to open an item.';
  $('price').textContent = '';
}

function makePlaceholder(type) {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, roughness: 0.55, metalness: 0.1 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.05 });

  if (type === 'plate') {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.08, 64), baseMat);
    plate.position.y = 0.04;
    group.add(plate);

    const food = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), accentMat);
    food.position.y = 0.18;
    food.scale.set(1.4, 0.65, 1.2);
    group.add(food);
  } else if (type === 'bowl') {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.35, 64, 1, true), baseMat);
    bowl.position.y = 0.175;
    group.add(bowl);

    const soup = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.05, 48), accentMat);
    soup.position.y = 0.33;
    group.add(soup);
  } else if (type === 'cup') {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.45, 48), baseMat);
    cup.position.y = 0.225;
    group.add(cup);

    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.28, 0.05, 48), accentMat);
    top.position.y = 0.44;
    group.add(top);
  } else {
    const item = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.35, 48), baseMat);
    item.position.y = 0.175;
    group.add(item);

    const cap = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.06, 16, 64), accentMat);
    cap.rotation.x = Math.PI / 2;
    cap.position.y = 0.33;
    group.add(cap);
  }

  return group;
}

// --- Three.js scene setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0f10);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 50);
camera.position.set(0, 1.1, 2.4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

$('canvas-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.25, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.65));
const key = new THREE.DirectionalLight(0xffffff, 1.5);
key.position.set(3, 5, 2);
scene.add(key);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(3, 64),
  new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.95, metalness: 0.0 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

let model = null;

function setModel(obj) {
  if (model) scene.remove(model);
  model = obj;
  scene.add(model);
}

renderer.setAnimationLoop(() => {
  controls.update();
  if (model) model.rotation.y += 0.004;
  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

async function renderFromRoute() {
  const slug = parseItemSlug();
  setLoading(true, 'Loading menu item…');
  try {
    const items = await loadItems();
    const item = items.find((x) => x.slug === slug);

    if (!slug) {
      showNotFound('');
      setModel(makePlaceholder('plate'));
      return;
    }
    if (!item) {
      showNotFound(slug);
      setModel(makePlaceholder('cylinder'));
      return;
    }

    showCard(item);
    setModel(makePlaceholder(item.type || 'plate'));
  } catch (e) {
    showError(e.message || String(e));
    showNotFound(slug || '');
    setModel(makePlaceholder('cylinder'));
  } finally {
    setLoading(false);
  }
}

window.addEventListener('hashchange', renderFromRoute);
renderFromRoute();
