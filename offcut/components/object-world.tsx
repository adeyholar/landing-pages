"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { ObjectKind } from "@/components/object";

type Props = {
  kind: ObjectKind;
  finish: string;
  turned: boolean;
  paused: boolean;
};
const palette: Record<string, string> = {
  natural: "#c49862",
  cherry: "#874b35",
  ink: "#495465",
};

// A deterministic, gently irregular open grain. No remote textures or models.
// The shared pixels are generated once; each renderer owns and disposes its texture.
let grainCanvas: HTMLCanvasElement | undefined;
function woodTexture() {
  if (grainCanvas) return grainMap(grainCanvas);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const context = canvas.getContext("2d")!;
  const image = context.createImageData(canvas.width, canvas.height);
  const grainNoise = new Float32Array(2048);
  let seed = 4271;
  for (let i = 0; i < grainNoise.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    grainNoise[i] = (seed / 4294967295) * 2 - 1;
  }
  const noise = (position: number) => {
    const base = Math.floor(position);
    const fraction = position - base;
    const smooth = fraction * fraction * (3 - 2 * fraction);
    const a = grainNoise[((base % 2048) + 2048) % 2048];
    const b = grainNoise[(((base + 1) % 2048) + 2048) % 2048];
    return a + (b - a) * smooth;
  };
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const u = x / 512;
      const v = y / 1024;
      const bend = noise(v * 2.8 + 927) * 0.9 + noise(v * 11 + 526) * 0.11;
      const broad = noise(u * 13 + bend * 0.2);
      const grain = noise(u * 195 + bend * 2.4);
      const fine = noise(u * 479 + bend * 5 + noise(v * 44 + 882) * 0.12);
      const pore = Math.pow(Math.max(0, noise(u * 307 + bend * 3.7)), 8);
      const shade = 217 + broad * 3 + grain * 5 + fine * 2 - pore * 7;
      const i = (y * canvas.width + x) * 4;
      image.data[i] = shade;
      image.data[i + 1] = shade;
      image.data[i + 2] = shade;
      image.data[i + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  grainCanvas = canvas;
  return grainMap(canvas);
}

function grainMap(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function contactTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 64);
  gradient.addColorStop(0, "rgba(44, 28, 20, 0.3)");
  gradient.addColorStop(0.35, "rgba(44, 28, 20, 0.16)");
  gradient.addColorStop(1, "rgba(44, 28, 20, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

// Turned profiles and rounded joinery keep every silhouette smooth at close range.
function turnedGeometry(points: [number, number][], segments = 96) {
  return new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}
function roundedDisc(radius: number, height: number) {
  const bevel = Math.min(0.055, height * 0.28);
  const points: [number, number][] = [
    [0, 0],
    [radius - bevel, 0],
  ];
  for (let i = 1; i <= 10; i++) {
    const angle = -Math.PI / 2 + ((i / 10) * Math.PI) / 2;
    points.push([
      radius - bevel + Math.cos(angle) * bevel,
      bevel + Math.sin(angle) * bevel,
    ]);
  }
  points.push([radius, height - bevel]);
  for (let i = 1; i <= 10; i++) {
    const angle = ((i / 10) * Math.PI) / 2;
    points.push([
      radius - bevel + Math.cos(angle) * bevel,
      height - bevel + Math.sin(angle) * bevel,
    ]);
  }
  points.push([0, height]);
  const geometry = turnedGeometry(points, 128);
  const position = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  for (let i = 0; i < position.count; i++) {
    uv.setXY(
      i,
      position.getX(i) / (2 * radius) + 0.5,
      position.getZ(i) / (2 * radius) + 0.5,
    );
  }
  return geometry;
}

function createFurniture(
  kind: ObjectKind,
  material: THREE.MeshPhysicalMaterial,
) {
  const group = new THREE.Group();
  function part(
    geometry: THREE.BufferGeometry,
    x = 0,
    y = 0,
    z = 0,
    ownMaterial = material,
  ) {
    const mesh = new THREE.Mesh(geometry, ownMaterial);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }
  function leg(top: THREE.Vector3, bottom: THREE.Vector3, radius = 0.105) {
    const length = top.distanceTo(bottom);
    const mesh = part(
      turnedGeometry([
        [0, 0],
        [radius * 0.58, 0],
        [radius * 0.76, 0.016],
        [radius * 0.82, 0.045],
        [radius, length - 0.08],
        [radius * 0.96, length - 0.025],
        [radius * 0.72, length],
        [0, length],
      ]),
    );
    mesh.position.copy(bottom);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      top.clone().sub(bottom).normalize(),
    );
  }
  if (kind === "stool") {
    part(roundedDisc(0.86, 0.21), 0, 1.3, 0);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 2;
      leg(
        new THREE.Vector3(Math.cos(angle) * 0.46, 1.37, Math.sin(angle) * 0.46),
        new THREE.Vector3(
          Math.cos(angle) * 0.72,
          0.015,
          Math.sin(angle) * 0.72,
        ),
        0.15,
      );
    }
    part(roundedDisc(0.53, 0.08), 0, 1.23, 0);
  } else if (kind === "table") {
    part(roundedDisc(0.98, 0.16), 0, 1.55, 0);
    const profile = new THREE.SplineCurve([
      new THREE.Vector2(0.45, 0.02),
      new THREE.Vector2(0.51, 0.08),
      new THREE.Vector2(0.49, 0.18),
      new THREE.Vector2(0.36, 0.52),
      new THREE.Vector2(0.27, 0.91),
      new THREE.Vector2(0.3, 1.27),
      new THREE.Vector2(0.43, 1.55),
    ]);
    part(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0, 0.02),
          ...profile.getPoints(60),
          new THREE.Vector2(0, 1.55),
        ],
        128,
      ),
    );
  } else if (kind === "chair") {
    const shell = new THREE.Shape();
    shell.moveTo(0.56, 0.91);
    shell.quadraticCurveTo(0.65, 0.92, 0.64, 0.99);
    shell.quadraticCurveTo(0.63, 1.02, 0.56, 1.02);
    shell.lineTo(-0.24, 1.02);
    shell.bezierCurveTo(-0.5, 1.02, -0.47, 1.2, -0.53, 1.48);
    shell.lineTo(-0.65, 1.98);
    shell.quadraticCurveTo(-0.66, 2.05, -0.73, 2.04);
    shell.quadraticCurveTo(-0.79, 2.03, -0.78, 1.97);
    shell.lineTo(-0.65, 1.45);
    shell.bezierCurveTo(-0.59, 1.17, -0.64, 0.9, -0.25, 0.9);
    shell.closePath();
    const geometry = new THREE.ExtrudeGeometry(shell, {
      depth: 1.08,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.028,
      bevelSegments: 8,
      curveSegments: 40,
    });
    geometry.translate(0, 0, -0.54);
    geometry.rotateY(-Math.PI / 2);
    part(geometry);
    for (const side of [-1, 1]) {
      leg(
        new THREE.Vector3(side * 0.37, 0.98, 0.34),
        new THREE.Vector3(side * 0.51, 0.015, 0.51),
        0.085,
      );
      leg(
        new THREE.Vector3(side * 0.37, 0.94, -0.34),
        new THREE.Vector3(side * 0.48, 0.015, -0.55),
        0.085,
      );
    }
    const stretcher = part(
      new RoundedBoxGeometry(0.95, 0.1, 0.09, 5, 0.028),
      0,
      0.87,
      -0.24,
    );
    stretcher.rotation.y = 0;
  } else {
    const walnut = material.clone();
    walnut.color.set("#925437");
    const a = part(
      new RoundedBoxGeometry(0.68, 1.83, 0.22, 8, 0.09),
      -0.43,
      0.94,
      -0.14,
    );
    a.rotation.z = 0.22;
    const b = part(
      new RoundedBoxGeometry(0.59, 1.5, 0.3, 8, 0.09),
      0.43,
      0.82,
      0.11,
      walnut,
    );
    b.rotation.z = -0.22;
    const c = part(
      new RoundedBoxGeometry(1.55, 0.36, 0.21, 8, 0.095),
      -0.05,
      1.17,
      0.35,
    );
    c.rotation.z = -0.35;
    group.children.forEach((child) => {
      child.userData.rest = child.position.clone();
    });
  }
  return group;
}

