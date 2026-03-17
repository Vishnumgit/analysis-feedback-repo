import * as THREE from 'three';
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Production API base – override via VITE_API_URL env var at build time
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  'https://analysis-feedback-repo.onrender.com';

// Helpers
const $         = (id) => document.getElementById(id);
const showError = (msg) => {
  const el = $('error-msg');
  el.textContent   = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
};
const setLoading = (visible, text = 'Loading…') => {
  $('loading').classList.toggle('hidden', !visible);
  $('loading-text').textContent = text;
};

// Parse QR code from URL: ?qr=qr_chair_001
const qrCode = new URLSearchParams(location.search).get('qr');

// ── Three.js Setup ──────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.01, 100,
);
camera.position.set(0, 1.2, 2.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace    = THREE.SRGBColorSpace;
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
$('canvas-container').appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.5, 0);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(3, 5, 3);
scene.add(dirLight);

// ── Model helpers ───────────────────────────────────────────────
const gltfLoader = new GLTFLoader();
let currentModel = null;

function loadGLTF(url) {
  return new Promise((resolve, reject) => {
    if (currentModel) { scene.remove(currentModel); currentModel = null; }
    gltfLoader.load(url, (gltf) => {
      currentModel = gltf.scene;
      const box    = new THREE.Box3().setFromObject(currentModel);
      const centre = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const s      = 1 / maxDim;
      currentModel.position.set(-centre.x * s, -centre.y * s, -centre.z * s);
      currentModel.scale.setScalar(s);
      scene.add(currentModel);
      resolve(currentModel);
    }, undefined, reject);
  });
}

function loadDemoModel() {
  if (currentModel) scene.remove(currentModel);
  const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6, roughness: 0.4, metalness: 0.3,
  });
  currentModel = new THREE.Mesh(geo, mat);
  currentModel.position.set(0, 0.25, 0);
  scene.add(currentModel);
}

// ── Product card ────────────────────────────────────────────────
function showProductCard(p) {
  $('product-name').textContent   = p.product_name;
  $('product-desc').textContent   = p.description || '';
  $('product-price').textContent  = p.price ? `$${parseFloat(p.price).toFixed(2)}` : '';
  $('product-card').style.display = 'block';
}

// ── API calls ───────────────────────────────────────────────────
async function fetchProduct(code) {
  const res = await fetch(`${API_BASE}/api/qr/${encodeURIComponent(code)}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const { data } = await res.json();
  return data;
}

function recordScan(code) {
  fetch(`${API_BASE}/api/qr/${encodeURIComponent(code)}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_agent: navigator.userAgent }),
  }).catch(() => {});
}

// ── Animation loop ───────────────────────────────────────────────
renderer.setAnimationLoop(() => {
  controls.update();
  if (currentModel) currentModel.rotation.y += 0.005;
  renderer.render(scene, camera);
});

// ── Resize ───────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Button ────────────────────────────────────────────────────────
$('btn-load').addEventListener('click', () => {
  loadDemoModel();
  $('btn-load').textContent = 'Reload Demo';
});

// ── Entry point ───────────────────────────────────────────────────
(async () => {
  try {
    if (qrCode) {
      setLoading(true, 'Fetching product…');
      const product = await fetchProduct(qrCode);
      showProductCard(product);

      setLoading(true, 'Loading 3D model…');
      await loadGLTF(product.model_url);
      recordScan(qrCode);
    } else {
      loadDemoModel();
    }
  } catch (err) {
    showError('Failed to load model: ' + err.message);
    loadDemoModel();
  } finally {
    setLoading(false);
  }
})();
