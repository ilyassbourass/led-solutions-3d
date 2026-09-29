import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class WarehouseSimulator {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.mode = 'led'; // 'led', 'halide', 'heatmap'
    this.fixtureCount = 8;
    this.dimmingLevel = 1.0;
    this.targetCameraPos = new THREE.Vector3(0, 12, 18);
    this.targetLookAt = new THREE.Vector3(0, 1.5, 0);

    this.luminaires = [];
    this.volumetricCones = [];
    this.spotLights = [];
    this.rackMeshes = [];

    this.init();
    this.buildWarehouse();
    this.setupLighting();
    this.setupEvents();
    this.animate(0);
  }

  init() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0f14);
    this.scene.fog = new THREE.FogExp2(0x0c0f14, 0.018);

    // Camera
    this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 0.1, 120);
    this.camera.position.copy(this.targetCameraPos);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't go below floor
    this.controls.minDistance = 2;
    this.controls.maxDistance = 45;
    this.controls.target.copy(this.targetLookAt);

    // Clock
    this.clock = new THREE.Clock();
  }

  // Generate Procedural Textures
  createConcreteCanvas(isHeatmap = false, heatmapMode = 'led') {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    if (isHeatmap) {
      // Photometric Lux Heatmap Texture
      ctx.fillStyle = '#060b1e'; // Default low-lux base (<50 lx)
      ctx.fillRect(0, 0, 2048, 2048);

      const fixtures = [
        [-9, -6], [-3, -6], [3, -6], [9, -6],
        [-9, 6], [-3, 6], [3, 6], [9, 6]
      ];

      // Render Lux Gradients per fixture
      fixtures.forEach(([fx, fz]) => {
        const cx = ((fx + 18) / 36) * 2048;
        const cy = ((fz + 14) / 28) * 2048;

        if (heatmapMode === 'led') {
          // Uniform wide 120-degree distribution (AS/NZS 1680 Compliant Green/Cyan)
          const grad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 520);
          grad.addColorStop(0, 'rgba(52, 211, 153, 0.95)'); // 250 Lux (Optimal Lime Green)
          grad.addColorStop(0.35, 'rgba(45, 212, 191, 0.9)'); // 220 Lux (Cyan)
          grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.7)'); // 160 Lux (Compliant Blue-Green)
          grad.addColorStop(0.9, 'rgba(99, 102, 241, 0.35)'); // 100 Lux
          grad.addColorStop(1, 'rgba(6, 11, 30, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 2048, 2048);
        } else {
          // Halide Mode: Harsh concentrated Hotspot (Red > 500 lx) with dark blue cold aisles
          const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 260);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.98)'); // >500 Lux (Glare / Hotspot Red)
          grad.addColorStop(0.2, 'rgba(249, 115, 22, 0.9)'); // 380 Lux (Orange)
          grad.addColorStop(0.45, 'rgba(234, 179, 8, 0.8)'); // 250 Lux (Yellow)
          grad.addColorStop(0.7, 'rgba(59, 130, 246, 0.4)'); // 80 Lux (Substandard Blue)
          grad.addColorStop(1, 'rgba(6, 11, 30, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 2048, 2048);
        }
      });

      // Overlay CAD Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      for (let i = 0; i <= 2048; i += 128) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i, 2048); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i); ctx.lineTo(2048, i); ctx.stroke();
      }

      // AS/NZS 1680 Standards Stencil
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillStyle = heatmapMode === 'led' ? '#34d399' : '#f87171';
      ctx.fillText(heatmapMode === 'led' ? 'AS/NZS 1680.2.4 COMPLIANT — UNIFORMITY U0: 0.68' : 'NON-COMPLIANT HAZARD — EXCESSIVE GLARE / DARK AISLES', 80, 100);
      ctx.fillText(heatmapMode === 'led' ? 'MEAN ILLUMINANCE: 224 LUX (TARGET 160-240 LX)' : 'MEAN ILLUMINANCE: 88 LUX (UNDERLIT AISLES < 40 LX)', 80, 150);

      return new THREE.CanvasTexture(canvas);
    }

    // Standard Realistic Concrete Floor
    ctx.fillStyle = '#1e242d';
    ctx.fillRect(0, 0, 2048, 2048);

    // Concrete Mottling / Noise
    for (let i = 0; i < 60000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 2048;
      const radius = Math.random() * 2.5;
      const alpha = Math.random() * 0.08;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha * 1.5})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Concrete Slab Expansion Joints
    ctx.strokeStyle = '#0f141a';
    ctx.lineWidth = 4;
    for (let x = 0; x <= 2048; x += 512) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, 2048); ctx.stroke();
    }
    for (let y = 0; y <= 2048; y += 512) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(2048, y); ctx.stroke();
    }

    // Yellow Industrial Safety Demarcation Lines
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 14;
    ctx.setLineDash([40, 25]);
    ctx.strokeRect(120, 120, 1808, 1808);
    ctx.setLineDash([]);

    // Central Forklift Lane Border Lines
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(700, 120); ctx.lineTo(700, 1928); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1348, 120); ctx.lineTo(1348, 1928); ctx.stroke();

    // Floor Markings / Stencils
    ctx.font = 'bold 52px "Inter", sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('FORKLIFT THOROUGHFARE — SPEED LIMIT 8 KM/H', 1024, 280);
    ctx.fillText('LED SOLUTIONS CANBERRA • AS/NZS 1680 CERTIFIED', 1024, 1820);

    ctx.font = 'bold 44px "Inter", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('BAY 01 — BULK STORAGE', 410, 200);
    ctx.fillText('BAY 02 — HIGH ACCURACY PACKING', 1640, 200);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  buildWarehouse() {
    // 1. Concrete Floor
    this.normalFloorTexture = this.createConcreteCanvas(false);
    this.ledHeatmapTexture = this.createConcreteCanvas(true, 'led');
    this.halideHeatmapTexture = this.createConcreteCanvas(true, 'halide');

    this.floorMaterial = new THREE.MeshStandardMaterial({
      map: this.normalFloorTexture,
      roughness: 0.35,
      metalness: 0.12
    });

    const floorGeo = new THREE.PlaneGeometry(36, 28);
    this.floorMesh = new THREE.Mesh(floorGeo, this.floorMaterial);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.receiveShadow = true;
    this.scene.add(this.floorMesh);

    // 2. Warehouse Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1b2028,
      roughness: 0.85,
      metalness: 0.2
    });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(36, 8.5), wallMat);
    backWall.position.set(0, 4.25, -14);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 8.5), wallMat);
    leftWall.position.set(-18, 4.25, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 8.5), wallMat);
    rightWall.position.set(18, 4.25, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    this.scene.add(rightWall);

    // 3. Steel Roof Trusses & Structural I-Beams
    this.buildStructuralTrusses();

    // 4. Industrial Pallet Racking Rows
    this.buildRackingRow(-12, -4);
    this.buildRackingRow(12, -4);
    this.buildRackingRow(-12, 6);
    this.buildRackingRow(12, 6);

    // 5. Procedural Industrial Forklift
    this.buildForklift(-1.5, 0, 2);

    // 6. Pallet Stacks in Middle Bay
    this.buildPalletStack(0, 0, -6);
    this.buildPalletStack(2.8, 0, -8);
    this.buildPalletStack(-3.2, 0, -9);
  }

  buildStructuralTrusses() {
    const trussMat = new THREE.MeshStandardMaterial({
      color: 0x222730,
      metalness: 0.8,
      roughness: 0.4
    });

    for (let z of [-12, -6, 0]) {
      // Main horizontal girder
      const girder = new THREE.Mesh(new THREE.BoxGeometry(36, 0.35, 0.3), trussMat);
      girder.position.set(0, 8.6, z);
      this.scene.add(girder);

      // Webbing diagonal struts
      for (let x = -16; x < 16; x += 3.0) {
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2), trussMat);
        strut.position.set(x + 1.5, 7.6, z);
        strut.rotation.z = Math.PI / 4.5;
        this.scene.add(strut);
      }
    }
  }

  buildRackingRow(xPos, zPos) {
    const rackGroup = new THREE.Group();
    rackGroup.position.set(xPos, 0, zPos);

    const uprightMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5, metalness: 0.5 }); // Safety Blue
    const beamMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, metalness: 0.4 }); // Safety Orange

    const rackLength = 8;
    const rackHeight = 5.6;
    const rackDepth = 1.6;

    // Uprights (Vertical pillars)
    [-rackLength / 2, 0, rackLength / 2].forEach(px => {
      [-rackDepth / 2, rackDepth / 2].forEach(pz => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, rackHeight, 0.12), uprightMat);
        post.position.set(px, rackHeight / 2, pz);
        post.castShadow = true;
        post.receiveShadow = true;
        rackGroup.add(post);
      });
    });

    // Horizontal orange crossbeams (3 shelf tiers)
    [1.5, 3.2, 4.8].forEach(levelY => {
      [-rackDepth / 2, rackDepth / 2].forEach(pz => {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(rackLength, 0.15, 0.08), beamMat);
        beam.position.set(0, levelY, pz);
        beam.castShadow = true;
        rackGroup.add(beam);
      });

      // Cargo on shelves
      this.populateShelfCargo(rackGroup, rackLength, levelY, rackDepth);
    });

    this.scene.add(rackGroup);
    this.rackMeshes.push(rackGroup);
  }

  populateShelfCargo(rackGroup, length, y, depth) {
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 }); // Cardboard brown
    const drumMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.8 }); // Steel Blue drum

    const slots = [-2.8, -1.4, 0, 1.4, 2.8];
    slots.forEach((sx, idx) => {
      if (Math.random() > 0.15) {
        if (idx % 2 === 0) {
          // Pallet with Cardboard boxes
          const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.95, depth * 0.85), boxMat);
          box.position.set(sx, y + 0.5, 0);
          box.castShadow = true;
          box.receiveShadow = true;
          rackGroup.add(box);
        } else {
          // Industrial drums
          const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 16), drumMat);
          drum.position.set(sx, y + 0.48, 0);
          drum.castShadow = true;
          drum.receiveShadow = true;
          rackGroup.add(drum);
        }
      }
    });
  }

  buildPalletStack(x, y, z) {
    const stackGroup = new THREE.Group();
    stackGroup.position.set(x, y, z);

    const palletMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 });
    const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 1.4), palletMat);
    pallet.position.y = 0.08;
    pallet.castShadow = true;
    pallet.receiveShadow = true;
    stackGroup.add(pallet);

    const boxMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
    const boxes = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.4, 1.3), boxMat);
    boxes.position.y = 0.85;
    boxes.castShadow = true;
    boxes.receiveShadow = true;
    stackGroup.add(boxes);

    this.scene.add(stackGroup);
  }

  buildForklift(x, y, z) {
    this.forkliftGroup = new THREE.Group();
    this.forkliftGroup.position.set(x, y, z);

    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.4 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7, metalness: 0.3 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });

    // Main Chassis
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 2.4), yellowMat);
    body.position.set(0, 0.65, 0);
    body.castShadow = true;
    this.forkliftGroup.add(body);

    // Counterweight at back
    const counterweight = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.8, 0.6), darkMat);
    counterweight.position.set(0, 0.7, 1.1);
    counterweight.castShadow = true;
    this.forkliftGroup.add(counterweight);

    // Operator Overhead Guard (Roll Cage)
    const cageGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6);
    [[-0.65, -0.6], [0.65, -0.6], [-0.65, 0.6], [0.65, 0.6]].forEach(([px, pz]) => {
      const leg = new THREE.Mesh(cageGeo, darkMat);
      leg.position.set(px, 1.8, pz);
      this.forkliftGroup.add(leg);
    });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 1.3), darkMat);
    roof.position.set(0, 2.6, 0);
    this.forkliftGroup.add(roof);

    // Amber Safety Beacon
    this.beaconLight = new THREE.PointLight(0xf59e0b, 1.5, 6);
    this.beaconLight.position.set(0, 2.75, 0);
    this.forkliftGroup.add(this.beaconLight);
    const beaconMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 2 })
    );
    beaconMesh.position.set(0, 2.7, 0);
    this.forkliftGroup.add(beaconMesh);

    // Front Mast & Forks
    const mast = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 0.15), darkMat);
    mast.position.set(0, 1.5, -1.25);
    mast.castShadow = true;
    this.forkliftGroup.add(mast);

    // Forks
    [-0.35, 0.35].forEach(fx => {
      const fork = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 1.2), darkMat);
      fork.position.set(fx, 0.1, -1.8);
      fork.castShadow = true;
      this.forkliftGroup.add(fork);
    });

    // 4 Wheels
    [[-0.8, -0.7], [0.8, -0.7], [-0.8, 0.8], [0.8, 0.8]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.28, 18), tireMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.32, wz);
      wheel.castShadow = true;
      this.forkliftGroup.add(wheel);
    });

    this.scene.add(this.forkliftGroup);
  }

  setupLighting() {
    // Ambient / Fill Light
    this.ambientLight = new THREE.AmbientLight(0x18202d, 0.6);
    this.scene.add(this.ambientLight);

    // Create 8 Industrial High-Bay Luminaires
    const fixturePositions = [
      [-9, 7.2, -6], [-3, 7.2, -6], [3, 7.2, -6], [9, 7.2, -6],
      [-9, 7.2, 6], [-3, 7.2, 6], [3, 7.2, 6], [9, 7.2, 6]
    ];

    fixturePositions.forEach(([x, y, z], idx) => {
      // 1. Physical Luminaire Fixture (Finned UFO High-Bay)
      const fixtureGroup = new THREE.Group();
      fixtureGroup.position.set(x, y, z);

      // Suspension Cable
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.6),
        new THREE.MeshBasicMaterial({ color: 0x64748b })
      );
      cable.position.y = 0.3;
      fixtureGroup.add(cable);

      // Finned Heatsink Housing
      const heatsink = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.58, 0.25, 24),
        new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.8 })
      );
      fixtureGroup.add(heatsink);

      // Emissive Optical Lens Disc
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xedf4ff,
        emissiveIntensity: 2.5,
        roughness: 0.1
      });
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.04, 24), lensMat);
      lens.position.y = -0.12;
      fixtureGroup.add(lens);

      this.scene.add(fixtureGroup);
      this.luminaires.push({ group: fixtureGroup, lensMat });

      // 2. Focused SpotLight
      const spot = new THREE.SpotLight(0xedf4ff, 85, 24, Math.PI / 2.8, 0.65, 1.2);
      spot.position.set(x, y - 0.15, z);
      spot.target.position.set(x, 0, z);
      spot.castShadow = true;
      spot.shadow.bias = -0.001;
      spot.shadow.mapSize.width = 1024;
      spot.shadow.mapSize.height = 1024;
      this.scene.add(spot);
      this.scene.add(spot.target);
      this.spotLights.push(spot);

      // 3. Volumetric Cone Mesh
      const coneGeo = new THREE.CylinderGeometry(0.44, 4.8, y - 0.2, 24, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xedf4ff,
        transparent: true,
        opacity: 0.075,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(x, y / 2, z);
      this.scene.add(cone);
      this.volumetricCones.push({ mesh: cone, material: coneMat });
    });

    this.applyMode(this.mode);
  }

  setMode(newMode) {
    this.mode = newMode;
    this.applyMode(newMode);
  }

  applyMode(mode) {
    if (mode === 'led') {
      // 5000K Crisp Daylight White Commercial LED (High Efficacy, AS/NZS 1680 Compliant)
      this.renderer.toneMappingExposure = 1.05;
      this.ambientLight.color.setHex(0x2a3648);
      this.ambientLight.intensity = 0.75;
      this.floorMaterial.map = this.normalFloorTexture;
      this.floorMaterial.needsUpdate = true;

      this.spotLights.forEach(spot => {
        spot.color.setHex(0xedf4ff);
        spot.intensity = 95 * this.dimmingLevel;
        spot.angle = Math.PI / 2.7; // Wide 120-degree distribution
        spot.penumbra = 0.75;
      });

      this.luminaires.forEach(lum => {
        lum.lensMat.emissive.setHex(0xedf4ff);
        lum.lensMat.emissiveIntensity = 3.2 * this.dimmingLevel;
      });

      this.volumetricCones.forEach(vc => {
        vc.mesh.visible = true;
        vc.material.color.setHex(0xedf4ff);
        vc.material.opacity = 0.065 * this.dimmingLevel;
      });

    } else if (mode === 'halide') {
      // 400W Metal Halide (Old Amber/Yellow, Glare, Dark Aisles, Ballast Flicker)
      this.renderer.toneMappingExposure = 0.88;
      this.ambientLight.color.setHex(0x0e131b);
      this.ambientLight.intensity = 0.25; // Pitch black shadows!
      this.floorMaterial.map = this.normalFloorTexture;
      this.floorMaterial.needsUpdate = true;

      this.spotLights.forEach(spot => {
        spot.color.setHex(0xffaa40);
        spot.intensity = 115 * this.dimmingLevel;
        spot.angle = Math.PI / 4.2; // Narrow harsh beam
        spot.penumbra = 0.25;
      });

      this.luminaires.forEach(lum => {
        lum.lensMat.emissive.setHex(0xff9922);
        lum.lensMat.emissiveIntensity = 2.0 * this.dimmingLevel;
      });

      this.volumetricCones.forEach(vc => {
        vc.mesh.visible = true;
        vc.material.color.setHex(0xff9922);
        vc.material.opacity = 0.12 * this.dimmingLevel;
      });

    } else if (mode === 'heatmap') {
      // Photometric Lux Engineering Heatmap
      this.renderer.toneMappingExposure = 1.2;
      this.ambientLight.color.setHex(0xffffff);
      this.ambientLight.intensity = 1.0;
      this.floorMaterial.map = this.ledHeatmapTexture;
      this.floorMaterial.needsUpdate = true;

      this.spotLights.forEach(spot => {
        spot.intensity = 25;
      });

      this.volumetricCones.forEach(vc => {
        vc.mesh.visible = false;
      });
    }
  }

  setDimming(level) {
    this.dimmingLevel = level;
    this.applyMode(this.mode);
  }

  setCameraPreset(presetName) {
    if (presetName === 'overview') {
      this.targetCameraPos.set(0, 14, 21);
      this.targetLookAt.set(0, 2, 0);
    } else if (presetName === 'forklift') {
      this.targetCameraPos.set(-1.5, 2.0, 5.5);
      this.targetLookAt.set(-1.5, 1.8, -10.0);
    } else if (presetName === 'cad') {
      this.targetCameraPos.set(0, 24, 0.1);
      this.targetLookAt.set(0, 0, 0);
    } else if (presetName === 'rack') {
      this.targetCameraPos.set(-8.5, 3.2, -3.8);
      this.targetLookAt.set(-12, 3.2, -4);
    }
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.width = this.container.clientWidth || window.innerWidth;
      this.height = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }

  animate(time) {
    requestAnimationFrame((t) => this.animate(t));

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Subtle 60Hz flicker simulation in Metal Halide mode
    if (this.mode === 'halide') {
      const flicker = 1.0 + (Math.sin(elapsed * 45) * 0.03) + (Math.random() - 0.5) * 0.04;
      this.spotLights.forEach(spot => {
        spot.intensity = 115 * this.dimmingLevel * flicker;
      });
    }

    // Forklift Amber Beacon Rotation
    if (this.beaconLight) {
      this.beaconLight.intensity = 1.5 + Math.sin(elapsed * 8) * 1.0;
    }

    // Smooth Camera Transition Lerp
    this.camera.position.lerp(this.targetCameraPos, 0.045);
    this.controls.target.lerp(this.targetLookAt, 0.045);
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}