export default function ObjectWorld({ kind, finish, turned, paused }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const controls = useRef({ finish, turned, paused });
  const invalidate = useRef<() => void>(() => {});
  useEffect(() => {
    controls.current = { finish, turned, paused };
    invalidate.current();
  }, [finish, turned, paused]);

  useEffect(() => {
    const element = mount.current;
    if (!element) return;
    const host = element.parentElement!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    const compact = matchMedia("(max-width: 760px)").matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1.4 : 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 30);
    camera.position.set(3.25, 2.85, 4.8);
    camera.lookAt(0, kind === "chair" ? 0.95 : 0.77, 0);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.7;
    room.dispose();
    pmrem.dispose();
    const wood = woodTexture();
    const material = new THREE.MeshPhysicalMaterial({
      color: palette[controls.current.finish] ?? palette.natural,
      map: wood,
      bumpMap: wood,
      bumpScale: 0.0012,
      roughness: 0.48,
      metalness: 0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.55,
      sheen: 0.15,
      sheenColor: new THREE.Color("#eadbc4"),
    });
    const furniture = createFurniture(kind, material);
    scene.add(furniture);
    const light = new THREE.DirectionalLight("#fff7e9", 3.5);
    light.position.set(-3, 7, 2);
    light.castShadow = true;
    light.shadow.mapSize.setScalar(compact ? 512 : 1024);
    light.shadow.radius = compact ? 8 : 16;
    light.shadow.blurSamples = compact ? 6 : 10;
    light.shadow.camera.left = light.shadow.camera.bottom = -2.5;
    light.shadow.camera.right = light.shadow.camera.top = 2.5;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 15;
    light.shadow.normalBias = 0.025;
    light.shadow.bias = -0.0001;
    light.target.position.set(0, 0.6, 0);
    scene.add(
      light,
      light.target,
      new THREE.HemisphereLight("#fff9ef", "#675b4b", 1.25),
    );
    const fill = new THREE.DirectionalLight("#e7edff", 1.3);
    fill.position.set(4, 2, -4);
    scene.add(fill);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.07 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.position.y = -0.01;
    scene.add(floor);
    const shadow = contactTexture();
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 2.6),
      new THREE.MeshBasicMaterial({
        map: shadow,
        transparent: true,
        depthWrite: false,
      }),
    );
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = 0.001;
    scene.add(contact);

    let raf = 0;
    let alive = true;
    let visible = false;
    let lost = false;
    let lastTime = 0;
    let hover = 0;
    let pointerY = 0;
    let scroll = 0;
    let rotation = kind === "chair" ? -0.35 : 0.15;
    let tilt = 0;
    let assembly = 0;
    const baseRotation = rotation;
    const desiredColor = new THREE.Color();
    const draw = (time: number) => {
      raf = 0;
      if (!alive || !visible || document.hidden || lost) return;
      const elapsed = Math.min((time - lastTime) / 1000 || 1 / 60, 0.06);
      lastTime = time;
      const {
        paused: still,
        turned: reverse,
        finish: selected,
      } = controls.current;
      const targetRotation =
        baseRotation +
        (reverse ? Math.PI * 0.88 : 0) +
        (still ? 0 : scroll * 0.42 + hover * 0.24);
      const targetTilt = still ? 0 : pointerY * 0.035;
      const targetAssembly = still ? 0 : Math.max(0, 0.24 - scroll) * 0.36;
      const lerp = still ? 1 : 1 - Math.exp(-elapsed * 8);
      rotation = THREE.MathUtils.lerp(rotation, targetRotation, lerp);
      tilt = THREE.MathUtils.lerp(tilt, targetTilt, lerp);
      assembly = THREE.MathUtils.lerp(assembly, targetAssembly, lerp);
      desiredColor.set(palette[selected] ?? palette.natural);
      material.color.lerp(desiredColor, lerp);
      furniture.rotation.set(tilt, rotation, 0);
      if (kind === "offcuts")
        furniture.children.forEach((child, index) => {
          const rest = child.userData.rest as THREE.Vector3;
          child.position.set(
            rest.x + (index - 1) * assembly,
            rest.y + assembly * (index + 1),
            rest.z,
          );
        });
      light.position.x = -3 + (still ? 0 : hover * 0.3);
      renderer.render(scene, camera);
      host.dataset.rendered = "true";
      const changing =
        Math.abs(rotation - targetRotation) +
        Math.abs(tilt - targetTilt) +
        Math.abs(assembly - targetAssembly) +
        Math.abs(material.color.r - desiredColor.r) +
        Math.abs(material.color.g - desiredColor.g) +
        Math.abs(material.color.b - desiredColor.b);
      if (changing > 0.0005) raf = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (!raf && alive && visible && !document.hidden && !lost)
        raf = requestAnimationFrame(draw);
    };
    invalidate.current = schedule;
    const trackScroll = () => {
      if (!visible) return;
      const bounds = host.getBoundingClientRect();
      scroll = Math.max(
        -0.7,
        Math.min(
          0.7,
          (innerHeight / 2 - (bounds.top + bounds.height / 2)) / innerHeight,
        ),
      );
      schedule();
    };
    const resize = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width / height < 0.8 ? 36 : 31;
      camera.updateProjectionMatrix();
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        resize();
        trackScroll();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    observer.observe(host);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || controls.current.paused) return;
      const rect = host.getBoundingClientRect();
      hover = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      schedule();
    };
    const leave = () => {
      hover = pointerY = 0;
      schedule();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else schedule();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
      delete host.dataset.rendered;
    };
    const contextRestored = () => {
      lost = false;
      schedule();
    };
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", trackScroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      contextRestored,
    );
    resize();
    return () => {
      alive = false;
      invalidate.current = () => {};
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", trackScroll);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        contextRestored,
      );
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((entry) => materials.add(entry));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((entry) => entry.dispose());
      wood.dispose();
      shadow.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      delete host.dataset.rendered;
    };
  }, [kind]);
  return <div className="object-world" ref={mount} aria-hidden="true" />;
}
