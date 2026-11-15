'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AvatarState } from '@/lib/types';
import {
  RotateCcw,
  Play,
  Pause,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Sun,
  Layers,
  AlertTriangle,
} from 'lucide-react';

interface AvatarStudioCanvasProps {
  avatarState: AvatarState;
  onCameraChange?: (angle: string) => void;
}

export function AvatarStudioCanvas({ avatarState }: AvatarStudioCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mannequinGroupRef = useRef<THREE.Group | null>(null);

  // Lighting references for lighting preset changes
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Smooth camera transition state
  const targetCameraPos = useRef(new THREE.Vector3(0, 1.25, 4.0));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.05, 0));
  const isTransitioningRef = useRef(false);

  // Turntable animation state
  const [isTurntable, setIsTurntable] = useState(false);
  const isTurntableRef = useRef(false);
  isTurntableRef.current = isTurntable;

  const [activePreset, setActivePreset] = useState<'front' | 'side' | 'back' | 'close' | 'full'>('front');
  const [lightingMode, setLightingMode] = useState<'atelier' | 'runway' | 'noir'>('atelier');
  const [webglError, setWebglError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate procedural micro-weave bump texture once
  const fabricBumpTextureRef = useRef<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#909090';
      for (let x = 0; x < 128; x += 4) {
        for (let y = 0; y < 128; y += 4) {
          if ((x + y) % 8 === 0) {
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(16, 16);
      fabricBumpTextureRef.current = texture;
    }
  }, []);

  // WebGL Availability Check
  const checkWebGLSupport = (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return Boolean(
        window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    if (!checkWebGLSupport()) {
      setWebglError(true);
      setIsLoading(false);
      return;
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0e0f); // Luxury deep obsidian-charcoal
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.25, 4.0);
    cameraRef.current = camera;

    // 3. Renderer with ACES Filmic tone mapping & high fidelity antialiasing
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls with Damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.04; // Don't clip beneath floor
    controls.minDistance = 1.6;
    controls.maxDistance = 6.0;
    controls.target.set(0, 1.05, 0);
    controlsRef.current = controls;

    // Stop automated turntable when user manually grabs
    controls.addEventListener('start', () => {
      setIsTurntable(false);
      isTransitioningRef.current = false;
    });

    // 5. Multi-tiered Three-Point Fashion Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Warm Key Light (Champagne Gold Warmth)
    const keyLight = new THREE.DirectionalLight(0xfaf3eb, 1.85);
    keyLight.position.set(3.2, 4.2, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Cool Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0xd0deeb, 0.75);
    fillLight.position.set(-3.2, 3.2, 2.2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Sharp Champagne Rim / Silhouette Light
    const rimLight = new THREE.DirectionalLight(0xb89560, 2.2);
    rimLight.position.set(0, 4.2, -3.5);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Subtle Overhead Runway Spotlight
    const spotLight = new THREE.SpotLight(0xfff7ea, 0.9, 12, Math.PI / 5, 0.4);
    spotLight.position.set(0, 5.2, 0);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // 6. Atelier Floor Disc with Champagne Gold Beveled Trim & Soft Shadows
    const floorGeo = new THREE.CircleGeometry(3.6, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x131315,
      roughness: 0.85,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Outer Champagne Gold Accent Ring
    const outerRingGeo = new THREE.RingGeometry(2.35, 2.37, 64);
    const goldRingMat = new THREE.MeshStandardMaterial({
      color: 0xb89560,
      metalness: 0.85,
      roughness: 0.25,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, goldRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.001;
    scene.add(outerRing);

    // Inner Concentric Studio Disc
    const innerDiscGeo = new THREE.CircleGeometry(1.2, 48);
    const innerDiscMat = new THREE.MeshStandardMaterial({
      color: 0x18181a,
      roughness: 0.7,
      metalness: 0.2,
    });
    const innerDisc = new THREE.Mesh(innerDiscGeo, innerDiscMat);
    innerDisc.rotation.x = -Math.PI / 2;
    innerDisc.position.y = 0.002;
    innerDisc.receiveShadow = true;
    scene.add(innerDisc);

    // 7. Mannequin Assembly Group
    const mannequinGroup = new THREE.Group();
    mannequinGroupRef.current = mannequinGroup;
    scene.add(mannequinGroup);

    buildMannequin(mannequinGroup, avatarState);

    // 8. Animation & Interpolation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isTransitioningRef.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCameraPos.current, 0.08);
        controlsRef.current.target.lerp(targetLookAt.current, 0.08);
        controlsRef.current.update();

        if (cameraRef.current.position.distanceTo(targetCameraPos.current) < 0.015) {
          isTransitioningRef.current = false;
        }
      } else if (isTurntableRef.current && cameraRef.current && controlsRef.current) {
        // Continuous smooth 360 degree turntable orbit
        const cam = cameraRef.current;
        const radius = Math.sqrt(cam.position.x * cam.position.x + cam.position.z * cam.position.z);
        const currentAngle = Math.atan2(cam.position.x, cam.position.z);
        const nextAngle = currentAngle + 0.0065;
        cam.position.x = radius * Math.sin(nextAngle);
        cam.position.z = radius * Math.cos(nextAngle);
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
      } else {
        controls.update();
      }

      renderer.render(scene, camera);
    };
    animate();
    setIsLoading(false);

    // 9. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 10. Memory Disposal on Component Unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (sceneRef.current) {
        disposeHierarchy(sceneRef.current);
        sceneRef.current.clear();
      }
      renderer.dispose();
    };
  }, []);

  // Update lighting mode dynamically
  useEffect(() => {
    if (!keyLightRef.current || !rimLightRef.current || !fillLightRef.current) return;
    if (lightingMode === 'atelier') {
      keyLightRef.current.intensity = 1.85;
      keyLightRef.current.color.setHex(0xfaf3eb);
      rimLightRef.current.intensity = 2.2;
      fillLightRef.current.intensity = 0.75;
    } else if (lightingMode === 'runway') {
      keyLightRef.current.intensity = 2.4;
      keyLightRef.current.color.setHex(0xffffff);
      rimLightRef.current.intensity = 2.8;
      fillLightRef.current.intensity = 0.5;
    } else if (lightingMode === 'noir') {
      keyLightRef.current.intensity = 1.1;
      keyLightRef.current.color.setHex(0xd8d8d8);
      rimLightRef.current.intensity = 2.9;
      rimLightRef.current.color.setHex(0xb89560);
      fillLightRef.current.intensity = 0.3;
    }
  }, [lightingMode]);

  // Rebuild 3D Mannequin & Garment when state changes
  useEffect(() => {
    if (mannequinGroupRef.current) {
      buildMannequin(mannequinGroupRef.current, avatarState);
    }
  }, [avatarState]);

  // Recursive Memory Disposal Helper
  function disposeHierarchy(obj: THREE.Object3D) {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // Procedural 3D Mannequin and Realistic Garment Engineering
  // -------------------------------------------------------------
  function buildMannequin(group: THREE.Group, state: AvatarState) {
    disposeHierarchy(group);
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const skinColor = new THREE.Color(state.skinTone || '#C68B59');
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.38,
      metalness: 0.14,
    });

    const isMale = state.gender === 'men' || state.gender === 'male';

    const bodyScaleX =
      state.bodyShape === 'athletic'
        ? 1.08
        : state.bodyShape === 'curvy'
        ? 1.16
        : state.bodyShape === 'broad'
        ? 1.24
        : 0.95;

    const heightScale = state.heightCm / 175; // Normalized around 175cm

    // 1. Head Sculpt & Sleek Hair Knot / Contour
    const headGeo = new THREE.SphereGeometry(isMale ? 0.142 : 0.134, 32, 32);
    headGeo.scale(0.84, 1.12, 0.94);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.y = 1.7 * heightScale;
    head.castShadow = true;
    group.add(head);

    // Sculpted Jawline / Chin Plane
    const jawGeo = new THREE.ConeGeometry(isMale ? 0.085 : 0.065, 0.09, 16);
    jawGeo.rotateX(Math.PI);
    const jaw = new THREE.Mesh(jawGeo, skinMaterial);
    jaw.position.set(0, 1.62 * heightScale, 0.04);
    group.add(jaw);

    // Minimal Hair Silhouette
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.6,
      metalness: 0.2,
    });
    const hairGeo = new THREE.SphereGeometry(isMale ? 0.146 : 0.138, 24, 24);
    hairGeo.scale(0.85, 1.05, 0.95);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, (1.72 + (isMale ? 0.01 : 0.02)) * heightScale, -0.02);
    group.add(hair);

    // 2. Neck with Sternocleidomastoid Contour
    const neckTopRadius = (isMale ? 0.064 : 0.046) * bodyScaleX;
    const neckBottomRadius = (isMale ? 0.082 : 0.062) * bodyScaleX;
    const neckGeo = new THREE.CylinderGeometry(neckTopRadius, neckBottomRadius, 0.13 * heightScale, 24);
    const neck = new THREE.Mesh(neckGeo, skinMaterial);
    neck.position.y = 1.565 * heightScale;
    group.add(neck);

    // 3. Clavicle & Shoulder Cap Band
    const shoulderSpan = (isMale ? 0.245 : 0.185) * bodyScaleX;
    const clavicleGeo = new THREE.CylinderGeometry(0.045, 0.05, shoulderSpan * 2, 24);
    clavicleGeo.rotateZ(Math.PI / 2);
    const clavicles = new THREE.Mesh(clavicleGeo, skinMaterial);
    clavicles.position.y = 1.48 * heightScale;
    group.add(clavicles);

    // 4. Torso: Anatomically Differentiated Silhouette
    if (isMale) {
      // V-Taper Athletic Stance: Broad shoulders, tapered waist
      const chestGeo = new THREE.CylinderGeometry(
        0.24 * bodyScaleX, // Broad chest
        0.165 * bodyScaleX, // Tapered mid-waist
        0.36 * heightScale,
        32
      );
      const chest = new THREE.Mesh(chestGeo, skinMaterial);
      chest.position.y = 1.34 * heightScale;
      chest.castShadow = true;
      group.add(chest);

      // Male Hips / Pelvis: Narrow and streamlined
      const hipsGeo = new THREE.CylinderGeometry(
        0.165 * bodyScaleX,
        0.155 * bodyScaleX,
        0.25 * heightScale,
        32
      );
      const hips = new THREE.Mesh(hipsGeo, skinMaterial);
      hips.position.y = 1.05 * heightScale;
      hips.castShadow = true;
      group.add(hips);
    } else {
      // Elegant Hourglass Silhouette: Tapered waist and flared hips
      const chestGeo = new THREE.CylinderGeometry(
        0.178 * bodyScaleX, // Chest contour
        0.126 * bodyScaleX, // Tapered narrow waist
        0.34 * heightScale,
        32
      );
      const chest = new THREE.Mesh(chestGeo, skinMaterial);
      chest.position.y = 1.34 * heightScale;
      chest.castShadow = true;
      group.add(chest);

      // Gentle Bust Line Geometry
      const bustGeo = new THREE.SphereGeometry(0.085 * bodyScaleX, 24, 24);
      bustGeo.scale(1.2, 0.8, 0.9);
      const leftBust = new THREE.Mesh(bustGeo, skinMaterial);
      leftBust.position.set(-0.065 * bodyScaleX, 1.35 * heightScale, 0.075);
      group.add(leftBust);

      const rightBust = new THREE.Mesh(bustGeo, skinMaterial);
      rightBust.position.set(0.065 * bodyScaleX, 1.35 * heightScale, 0.075);
      group.add(rightBust);

      // Female Hips: Flared contour
      const hipsGeo = new THREE.CylinderGeometry(
        0.13 * bodyScaleX,
        0.192 * bodyScaleX,
        0.25 * heightScale,
        32
      );
      const hips = new THREE.Mesh(hipsGeo, skinMaterial);
      hips.position.y = 1.05 * heightScale;
      hips.castShadow = true;
      group.add(hips);
    }

    // 5. Defined Legs (Thighs, Knees, Calves, Minimalist Foot Pedestal)
    const legRadius = (isMale ? 0.068 : 0.058) * bodyScaleX;
    const legSpacing = (isMale ? 0.098 : 0.088) * bodyScaleX;
    const legGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.65, 0.86 * heightScale, 24);

    const leftLeg = new THREE.Mesh(legGeo, skinMaterial);
    leftLeg.position.set(-legSpacing, 0.45 * heightScale, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, skinMaterial);
    rightLeg.position.set(legSpacing, 0.45 * heightScale, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Minimalist Studio Shoes / Footwear Platform
    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.8,
    });
    const shoeGeo = new THREE.BoxGeometry(0.08 * bodyScaleX, 0.04 * heightScale, 0.18);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-legSpacing, 0.02 * heightScale, 0.03);
    group.add(leftShoe);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(legSpacing, 0.02 * heightScale, 0.03);
    group.add(rightShoe);

    // 6. Natural Relaxed Runway Arms
    const armRadius = (isMale ? 0.048 : 0.038) * bodyScaleX;
    const armGeo = new THREE.CylinderGeometry(armRadius, armRadius * 0.75, 0.74 * heightScale, 24);
    const shoulderOffset = (isMale ? 0.285 : 0.235) * bodyScaleX;

    const leftArm = new THREE.Mesh(armGeo, skinMaterial);
    leftArm.position.set(-shoulderOffset, 1.18 * heightScale, 0);
    leftArm.rotation.z = 0.11;
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, skinMaterial);
    rightArm.position.set(shoulderOffset, 1.18 * heightScale, 0);
    rightArm.rotation.z = -0.11;
    rightArm.castShadow = true;
    group.add(rightArm);

    // Hands / Palm Accent
    const handGeo = new THREE.SphereGeometry(0.036 * bodyScaleX, 16, 16);
    handGeo.scale(0.7, 1.3, 0.9);
    const leftHand = new THREE.Mesh(handGeo, skinMaterial);
    leftHand.position.set(-(shoulderOffset + 0.04), 0.77 * heightScale, 0);
    group.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinMaterial);
    rightHand.position.set(shoulderOffset + 0.04, 0.77 * heightScale, 0);
    group.add(rightHand);

    // -------------------------------------------------------------
    // Tailored Luxury Garments with Realistic Fabric Materials
    // -------------------------------------------------------------
    const garmentColor = new THREE.Color(state.selectedColor || '#B89560');

    // Material 1: Mulberry Silk Satin (for gowns and eveningwear)
    const satinMaterial = new THREE.MeshStandardMaterial({
      color: garmentColor,
      roughness: 0.32,
      metalness: 0.18,
      bumpMap: fabricBumpTextureRef.current || undefined,
      bumpScale: 0.002,
      side: THREE.DoubleSide,
    });

    // Material 2: Heavyweight Oxford Cotton / Poplin
    const poplinMaterial = new THREE.MeshStandardMaterial({
      color: garmentColor,
      roughness: 0.72,
      metalness: 0.04,
      bumpMap: fabricBumpTextureRef.current || undefined,
      bumpScale: 0.004,
      side: THREE.DoubleSide,
    });

    // Material 3: Double-Faced Wool Gabardine (for trench coats)
    const woolMaterial = new THREE.MeshStandardMaterial({
      color: garmentColor,
      roughness: 0.82,
      metalness: 0.06,
      bumpMap: fabricBumpTextureRef.current || undefined,
      bumpScale: 0.006,
      side: THREE.DoubleSide,
    });

    // Material 4: Champagne Gold Metallic Trim
    const goldTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0xb89560,
      roughness: 0.25,
      metalness: 0.88,
    });

    // Category 1: Column Gowns (The Column Gown / Fleur Bias Midi)
    if (state.selectedCategory === 'dresses') {
      // Sweetheart / Square Neckline Bodice (Clearance offset +0.012 to prevent clipping)
      const bodiceGeo = new THREE.CylinderGeometry(
        0.192 * bodyScaleX,
        0.142 * bodyScaleX,
        0.42 * heightScale,
        36
      );
      const bodice = new THREE.Mesh(bodiceGeo, satinMaterial);
      bodice.position.y = 1.32 * heightScale;
      bodice.castShadow = true;
      group.add(bodice);

      // Gold Neckline Trim Piping
      const neckPipingGeo = new THREE.TorusGeometry(0.193 * bodyScaleX, 0.006, 16, 40);
      const neckPiping = new THREE.Mesh(neckPipingGeo, goldTrimMaterial);
      neckPiping.rotation.x = Math.PI / 2;
      neckPiping.position.y = 1.53 * heightScale;
      group.add(neckPiping);

      // Fluted Column Skirt with Floor-Sweeping Drape
      const skirtGeo = new THREE.CylinderGeometry(
        0.144 * bodyScaleX,
        0.345 * bodyScaleX,
        1.14 * heightScale,
        36,
        1,
        true
      );
      const skirt = new THREE.Mesh(skirtGeo, satinMaterial);
      skirt.position.y = 0.62 * heightScale;
      skirt.castShadow = true;
      group.add(skirt);

      // Back Drape Train
      const trainGeo = new THREE.CylinderGeometry(
        0.13 * bodyScaleX,
        0.28 * bodyScaleX,
        0.85 * heightScale,
        24,
        1,
        true,
        Math.PI * 0.75,
        Math.PI * 0.5
      );
      const train = new THREE.Mesh(trainGeo, satinMaterial);
      train.position.set(0, 0.52 * heightScale, -0.08);
      group.add(train);

      // Hem Ring in Satin Gold
      const hemRingGeo = new THREE.TorusGeometry(0.345 * bodyScaleX, 0.008, 16, 48);
      const hemRing = new THREE.Mesh(hemRingGeo, goldTrimMaterial);
      hemRing.rotation.x = Math.PI / 2;
      hemRing.position.y = 0.05 * heightScale;
      group.add(hemRing);
    }

    // Category 2: Structured Weighted Shirts (Oxford Dress Shirt / Indigo Workshirt)
    else if (state.selectedCategory === 'shirts') {
      const shirtTopRad = (isMale ? 0.255 : 0.198) * bodyScaleX;
      const shirtBotRad = (isMale ? 0.185 : 0.155) * bodyScaleX;

      // Structured Shirt Body
      const shirtGeo = new THREE.CylinderGeometry(shirtTopRad, shirtBotRad, 0.62 * heightScale, 32);
      const shirt = new THREE.Mesh(shirtGeo, poplinMaterial);
      shirt.position.y = 1.25 * heightScale;
      shirt.castShadow = true;
      group.add(shirt);

      // Turned-down Tailored Collar
      const collarGeo = new THREE.TorusGeometry(neckBottomRadius + 0.016, 0.022, 16, 32);
      const collar = new THREE.Mesh(collarGeo, poplinMaterial);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 1.52 * heightScale;
      group.add(collar);

      // Front Button Placket Stripe
      const placketGeo = new THREE.BoxGeometry(0.024, 0.56 * heightScale, 0.01);
      const placket = new THREE.Mesh(placketGeo, poplinMaterial);
      placket.position.set(0, 1.25 * heightScale, (isMale ? 0.22 : 0.175) * bodyScaleX);
      group.add(placket);

      // Micro Horn Buttons (4 buttons)
      const buttonMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.3 });
      const buttonGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.004, 16);
      buttonGeo.rotateX(Math.PI / 2);
      for (let i = 0; i < 4; i++) {
        const btn = new THREE.Mesh(buttonGeo, buttonMat);
        btn.position.set(
          0,
          (1.42 - i * 0.11) * heightScale,
          (isMale ? 0.222 : 0.177) * bodyScaleX
        );
        group.add(btn);
      }

      // Tailored Sleeves along Arms
      const sleeveGeo = new THREE.CylinderGeometry(
        armRadius * 1.35,
        armRadius * 1.2,
        0.54 * heightScale,
        24
      );
      const leftSleeve = new THREE.Mesh(sleeveGeo, poplinMaterial);
      leftSleeve.position.set(-shoulderOffset, 1.24 * heightScale, 0);
      leftSleeve.rotation.z = 0.11;
      group.add(leftSleeve);

      const rightSleeve = new THREE.Mesh(sleeveGeo, poplinMaterial);
      rightSleeve.position.set(shoulderOffset, 1.24 * heightScale, 0);
      rightSleeve.rotation.z = -0.11;
      group.add(rightSleeve);

      // Tailored High-Waist Trousers with Front Crease
      const trouserMat = new THREE.MeshStandardMaterial({
        color: 0x151515,
        roughness: 0.78,
        metalness: 0.05,
      });
      const trouserGeo = new THREE.CylinderGeometry(
        (isMale ? 0.185 : 0.172) * bodyScaleX,
        0.112 * bodyScaleX,
        0.94 * heightScale,
        32
      );
      const trousers = new THREE.Mesh(trouserGeo, trouserMat);
      trousers.position.y = 0.5 * heightScale;
      trousers.castShadow = true;
      group.add(trousers);
    }

    // Category 3: Archival Trench Coats (Azure Trench / Nocturne Overcoat)
    else if (state.selectedCategory === 'outerwear') {
      const coatTop = (isMale ? 0.285 : 0.245) * bodyScaleX;
      const coatBot = (isMale ? 0.385 : 0.345) * bodyScaleX;

      // Heavyweight Layered Coat Silhouette
      const coatGeo = new THREE.CylinderGeometry(coatTop, coatBot, 1.2 * heightScale, 32, 1, true);
      const coat = new THREE.Mesh(coatGeo, woolMaterial);
      coat.position.y = 0.95 * heightScale;
      coat.castShadow = true;
      group.add(coat);

      // Wide Notch Lapels Folded Open
      const lapelGeo = new THREE.BoxGeometry(0.12 * bodyScaleX, 0.36 * heightScale, 0.015);
      const leftLapel = new THREE.Mesh(lapelGeo, woolMaterial);
      leftLapel.position.set(-0.11 * bodyScaleX, 1.34 * heightScale, (isMale ? 0.25 : 0.2) * bodyScaleX);
      leftLapel.rotation.z = 0.18;
      leftLapel.rotation.y = 0.22;
      group.add(leftLapel);

      const rightLapel = new THREE.Mesh(lapelGeo, woolMaterial);
      rightLapel.position.set(0.11 * bodyScaleX, 1.34 * heightScale, (isMale ? 0.25 : 0.2) * bodyScaleX);
      rightLapel.rotation.z = -0.18;
      rightLapel.rotation.y = -0.22;
      group.add(rightLapel);

      // Cinched Waist Belt with Buckle Ring
      const beltRadius = (isMale ? 0.235 : 0.185) * bodyScaleX;
      const beltGeo = new THREE.CylinderGeometry(beltRadius, beltRadius, 0.05 * heightScale, 32, 1, true);
      const belt = new THREE.Mesh(beltGeo, woolMaterial);
      belt.position.y = 1.06 * heightScale;
      group.add(belt);

      // Gold Metallic Belt Buckle
      const buckleGeo = new THREE.TorusGeometry(0.038, 0.007, 16, 24);
      const buckle = new THREE.Mesh(buckleGeo, goldTrimMaterial);
      buckle.position.set(0, 1.06 * heightScale, beltRadius + 0.01);
      group.add(buckle);

      // Double-breasted Horn/Gold Buttons (6 buttons)
      const dbButtonGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.005, 16);
      dbButtonGeo.rotateX(Math.PI / 2);
      for (let row = 0; row < 3; row++) {
        const yPos = (1.32 - row * 0.11) * heightScale;
        const btnL = new THREE.Mesh(dbButtonGeo, goldTrimMaterial);
        btnL.position.set(-0.065 * bodyScaleX, yPos, (isMale ? 0.26 : 0.21) * bodyScaleX);
        group.add(btnL);

        const btnR = new THREE.Mesh(dbButtonGeo, goldTrimMaterial);
        btnR.position.set(0.065 * bodyScaleX, yPos, (isMale ? 0.26 : 0.21) * bodyScaleX);
        group.add(btnR);
      }
    }

    // Category 4: Co-ords & Tailored Sets (Solstice Track Set / Silk Organza Co-Ord)
    else {
      // Cropped Blazer / Structured Corset Top
      const topGeo = new THREE.CylinderGeometry(
        (isMale ? 0.245 : 0.195) * bodyScaleX,
        (isMale ? 0.178 : 0.145) * bodyScaleX,
        0.5 * heightScale,
        32
      );
      const top = new THREE.Mesh(topGeo, satinMaterial);
      top.position.y = 1.28 * heightScale;
      top.castShadow = true;
      group.add(top);

      // Fluid High-Waist Palazzo Trousers with Wide Flare
      const bottomGeo = new THREE.CylinderGeometry(
        (isMale ? 0.19 : 0.165) * bodyScaleX,
        (isMale ? 0.22 : 0.24) * bodyScaleX, // Wide-leg flare
        0.88 * heightScale,
        32
      );
      const bottom = new THREE.Mesh(bottomGeo, satinMaterial);
      bottom.position.y = 0.5 * heightScale;
      bottom.castShadow = true;
      group.add(bottom);

      // Waist Accent Sash Ring
      const sashGeo = new THREE.TorusGeometry((isMale ? 0.18 : 0.15) * bodyScaleX, 0.009, 16, 40);
      const sash = new THREE.Mesh(sashGeo, goldTrimMaterial);
      sash.rotation.x = Math.PI / 2;
      sash.position.y = 1.03 * heightScale;
      group.add(sash);
    }
  }

  // Smooth Camera Preset Controller
  const setCameraPreset = useCallback((preset: 'front' | 'side' | 'back' | 'close' | 'full') => {
    setActivePreset(preset);
    setIsTurntable(false);
    isTransitioningRef.current = true;

    if (preset === 'front') {
      targetCameraPos.current.set(0, 1.25, 3.8);
      targetLookAt.current.set(0, 1.05, 0);
    } else if (preset === 'side') {
      targetCameraPos.current.set(3.6, 1.25, 0);
      targetLookAt.current.set(0, 1.05, 0);
    } else if (preset === 'back') {
      targetCameraPos.current.set(0, 1.25, -3.8);
      targetLookAt.current.set(0, 1.05, 0);
    } else if (preset === 'close') {
      targetCameraPos.current.set(0, 1.48, 1.95);
      targetLookAt.current.set(0, 1.4, 0);
    } else if (preset === 'full') {
      targetCameraPos.current.set(0, 1.15, 4.5);
      targetLookAt.current.set(0, 0.95, 0);
    }
  }, []);

  // WebGL Fallback View
  if (webglError) {
    return (
      <div className="relative w-full h-full min-h-[500px] lg:min-h-[640px] rounded-xl overflow-hidden bg-obsidian-deep border border-gold/20 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold">
          <AlertTriangle size={32} />
        </div>
        <h3 className="font-editorial text-2xl font-bold text-ivory">Hardware 3D Acceleration Required</h3>
        <p className="text-xs text-stone max-w-md">
          Your browser does not currently support WebGL rendering. Please enable hardware acceleration or view our high-definition editorial catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[640px] rounded-xl overflow-hidden bg-obsidian-deep border border-gold/20 shadow-2xl select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Status Badge & Lighting Mode Switcher */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10 pointer-events-none">
        <div className="pointer-events-auto px-3 py-1 bg-charcoal/80 backdrop-blur-md rounded border border-white/10 text-[10px] font-sans font-bold text-gold uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span>3D FASHION SHOWROOM</span>
        </div>

        {/* Studio Lighting Mode Dropdown */}
        <div className="pointer-events-auto flex items-center bg-charcoal/80 backdrop-blur-md rounded-lg border border-white/10 p-1 text-[10px] text-stone gap-1 font-semibold">
          <Sun size={12} className="text-gold ml-1" />
          <button
            type="button"
            onClick={() => setLightingMode('atelier')}
            className={`px-2 py-0.5 rounded transition-colors ${
              lightingMode === 'atelier' ? 'bg-gold text-obsidian font-bold' : 'hover:text-ivory'
            }`}
          >
            Atelier
          </button>
          <button
            type="button"
            onClick={() => setLightingMode('runway')}
            className={`px-2 py-0.5 rounded transition-colors ${
              lightingMode === 'runway' ? 'bg-gold text-obsidian font-bold' : 'hover:text-ivory'
            }`}
          >
            Runway
          </button>
          <button
            type="button"
            onClick={() => setLightingMode('noir')}
            className={`px-2 py-0.5 rounded transition-colors ${
              lightingMode === 'noir' ? 'bg-gold text-obsidian font-bold' : 'hover:text-ivory'
            }`}
          >
            Noir
          </button>
        </div>
      </div>

      {/* Floating Camera Toolbar */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
        {/* Preset Angles */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-charcoal/85 backdrop-blur-md p-1.5 rounded-lg border border-white/10 text-xs text-stone">
          <button
            type="button"
            onClick={() => setCameraPreset('front')}
            className={`px-2.5 py-1 rounded transition-colors font-semibold uppercase text-[10px] ${
              activePreset === 'front' && !isTurntable ? 'bg-gold text-obsidian' : 'hover:bg-white/10 hover:text-ivory'
            }`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('side')}
            className={`px-2.5 py-1 rounded transition-colors font-semibold uppercase text-[10px] ${
              activePreset === 'side' && !isTurntable ? 'bg-gold text-obsidian' : 'hover:bg-white/10 hover:text-ivory'
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('back')}
            className={`px-2.5 py-1 rounded transition-colors font-semibold uppercase text-[10px] ${
              activePreset === 'back' && !isTurntable ? 'bg-gold text-obsidian' : 'hover:bg-white/10 hover:text-ivory'
            }`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('close')}
            className={`px-2.5 py-1 rounded transition-colors font-semibold uppercase text-[10px] ${
              activePreset === 'close' && !isTurntable ? 'bg-gold text-obsidian' : 'hover:bg-white/10 hover:text-ivory'
            }`}
          >
            Close-Up
          </button>
          <button
            type="button"
            onClick={() => setCameraPreset('full')}
            className={`px-2.5 py-1 rounded transition-colors font-semibold uppercase text-[10px] ${
              activePreset === 'full' && !isTurntable ? 'bg-gold text-obsidian' : 'hover:bg-white/10 hover:text-ivory'
            }`}
          >
            Full
          </button>

          <span className="w-px h-3.5 bg-white/10 mx-0.5" />

          {/* 360 Turntable Auto-Rotate Button */}
          <button
            type="button"
            onClick={() => setIsTurntable(!isTurntable)}
            className={`px-2.5 py-1 rounded transition-colors font-semibold uppercase text-[10px] flex items-center gap-1 ${
              isTurntable ? 'bg-gold text-obsidian font-bold shadow-gold' : 'hover:bg-white/10 hover:text-ivory'
            }`}
            title="360° Automated Turntable Orbit"
          >
            {isTurntable ? <Pause size={10} /> : <Play size={10} />}
            <span>360°</span>
          </button>

          {/* Reset Camera Button */}
          <button
            type="button"
            onClick={() => setCameraPreset('front')}
            className="p-1.5 rounded hover:bg-white/10 text-stone hover:text-ivory transition-colors"
            title="Reset Camera Framing"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Interaction Hint */}
        <div className="pointer-events-auto bg-charcoal/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-stone font-sans hidden sm:block">
          <span>Orbit: Drag &middot; Zoom: Pinch / Wheel</span>
        </div>
      </div>
    </div>
  );
}
