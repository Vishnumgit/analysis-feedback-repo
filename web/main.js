import * as THREE from 'three';
import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ARButton }      from 'three/addons/webxr/ARButton.js';

// ── API configuration ──────────────────────────────────────────
// Vite replaces import.meta.env.VITE_API_BASE at build time.
// Falls back to localhost for plain-browser / Docker dev usage.
export const API_BASE =
  (import.meta.env?.VITE_API_BASE) ||
  'http://localhost:3000';

// ── API helpers ───────────────────────────────────────────────

/**
 * Fetch all products (with optional pagination / category filter).
 * @returns {Promise<{data: object[], pagination: object}>}
 */
export async function loadProducts({ page = 1, limit = 20, category } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (category) params.set('category', category);
  const response = await fetch(`${API_BASE}/api/products?${params}`);
  if (!response.ok) throw new Error(`loadProducts: API returned ${response.status}`);
  const products = await response.json();
  console.log('Products:', products);
  return products;
}

/**
 * Fetch a single product by QR code.
 * @param {string} qrCode
 * @returns {Promise<{data: object}>}
 */
export async function loadProductByQR(qrCode) {
  const response = await fetch(`${API_BASE}/api/qr/${encodeURIComponent(qrCode)}`);
  if (!response.ok) throw new Error(`loadProductByQR: API returned ${response.status}`);
  const product = await response.json();
  console.log('Product:', product);
  return product;
}

/**
 * Record an AR session for analytics.
 * @param {{product_id: number, platform?: string, duration?: number}} payload
 */
export async function logSession(payload) {
  await fetch(`${API_BASE}/api/analytics/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => console.warn('logSession failed:', err.message));
}

// ── DOM helpers ───────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

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

// ── Three.js setup ────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 0.01, 100
);
camera.position.set(0, 1.2, 2.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace    = THREE.SRGBColorSpace;
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.xr.enabled          = true;
$('canvas-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.5, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(3, 5, 3);
scene.add(dirLight);

// ── Model loading ─────────────────────────────────────────────
const gltfLoader = new GLTFLoader();
let currentModel  = null;

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

// ── Product card ──────────────────────────────────────────────
function showProductCard(p) {
  $('product-name').textContent   = p.product_name;
  $('product-desc').textContent   = p.description || '';
  $('product-price').textContent  = p.price ? `$${parseFloat(p.price).toFixed(2)}` : '';
  $('product-card').style.display = 'block';
}

// ── AR Button ─────────────────────────────────────────────────
async function setupARButton() {
  if (!('xr' in navigator)) return;
  const supported = await navigator.xr.isSessionSupported('immersive-ar').catch(() => false);
  if (!supported) return;
  const arBtn = ARButton.createButton(renderer, {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['dom-overlay'],
    domOverlay: { root: $('ui') },
  });
  arBtn.className = 'btn btn-ar';
  $('ui').appendChild(arBtn);
}

// ── Animation loop ────────────────────────────────────────────
renderer.setAnimationLoop(() => {
  controls.update();
  if (currentModel && !renderer.xr.isPresenting) {
    currentModel.rotation.y += 0.005;
  }
  renderer.render(scene, camera);
});

// ── Resize ────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Button ────────────────────────────────────────────────────
$('btn-load').addEventListener('click', () => {
  loadDemoModel();
  $('btn-load').textContent = 'Reload Demo';
});

// ── Entry point ───────────────────────────────────────────────
const qrCode = new URLSearchParams(location.search).get('qr');

(async () => {
  try {
    if (qrCode) {
      setLoading(true, 'Fetching product…');
      const { data } = await loadProductByQR(qrCode);
      showProductCard(data);

      setLoading(true, 'Loading 3D model…');
      await loadGLTF(data.model_url);

      // Fire-and-forget: record scan + session
      fetch(`${API_BASE}/api/qr/${encodeURIComponent(qrCode)}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_agent: navigator.userAgent }),
      }).catch(() => {});

      logSession({ product_id: data.product_id, platform: 'web' });
    } else {
      loadDemoModel();
    }
    await setupARButton();
  } catch (err) {
    showError('Failed to load model: ' + err.message);
    loadDemoModel();
  } finally {
    setLoading(false);
  }
})();
