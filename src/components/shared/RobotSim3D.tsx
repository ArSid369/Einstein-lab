import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, Pause, Play, RotateCcw } from 'lucide-react';
import { SimulationConfig } from '../../types/newtonlab';

export interface LiveSimCommand {
  mode?: 'rover' | 'arm';
  waypoints?: Array<{ x: number; z: number }>;
  joints?: number[];
  runId: number;
}

interface RobotSim3DProps {
  config: SimulationConfig;
  liveCommand?: LiveSimCommand | null;
  executionState: 'idle' | 'running' | 'passed' | 'error';
  allowFullscreen?: boolean;
}

const _vecTarget = new THREE.Vector3();
const _vecNext = new THREE.Vector3();
const _vecDir = new THREE.Vector3();

function createLabFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#131c2e';
  ctx.fillRect(0, 0, 512, 512);

  // Sub-grid 8x8
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  ctx.lineWidth = 1;
  const step = 64;
  for (let i = 0; i <= 512; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Major border lines
  ctx.strokeStyle = 'rgba(83, 185, 71, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 512, 512);

  // Calibration crosshairs
  ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.fillRect(254, 248, 4, 16);
  ctx.fillRect(248, 254, 16, 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildRoverModel(): {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  lidarTurret: THREE.Mesh;
  statusBar: THREE.Mesh;
} {
  const group = new THREE.Group();

  const chassisMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.55, roughness: 0.35 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.42 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x53b947, metalness: 0.3, roughness: 0.32 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.08, roughness: 0.85 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.22 });
  const statusMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x16a34a,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  // 1. Lower battery bay (bottom rests cleanly above wheel axle)
  const lowerBay = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.78), darkMetalMat);
  lowerBay.position.set(0, 0.2, 0);
  lowerBay.castShadow = true;
  group.add(lowerBay);

  // 2. Main anodized deck plate
  const mainDeck = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.92), chassisMat);
  mainDeck.position.set(0, 0.31, 0);
  mainDeck.castShadow = true;
  group.add(mainDeck);

  // 3. Green front canopy hood
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.09, 0.34), accentMat);
  canopy.position.set(0, 0.39, 0.18);
  canopy.castShadow = true;
  group.add(canopy);

  // 4. Front ultrasonic / stereo camera bumper (+Z is forward)
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.1), darkMetalMat);
  bumper.position.set(0, 0.26, 0.48);
  group.add(bumper);

  // 5 & 6. Stereo optics lenses
  const lensGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.04, 16);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.12 });
  [-0.14, 0.14].forEach((xOff) => {
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(xOff, 0.38, 0.37);
    group.add(lens);
  });

  // 7. Rear status light bar
  const statusBar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.04), statusMat);
  statusBar.position.set(0, 0.37, -0.44);
  group.add(statusBar);

  // 8. LiDAR pedestal + rotating turret
  const lidarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.08, 20), darkMetalMat);
  lidarBase.position.set(0, 0.4, -0.14);
  group.add(lidarBase);

  const lidarTurret = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.11, 20), accentMat);
  lidarTurret.position.set(0, 0.49, -0.14);
  lidarTurret.castShadow = true;
  group.add(lidarTurret);

  // 9–12. Four drive wheels + metallic hubs (bottom touches y = 0)
  const wheels: THREE.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 22);
  const hubGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.11, 14);
  const wheelPositions: Array<[number, number]> = [
    [-0.41, 0.28],
    [0.41, 0.28],
    [-0.41, -0.28],
    [0.41, -0.28],
  ];

  wheelPositions.forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, rubberMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, 0.15, wz);
    wheel.castShadow = true;
    const hub = new THREE.Mesh(hubGeo, hubMat);
    wheel.add(hub);
    group.add(wheel);
    wheels.push(wheel);
  });

  return { group, wheels, lidarTurret, statusBar };
}

