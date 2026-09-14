import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FloorId, FloorData, TelemetryPacket } from '../types';
import { 
  RotateCcw, 
  Maximize2, 
  Layers, 
  Eye, 
  Compass, 
  Radio, 
  Cpu, 
  Flame, 
  Database,
  ArrowUp,
  Activity,
  Maximize,
  Minimize,
  Sparkles,
  Building2,
  Sliders
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ThreeSkyscraperProps {
  floors: FloorData[];
  selectedFloorId: FloorId | null;
  onSelectFloor: (id: FloorId) => void;
  blueprintMode: boolean;
  activePackets: TelemetryPacket[];
  shiftActive: boolean;
  timeOfDay?: 'day' | 'sunset' | 'night';
  themeMode?: 'light' | 'dark';
}

/**
 * Creates high-resolution crisp illuminated corporate architectural signage textures
 * mimicking the bold, prestigious headquarters signage of Morgan Stanley (1585 Broadway).
 */
const createCorporateSignTexture = (
  mainText: string,
  subText: string = '',
  blueprintMode: boolean,
  timeOfDay: string = 'sunset',
  aspectRatio: number = 4
): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = Math.round(1024 / aspectRatio);
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;

  // Architectural Signboard Backing Plate: Brushed obsidian titanium
  ctx.fillStyle = blueprintMode ? '#021827' : '#060913';
  ctx.fillRect(0, 0, w, h);

  // Brushed architectural metallic gradient highlight
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, blueprintMode ? 'rgba(6,182,212,0.28)' : 'rgba(255,255,255,0.14)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0)');
  grad.addColorStop(1, blueprintMode ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.06)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Outer Architectural Bezel Trim
  const trimColor = blueprintMode 
    ? '#06b6d4' 
    : timeOfDay === 'sunset' 
    ? '#f59e0b' 
    : timeOfDay === 'day' 
    ? '#38bdf8' 
    : '#818cf8';
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  // Inner Neon Accent Hairline
  ctx.strokeStyle = blueprintMode ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(18, 18, w - 36, h - 36);

  // Architectural Corner Mounting Rivets
  const drawRivet = (rx: number, ry: number) => {
    ctx.fillStyle = blueprintMode ? '#22d3ee' : timeOfDay === 'sunset' ? '#fbbf24' : '#93c5fd';
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fill();
  };
  drawRivet(28, 28);
  drawRivet(w - 28, 28);
  drawRivet(w - 28, h - 28);
  drawRivet(28, h - 28);

  // Morgan Stanley Signature Corporate Typography Setup
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Luminous Corporate Letter Glow
  ctx.shadowColor = blueprintMode 
    ? '#06b6d4' 
    : timeOfDay === 'sunset' 
    ? '#fbbf24' 
    : timeOfDay === 'day' 
    ? '#93c5fd' 
    : '#a5b4fc';
  ctx.shadowBlur = blueprintMode ? 32 : 24;

  // Main Corporate Name: "ACE & COMPANY"
  const fontSize = subText ? 76 : 92;
  ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = blueprintMode ? '#ecfeff' : '#ffffff';

  const titleY = subText ? h * 0.42 : h * 0.5;
  ctx.fillText(mainText, w / 2, titleY);

  // Subtitle / Division (e.g. GLOBAL INVESTMENT MANAGEMENT)
  if (subText) {
    ctx.shadowBlur = 8;
    ctx.shadowColor = blueprintMode ? '#0891b2' : 'rgba(0,0,0,0.8)';
    ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.fillStyle = blueprintMode ? '#38bdf8' : timeOfDay === 'sunset' ? '#fde68a' : '#cbd5e1';
    ctx.fillText(subText, w / 2, h * 0.78);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

export const ThreeSkyscraper: React.FC<ThreeSkyscraperProps> = ({
  floors,
  selectedFloorId,
  onSelectFloor,
  blueprintMode,
  activePackets,
  shiftActive,
  timeOfDay = 'sunset',
  themeMode = 'dark',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameId = useRef<number | null>(null);

  // 3D scene elements references for dynamic animation
  const floorGroupsRef = useRef<Map<number, THREE.Group>>(new Map());
  const packetMeshesRef = useRef<THREE.Mesh[]>([]);
  const buildingRootRef = useRef<THREE.Group | null>(null);
  const beaconLightRef = useRef<THREE.PointLight | null>(null);
  const marqueeGlowRef = useRef<THREE.PointLight | null>(null);
  const reflectionLightRef = useRef<THREE.PointLight | null>(null);
  const ambientParticlesRef = useRef<THREE.Points | null>(null);

  // Interactive interaction states
  const isDraggingRef = useRef(false);
  const prevPointerPositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.22, y: -0.65 });
  const cameraZoomTargetRef = useRef(17);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Setup Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Realistic Crystal Glass vs Blueprint Environment styling
    if (blueprintMode) {
      scene.background = new THREE.Color(0x020510);
      scene.fog = new THREE.FogExp2(0x020510, 0.022);
    } else if (themeMode === 'light') {
      // Clean, bright daylight architectural atmosphere in Light Mode
      const skyBg = timeOfDay === 'sunset' ? 0xfef3c7 : timeOfDay === 'day' ? 0xf1f5f9 : 0xe2e8f0;
      scene.background = new THREE.Color(skyBg);
      scene.fog = new THREE.FogExp2(skyBg, 0.012);
    } else if (timeOfDay === 'day') {
      // Unified deep sapphire corporate atmosphere in Dark Mode (Day)
      scene.background = new THREE.Color(0x071120);
      scene.fog = new THREE.FogExp2(0x071120, 0.018);
    } else if (timeOfDay === 'sunset') {
      // Golden twilight atmosphere in Dark Mode (Sunset)
      scene.background = new THREE.Color(0x180d22);
      scene.fog = new THREE.FogExp2(0x180d22, 0.018);
    } else {
      // Deep obsidian night in Dark Mode (Night)
      scene.background = new THREE.Color(0x04060c);
      scene.fog = new THREE.FogExp2(0x04060c, 0.020);
    }

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4.5, cameraZoomTargetRef.current);
    cameraRef.current = camera;

    // 3. Renderer with high performance settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance' 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Append canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    if (blueprintMode) {
      // Tactical Cybernetic Lighting
      const ambientLight = new THREE.AmbientLight(0x0e3b43, 1.2);
      scene.add(ambientLight);

      const dirLightCyan = new THREE.DirectionalLight(0x06b6d4, 1.4);
      dirLightCyan.position.set(12, 22, 16);
      scene.add(dirLightCyan);

      const dirLightViolet = new THREE.DirectionalLight(0x8b5cf6, 0.8);
      dirLightViolet.position.set(-16, 12, -12);
      scene.add(dirLightViolet);
    } else if (timeOfDay === 'day') {
      // Crisp daylight sun & sky bounce
      const ambientLight = new THREE.AmbientLight(themeMode === 'light' ? 0xf8fafc : 0x334155, 1.3);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfffef0, 2.2);
      sunLight.position.set(18, 32, 24);
      sunLight.castShadow = true;
      scene.add(sunLight);

      const skyFill = new THREE.DirectionalLight(0x38bdf8, 0.9);
      skyFill.position.set(-18, 16, -14);
      scene.add(skyFill);

      const plazaBounce = new THREE.DirectionalLight(0xe2e8f0, 0.6);
      plazaBounce.position.set(0, -6, 12);
      scene.add(plazaBounce);
    } else if (timeOfDay === 'sunset') {
      // Golden Hour Sunset
      const ambientLight = new THREE.AmbientLight(0xfde68a, 0.85);
      scene.add(ambientLight);

      const sunsetSun = new THREE.DirectionalLight(0xf59e0b, 2.6);
      sunsetSun.position.set(24, 16, 20);
      sunsetSun.castShadow = true;
      scene.add(sunsetSun);

      const duskRim = new THREE.DirectionalLight(0xf43f5e, 1.1);
      duskRim.position.set(-20, 10, -18);
      scene.add(duskRim);

      const warmStreetBounce = new THREE.DirectionalLight(0xd97706, 0.7);
      warmStreetBounce.position.set(-10, -4, 12);
      scene.add(warmStreetBounce);
    } else {
      // Cinematic Manhattan Night Architectural Lighting
      const ambientLight = new THREE.AmbientLight(0x1e293b, 0.7);
      scene.add(ambientLight);

      // Cool moonlight key light
      const moonLight = new THREE.DirectionalLight(0x93c5fd, 1.6);
      moonLight.position.set(15, 25, 20);
      moonLight.castShadow = true;
      scene.add(moonLight);

      // Warm ground-up street bounce (New York Wall Street atmosphere)
      const streetBounce = new THREE.DirectionalLight(0xd97706, 0.65);
      streetBounce.position.set(-14, -4, 12);
      scene.add(streetBounce);

      // Subtle rear architectural rim light
      const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
      rimLight.position.set(-10, 18, -18);
      scene.add(rimLight);
    }

    // Dynamic Mouse Specular Reflection Light (Gleams across crystal glass facade on mouse hover)
    const reflectionLight = new THREE.PointLight(
      blueprintMode ? 0x06b6d4 : timeOfDay === 'sunset' ? 0xfef08a : 0xffffff,
      1.8,
      28
    );
    reflectionLight.position.set(0, 4.5, 11);
    scene.add(reflectionLight);
    reflectionLightRef.current = reflectionLight;

    // Environmental Particle FX: Ambient Data Stream Particles (Packet transmissions & atmospheric dust)
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 180;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 32;
      posArray[i + 1] = -4.0 + Math.random() * 20.0;
      posArray[i + 2] = (Math.random() - 0.5) * 26;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: blueprintMode ? 0.22 : 0.16,
      color: blueprintMode 
        ? 0x06b6d4 
        : timeOfDay === 'sunset' 
        ? 0xf59e0b 
        : timeOfDay === 'day' 
        ? 0x38bdf8 
        : 0xa78bfa,
      transparent: true,
      opacity: blueprintMode ? 0.85 : 0.55,
      blending: THREE.AdditiveBlending,
    });
    const ambientParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(ambientParticles);
    ambientParticlesRef.current = ambientParticles;

    // 5. Root Group
    const buildingRoot = new THREE.Group();
    buildingRootRef.current = buildingRoot;
    scene.add(buildingRoot);

    // 6. Ground Plinth & Architectural Grid
    if (blueprintMode) {
      const gridHelper = new THREE.GridHelper(34, 34, 0x06b6d4, 0x0e3b43);
      gridHelper.position.y = -4.5;
      scene.add(gridHelper);
    } else {
      // Polished plaza plinth adapted to time of day
      const plinthColor = timeOfDay === 'day'
        ? (themeMode === 'light' ? 0xe2e8f0 : 0x1e293b)
        : timeOfDay === 'sunset'
        ? (themeMode === 'light' ? 0xfef3c7 : 0x1c1022)
        : 0x0a0f1d;

      const plinthGeo = new THREE.BoxGeometry(22, 0.4, 22);
      const plinthMat = new THREE.MeshStandardMaterial({
        color: plinthColor,
        roughness: 0.35,
        metalness: timeOfDay === 'day' ? 0.3 : 0.8,
      });
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      plinth.position.y = -4.7;
      scene.add(plinth);

      // Architectural plaza grid lines
      const gridColorA = timeOfDay === 'day' ? 0x94a3b8 : 0x334155;
      const gridColorB = timeOfDay === 'day' ? 0xcbd5e1 : 0x1e293b;
      const plazaGrid = new THREE.GridHelper(26, 26, gridColorA, gridColorB);
      plazaGrid.position.y = -4.48;
      scene.add(plazaGrid);

      // Distant NYC Skyline Silhouettes in the background
      const skylineGroup = new THREE.Group();
      const towerConfigs = [
        { x: -16, z: -20, w: 4, h: 22, d: 4 },
        { x: -9, z: -24, w: 5, h: 28, d: 5 },
        { x: 9, z: -22, w: 4.5, h: 24, d: 4.5 },
        { x: 17, z: -18, w: 5, h: 19, d: 5 },
        { x: -18, z: -10, w: 4, h: 16, d: 4 },
        { x: 19, z: -8, w: 4, h: 17, d: 4 },
      ];

      const towerColor = timeOfDay === 'day'
        ? (themeMode === 'light' ? 0x94a3b8 : 0x1e293b)
        : timeOfDay === 'sunset'
        ? (themeMode === 'light' ? 0x7c2d12 : 0x3b1528)
        : 0x070b14;

      towerConfigs.forEach((t) => {
        const tGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
        const tMat = new THREE.MeshStandardMaterial({
          color: towerColor,
          roughness: 0.8,
          metalness: 0.3,
        });
        const tower = new THREE.Mesh(tGeo, tMat);
        tower.position.set(t.x, -4.5 + t.h / 2, t.z);
        skylineGroup.add(tower);

        // Distant illuminated windows on background towers
        const winGeo = new THREE.BoxGeometry(t.w + 0.05, t.h * 0.7, t.d + 0.05);
        const winMat = new THREE.MeshBasicMaterial({
          color: timeOfDay === 'day' ? 0x38bdf8 : 0xf59e0b,
          transparent: true,
          opacity: timeOfDay === 'day' ? 0.08 : 0.04,
          wireframe: true,
        });
        const wins = new THREE.Mesh(winGeo, winMat);
        wins.position.set(t.x, -4.5 + t.h / 2, t.z);
        skylineGroup.add(wins);
      });
      scene.add(skylineGroup);
    }

    // 7. Skyscraper Monolith Dimensions
    // 7. Skyscraper Monolith Dimensions & Solid Architectural Glass Structure
    const floorHeight = 2.45;
    const floorWidth = 6.6;
    const floorDepth = 5.4;
    const startY = -4.1;

    floorGroupsRef.current.clear();

    // Architectural Corner LED Fin Glow Color (inspired by modern glass monoliths like Interseguro tower)
    const ledFinColor = blueprintMode
      ? 0x06b6d4
      : timeOfDay === 'sunset'
      ? 0xf59e0b
      : timeOfDay === 'day'
      ? 0x38bdf8
      : 0x60a5fa;

    // 5 Floors: 0 (Ground State Bus), 1 (Quant Desk), 2 (Fundamental), 3 (Risk), 4 (Board Room)
    floors.forEach((fl, idx) => {
      const floorGroup = new THREE.Group();
      // Seamless vertical stacking: zero air gap between floors
      const baseY = startY + idx * floorHeight;
      floorGroup.position.set(0, baseY, 0);

      const colorHex = fl.accentColor ? parseInt(fl.accentColor.replace('#', '0x'), 16) : 0x10b981;

      // 1. Structural Floor Slab at base of each floor level
      const slabGeo = new THREE.BoxGeometry(floorWidth - 0.08, 0.16, floorDepth - 0.08);
      const slabColor = blueprintMode
        ? 0x083344
        : themeMode === 'light'
        ? 0xe2e8f0
        : timeOfDay === 'sunset'
        ? 0x22132e
        : 0x0b1326;

      const slabMat = blueprintMode
        ? new THREE.MeshBasicMaterial({ color: 0x083344, wireframe: true })
        : new THREE.MeshStandardMaterial({
            color: slabColor,
            roughness: 0.2,
            metalness: 0.85,
          });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.y = 0.08;
      floorGroup.add(slabMesh);

      // 2. Exterior Architectural Spandrel Glass Band (conceals inter-floor mechanicals & structural joints)
      const spandrelHeight = 0.38;
      const spandrelGeo = new THREE.BoxGeometry(floorWidth + 0.03, spandrelHeight, floorDepth + 0.03);
      const spandrelColor = blueprintMode
        ? 0x032130
        : themeMode === 'light'
        ? 0x94a3b8
        : 0x060c18;
      const spandrelMat = blueprintMode
        ? new THREE.MeshBasicMaterial({ color: 0x0891b2, wireframe: true })
        : new THREE.MeshStandardMaterial({
            color: spandrelColor,
            roughness: 0.15,
            metalness: 0.9,
          });
      const spandrelMesh = new THREE.Mesh(spandrelGeo, spandrelMat);
      spandrelMesh.position.y = spandrelHeight / 2;
      floorGroup.add(spandrelMesh);

      // Polished metallic architectural reveal groove
      const trimGeo = new THREE.BoxGeometry(floorWidth + 0.05, 0.03, floorDepth + 0.05);
      const trimMat = new THREE.MeshStandardMaterial({
        color: blueprintMode ? 0x06b6d4 : (themeMode === 'light' ? 0x64748b : 0x475569),
        metalness: 0.95,
        roughness: 0.1,
      });
      const trimMesh = new THREE.Mesh(trimGeo, trimMat);
      trimMesh.position.y = spandrelHeight;
      floorGroup.add(trimMesh);

      // 3. FULL CONTINUOUS EXTERIOR CRYSTAL GLASS CURTAIN WALL ENVELOPE
      // MeshPhysicalMaterial matching exact user specification:
      // (transmission: 0.85, roughness: 0.1, metalness: 0.15, ior: 1.5, transparent: true, envMapIntensity: 1.2)
      const visionHeight = floorHeight - spandrelHeight;
      const glassGeo = new THREE.BoxGeometry(floorWidth, visionHeight, floorDepth);
      
      const glassMat = blueprintMode
        ? new THREE.MeshBasicMaterial({
            color: 0x06b6d4,
            wireframe: true,
            transparent: true,
            opacity: 0.45,
          })
        : new THREE.MeshPhysicalMaterial({
            color: themeMode === 'light' 
              ? (timeOfDay === 'sunset' ? 0xfef08a : 0xcbeafe) 
              : (timeOfDay === 'sunset' ? 0xfde68a : 0x93c5fd),
            transmission: 0.85,
            roughness: 0.1,
            metalness: 0.15,
            ior: 1.5,
            transparent: true,
            envMapIntensity: 1.2,
            reflectivity: 0.95,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
            opacity: 0.84,
            depthWrite: false,
            side: THREE.DoubleSide,
          });

      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.y = spandrelHeight + visionHeight / 2;
      floorGroup.add(glassMesh);

      // 4. Exterior Surface Curtain Wall Mullions (surface mounted, never piercing office interiors)
      if (!blueprintMode) {
        const mullionColor = themeMode === 'light' ? 0x94a3b8 : 0x334155;
        const mullionMat = new THREE.MeshStandardMaterial({
          color: mullionColor,
          metalness: 0.9,
          roughness: 0.2,
        });

        // Horizontal transom reveal line at 65% glass height
        const transomGeo = new THREE.BoxGeometry(floorWidth + 0.02, 0.04, floorDepth + 0.02);
        const transom = new THREE.Mesh(transomGeo, mullionMat);
        transom.position.y = spandrelHeight + visionHeight * 0.65;
        floorGroup.add(transom);

        // Vertical exterior surface mullions (front and rear vision glass facades)
        [-2.0, -0.7, 0.7, 2.0].forEach((vx) => {
          const vFrontGeo = new THREE.BoxGeometry(0.04, visionHeight, 0.03);
          const vFront = new THREE.Mesh(vFrontGeo, mullionMat);
          vFront.position.set(vx, spandrelHeight + visionHeight / 2, floorDepth / 2 + 0.015);
          floorGroup.add(vFront);

          const vBack = new THREE.Mesh(vFrontGeo, mullionMat);
          vBack.position.set(vx, spandrelHeight + visionHeight / 2, -floorDepth / 2 - 0.015);
          floorGroup.add(vBack);
        });

        // Vertical exterior surface mullions (side glass facades)
        [-1.3, 0, 1.3].forEach((vz) => {
          const vSideGeo = new THREE.BoxGeometry(0.03, visionHeight, 0.04);
          const vSideL = new THREE.Mesh(vSideGeo, mullionMat);
          vSideL.position.set(-floorWidth / 2 - 0.015, spandrelHeight + visionHeight / 2, vz);
          floorGroup.add(vSideL);

          const vSideR = new THREE.Mesh(vSideGeo, mullionMat);
          vSideR.position.set(floorWidth / 2 + 0.015, spandrelHeight + visionHeight / 2, vz);
          floorGroup.add(vSideR);
        });
      }

      // 5. GLOWING VERTICAL ARCHITECTURAL LED LIGHT FINS (running up chamfered exterior corners)
      const corners = [
        [-floorWidth / 2, -floorDepth / 2],
        [floorWidth / 2, -floorDepth / 2],
        [-floorWidth / 2, floorDepth / 2],
        [floorWidth / 2, floorDepth / 2],
      ];

      const cornerFinMat = new THREE.MeshStandardMaterial({
        color: blueprintMode ? 0x06b6d4 : (themeMode === 'light' ? 0x94a3b8 : 0x1e293b),
        metalness: 0.92,
        roughness: 0.15,
      });

      const ledMat = new THREE.MeshBasicMaterial({
        color: ledFinColor,
        toneMapped: false,
      });

      corners.forEach(([cx, cz]) => {
        // Architectural corner beveled casing
        const finGeo = new THREE.BoxGeometry(0.12, floorHeight, 0.12);
        const fin = new THREE.Mesh(finGeo, cornerFinMat);
        fin.position.set(cx, floorHeight / 2, cz);
        floorGroup.add(fin);

        // Glowing continuous vertical LED light strip running the entire floor height
        const ledStripGeo = new THREE.BoxGeometry(0.05, floorHeight + 0.02, 0.05);
        const ledStrip = new THREE.Mesh(ledStripGeo, ledMat);
        const offsetX = Math.sign(cx) * 0.04;
        const offsetZ = Math.sign(cz) * 0.04;
        ledStrip.position.set(cx + offsetX, floorHeight / 2, cz + offsetZ);
        floorGroup.add(ledStrip);
      });

      // Luminous corner radiance point lights on key floors
      if (idx === 1 || idx === 3 || idx === 4) {
        const cornerGlow = new THREE.PointLight(ledFinColor, 1.4, 5.5);
        cornerGlow.position.set(floorWidth / 2 + 0.25, floorHeight / 2, floorDepth / 2 + 0.25);
        floorGroup.add(cornerGlow);
      }

      // 6. WARM INTERNAL OFFICE LIGHTING GLOWING OUTWARD THROUGH THE GLASS
      const interiorLightColor = blueprintMode 
        ? colorHex 
        : timeOfDay === 'sunset'
        ? 0xffb84d // warm golden amber glow
        : 0xffe8b3; // 2900K warm executive tungsten glow
      
      const coreLight = new THREE.PointLight(
        interiorLightColor, 
        blueprintMode ? 2.6 : 2.8, 
        8.5
      );
      coreLight.position.set(0, spandrelHeight + visionHeight * 0.55, 0);
      floorGroup.add(coreLight);

      // Floor-Specific Interior Layouts (Visible through crystal glass)
      if (fl.id === 4) {
        // Floor 4: Executive Boardroom Mahogany Table & Center Holo
        const tableGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.14, 20);
        const tableMat = new THREE.MeshStandardMaterial({
          color: blueprintMode ? 0x0284c7 : 0x78350f, // rich polished walnut
          roughness: 0.2,
          metalness: 0.5,
        });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.y = 0.45;
        floorGroup.add(table);

        // Executive Leather Chairs around table
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
          const chairGeo = new THREE.BoxGeometry(0.4, 0.5, 0.4);
          const chairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.3 });
          const chair = new THREE.Mesh(chairGeo, chairMat);
          chair.position.set(Math.cos(a) * 1.9, 0.35, Math.sin(a) * 1.9);
          floorGroup.add(chair);
        }

        // Central Holographic Quorum Emitter
        const holoGeo = new THREE.ConeGeometry(0.55, 1.0, 12);
        const holoMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          wireframe: true,
          transparent: true,
          opacity: 0.75,
        });
        const holo = new THREE.Mesh(holoGeo, holoMat);
        holo.position.y = 1.05;
        floorGroup.add(holo);
      } else if (fl.id === 0) {
        // Floor 0: Ground Floor Server Racks (Kafka / Redis State Bus) & Marble Lobby
        for (let r = -2; r <= 2; r += 1.0) {
          const rackGeo = new THREE.BoxGeometry(0.65, 1.4, 1.2);
          const rackMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3, metalness: 0.9 });
          const rack = new THREE.Mesh(rackGeo, rackMat);
          rack.position.set(r * 0.9, 0.7, 0);
          floorGroup.add(rack);

          // Blinking rack activity LED
          const ledGeo = new THREE.SphereGeometry(0.06, 6, 6);
          const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
          const led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(r * 0.9, 1.2, 0.62);
          floorGroup.add(led);
        }
      } else {
        // Floors 1, 2, 3: Trading & Quantitative Analysis Desks
        for (let d = -1.8; d <= 1.8; d += 1.2) {
          const deskGeo = new THREE.BoxGeometry(0.9, 0.4, 0.8);
          const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
          const desk = new THREE.Mesh(deskGeo, deskMat);
          desk.position.set(d, 0.35, d % 2 === 0 ? 0.6 : -0.6);
          floorGroup.add(desk);

          // Multi-Monitor Array (Bloomberg Terminal aesthetic)
          const monGeo = new THREE.BoxGeometry(0.42, 0.32, 0.05);
          const monMat = new THREE.MeshBasicMaterial({ color: colorHex });
          const mon = new THREE.Mesh(monGeo, monMat);
          mon.position.set(d, 0.75, d % 2 === 0 ? 0.6 : -0.6);
          floorGroup.add(mon);
        }
      }

      // Neon Wire / Blueprint Edge Contour
      const edgeGeo = new THREE.EdgesGeometry(glassGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: colorHex,
        linewidth: 2,
        transparent: true,
        opacity: blueprintMode ? 0.95 : 0.35,
      });
      const wireframeEdges = new THREE.LineSegments(edgeGeo, edgeMat);
      wireframeEdges.position.y = spandrelHeight + visionHeight / 2;
      floorGroup.add(wireframeEdges);

      // Floor metadata tag for raycasting
      floorGroup.userData = { floorId: fl.id, name: fl.name, baseY };

      buildingRoot.add(floorGroup);
      floorGroupsRef.current.set(fl.id, floorGroup);
    });

    // 8. Skyscraper Monolith Crown, Helipad & Morgan Stanley-Style Corporate Parapet
    const crownGroup = new THREE.Group();
    const crownBaseY = startY + floors.length * floorHeight + 0.05;
    crownGroup.position.set(0, crownBaseY, 0);

    // Penthouse Mechanical Parapet Box (Backing structure for the monumental corporate signage)
    const penthouseWidth = 5.6;
    const penthouseHeight = 1.15;
    const penthouseDepth = 4.6;
    const penthouseGeo = new THREE.BoxGeometry(penthouseWidth, penthouseHeight, penthouseDepth);
    const penthouseMat = new THREE.MeshStandardMaterial({
      color: blueprintMode ? 0x021827 : (themeMode === 'light' ? 0x1e293b : 0x070a13),
      metalness: 0.95,
      roughness: 0.15,
    });
    const penthouse = new THREE.Mesh(penthouseGeo, penthouseMat);
    penthouse.position.y = penthouseHeight / 2 - 0.15;
    crownGroup.add(penthouse);

    // Helipad structure on top of the penthouse
    const helipadGeo = new THREE.CylinderGeometry(2.5, 2.8, 0.45, 24);
    const helipadMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25,
    });
    const helipad = new THREE.Mesh(helipadGeo, helipadMat);
    helipad.position.y = penthouseHeight + 0.05;
    crownGroup.add(helipad);

    // Helipad 'H' ring
    const hRingGeo = new THREE.RingGeometry(1.2, 1.4, 24);
    const hRingMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    const hRing = new THREE.Mesh(hRingGeo, hRingMat);
    hRing.rotation.x = -Math.PI / 2;
    hRing.position.y = penthouseHeight + 0.28;
    crownGroup.add(hRing);

    // 9. MONUMENTAL "ACE & COMPANY" MORGAN STANLEY-STYLE HEADQUARTERS SIGNAGE
    // Generated with crisp Canvas textures & emissive illumination matching 1585 Broadway
    const signTexFront = createCorporateSignTexture(
      'ACE & COMPANY',
      'GLOBAL INVESTMENT MANAGEMENT',
      blueprintMode,
      timeOfDay,
      4.6
    );

    const signTexSides = createCorporateSignTexture(
      'ACE & COMPANY',
      'QUANTITATIVE ASSET MANAGEMENT',
      blueprintMode,
      timeOfDay,
      3.8
    );

    const createSignMesh = (geo: THREE.BufferGeometry, tex: THREE.CanvasTexture) => {
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        emissive: blueprintMode ? 0x06b6d4 : 0xffffff,
        emissiveMap: tex,
        emissiveIntensity: blueprintMode ? 0.95 : 0.85,
        roughness: 0.15,
        metalness: 0.9,
      });
      return new THREE.Mesh(geo, mat);
    };

    // A. Front Crown Face (facing default camera view)
    const frontSignGeo = new THREE.BoxGeometry(4.8, 0.88, 0.12);
    const frontSign = createSignMesh(frontSignGeo, signTexFront);
    frontSign.position.set(0, penthouseHeight / 2 - 0.15, penthouseDepth / 2 + 0.07);
    crownGroup.add(frontSign);

    // B. Back Crown Face (visible when rotated 180 degrees)
    const backSign = createSignMesh(frontSignGeo, signTexFront);
    backSign.position.set(0, penthouseHeight / 2 - 0.15, -penthouseDepth / 2 - 0.07);
    backSign.rotation.y = Math.PI;
    crownGroup.add(backSign);

    // C. Right Side Crown Face (visible from +X profile)
    const sideSignGeo = new THREE.BoxGeometry(4.0, 0.88, 0.12);
    const rightSign = createSignMesh(sideSignGeo, signTexSides);
    rightSign.position.set(penthouseWidth / 2 + 0.07, penthouseHeight / 2 - 0.15, 0);
    rightSign.rotation.y = Math.PI / 2;
    crownGroup.add(rightSign);

    // D. Left Side Crown Face (visible from -X profile)
    const leftSign = createSignMesh(sideSignGeo, signTexSides);
    leftSign.position.set(-penthouseWidth / 2 - 0.07, penthouseHeight / 2 - 0.15, 0);
    leftSign.rotation.y = -Math.PI / 2;
    crownGroup.add(leftSign);

    // Crown Architectural Ambient Luminescence Glow Lights
    const crownGlowColor = blueprintMode ? 0x06b6d4 : timeOfDay === 'sunset' ? 0xf59e0b : 0x93c5fd;
    const marqueeGlow = new THREE.PointLight(crownGlowColor, 2.4, 10);
    marqueeGlow.position.set(0, penthouseHeight / 2, penthouseDepth / 2 + 1.2);
    crownGroup.add(marqueeGlow);
    marqueeGlowRef.current = marqueeGlow;

    // Spire / Telecommunications Antenna
    const spireGeo = new THREE.CylinderGeometry(0.04, 0.22, 3.4, 8);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.1,
    });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = penthouseHeight + 1.9;
    crownGroup.add(spire);

    // Rooftop Aviation Warning Strobe Beacon
    const beaconLight = new THREE.PointLight(0xef4444, 2.2, 16);
    beaconLight.position.set(0, penthouseHeight + 3.6, 0);
    crownGroup.add(beaconLight);
    beaconLightRef.current = beaconLight;

    const beaconDotGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const beaconDotMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beaconDot = new THREE.Mesh(beaconDotGeo, beaconDotMat);
    beaconDot.position.set(0, penthouseHeight + 3.6, 0);
    crownGroup.add(beaconDot);

    buildingRoot.add(crownGroup);

    // 10. MID-TOWER ARCHITECTURAL CORPORATE SIGNBAND (Morgan Stanley Mid-Tower Ribbon)
    // Mounted prominently across the upper facade between Floors 3 & 4
    const midBandTexture = createCorporateSignTexture(
      'ACE & COMPANY',
      'AUTONOMOUS QUANTITATIVE TRADING MATRIX',
      blueprintMode,
      timeOfDay,
      8.0
    );
    const midBandGeo = new THREE.BoxGeometry(floorWidth + 0.12, 0.52, 0.12);
    const midBandMat = new THREE.MeshStandardMaterial({
      map: midBandTexture,
      emissive: blueprintMode ? 0x06b6d4 : 0xffffff,
      emissiveMap: midBandTexture,
      emissiveIntensity: blueprintMode ? 0.95 : 0.82,
      roughness: 0.15,
      metalness: 0.88,
    });
    const midBand = new THREE.Mesh(midBandGeo, midBandMat);
    midBand.position.set(0, 6.22, floorDepth / 2 + 0.08);
    buildingRoot.add(midBand);

    // 11. PLAZA LEVEL GRAND ENTRANCE CANOPY & MARQUEE (Floor 0 Lobby Portal)
    const entranceGroup = new THREE.Group();
    // Cantilevered Architectural Canopy Slab
    const canopyGeo = new THREE.BoxGeometry(4.0, 0.2, 1.8);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: blueprintMode ? 0x021827 : 0x0b1120,
      metalness: 0.95,
      roughness: 0.2,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, -3.25, floorDepth / 2 + 0.9);
    entranceGroup.add(canopy);

    // Dual Architectural Stainless-Steel Columns
    const colGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.25, 16);
    const colMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.1,
    });
    const colLeft = new THREE.Mesh(colGeo, colMat);
    colLeft.position.set(-1.7, -3.88, floorDepth / 2 + 1.6);
    entranceGroup.add(colLeft);

    const colRight = new THREE.Mesh(colGeo, colMat);
    colRight.position.set(1.7, -3.88, floorDepth / 2 + 1.6);
    entranceGroup.add(colRight);

    // Entrance Fascia Signboard: "ACE & COMPANY • GLOBAL HEADQUARTERS"
    const entranceTexture = createCorporateSignTexture(
      'ACE & COMPANY',
      'GLOBAL HEADQUARTERS • WALL STREET',
      blueprintMode,
      timeOfDay,
      6.0
    );
    const entranceSignGeo = new THREE.BoxGeometry(3.8, 0.38, 0.08);
    const entranceSignMat = new THREE.MeshStandardMaterial({
      map: entranceTexture,
      emissive: blueprintMode ? 0x06b6d4 : 0xffffff,
      emissiveMap: entranceTexture,
      emissiveIntensity: blueprintMode ? 0.95 : 0.85,
      roughness: 0.2,
      metalness: 0.85,
    });
    const entranceSign = new THREE.Mesh(entranceSignGeo, entranceSignMat);
    entranceSign.position.set(0, -3.22, floorDepth / 2 + 1.84);
    entranceGroup.add(entranceSign);

    // Warm Entryway Downlight projecting onto Plaza Plinth
    const entryLight = new THREE.PointLight(
      blueprintMode ? 0x06b6d4 : 0xfef08a,
      2.2,
      6
    );
    entryLight.position.set(0, -3.4, floorDepth / 2 + 1.0);
    entranceGroup.add(entryLight);

    buildingRoot.add(entranceGroup);

    // 12. Central Vertical High-Speed State Bus Conduit
    const conduitGeo = new THREE.CylinderGeometry(0.16, 0.16, 14.0, 16);
    const conduitMat = new THREE.MeshBasicMaterial({
      color: blueprintMode ? 0x06b6d4 : 0x10b981,
      transparent: true,
      opacity: 0.65,
      wireframe: true,
    });
    const conduit = new THREE.Mesh(conduitGeo, conduitMat);
    conduit.position.set(0, 2.9, 0);
    buildingRoot.add(conduit);

    // 13. Telemetry Data Packets traveling along vertical conduit
    const packetsPool: THREE.Mesh[] = [];
    for (let i = 0; i < 20; i++) {
      const packetGeo = new THREE.SphereGeometry(0.16, 8, 8);
      const packetMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0x10b981 : i % 3 === 1 ? 0xf59e0b : 0x8b5cf6,
      });
      const pMesh = new THREE.Mesh(packetGeo, packetMat);
      pMesh.position.set(
        (Math.random() - 0.5) * 0.8,
        -3.5 + Math.random() * 12.0,
        (Math.random() - 0.5) * 0.8
      );
      pMesh.userData = {
        speed: 0.04 + Math.random() * 0.06,
        direction: Math.random() > 0.3 ? 1 : -1,
        minY: -3.5,
        maxY: 8.8,
      };
      buildingRoot.add(pMesh);
      packetsPool.push(pMesh);
    }
    packetMeshesRef.current = packetsPool;

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 12. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Beacon strobe pulse
      if (beaconLightRef.current) {
        beaconLightRef.current.intensity = Math.sin(elapsed * 4) > 0 ? 2.5 : 0.2;
      }

      // Marquee gentle glow pulse
      if (marqueeGlowRef.current) {
        marqueeGlowRef.current.intensity = 1.8 + Math.sin(elapsed * 2) * 0.4;
      }

      // Auto rotation or smooth manual rotation
      if (buildingRootRef.current) {
        if (autoRotate && !isDraggingRef.current) {
          targetRotationRef.current.y += 0.0035;
        }

        buildingRootRef.current.rotation.y += (targetRotationRef.current.y - buildingRootRef.current.rotation.y) * 0.08;
        buildingRootRef.current.rotation.x += (targetRotationRef.current.x - buildingRootRef.current.rotation.x) * 0.08;
      }

      // Camera zoom interpolation
      if (cameraRef.current) {
        cameraRef.current.position.z += (cameraZoomTargetRef.current - cameraRef.current.position.z) * 0.1;
      }

      // Animate ambient data particles drift (Environmental Particle FX)
      if (ambientParticlesRef.current) {
        const positions = ambientParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += 0.018;
          if (positions[i] > 16.0) {
            positions[i] = -4.0;
          }
        }
        ambientParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        ambientParticlesRef.current.rotation.y = elapsed * 0.02;
      }

      // Animate telemetry packets vertically along conduit
      if (shiftActive) {
        packetMeshesRef.current.forEach((p) => {
          const { speed, direction, minY, maxY } = p.userData;
          p.position.y += speed * direction;
          if (p.position.y > maxY) {
            p.position.y = minY;
          } else if (p.position.y < minY) {
            p.position.y = maxY;
          }
          // Slight orbital swirl around the central spine
          p.position.x = Math.sin(elapsed * 3 + p.position.y) * 0.45;
          p.position.z = Math.cos(elapsed * 3 + p.position.y) * 0.45;
        });
      }

      // Exploded Floor Dissection or Selected Floor Projection
      floorGroupsRef.current.forEach((group, id) => {
        const baseY = group.userData.baseY;
        let targetY = baseY;
        let targetX = 0;
        let targetZ = 0;

        if (isExploded) {
          targetY = baseY + (id - 2) * 1.5;
        } else if (selectedFloorId !== null && selectedFloorId === id) {
          targetX = 1.3;
          targetZ = 1.1;
        }

        group.position.y += (targetY - group.position.y) * 0.1;
        group.position.x += (targetX - group.position.x) * 0.1;
        group.position.z += (targetZ - group.position.z) * 0.1;
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [floors, blueprintMode, isExploded, timeOfDay, themeMode]);

  // Pointer Drag & Orbit Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevPointerPositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      // Subtle 3D Tilt Parallax on mouse hover
      if (!isDraggingRef.current) {
        targetRotationRef.current.x = 0.22 + normY * 0.18;
        if (!autoRotate) {
          targetRotationRef.current.y = -0.65 + normX * 0.28;
        }
      }

      // Dynamic Specular Reflection Light tracks mouse across crystal facade
      if (reflectionLightRef.current) {
        reflectionLightRef.current.position.x = normX * 18;
        reflectionLightRef.current.position.y = 4.5 - normY * 10;
        reflectionLightRef.current.position.z = 11 + Math.abs(normX) * 4;
      }
    }

    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - prevPointerPositionRef.current.x;
    const deltaY = e.clientY - prevPointerPositionRef.current.y;

    targetRotationRef.current.y += deltaX * 0.007;
    targetRotationRef.current.x += deltaY * 0.005;
    targetRotationRef.current.x = Math.max(-0.2, Math.min(0.8, targetRotationRef.current.x));

    prevPointerPositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;

    // Raycasting Floor Click Detection
    if (containerRef.current && cameraRef.current && sceneRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent && parent !== sceneRef.current) {
          if (parent.userData && parent.userData.floorId !== undefined) {
            const fId = parent.userData.floorId as FloorId;
            soundFx.playClick(1500);
            soundFx.playPacketPing(fId);
            onSelectFloor(fId);
            return;
          }
          parent = parent.parent;
        }
      }
    }
  };

  const handleZoom = (zoomIn: boolean) => {
    soundFx.playClick(1300);
    cameraZoomTargetRef.current = Math.max(9, Math.min(26, cameraZoomTargetRef.current + (zoomIn ? -3 : 3)));
  };

  const resetCamera = () => {
    soundFx.playClick(1000);
    targetRotationRef.current = { x: 0.22, y: -0.65 };
    cameraZoomTargetRef.current = 17;
  };

  return (
    <div 
      id="three-skyscraper-container"
      className={`relative w-full h-[540px] sm:h-[620px] rounded-3xl overflow-hidden border backdrop-blur-2xl shadow-2xl group select-none transition-colors duration-300 ${
        blueprintMode
          ? 'border-cyan-500/30 bg-[#020510]'
          : themeMode === 'light'
          ? 'border-slate-200 bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-200/90 shadow-xl'
          : 'border-slate-800/80 bg-[#050711]'
      }`}
    >
      {/* 3D WebGL Canvas Mount */}
      <div 
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Cybernetic Blueprint Grid / HUD Overlays */}
      <div className={`absolute inset-0 pointer-events-none ${
        blueprintMode 
          ? 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,5,16,0.6)_100%)]'
          : themeMode === 'light'
          ? 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(203,213,225,0.25)_100%)]'
          : 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,8,0.5)_100%)]'
      }`} />

      {/* Top HUD Status Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 backdrop-blur-md border shadow-sm ${
            blueprintMode 
              ? 'bg-cyan-950/80 border-cyan-500/30 text-cyan-300' 
              : themeMode === 'light'
              ? 'bg-white/95 border-slate-200 text-emerald-700 shadow-sm'
              : 'bg-slate-900/80 border-slate-700/60 text-emerald-400'
          }`}>
            <Radio className="w-3 h-3 animate-spin text-emerald-500 dark:text-emerald-400" />
            <span>{blueprintMode ? 'TACTICAL BLUEPRINT SCHEMATIC' : 'REALISTIC CINEMATIC MONOLITH'}</span>
          </span>

          <span className={`hidden sm:inline text-[10px] font-mono px-2 py-1 rounded border backdrop-blur-sm ${
            themeMode === 'light'
              ? 'bg-white/80 text-slate-600 border-slate-200 shadow-sm'
              : 'bg-black/50 text-slate-400 border-white/5'
          }`}>
            {blueprintMode ? 'Showing live workflow nodes & cross-floor buses' : 'Showing continuous crystal glass facade & LED light fins'}
          </span>
        </div>

        {/* 3D Viewport Controls */}
        <div className={`flex items-center gap-1.5 pointer-events-auto p-1 rounded-xl border backdrop-blur-md transition-colors ${
          themeMode === 'light' 
            ? 'bg-white/85 border-slate-200 shadow-md text-slate-700' 
            : 'bg-black/60 border-white/10 text-slate-300'
        }`}>
          <button
            onClick={() => handleZoom(true)}
            className={`p-1.5 rounded-lg transition-colors ${
              themeMode === 'light' ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Zoom In"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(false)}
            className={`p-1.5 rounded-lg transition-colors ${
              themeMode === 'light' ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Zoom Out"
          >
            <Minimize className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetCamera}
            className={`p-1.5 rounded-lg transition-colors ${
              themeMode === 'light' ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-slate-300 hover:text-white'
            }`}
            title="Reset 3D Perspective"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              soundFx.playClick(1200);
              setIsExploded(!isExploded);
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
              isExploded 
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40' 
                : themeMode === 'light' 
                ? 'hover:bg-slate-100 text-slate-600 border-transparent' 
                : 'hover:bg-white/10 text-slate-300 border-transparent'
            }`}
            title="Toggle Exploded Vertical Dissection"
          >
            <Layers className="w-3 h-3 inline mr-1" />
            {isExploded ? 'Exploded ON' : 'Explode'}
          </button>
          <button
            onClick={() => {
              soundFx.playClick(1000);
              setAutoRotate(!autoRotate);
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border ${
              autoRotate 
                ? 'bg-cyan-500/20 text-cyan-500 border-cyan-500/40' 
                : themeMode === 'light' 
                ? 'hover:bg-slate-100 text-slate-500 border-transparent' 
                : 'hover:bg-white/10 text-slate-400 border-transparent'
            }`}
            title="Toggle 3D auto orbit"
          >
            Orbit: {autoRotate ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Floating Floor Selector Badges (Left Side HUD Stack) */}
      <div className="absolute left-4 bottom-4 top-16 flex flex-col justify-end gap-2 pointer-events-none z-10">
        {[4, 3, 2, 1, 0].map((fId) => {
          const fl = floors.find((f) => f.id === fId);
          if (!fl) return null;
          const isSelected = selectedFloorId === fId;

          return (
            <button
              key={fId}
              onClick={() => {
                soundFx.playClick(1400);
                soundFx.playPacketPing(fId);
                onSelectFloor(fId as FloorId);
              }}
              className={`pointer-events-auto flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-left transition-all duration-300 backdrop-blur-xl ${
                isSelected
                  ? themeMode === 'light'
                    ? 'bg-white border-emerald-500 shadow-lg scale-105 translate-x-1'
                    : 'bg-slate-900/90 border-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.35)] scale-105 translate-x-1'
                  : themeMode === 'light'
                  ? 'bg-white/80 hover:bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
                  : 'bg-black/50 hover:bg-slate-900/70 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div 
                className="w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[11px] border"
                style={{ 
                  borderColor: fl.accentColor, 
                  color: fl.accentColor,
                  backgroundColor: `${fl.accentColor}15`
                }}
              >
                F{fId}
              </div>

              <div className="hidden sm:block">
                <div className={`text-[11px] font-bold flex items-center gap-1.5 ${
                  themeMode === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  <span>{fl.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                </div>
                <div className="text-[9px] text-slate-500 truncate max-w-[140px]">
                  {fl.department}
                </div>
              </div>

              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ml-auto ${
                fl.status === 'IN_SESSION' 
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300' 
                  : fl.status === 'AUDITING' 
                  ? 'bg-rose-500/20 text-rose-500 dark:text-rose-300' 
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
              }`}>
                {fl.status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Real-time Telemetry Data Packet Counter / Legend (Right Bottom HUD) */}
      <div className="absolute right-4 bottom-4 pointer-events-none hidden md:block">
        <div className={`backdrop-blur-xl border p-3 rounded-2xl text-[11px] font-mono space-y-1.5 shadow-xl transition-colors ${
          themeMode === 'light'
            ? 'bg-white/90 border-slate-200 text-slate-800'
            : 'bg-slate-950/80 border-slate-800/80 text-slate-300'
        }`}>
          <div className="text-slate-500 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-1 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-bold">
              <Activity className="w-3 h-3" /> PIPELINE TELEMETRY
            </span>
            <span>BUS LATENCY: 0.28ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Floor 1: Quant Tick Breakouts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <span>Floor 2: SEC 10-K XBRL Parsing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Floor 3: VaR Risk Stress Tests</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Floor 4: Board Investment Quorum</span>
          </div>
        </div>
      </div>

    </div>
  );
};
