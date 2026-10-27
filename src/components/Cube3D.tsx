import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { FaceId, FaceColor } from '../types';
import { COLOR_HEX, BLANK_HEX } from '../types';

export interface Cube3DRef {
  turnLeft: () => void;
  turnRight: () => void;
  tiltUp: () => void;
  resetView: () => void;
  setFacelets: (facelets: Record<FaceId, (FaceColor | null)[]>) => void;
  animateFaceMove: (
    move: string,
    targetFaceletsOrOnComplete?: Record<FaceId, (FaceColor | null)[]> | (() => void),
    onComplete?: () => void
  ) => void;
  isAnimating: () => boolean;
}

interface Cube3DProps {
  facelets: Record<FaceId, (FaceColor | null)[]>;
  onStickerClick?: (face: FaceId, index: number) => void;
  activeFaceHighlight?: FaceId | null;
  interactive?: boolean;
}

export const Cube3D = forwardRef<Cube3DRef, Cube3DProps>(({
  facelets,
  onStickerClick,
  activeFaceHighlight = null,
  interactive = true,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const cubiesRef = useRef<THREE.Group[]>([]);
  const pivotGroupRef = useRef<THREE.Group | null>(null);
  const stickerMeshesRef = useRef<THREE.Mesh[]>([]);

  const isOrbitingRef = useRef(false);
  const isMoveAnimatingRef = useRef(false);

  const onStickerClickRef = useRef(onStickerClick);
  const faceletsRef = useRef(facelets);

  useEffect(() => {
    onStickerClickRef.current = onStickerClick;
  }, [onStickerClick]);

  useEffect(() => {
    faceletsRef.current = facelets;
  }, [facelets]);

  // Smooth camera orbit animations
  const animateCameraOrbit = useCallback((deltaAzimuth: number, deltaPolar: number = 0) => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera || isOrbitingRef.current || isMoveAnimatingRef.current) return;

    isOrbitingRef.current = true;
    const duration = 240; // ms
    const startTime = performance.now();

    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);

    const startAzimuth = spherical.theta;
    const startPolar = spherical.phi;
    const radius = spherical.radius;

    const targetAzimuth = startAzimuth + deltaAzimuth;
    const targetPolar = THREE.MathUtils.clamp(startPolar + deltaPolar, 0.25, Math.PI - 0.25);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      spherical.theta = THREE.MathUtils.lerp(startAzimuth, targetAzimuth, ease);
      spherical.phi = THREE.MathUtils.lerp(startPolar, targetPolar, ease);
      spherical.radius = radius;

      camera.position.setFromSpherical(spherical).add(controls.target);
      camera.lookAt(controls.target);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isOrbitingRef.current = false;
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const turnLeft = useCallback(() => {
    animateCameraOrbit(Math.PI / 2, 0);
  }, [animateCameraOrbit]);

  const turnRight = useCallback(() => {
    animateCameraOrbit(-Math.PI / 2, 0);
  }, [animateCameraOrbit]);

  const tiltUp = useCallback(() => {
    animateCameraOrbit(0, -Math.PI / 4);
  }, [animateCameraOrbit]);

  const resetView = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || isMoveAnimatingRef.current) return;

    camera.position.set(4.2, 3.4, 4.8);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
  }, []);

  /**
   * Directly sets the cube's 3D sticker colors to the specified state,
   * guaranteeing all cubies are strictly in their canonical positions.
   */
  const setFacelets = useCallback((newState: Record<FaceId, (FaceColor | null)[]>) => {
    faceletsRef.current = newState;

    const scene = sceneRef.current;
    const pivot = pivotGroupRef.current;
    if (scene && pivot) {
      while (pivot.children.length > 0) {
        scene.attach(pivot.children[0]);
      }
      pivot.rotation.set(0, 0, 0);
    }

    for (const c of cubiesRef.current) {
      const canonical = c.userData?.canonicalPos as THREE.Vector3 | undefined;
      if (canonical) {
        c.position.copy(canonical);
      }
      c.rotation.set(0, 0, 0);
    }

    stickerMeshesRef.current.forEach(mesh => {
      const { face: f, index: idx } = mesh.userData as { face: FaceId; index: number };
      const colorName = newState[f]?.[idx];
      const hex = colorName ? COLOR_HEX[colorName] : BLANK_HEX;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setStyle(hex);
    });
  }, []);

  /**
   * Animates a single face turn slice with physical 3D rotation,
   * cleanly settling into targetFacelets on canonical cubie positions.
   */
  const animateFaceMove = useCallback((
    move: string,
    targetFaceletsOrOnComplete?: Record<FaceId, (FaceColor | null)[]> | (() => void),
    maybeOnComplete?: () => void
  ) => {
    let targetFacelets: Record<FaceId, (FaceColor | null)[]> | undefined;
    let onComplete: (() => void) | undefined;

    if (typeof targetFaceletsOrOnComplete === 'function') {
      onComplete = targetFaceletsOrOnComplete;
      targetFacelets = undefined;
    } else {
      targetFacelets = targetFaceletsOrOnComplete;
      onComplete = maybeOnComplete;
    }

    const scene = sceneRef.current;
    const pivot = pivotGroupRef.current;
    const cubies = cubiesRef.current;

    if (!scene || !pivot || cubies.length === 0 || isMoveAnimatingRef.current) {
      onComplete?.();
      return;
    }

    const trimmed = move.trim();
    if (!trimmed) {
      onComplete?.();
      return;
    }

    isMoveAnimatingRef.current = true;

    // Ensure all cubies are at canonical positions before beginning the turn
    for (const c of cubies) {
      const canonical = c.userData?.canonicalPos as THREE.Vector3 | undefined;
      if (canonical) {
        c.position.copy(canonical);
      }
      c.rotation.set(0, 0, 0);
    }
    pivot.rotation.set(0, 0, 0);

    const face = trimmed[0] as FaceId;
    const modifier = trimmed.length > 1 ? trimmed[1] : '';

    // 1. Select the 9 cubies in the target slice
    const sliceCubies: THREE.Group[] = [];
    for (const cubie of cubies) {
      const pos = cubie.position;
      let inSlice = false;
      switch (face) {
        case 'R': inSlice = pos.x > 0.5; break;
        case 'L': inSlice = pos.x < -0.5; break;
        case 'U': inSlice = pos.y > 0.5; break;
        case 'D': inSlice = pos.y < -0.5; break;
        case 'F': inSlice = pos.z > 0.5; break;
        case 'B': inSlice = pos.z < -0.5; break;
      }
      if (inSlice) {
        sliceCubies.push(cubie);
      }
    }

    // 2. Determine rotation axis and target angle
    const axis = new THREE.Vector3();
    let baseAngle = 0;

    switch (face) {
      case 'R':
        axis.set(1, 0, 0);
        baseAngle = -Math.PI / 2;
        break;
      case 'L':
        axis.set(1, 0, 0);
        baseAngle = Math.PI / 2;
        break;
      case 'U':
        axis.set(0, 1, 0);
        baseAngle = -Math.PI / 2;
        break;
      case 'D':
        axis.set(0, 1, 0);
        baseAngle = Math.PI / 2;
        break;
      case 'F':
        axis.set(0, 0, 1);
        baseAngle = -Math.PI / 2;
        break;
      case 'B':
        axis.set(0, 0, 1);
        baseAngle = Math.PI / 2;
        break;
    }

    let targetAngle = baseAngle;
    if (modifier === "'") {
      targetAngle = -baseAngle;
    } else if (modifier === '2') {
      targetAngle = baseAngle * 2;
    }

    // 3. Attach slice cubies to the pivot group
    pivot.rotation.set(0, 0, 0);
    for (const c of sliceCubies) {
      pivot.attach(c);
    }

    // 4. Animate rotation
    const duration = 380; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easeInOutCubic
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      pivot.setRotationFromAxisAngle(axis, targetAngle * ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Detach slice cubies back to scene
        for (const c of sliceCubies) {
          scene.attach(c);
        }
        pivot.rotation.set(0, 0, 0);

        // Snap ALL cubies to canonical positions and zero rotation
        for (const c of cubies) {
          const canonical = c.userData?.canonicalPos as THREE.Vector3 | undefined;
          if (canonical) {
            c.position.copy(canonical);
          }
          c.rotation.set(0, 0, 0);
        }

        // Apply targetFacelets if provided, otherwise faceletsRef.current
        const faceletsToApply = targetFacelets || faceletsRef.current;
        if (targetFacelets) {
          faceletsRef.current = targetFacelets;
        }

        stickerMeshesRef.current.forEach(mesh => {
          const { face: f, index: idx } = mesh.userData as { face: FaceId; index: number };
          const colorName = faceletsToApply[f]?.[idx];
          const hex = colorName ? COLOR_HEX[colorName] : BLANK_HEX;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.color.setStyle(hex);
        });

        isMoveAnimatingRef.current = false;
        onComplete?.();
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const isAnimating = useCallback(() => {
    return isMoveAnimatingRef.current || isOrbitingRef.current;
  }, []);

  useImperativeHandle(ref, () => ({
    turnLeft,
    turnRight,
    tiltUp,
    resetView,
    setFacelets,
    animateFaceMove,
    isAnimating,
  }), [turnLeft, turnRight, tiltUp, resetView, setFacelets, animateFaceMove, isAnimating]);

  // Update sticker colors when facelets state changes
  useEffect(() => {
    if (isMoveAnimatingRef.current) return;
    stickerMeshesRef.current.forEach(mesh => {
      const { face, index } = mesh.userData as { face: FaceId; index: number };
      const colorName = facelets[face]?.[index];
      const hex = colorName ? COLOR_HEX[colorName] : BLANK_HEX;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setStyle(hex);

      // Subtle face highlight if this face is the active turn face
      if (activeFaceHighlight === face) {
        mat.emissive.setStyle('#222222');
      } else {
        mat.emissive.setStyle('#000000');
      }
    });
  }, [facelets, activeFaceHighlight]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#DFDFDF');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4.2, 3.4, 4.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.85;
    controls.minDistance = 3.2;
    controls.maxDistance = 9;
    controls.enablePan = false;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(6, 10, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight2.position.set(-8, -4, -6);
    scene.add(dirLight2);

    // 6. Pivot group for slice turns
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);
    pivotGroupRef.current = pivotGroup;

    // 7. Construct 3D Cube Meshes
    const cubieGeo = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
      metalness: 0.1,
    });

    const stickerOffset = 0.478;
    const stickerGeo = new THREE.BoxGeometry(0.86, 0.86, 0.025);

    const stickerMeshes: THREE.Mesh[] = [];
    const cubies: THREE.Group[] = [];

    const createSticker = (face: FaceId, index: number, rot: [number, number, number], pos: [number, number, number]) => {
      const colorName = faceletsRef.current[face]?.[index];
      const initialHex = colorName ? COLOR_HEX[colorName] : BLANK_HEX;
      const mat = new THREE.MeshStandardMaterial({
        color: initialHex,
        roughness: 0.25,
        metalness: 0.05,
      });
      const mesh = new THREE.Mesh(stickerGeo, mat);
      mesh.rotation.set(rot[0], rot[1], rot[2]);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.userData = { face, index };
      stickerMeshes.push(mesh);
      return mesh;
    };

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;

          const cubie = new THREE.Group();
          cubie.position.set(x, y, z);
          cubie.userData = { canonicalPos: new THREE.Vector3(x, y, z) };

          // Black inner body
          const body = new THREE.Mesh(cubieGeo, bodyMat);
          cubie.add(body);

          // Up (U) face: y = 1
          if (y === 1) {
            const idx = (z + 1) * 3 + (x + 1);
            const sticker = createSticker('U', idx, [-Math.PI / 2, 0, 0], [0, stickerOffset, 0]);
            cubie.add(sticker);
          }
          // Down (D) face: y = -1
          if (y === -1) {
            const idx = (1 - z) * 3 + (x + 1);
            const sticker = createSticker('D', idx, [Math.PI / 2, 0, 0], [0, -stickerOffset, 0]);
            cubie.add(sticker);
          }
          // Right (R) face: x = 1
          if (x === 1) {
            const idx = (1 - y) * 3 + (1 - z);
            const sticker = createSticker('R', idx, [0, Math.PI / 2, 0], [stickerOffset, 0, 0]);
            cubie.add(sticker);
          }
          // Left (L) face: x = -1
          if (x === -1) {
            const idx = (1 - y) * 3 + (z + 1);
            const sticker = createSticker('L', idx, [0, -Math.PI / 2, 0], [-stickerOffset, 0, 0]);
            cubie.add(sticker);
          }
          // Front (F) face: z = 1
          if (z === 1) {
            const idx = (1 - y) * 3 + (x + 1);
            const sticker = createSticker('F', idx, [0, 0, 0], [0, 0, stickerOffset]);
            cubie.add(sticker);
          }
          // Back (B) face: z = -1
          if (z === -1) {
            const idx = (1 - y) * 3 + (1 - x);
            const sticker = createSticker('B', idx, [0, Math.PI, 0], [0, 0, -stickerOffset]);
            cubie.add(sticker);
          }

          scene.add(cubie);
          cubies.push(cubie);
        }
      }
    }

    cubiesRef.current = cubies;
    stickerMeshesRef.current = stickerMeshes;

    // 8. Raycaster for Click-to-Paint on 3D tiles (only if interactive)
    const raycaster = new THREE.Raycaster();
    let downX = 0;
    let downY = 0;
    let downTime = 0;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive || isMoveAnimatingRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      downX = clientX;
      downY = clientY;
      downTime = performance.now();
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      if (!interactive || isMoveAnimatingRef.current) return;
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      const dist = Math.hypot(clientX - downX, clientY - downY);
      const duration = performance.now() - downTime;

      // Click threshold: < 6px travel, < 350ms duration
      if (dist < 6 && duration < 350) {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((clientX - rect.left) / rect.width) * 2 - 1,
          -((clientY - rect.top) / rect.height) * 2 + 1
        );

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(stickerMeshesRef.current, false);

        if (hits.length > 0) {
          const hit = hits[0].object;
          const { face, index } = hit.userData as { face: FaceId; index: number };
          onStickerClickRef.current?.(face, index);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handlePointerDown);
    dom.addEventListener('mouseup', handlePointerUp);
    dom.addEventListener('touchstart', handlePointerDown, { passive: true });
    dom.addEventListener('touchend', handlePointerUp, { passive: true });

    // 9. Render Loop
    let animId: number;
    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      controls.update();
      renderer.render(scene, camera);
    };
    renderLoop();

    // 10. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', handlePointerDown);
      dom.removeEventListener('mouseup', handlePointerUp);
      dom.removeEventListener('touchstart', handlePointerDown);
      dom.removeEventListener('touchend', handlePointerUp);
      renderer.dispose();
      cubieGeo.dispose();
      bodyMat.dispose();
      stickerGeo.dispose();
      if (dom.parentNode === container) {
        container.removeChild(dom);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[380px] sm:h-[440px] md:h-[480px] cursor-grab active:cursor-grabbing relative select-none"
      style={{ backgroundColor: '#DFDFDF' }}
    />
  );
});