function buildRoboticArmModel(): {
  group: THREE.Group;
  waistPivot: THREE.Group;
  shoulderPivot: THREE.Group;
  elbowPivot: THREE.Group;
  leftFinger: THREE.Mesh;
  rightFinger: THREE.Mesh;
} {
  const group = new THREE.Group();

  const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.78, roughness: 0.35 });
  const linkMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.28 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x53b947, metalness: 0.35, roughness: 0.32 });
  const jointMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.22 });

  // 1. Bolted pedestal flange (bottom at y = 0)
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.14, 28), baseMat);
  flange.position.y = 0.07;
  flange.castShadow = true;
  flange.receiveShadow = true;
  group.add(flange);

  // 2. Pedestal column
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.42, 24), baseMat);
  column.position.y = 0.35;
  column.castShadow = true;
  group.add(column);

  // 3. Rotating waist turntable
  const waistPivot = new THREE.Group();
  waistPivot.position.y = 0.56;
  group.add(waistPivot);

  const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.24, 24), accentMat);
  turret.position.y = 0.12;
  turret.castShadow = true;
  waistPivot.add(turret);

  // 4. Shoulder yoke & pivot
  const shoulderPivot = new THREE.Group();
  shoulderPivot.position.y = 0.3;
  waistPivot.add(shoulderPivot);

  const shoulderHub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.44, 20), jointMat);
  shoulderHub.rotation.z = Math.PI / 2;
  shoulderPivot.add(shoulderHub);

  // 5. Upper boom link (L1 = 1.6m)
  const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.6, 0.24), linkMat);
  upperArm.position.y = 0.8;
  upperArm.castShadow = true;
  shoulderPivot.add(upperArm);

  const armStripe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 0.08), accentMat);
  armStripe.position.y = 0.8;
  shoulderPivot.add(armStripe);

  // 6. Elbow pivot
  const elbowPivot = new THREE.Group();
  elbowPivot.position.y = 1.6;
  shoulderPivot.add(elbowPivot);

  const elbowHub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.36, 18), jointMat);
  elbowHub.rotation.z = Math.PI / 2;
  elbowPivot.add(elbowHub);

  // 7. Forearm link (L2 = 1.3m)
  const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.17, 1.3, 0.18), linkMat);
  forearm.position.y = 0.65;
  forearm.castShadow = true;
  elbowPivot.add(forearm);

  // 8. Wrist & gripper base
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.2, 16), baseMat);
  wrist.position.y = 1.35;
  elbowPivot.add(wrist);

  const gripperPalm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.07, 0.12), jointMat);
  gripperPalm.position.y = 1.48;
  elbowPivot.add(gripperPalm);

  // 9 & 10. Parallel gripper jaws
  const fingerGeo = new THREE.BoxGeometry(0.05, 0.24, 0.08);
  const leftFinger = new THREE.Mesh(fingerGeo, accentMat);
  leftFinger.position.set(-0.1, 1.63, 0);
  elbowPivot.add(leftFinger);

  const rightFinger = new THREE.Mesh(fingerGeo, accentMat);
  rightFinger.position.set(0.1, 1.63, 0);
  elbowPivot.add(rightFinger);

  return { group, waistPivot, shoulderPivot, elbowPivot, leftFinger, rightFinger };
}

