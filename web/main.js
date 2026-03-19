import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://analysis-feedback-repo.onrender.com').replace(
  /\/+$/,
  ''
);

const apiRequest = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers =
    options.body !== undefined
      ? { 'Content-Type': 'application/json', ...(options.headers || {}) }
      : options.headers || {};

  return fetch(url, { ...options, headers });
};

const Api = {
  async fetchProductByQr(qrCode) {
    const res = await apiRequest(`/api/qr/${encodeURIComponent(qrCode)}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  },

  async recordScan(qrCode, payload = {}) {
    try {
      await apiRequest(`/api/qr/${encodeURIComponent(qrCode)}/scan`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (_err) {
      // Non-blocking
    }
  },

  async logSession(productId, payload = {}) {
    try {
      await apiRequest('/api/analytics/session', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, ...payload }),
      });
    } catch (_err) {
      // Non-blocking
    }
  },
};

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

function detectPlatform() {
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return 'web';
}

function mapProductToCard(product, fallbackSlug) {
  return {
    slug: fallbackSlug,
    name: product?.product_name || product?.name || fallbackSlug,
    description: product?.description || '',
    price: product?.price ?? product?.price_inr ?? '',
    type: product?.type || product?.category || 'plate',
  };
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

// --- Shared profile curves for LatheGeometry ---
const BOWL_PROFILE = [
  new THREE.Vector2(0.00, 0.00),
  new THREE.Vector2(0.12, 0.02),
  new THREE.Vector2(0.35, 0.08),
  new THREE.Vector2(0.48, 0.25),
  new THREE.Vector2(0.54, 0.43),
];

const MUG_PROFILE = [
  new THREE.Vector2(0.00, 0.00),
  new THREE.Vector2(0.28, 0.01),
  new THREE.Vector2(0.28, 0.02),
  new THREE.Vector2(0.30, 0.42),
  new THREE.Vector2(0.33, 0.44),
];

// Helper: create a MeshStandardMaterial
function mat(color, roughness = 0.6, metalness = 0.05) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

// Helper: create a bowl mesh via LatheGeometry (DoubleSide so interior is visible)
function lathedBowl(profile, color) {
  return new THREE.Mesh(
    new THREE.LatheGeometry(profile, 48),
    new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide })
  );
}

// --- Item-specific 3D model builders ---

function makeDosa() {
  const g = new THREE.Group();
  // Plate
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.70, 0.65, 0.04, 64), mat(0xe8d5b7, 0.7));
  plate.position.y = 0.02;
  g.add(plate);
  // Dosa roll (cylinder lying on its side)
  const dosa = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.60, 32), mat(0xc8a040, 0.75));
  dosa.rotation.z = Math.PI / 2;
  dosa.position.set(0, 0.14, 0);
  g.add(dosa);
  // Dosa roll end caps
  const capMat = mat(0xb08030, 0.75);
  [-0.31, 0.31].forEach((x) => {
    const cap = new THREE.Mesh(new THREE.CircleGeometry(0.10, 24), capMat);
    cap.rotation.y = Math.PI / 2;
    cap.position.set(x, 0.14, 0);
    g.add(cap);
  });
  // Small chutney cup
  const chutney = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.08, 32), mat(0x558b2f, 0.6));
  chutney.position.set(0.44, 0.08, 0.28);
  g.add(chutney);
  const chutneyTop = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.01, 32), mat(0x76a830, 0.3));
  chutneyTop.position.set(0.44, 0.12, 0.28);
  g.add(chutneyTop);
  return g;
}

function makeIdliSambar() {
  const g = new THREE.Group();
  // Plate
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.60, 0.04, 64), mat(0xf5f0e8, 0.6));
  plate.position.y = 0.02;
  g.add(plate);
  // Idlis (flattened spheres)
  const idliMat = mat(0xf8f4ec, 0.65);
  [[-0.22, -0.10], [0.22, -0.10], [0, 0.20]].forEach(([x, z]) => {
    const idli = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), idliMat);
    idli.scale.y = 0.45;
    idli.position.set(x, 0.10, z);
    g.add(idli);
  });
  // Sambar bowl
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.10, 32), mat(0x8b4513, 0.6));
  bowl.position.set(0.40, 0.09, 0.30);
  g.add(bowl);
  const sambar = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.01, 32), mat(0xc8601a, 0.3));
  sambar.position.set(0.40, 0.14, 0.30);
  g.add(sambar);
  return g;
}

function makeSamosa() {
  const g = new THREE.Group();
  // Plate
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.60, 0.55, 0.04, 64), mat(0xe0d0b0, 0.7));
  plate.position.y = 0.02;
  g.add(plate);
  // Samosas (3-sided cones like a triangular pastry)
  const samosaMat = mat(0xc8922a, 0.82);
  [[-0.20, 0], [0.20, Math.PI / 3]].forEach(([xOff, rotY]) => {
    const samosa = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 3), samosaMat);
    samosa.rotation.y = rotY;
    samosa.position.set(xOff, 0.24, 0);
    g.add(samosa);
  });
  // Green chutney dip
  const dip = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.06, 24), mat(0x2e7d32, 0.55));
  dip.position.set(0, 0.06, 0.36);
  g.add(dip);
  const dipTop = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.01, 24), mat(0x4caf50, 0.3));
  dipTop.position.set(0, 0.09, 0.36);
  g.add(dipTop);
  return g;
}

function makeBiryani(isChicken) {
  const g = new THREE.Group();
  // Ceramic bowl
  g.add(lathedBowl(BOWL_PROFILE, 0xf0ebe0));
  // Rice mound
  const riceColor = isChicken ? 0xe8b048 : 0xdcc060;
  const rice = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), mat(riceColor, 0.82));
  rice.scale.set(1.0, 0.58, 1.0);
  rice.position.y = 0.36;
  g.add(rice);
  // Garnish bits (herbs/peas)
  const garnishColor = isChicken ? 0x8b6914 : 0x4caf50;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const bit = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), mat(garnishColor, 0.75));
    bit.position.set(Math.cos(angle) * 0.22, 0.46, Math.sin(angle) * 0.22);
    g.add(bit);
  }
  // Chicken pieces for chicken biryani
  if (isChicken) {
    const chickenMat = mat(0x6d4c1a, 0.9);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + 0.5;
      const piece = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), chickenMat);
      piece.scale.set(1.3, 0.8, 0.9);
      piece.position.set(Math.cos(angle) * 0.18, 0.43, Math.sin(angle) * 0.18);
      g.add(piece);
    }
  }
  return g;
}

function makeFriedRice() {
  const g = new THREE.Group();
  // Bowl
  g.add(lathedBowl(BOWL_PROFILE, 0xf5f0e8));
  // Rice mound
  const rice = new THREE.Mesh(new THREE.SphereGeometry(0.40, 32, 24), mat(0xc8a840, 0.82));
  rice.scale.set(1.0, 0.55, 1.0);
  rice.position.y = 0.35;
  g.add(rice);
  // Vegetable pieces (small coloured cubes)
  [0xe53935, 0x43a047, 0xfdd835].forEach((c, i) => {
    const angle = (i / 3) * Math.PI * 2;
    const veg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.06), mat(c, 0.8));
    veg.position.set(Math.cos(angle) * 0.20, 0.44, Math.sin(angle) * 0.20);
    g.add(veg);
  });
  return g;
}

function makePaneerButterMasala() {
  const g = new THREE.Group();
  // Bowl
  g.add(lathedBowl(BOWL_PROFILE, 0xc8a87a));
  // Orange-red gravy surface
  const gravy = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.04, 48), mat(0xd4501a, 0.35));
  gravy.position.y = 0.28;
  g.add(gravy);
  // Paneer cubes
  const paneerMat = mat(0xf5ede0, 0.7);
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.10), paneerMat);
    cube.position.set(Math.cos(angle) * 0.22, 0.34, Math.sin(angle) * 0.22);
    cube.rotation.y = angle;
    g.add(cube);
  }
  // Green herb garnish
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const bit = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), mat(0x388e3c, 0.8));
    bit.position.set(Math.cos(angle) * 0.15, 0.32, Math.sin(angle) * 0.15);
    g.add(bit);
  }
  return g;
}

function makeDrink(isCoffee) {
  const g = new THREE.Group();
  const mugColor = isCoffee ? 0x5d4037 : 0x8d6e63;
  // Mug body
  const mug = new THREE.Mesh(
    new THREE.LatheGeometry(MUG_PROFILE, 48),
    new THREE.MeshStandardMaterial({ color: mugColor, roughness: 0.5, metalness: 0.1, side: THREE.DoubleSide })
  );
  g.add(mug);
  // Handle (half-torus on the side)
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.03, 12, 32, Math.PI),
    mat(mugColor, 0.5, 0.1)
  );
  handle.rotation.y = Math.PI / 2;
  handle.position.set(0.42, 0.22, 0);
  g.add(handle);
  // Liquid surface
  const liquidColor = isCoffee ? 0x3e2723 : 0xc8822a;
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 48), mat(liquidColor, 0.3));
  liquid.position.y = 0.38;
  g.add(liquid);
  // Saucer
  const saucerColor = isCoffee ? 0x6d4c41 : 0x9e8070;
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.48, 0.03, 64), mat(saucerColor, 0.6));
  saucer.position.y = -0.02;
  g.add(saucer);
  return g;
}

function makeChai() { return makeDrink(false); }
function makeCoffee() { return makeDrink(true); }

function makeGulabJamun() {
  const g = new THREE.Group();
  // Shallow dish
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.50, 0.12, 64), mat(0xd4b896, 0.55));
  dish.position.y = 0.06;
  g.add(dish);
  // Sugar syrup surface (golden)
  const syrup = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.50, 0.02, 48), mat(0xe8c060, 0.25));
  syrup.position.y = 0.13;
  g.add(syrup);
  // Gulab jamun balls (dark brown spheres)
  const ballMat = mat(0x6d3010, 0.7);
  [[0, 0], [0.25, 0.18], [-0.22, 0.20], [0.15, -0.25], [-0.18, -0.18]].forEach(([x, z]) => {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), ballMat);
    ball.position.set(x, 0.22, z);
    g.add(ball);
  });
  return g;
}

// Dispatch to the item-specific builder by slug
function buildItemModel(slug) {
  switch (slug) {
    case 'masala-dosa': return makeDosa();
    case 'idli-sambar': return makeIdliSambar();
    case 'samosa': return makeSamosa();
    case 'veg-biryani': return makeBiryani(false);
    case 'chicken-biryani': return makeBiryani(true);
    case 'veg-fried-rice': return makeFriedRice();
    case 'paneer-butter-masala': return makePaneerButterMasala();
    case 'chai': return makeChai();
    case 'coffee': return makeCoffee();
    case 'gulab-jamun': return makeGulabJamun();
    default: return null;
  }
}

function makePlaceholder(slug, type) {
  if (slug) {
    const specific = buildItemModel(slug);
    if (specific) return specific;
  }

  // Fallback generic type-based models
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
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(BOWL_PROFILE, 48),
      new THREE.MeshStandardMaterial({ color: 0x2dd4bf, roughness: 0.55, metalness: 0.1, side: THREE.DoubleSide }));
    group.add(bowl);

    const soup = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.04, 48), accentMat);
    soup.position.y = 0.28;
    group.add(soup);
  } else if (type === 'cup') {
    const cup = new THREE.Mesh(new THREE.LatheGeometry(MUG_PROFILE, 48),
      new THREE.MeshStandardMaterial({ color: 0x2dd4bf, roughness: 0.55, metalness: 0.1, side: THREE.DoubleSide }));
    group.add(cup);

    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 48), accentMat);
    top.position.y = 0.40;
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
    if (!slug) {
      showNotFound('');
      setModel(makePlaceholder(null, 'plate'));
      return;
    }

    let product = null;
    try {
      product = await Api.fetchProductByQr(slug);
    } catch (apiErr) {
      showError(apiErr.message || 'API unavailable, using local menu');
    }

    if (product) {
      const item = mapProductToCard(product, slug);
      showCard(item);
      setModel(makePlaceholder(item.slug, item.type || 'plate'));
      Api.recordScan(slug, { user_agent: navigator.userAgent });
      Api.logSession(product.product_id, {
        platform: detectPlatform(),
        duration: 0,
        user_agent: navigator.userAgent,
      });
      return;
    }

    const items = await loadItems();
    const fallback = items.find((x) => x.slug === slug);
    if (!fallback) {
      showNotFound(slug);
      setModel(makePlaceholder(null, 'cylinder'));
      return;
    }

    showCard(fallback);
    setModel(makePlaceholder(fallback.slug, fallback.type || 'plate'));
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