export const RobotSim3D: React.FC<RobotSim3DProps> = ({
  config,
  liveCommand,
  executionState,
  allowFullscreen = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<0.5 | 1 | 2>(1);
  const [simMode, setSimMode] = useState<'rover' | 'arm'>(config.mode);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'top' | 'close'>('iso');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [telemetry, setTelemetry] = useState({ x: 0, z: 0, headingDeg: 0, progressPct: 0 });
  const [webglError, setWebglError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const stateRef = useRef({
    isPlaying: true,
    speedMultiplier: 1,
    simMode: config.mode,
    waypoints: config.defaultWaypoints || [
      { x: -1.5, z: -1.5 },
      { x: 0, z: 0 },
      { x: 2, z: 1.5 },
    ],
    targetJoints: config.defaultJoints || [0.5, 0.45, 0.75, 0.4],
    currentJoints: [0, 0.2, 0.2, 0.5],
    progress: 0,
    resetRequested: false,
    cameraTargetPos: null as THREE.Vector3 | null,
    cameraTargetLook: null as THREE.Vector3 | null,
    executionState,
  });

  // Sync incoming props into mutable ref without tearing down WebGL scene
  useEffect(() => {
    const nextMode = liveCommand?.mode || config.mode;
    setSimMode(nextMode);
    stateRef.current.simMode = nextMode;

    if (liveCommand?.waypoints && liveCommand.waypoints.length >= 1) {
      stateRef.current.waypoints = liveCommand.waypoints;
      stateRef.current.progress = 0;
      setIsPlaying(true);
      stateRef.current.isPlaying = true;
    } else if (config.defaultWaypoints) {
      stateRef.current.waypoints = config.defaultWaypoints;
      stateRef.current.progress = 0;
    }

    if (liveCommand?.joints && liveCommand.joints.length >= 3) {
      stateRef.current.targetJoints = [
        liveCommand.joints[0] ?? 0.5,
        liveCommand.joints[1] ?? 0.45,
        liveCommand.joints[2] ?? 0.75,
        liveCommand.joints[3] ?? 0.4,
      ];
      setIsPlaying(true);
      stateRef.current.isPlaying = true;
    } else if (config.defaultJoints) {
      stateRef.current.targetJoints = config.defaultJoints;
    }

    stateRef.current.executionState = executionState;
  }, [config, liveCommand, executionState]);

  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    stateRef.current.speedMultiplier = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    stateRef.current.simMode = simMode;
  }, [simMode]);

  useEffect(() => {
    if (cameraPreset === 'iso') {
      stateRef.current.cameraTargetPos = new THREE.Vector3(5.6, 4.6, 6.2);
      stateRef.current.cameraTargetLook = new THREE.Vector3(0, 0.6, 0);
    } else if (cameraPreset === 'top') {
      stateRef.current.cameraTargetPos = new THREE.Vector3(0.01, 9.5, 0.01);
      stateRef.current.cameraTargetLook = new THREE.Vector3(0, 0, 0);
    } else {
      stateRef.current.cameraTargetPos = new THREE.Vector3(2.8, 2.2, 3.2);
      stateRef.current.cameraTargetLook = new THREE.Vector3(0, 0.9, 0);
    }
  }, [cameraPreset]);

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    // Detect Software WebGL (SwiftShader/llvmpipe) to pace CPU rendering safely
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError('WebGL viewport unavailable in this browser session.');
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(mount.clientWidth || 480, mount.clientHeight || 420);

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError('3D viewport context paused. Click Reset to restore.');
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 14, 32);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      46,
      (mount.clientWidth || 480) / (mount.clientHeight || 420),
      0.1,
      100
    );
    camera.position.set(5.6, 4.6, 6.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 2.2;
    controls.maxDistance = 16;
    controls.target.set(0, 0.6, 0);

    controls.addEventListener('start', () => {
      stateRef.current.cameraTargetPos = null;
      stateRef.current.cameraTargetLook = null;
    });

    // 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.75);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.85);
    keyLight.position.set(6, 10, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 0.9);
    rimLight.position.set(-6, 5, -6);
    scene.add(rimLight);

    // Calibration Grid Floor Plane
    const floorTexture = createLabFloorTexture();
    floorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.72,
      metalness: 0.18,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Axis Triad Indicator at origin
    const axesHelper = new THREE.AxesHelper(1.2);
    axesHelper.position.set(-4.2, 0.03, -4.2);
    scene.add(axesHelper);

    // Obstacles & Target Marker Group
    const dynamicEnvGroup = new THREE.Group();
    scene.add(dynamicEnvGroup);

    const obstacleMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.35,
      metalness: 0.3,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });

    (config.obstacles || []).forEach((obs) => {
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.radius * 0.68, obs.radius * 0.72, 0.9, 24),
        obstacleMat
      );
      cyl.position.set(obs.x, 0.45, obs.z);
      cyl.castShadow = true;
      cyl.receiveShadow = true;
      dynamicEnvGroup.add(cyl);

      const safetyRing = new THREE.Mesh(
        new THREE.RingGeometry(obs.radius, obs.radius + 0.06, 32),
        ringMat
      );
      safetyRing.rotation.x = -Math.PI / 2;
      safetyRing.position.set(obs.x, 0.02, obs.z);
      dynamicEnvGroup.add(safetyRing);
    });

    if (config.targetPoint) {
      const targetRing = new THREE.Mesh(
        new THREE.RingGeometry(0.28, 0.38, 28),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
      );
      targetRing.rotation.x = -Math.PI / 2;
      targetRing.position.set(config.targetPoint.x, 0.025, config.targetPoint.z);
      dynamicEnvGroup.add(targetRing);

      const targetCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.24, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6, roughness: 0.25 })
      );
      targetCube.position.set(config.targetPoint.x, 0.12, config.targetPoint.z);
      targetCube.castShadow = true;
      dynamicEnvGroup.add(targetCube);
    }

    // Path Trajectory Line & Nodes
    const pathLineGeo = new THREE.BufferGeometry();
    const pathLineMat = new THREE.LineBasicMaterial({ color: 0x53b947 });
    const pathLine = new THREE.Line(pathLineGeo, pathLineMat);
    pathLine.position.y = 0.05;
    scene.add(pathLine);

    let lastWaypointsHash = '';
    const waypointMarkersGroup = new THREE.Group();
    scene.add(waypointMarkersGroup);

    const syncPathVisuals = (wps: Array<{ x: number; z: number }>) => {
      const hash = JSON.stringify(wps);
      if (hash === lastWaypointsHash) return;
      lastWaypointsHash = hash;

      const pts = wps.map((w) => new THREE.Vector3(w.x, 0, w.z));
      pathLineGeo.setFromPoints(pts);

      while (waypointMarkersGroup.children.length > 0) {
        const child = waypointMarkersGroup.children.pop() as THREE.Mesh;
        child.geometry.dispose();
      }
      const nodeGeo = new THREE.SphereGeometry(0.085, 12, 12);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x53b947,
        emissive: 0x37852d,
        emissiveIntensity: 0.5,
      });
      pts.forEach((p) => {
        const dot = new THREE.Mesh(nodeGeo, nodeMat);
        dot.position.set(p.x, 0.08, p.z);
        waypointMarkersGroup.add(dot);
      });
    };

    // Build Rover & Robotic Arm Models
    const rover = buildRoverModel();
    scene.add(rover.group);

    const arm = buildRoboticArmModel();
    scene.add(arm.group);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let hudTimer = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const s = stateRef.current;

      rover.group.visible = s.simMode === 'rover';
      pathLine.visible = s.simMode === 'rover';
      waypointMarkersGroup.visible = s.simMode === 'rover';
      arm.group.visible = s.simMode === 'arm';

      // Status bar color feedback
      const statusMat = rover.statusBar.material as THREE.MeshStandardMaterial;
      if (s.executionState === 'error') {
        statusMat.color.setHex(0xef4444);
        statusMat.emissive.setHex(0xdc2626);
      } else if (s.executionState === 'passed') {
        statusMat.color.setHex(0x22c55e);
        statusMat.emissive.setHex(0x16a34a);
      } else {
        statusMat.color.setHex(0x53b947);
        statusMat.emissive.setHex(0x37852d);
      }

      if (s.resetRequested) {
        s.progress = 0;
        s.currentJoints = [0, 0.2, 0.2, 0.5];
        s.resetRequested = false;
      }

      if (s.simMode === 'rover') {
        const wps = s.waypoints;
        syncPathVisuals(wps);
        if (wps.length >= 2) {
          if (s.isPlaying) {
            s.progress += delta * 0.22 * s.speedMultiplier;
            if (s.progress > 1) s.progress = 0;
          }
          const totalSegments = wps.length - 1;
          const scaled = s.progress * totalSegments;
          const segIdx = Math.min(Math.floor(scaled), totalSegments - 1);
          const segT = scaled - segIdx;

          _vecTarget.set(wps[segIdx].x, 0, wps[segIdx].z);
          _vecNext.set(wps[segIdx + 1].x, 0, wps[segIdx + 1].z);
          _vecDir.subVectors(_vecNext, _vecTarget);

          rover.group.position.lerpVectors(_vecTarget, _vecNext, segT);
          const heading = Math.atan2(_vecDir.x, _vecDir.z);
          rover.group.rotation.y = heading;

          if (s.isPlaying) {
            rover.wheels.forEach((w) => {
              w.rotation.x += delta * 5.0 * s.speedMultiplier;
            });
            rover.lidarTurret.rotation.y += delta * 4.2 * s.speedMultiplier;
          }

          hudTimer += delta;
          if (hudTimer > 0.15) {
            hudTimer = 0;
            setTelemetry({
              x: Number(rover.group.position.x.toFixed(2)),
              z: Number(rover.group.position.z.toFixed(2)),
              headingDeg: Math.round((heading * 180) / Math.PI),
              progressPct: Math.round(s.progress * 100),
            });
          }
        } else if (wps.length === 1) {
          rover.group.position.set(wps[0].x, 0, wps[0].z);
        }
      } else {
        // 6-DOF Arm smooth joint damping
        const tJoints = s.isPlaying ? s.targetJoints : s.currentJoints;
        for (let i = 0; i < 4; i++) {
          s.currentJoints[i] = THREE.MathUtils.damp(s.currentJoints[i], tJoints[i], 4.5, delta);
        }
        arm.waistPivot.rotation.y = s.currentJoints[0];
        arm.shoulderPivot.rotation.z = -s.currentJoints[1];
        arm.elbowPivot.rotation.z = -s.currentJoints[2];
        const gripOffset = 0.05 + (1 - THREE.MathUtils.clamp(s.currentJoints[3], 0, 1)) * 0.08;
        arm.leftFinger.position.x = -gripOffset;
        arm.rightFinger.position.x = gripOffset;

        hudTimer += delta;
        if (hudTimer > 0.15) {
          hudTimer = 0;
          setTelemetry({
            x: Number(s.currentJoints[0].toFixed(2)),
            z: Number(s.currentJoints[1].toFixed(2)),
            headingDeg: Math.round((s.currentJoints[2] * 180) / Math.PI),
            progressPct: Math.round(THREE.MathUtils.clamp(s.currentJoints[3], 0, 1) * 100),
          });
        }
      }

      // Smooth camera preset transition
      if (s.cameraTargetPos && s.cameraTargetLook) {
        camera.position.lerp(s.cameraTargetPos, 1 - Math.exp(-6 * delta));
        controls.target.lerp(s.cameraTargetLook, 1 - Math.exp(-6 * delta));
        if (camera.position.distanceTo(s.cameraTargetPos) < 0.05) {
          s.cameraTargetPos = null;
          s.cameraTargetLook = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    tick();

    const resizeObserver = new ResizeObserver(() => {
      if (!mount || disposed) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      controls.dispose();
      floorTexture.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [config]);

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-0'
          : 'relative w-full h-full min-h-[380px] rounded-[10px] border border-slate-800'
      } overflow-hidden bg-[#0F172A] select-none`}
    >
      {/* Isolated WebGL Mount Container */}
      <div ref={containerRef} className="w-full h-full" />

      {webglError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0F172A] text-slate-300 text-sm p-6 text-center">
          <div>
            <p className="font-medium text-white">{webglError}</p>
            <p className="mt-1 text-xs text-slate-400">2D telemetry coordinates remain active below.</p>
          </div>
        </div>
      )}

      {/* Top-Left Minimal Spec Readout (Semantic DOM Overlay, no backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 flex items-center gap-3 tabular-nums">
          <span className="font-medium text-white">
            {simMode === 'rover' ? 'Mobile Rover 3D' : '6-DOF Robotic Arm'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="font-mono text-slate-300">
            {simMode === 'rover'
              ? `Pose (${telemetry.x}, ${telemetry.z})m · ${telemetry.headingDeg}°`
              : `J1 ${telemetry.x} rad · J2 ${telemetry.z} rad · J3 ${telemetry.headingDeg}°`}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setSimMode('rover')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                simMode === 'rover' ? 'bg-[#53b947] text-[#0B1A09]' : 'text-slate-300 hover:text-white'
              }`}
            >
              Rover
            </button>
            <button
              type="button"
              onClick={() => setSimMode('arm')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                simMode === 'arm' ? 'bg-[#53b947] text-[#0B1A09]' : 'text-slate-300 hover:text-white'
              }`}
            >
              Arm
            </button>
          </div>

          {allowFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              className="inline-flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              aria-label={isFullscreen ? 'Exit fullscreen 3D simulation' : 'Fullscreen 3D simulation'}
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen 3D simulation'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#84E179]" />
                  <span>Exit</span>
                </>
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center max-w-[94%]">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          className="mb-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-t-md bg-slate-900/95 border border-b-0 border-slate-700 text-[11px] font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          {dockCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{dockCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
        </button>

        {!dockCollapsed && (
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-900/95 border border-slate-700/90 rounded-[10px] px-3 py-2 shadow-lg">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stateRef.current.resetRequested = true;
                setIsPlaying(true);
                stateRef.current.isPlaying = true;
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <div className="h-4 w-px bg-slate-700 mx-0.5" />

            {/* Speed selector */}
            <div className="flex items-center gap-0.5 bg-slate-800 rounded-md p-0.5">
              {([0.5, 1, 2] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2 py-1 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                    speedMultiplier === spd ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-700 mx-0.5" />

            {/* Camera presets */}
            <div className="flex items-center gap-0.5 bg-slate-800 rounded-md p-0.5">
              {(
                [
                  { id: 'iso', label: 'Iso' },
                  { id: 'top', label: 'Top' },
                  { id: 'close', label: 'Close' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCameraPreset(preset.id)}
                  className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    cameraPreset === preset.id ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
