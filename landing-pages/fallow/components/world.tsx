"use client";
import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type * as Three from "three";
import { journeyAt } from "@/lib/journey";
import type { WorldLoadState } from "@/lib/world-loading";
type Props = {
  progress: MutableRefObject<number>;
  awake: boolean;
  kind: number;
  paused: boolean;
  active: boolean;
  onReady: (ready: boolean) => void;
  onLoad: (state: WorldLoadState) => void;
};
export function World(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    state = useRef(props),
    request = useRef(() => {});
  useEffect(() => {
    state.current = props;
    request.current();
  }, [props]);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let failed = false;
    let cleaned = false;
    let loadingProgress = 0;
    const disposers: (() => void)[] = [];
    const resources = new Set<{ dispose: () => void }>();
    const pendingFrames = new Map<number, (alive: boolean) => void>();
    const own = <R extends { dispose: () => void } | null>(resource: R): R => {
      if (!resource) return resource;
      resources.add(resource);
      return resource;
    };
    const release = (resource: { dispose: () => void }) => {
      if (resources.delete(resource)) resource.dispose();
    };
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      request.current = () => {};
      pendingFrames.forEach((resolve, frame) => {
        cancelAnimationFrame(frame);
        resolve(false);
      });
      pendingFrames.clear();
      // Dispose in reverse construction order, including resources created
      // before the scene was complete if setup was interrupted.
      disposers.reverse().forEach((dispose) => {
        try {
          dispose();
        } catch {
          /* Keep releasing the remaining resources. */
        }
      });
      disposers.length = 0;
      [...resources].reverse().forEach((resource) => {
        resources.delete(resource);
        try {
          resource.dispose();
        } catch {
          /* A lost context must not prevent the rest from being released. */
        }
      });
    };
    const fallback = () => {
      if (disposed || failed) return;
      failed = true;
      cleanup();
      state.current.onReady(false);
      state.current.onLoad({
        status: "fallback",
        progress: 100,
        stage: "A quieter garden awaits",
      });
    };
    const nextFrame = () =>
      new Promise<boolean>((resolve) => {
        if (disposed || failed) {
          resolve(false);
          return;
        }
        const frame = requestAnimationFrame(() => {
          pendingFrames.delete(frame);
          resolve(!disposed && !failed);
        });
        pendingFrames.set(frame, resolve);
      });
    const milestone = async (progress: number, stage: string) => {
      if (disposed || failed) return false;
      loadingProgress = Math.max(loadingProgress, progress);
      state.current.onLoad({
        status: "loading",
        progress: loadingProgress,
        stage,
      });
      // Two frames give React and the browser a paint between CPU-heavy steps.
      return (await nextFrame()) && (await nextFrame());
    };
    async function setup() {
      if (!(await milestone(0, "Gathering a little world"))) return;
      const [T, { RoomEnvironment }, { mergeVertices, mergeGeometries }] =
        await Promise.all([
          import("three"),
          import("three/addons/environments/RoomEnvironment.js"),
          import("three/addons/utils/BufferGeometryUtils.js"),
        ]);
      if (disposed || failed) return;
      const renderer = own(
        new T.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }),
      );
      // Three reports some shader failures without throwing during render.
      // Defer cleanup until render returns rather than disposing mid-draw.
      let shaderFailed = false;
      renderer.debug.onShaderError = () => {
        shaderFailed = true;
      };
      renderer.domElement.style.opacity = "0";
      disposers.push(() => renderer.domElement.remove());
      const contextLost = (event: Event) => {
        event.preventDefault();
        fallback();
      };
      renderer.domElement.addEventListener("webglcontextlost", contextLost);
      disposers.push(() =>
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          contextLost,
        ),
      );
      if (!(await milestone(12, "Making room to grow"))) return;
      renderer.setPixelRatio(
        Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.5),
      );
      renderer.setSize(el!.clientWidth, el!.clientHeight);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFShadowMap;
      el!.appendChild(renderer.domElement);
      const scene = new T.Scene();
      scene.background = new T.Color("#e1cbd0");
      scene.fog = new T.FogExp2("#e1cbd0", 0.022);
      const camera = new T.PerspectiveCamera(
        38,
        el!.clientWidth / el!.clientHeight,
        0.1,
        100,
      );
      scene.add(new T.HemisphereLight(0xffede1, 0x7a4559, 1.3));
      const sun = new T.DirectionalLight(0xffe8ce, 3.2);
      sun.position.set(-5, 10, 6);
      own(sun.shadow);
      sun.castShadow = true;
      sun.shadow.mapSize.set(
        innerWidth < 700 ? 512 : 1024,
        innerWidth < 700 ? 512 : 1024,
      );
      sun.shadow.camera.left = -13;
      sun.shadow.camera.right = 13;
      sun.shadow.camera.top = 13;
      sun.shadow.camera.bottom = -13;
      sun.shadow.normalBias = 0.035;
      scene.add(sun);
      const rim = new T.DirectionalLight(0xe0a8dd, 1.5);
      rim.position.set(8, 5, -6);
      scene.add(rim);
      const groundMat = own(
        new T.MeshStandardMaterial({
          color: 0x9e8188,
          roughness: 1,
          transparent: true,
        }),
      );
      const floor = new T.Mesh(own(new T.PlaneGeometry(160, 160)), groundMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.25;
      floor.receiveShadow = true;
      floor.renderOrder = -2;
      scene.add(floor);
      const rockMat = own(
        new T.MeshStandardMaterial({
          color: 0x9f8a84,
          roughness: 0.9,
          transparent: true,
          depthWrite: false,
        }),
      );
      const rockSource = own(new T.IcosahedronGeometry(1, 10));
      const a = rockSource.attributes.position;
      for (let i = 0; i < a.count; i++) {
        const x = a.getX(i),
          y = a.getY(i),
          z = a.getZ(i);
        const n =
          1 +
          0.045 * Math.sin(x * 4 + z * 3) * Math.cos(y * 6) +
          0.018 * Math.sin(z * 9 + x * 2);
        a.setXYZ(i, x * n, y * n, z * n);
      }
      // Weld the procedural stone before computing normals so light flows
      // across its surface instead of exposing the triangulation.
      rockSource.deleteAttribute("normal");
      rockSource.deleteAttribute("uv");
      const rockGeo = own(mergeVertices(rockSource));
      rockGeo.computeVertexNormals();
      release(rockSource);
      const stone = new T.Mesh(rockGeo, rockMat);
      stone.scale.set(3.2, 0.72, 2.5);
      stone.position.set(0.3, -0.55, 0);
      stone.castShadow = true;
      stone.receiveShadow = true;
      stone.renderOrder = -1;
      scene.add(stone);
      const terraces = new T.Group();
      for (let i = 0; i < 10; i++) {
        const s = new T.Mesh(rockGeo, rockMat);
        s.scale.set(2 + 0.6 * Math.sin(i), 0.45, 1.2);
        s.position.set(Math.sin(i * 0.8) * 5, -0.75, -3.5 - i * 2.7);
        s.rotation.y = i * 0.9;
        s.castShadow = true;
        s.receiveShadow = true;
        s.renderOrder = -1;
        terraces.add(s);
      }
      scene.add(terraces);
      scene.updateMatrixWorld(true);
      const surfaceRay = new T.Raycaster();
      const downward = new T.Vector3(0, -1, 0);
      const upright = new T.Vector3(0, 1, 0);
      const supportingSurfaces = [stone, ...terraces.children, floor];
      const surfaceAt = (
        x: number,
        z: number,
        surfaces: Three.Object3D[] = supportingSurfaces,
      ) => {
        surfaceRay.set(new T.Vector3(x, 12, z), downward);
        const hit = surfaceRay.intersectObjects(surfaces, false)[0];
        if (!hit?.face) return null;
        return {
          point: hit.point.clone(),
          normal: hit.face.normal
            .clone()
            .applyNormalMatrix(
              new T.Matrix3().getNormalMatrix(hit.object.matrixWorld),
            )
            .normalize(),
        };
      };
      const plantSurface = surfaceAt(0, 0, [stone]);
      const plantAnchor =
        plantSurface?.point.clone() ?? new T.Vector3(0, 0.15, 0);
      plantAnchor.y -= 0.012;
      const taperedTube = (
        curve: Three.Curve<Three.Vector3>,
        steps: number,
        radius: number,
        tipRadius: number,
        sides = 8,
      ) => {
        const geometry = own(
          new T.TubeGeometry(curve, steps, radius, sides, false),
        );
        const positions = geometry.attributes.position;
        for (let ring = 0; ring <= steps; ring++) {
          const t = ring / steps;
          const center = curve.getPointAt(t);
          const taper = T.MathUtils.lerp(1, tipRadius / radius, t);
          for (let side = 0; side <= sides; side++) {
            const vertex = ring * (sides + 1) + side;
            positions.setXYZ(
              vertex,
              center.x + (positions.getX(vertex) - center.x) * taper,
              center.y + (positions.getY(vertex) - center.y) * taper,
              center.z + (positions.getZ(vertex) - center.z) * taper,
            );
          }
        }
        geometry.computeVertexNormals();
        return geometry;
      };
      const moon = new T.Mesh(
        own(new T.SphereGeometry(5, 64, 40)),
        own(new T.MeshStandardMaterial({ color: 0xe9c1b7, roughness: 0.55 })),
      );
      moon.position.set(-15, 6, -22);
      scene.add(moon);
      const wireMat = own(
        new T.MeshStandardMaterial({
          color: 0xd1b5a4,
          metalness: 0.7,
          roughness: 0.25,
        }),
      );
      const arch = new T.Mesh(
        own(new T.TorusGeometry(6, 0.025, 6, 128, Math.PI * 1.5)),
        wireMat,
      );
      arch.position.set(0, 1.1, -5);
      arch.rotation.z = -Math.PI / 4;
      scene.add(arch);
      if (!(await milestone(28, "Laying the quiet ground"))) return;
      const petalSource = own(new T.SphereGeometry(1, 40, 28));
      const pos = petalSource.attributes.position;
      const pigments: number[] = [];
      // A closed, softly curled surface gives the petal a rounded edge and
      // a fine thickness. The flattened sphere avoids open paper-like edges.
      for (let i = 0; i < pos.count; i++) {
        const u = (pos.getY(i) + 1) * 0.5;
        const lateral = pos.getX(i);
        pos.setXYZ(
          i,
          u * 2.08,
          Math.sin(u * Math.PI) * 0.3 +
            u * u * 0.48 +
            lateral * lateral * 0.16 +
            pos.getZ(i) * 0.026,
          lateral *
            (0.47 + u * 0.14) *
            (0.28 + u * 0.72) *
            T.MathUtils.smoothstep(u, 0, 0.2),
        );
        const shade = 0.82 + u * 0.17 + Math.abs(lateral) * 0.04;
        pigments.push(shade, shade * 0.99, shade);
      }
      petalSource.setAttribute(
        "color",
        new T.Float32BufferAttribute(pigments, 3),
      );
      petalSource.deleteAttribute("normal");
      petalSource.deleteAttribute("uv");
      const petalGeo = own(mergeVertices(petalSource));
      petalGeo.computeVertexNormals();
      release(petalSource);
      const petalMat = own(
        new T.MeshPhysicalMaterial({
          color: 0xb66d86,
          roughness: 0.43,
          metalness: 0,
          clearcoat: 0.24,
          clearcoatRoughness: 0.48,
          sheen: 0.45,
          sheenColor: new T.Color(0xf6c1ca),
          sheenRoughness: 0.65,
          vertexColors: true,
        }),
      );
      const leafMat = own(
        new T.MeshStandardMaterial({
          color: 0x77794d,
          roughness: 0.62,
          metalness: 0,
        }),
      );
      const stemMat = own(
        new T.MeshStandardMaterial({
          color: 0x71754c,
          roughness: 0.55,
        }),
      );
      const goldMat = own(
        new T.MeshStandardMaterial({
          color: 0xc99a55,
          roughness: 0.7,
          metalness: 0,
        }),
      );
      const stalkPath = new T.CatmullRomCurve3([
        new T.Vector3(0, 0, 0),
        new T.Vector3(-0.15, 0.8, 0.05),
        new T.Vector3(0.12, 1.8, 0),
        new T.Vector3(0, 2.6, 0),
      ]);
      const stalkGeo = taperedTube(stalkPath, 56, 0.055, 0.034, 12);
      const bloom = new T.Group();
      bloom.rotation.x = 0.58;
      bloom.position.y = 2.6;
      const petals: Three.Group[] = [];
      for (let i = 0; i < 16; i++) {
        const hinge = new T.Group();
        hinge.position.x = 0.08;
        const rotation = new T.Group();
        rotation.rotation.y = (i * Math.PI * 2) / 8 + (i > 7 ? 0.34 : 0);
        const petal = new T.Mesh(petalGeo, petalMat);
        petal.castShadow = false;
        hinge.add(petal);
        if (i > 7) {
          hinge.scale.setScalar(0.76);
          hinge.position.y = 0.11;
        }
        rotation.add(hinge);
        bloom.add(rotation);
        petals.push(hinge);
      }
      const center = new T.Mesh(
        own(new T.SphereGeometry(0.34, 32, 24)),
        goldMat,
      );
      center.scale.y = 0.3;
      center.position.y = 0.18;
      bloom.add(center);
      const pollen = own(
        new T.InstancedMesh(
          own(new T.SphereGeometry(0.027, 8, 6)),
          goldMat,
          150,
        ),
      );
      const dummy = new T.Object3D();
      for (let i = 0; i < 150; i++) {
        const phi = i * 2.39996,
          r = 0.32 * Math.sqrt(i / 150);
        dummy.position.set(
          Math.cos(phi) * r,
          0.18 + 0.3 * Math.sqrt(0.34 * 0.34 - r * r) + 0.006,
          Math.sin(phi) * r,
        );
        dummy.updateMatrix();
        pollen.setMatrixAt(i, dummy.matrix);
      }
      bloom.add(pollen);
      // The dormant form is a single closed surface. Folding every open
      // petal into the same narrow space creates intersecting triangles.
      const budSource = own(new T.SphereGeometry(1, 64, 48));
      const budPositions = budSource.attributes.position;
      const budPigments: number[] = [];
      for (let i = 0; i < budPositions.count; i++) {
        const x = budPositions.getX(i),
          z = budPositions.getZ(i),
          u = (budPositions.getY(i) + 1) * 0.5;
        const ridge = 1 + 0.015 * Math.cos(Math.atan2(z, x) * 5 + u * 0.5);
        const width = 0.5 * (1 - u * 0.3) * ridge;
        budPositions.setXYZ(i, x * width, 0.07 + u * 1.75, z * width);
        const pigment = 0.87 + u * 0.13;
        budPigments.push(pigment, pigment, pigment);
      }
      budSource.setAttribute(
        "color",
        new T.Float32BufferAttribute(budPigments, 3),
      );
      budSource.deleteAttribute("normal");
      budSource.deleteAttribute("uv");
      const budGeometry = own(mergeVertices(budSource));
      budGeometry.computeVertexNormals();
      release(budSource);
      const bud = new T.Mesh(budGeometry, petalMat);
      bud.name = "closed-bud";
      bud.castShadow = true;
      bloom.add(bud);
      const calyx = new T.Mesh(
        own(new T.SphereGeometry(0.34, 32, 24)),
        leafMat,
      );
      calyx.position.y = 0.025;
      calyx.scale.set(0.92, 0.35, 0.92);
      bloom.add(calyx);
      const plant = new T.Group();
      const stalk = new T.Mesh(stalkGeo, stemMat);
      stalk.castShadow = true;
      plant.add(stalk);
      plant.add(bloom);
      const leafLength = 0.93;
      const leafCenterY = (t: number) =>
        Math.sin(t * Math.PI) * 0.14 + 0.06 * t - 0.09 * t * t;
      const leafSource = own(new T.SphereGeometry(1, 32, 24));
      const leafPositions = leafSource.attributes.position;
      for (let i = 0; i < leafPositions.count; i++) {
        const t = (leafPositions.getY(i) + 1) * 0.5;
        const lateral = leafPositions.getX(i);
        leafPositions.setXYZ(
          i,
          t * leafLength,
          leafCenterY(t) +
            lateral * lateral * 0.027 +
            leafPositions.getZ(i) * 0.01,
          lateral * 0.19 * (0.72 + t * 0.28),
        );
      }
      leafSource.deleteAttribute("normal");
      leafSource.deleteAttribute("uv");
      const leafGeo = own(mergeVertices(leafSource));
      leafGeo.computeVertexNormals();
      release(leafSource);
      const veinPath = new T.CatmullRomCurve3(
        Array.from({ length: 25 }, (_, i) => {
          const t = (i / 24) * 0.965;
          const upperSurface =
            0.01 * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
          return new T.Vector3(
            t * leafLength,
            leafCenterY(t) + upperSurface - 0.001,
            0,
          );
        }),
      );
      const veinGeo = taperedTube(veinPath, 32, 0.0055, 0.0013, 6);
      for (let i = 0; i < 3; i++) {
        const node = stalkPath.getPoint(0.19 + i * 0.19);
        const tangent = stalkPath.getTangent(0.19 + i * 0.19).normalize();
        const angle = i * 2.45 + 0.15;
        const outward = new T.Vector3(Math.cos(angle), 0, Math.sin(angle));
        const leafBase = node
          .clone()
          .addScaledVector(outward, 0.22)
          .addScaledVector(tangent, 0.1);
        const petiolePath = new T.CatmullRomCurve3([
          node,
          node
            .clone()
            .addScaledVector(outward, 0.075)
            .addScaledVector(tangent, 0.07),
          leafBase,
        ]);
        plant.add(
          new T.Mesh(taperedTube(petiolePath, 20, 0.022, 0.012, 8), stemMat),
        );
        const across = new T.Vector3()
          .crossVectors(outward, tangent)
          .normalize();
        const normal = new T.Vector3()
          .crossVectors(across, outward)
          .normalize();
        const leafMount = new T.Group();
        leafMount.position.copy(leafBase);
        leafMount.quaternion.setFromRotationMatrix(
          new T.Matrix4().makeBasis(outward, normal, across),
        );
        leafMount.scale.setScalar(1.05 - i * 0.11);
        const leaf = new T.Mesh(leafGeo, leafMat);
        leaf.castShadow = true;
        leafMount.add(leaf);
        leafMount.add(new T.Mesh(veinGeo, stemMat));
        plant.add(leafMount);
      }
      plant.position.copy(plantAnchor);
      scene.add(plant);
      if (!(await milestone(42, "Shaping a small possibility"))) return;
      const field = new T.Group();
      const fieldCount = innerWidth < 600 ? 11 : 21;
      const fieldPoses: {
        x: number;
        y: number;
        z: number;
        size: number;
        rotation: number;
      }[] = [];
      for (let i = 0; i < fieldCount; i++) {
        const angle = i * 2.39996;
        const radius = 3 + Math.sqrt(i) * 1.7;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius - 3;
        const surface = surfaceAt(x, z);
        fieldPoses.push({
          x,
          y: (surface?.point.y ?? floor.position.y) - 0.012,
          z,
          size: 0.3 + (i % 5) * 0.08,
          rotation: i * 1.5,
        });
      }
      // Bake the open flower once per material. The entire meadow uses four
      // instanced draws instead of hundreds of individual petal meshes.
      const template = plant.clone(true);
      template.position.set(0, 0, 0);
      template.quaternion.identity();
      template.scale.setScalar(1);
      const templateBloom = template.children[1];
      templateBloom.children.slice(0, 16).forEach((radial, index) => {
        radial.children[0].rotation.z = index > 7 ? 0.18 : -0.14;
      });
      template.updateMatrixWorld(true);
      const parts = new Map<Three.Material, Three.BufferGeometry[]>();
      template.traverse((object) => {
        const mesh = object as Three.Mesh;
        if (
          !mesh.isMesh ||
          (mesh as Three.InstancedMesh).isInstancedMesh ||
          mesh.name === "closed-bud" ||
          Array.isArray(mesh.material)
        )
          return;
        const group = parts.get(mesh.material) ?? [];
        const part = own(mesh.geometry.clone()).applyMatrix4(mesh.matrixWorld);
        part.deleteAttribute("uv");
        if (mesh.material !== petalMat) part.deleteAttribute("color");
        group.push(part);
        parts.set(mesh.material, group);
      });
      const fieldMeshes: Three.InstancedMesh[] = [];
      parts.forEach((geometries, material) => {
        const geometry = own(mergeGeometries(geometries));
        geometries.forEach((part) => release(part));
        if (!geometry) return;
        const mesh = own(new T.InstancedMesh(geometry, material, fieldCount));
        mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
        mesh.castShadow = true;
        fieldMeshes.push(mesh);
        field.add(mesh);
      });
      scene.add(field);
      // A tuft has a shared buried root and seven curved, tapered leaves.
      // Sample the actual stone surface once; no flat-height floating blades.
      const tuftParts: Three.BufferGeometry[] = [];
      const grassBase = new T.Color(0x475643);
      const grassTip = new T.Color(0x9ba785);
      const bladeTint = new T.Color();
      for (let blade = 0; blade < 7; blade++) {
        const basal = blade > 4;
        const height = basal ? 0.14 : 0.23 + (blade % 3) * 0.105;
        const bend = basal ? 0.22 : 0.09 + (blade % 4) * 0.04;
        const width = basal ? 0.052 : 0.024 + (blade % 2) * 0.008;
        const bladeSource = own(new T.SphereGeometry(1, 8, 12));
        const positions = bladeSource.attributes.position;
        const tones: number[] = [];
        for (let vertex = 0; vertex < positions.count; vertex++) {
          const t = (positions.getY(vertex) + 1) * 0.5;
          const side = positions.getX(vertex);
          positions.setXYZ(
            vertex,
            bend * t * t + positions.getZ(vertex) * 0.0025,
            height * t * (1 - 0.13 * t) + side * side * 0.006,
            side * width * (0.9 - t * 0.45),
          );
          bladeTint
            .copy(grassBase)
            .lerp(grassTip, Math.pow(t, 0.7) * (0.72 + blade * 0.035));
          tones.push(bladeTint.r, bladeTint.g, bladeTint.b);
        }
        bladeSource.setAttribute(
          "color",
          new T.Float32BufferAttribute(tones, 3),
        );
        bladeSource.deleteAttribute("normal");
        bladeSource.deleteAttribute("uv");
        const bladeGeo = own(mergeVertices(bladeSource));
        bladeGeo.computeVertexNormals();
        bladeGeo.rotateY(blade * 2.39996);
        tuftParts.push(bladeGeo);
        release(bladeSource);
      }
      const grassGeo = own(mergeGeometries(tuftParts))!;
      tuftParts.forEach((part) => release(part));
      const grassMat = own(
        new T.MeshStandardMaterial({
          color: 0xffffff,
          vertexColors: true,
          roughness: 0.83,
          metalness: 0,
          transparent: true,
          depthWrite: false,
        }),
      );
      const grassCount = innerWidth < 700 ? 125 : 190;
      const grass = own(new T.InstancedMesh(grassGeo, grassMat, grassCount));
      const grassTint = new T.Color();
      const localTurn = new T.Quaternion();
      let planted = 0;
      for (let i = 0; planted < grassCount && i < grassCount * 4; i++) {
        const angle = i * 2.39996;
        const radius = Math.sqrt(((i * 73) % 199) / 199) * 0.82;
        const x = stone.position.x + Math.cos(angle) * radius * stone.scale.x;
        const z = Math.sin(angle) * radius * stone.scale.z;
        if (Math.hypot(x - plantAnchor.x, z - plantAnchor.z) < 0.23) continue;
        const surface = surfaceAt(x, z, [stone]);
        if (!surface || surface.normal.y < 0.72) continue;
        dummy.position
          .copy(surface.point)
          .addScaledVector(surface.normal, -0.014);
        dummy.quaternion.setFromUnitVectors(upright, surface.normal);
        localTurn.setFromAxisAngle(upright, angle);
        dummy.quaternion.multiply(localTurn);
        const size = 0.62 + (Math.sin(i * 17.13) + 1) * 0.3;
        dummy.scale.setScalar(size);
        dummy.updateMatrix();
        grass.setMatrixAt(planted, dummy.matrix);
        grassTint.setHex([0xd7dec8, 0xb9c6a5, 0xe5dfc6, 0xc3ccb2][i % 4]);
        grass.setColorAt(planted, grassTint);
        planted++;
      }
      grass.count = planted;
      grass.instanceMatrix.needsUpdate = true;
      if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
      grass.computeBoundingSphere();
      grass.receiveShadow = true;
      grass.castShadow = true;
      scene.add(grass);
      const roots = new T.Group();
      roots.position.copy(plantAnchor);
      const rootMat = own(
        new T.MeshStandardMaterial({
          color: 0xd7b09b,
          emissive: 0x603531,
          emissiveIntensity: 0.4,
          roughness: 0.65,
        }),
      );
      for (let i = 0; i < 32; i++) {
        const angle = i * 2.39996,
          depth = 1 + (i % 7) * 0.4;
        const points = Array.from(
          { length: 7 },
          (_, j) =>
            new T.Vector3(
              Math.cos(angle + j * 0.25) * j * 0.19,
              (-j * depth) / 6,
              Math.sin(angle + j * 0.3) * j * 0.17,
            ),
        );
        const root = new T.Mesh(
          taperedTube(
            new T.CatmullRomCurve3(points),
            28,
            0.012 + (i % 3) * 0.005,
            0.0025,
            7,
          ),
          rootMat,
        );
        roots.add(root);
      }
      scene.add(roots);
      const dustGeo = own(new T.BufferGeometry()),
        dustPos = new Float32Array(120 * 3);
      for (let i = 0; i < 120; i++) {
        dustPos[i * 3] = Math.sin(i * 91) * 14;
        dustPos[i * 3 + 1] = (Math.cos(i * 17) + 1) * 5;
        dustPos[i * 3 + 2] = Math.sin(i * 21) * 12;
      }
      dustGeo.setAttribute("position", new T.BufferAttribute(dustPos, 3));
      const dust = new T.Points(
        dustGeo,
        own(
          new T.PointsMaterial({
            color: 0xffead3,
            size: 0.035,
            transparent: true,
            opacity: 0.65,
          }),
        ),
      );
      scene.add(dust);
      if (!(await milestone(55, "Putting down roots"))) return;
      // The environment is generated locally; there are no image textures
      // or model downloads to count. PMREM performs its GPU work here.
      const room = own(new RoomEnvironment());
      const pmrem = own(new T.PMREMGenerator(renderer));
      const env = own(pmrem.fromScene(room, 0.04));
      scene.environment = env.texture;
      scene.environmentIntensity = 0.65;
      release(room);
      release(pmrem);
      if (!(await milestone(76, "Finding the softer light"))) return;
      let raf = 0,
        time = 0,
        last = 0,
        p = state.current.progress.current,
        awakening = 0,
        mx = 0,
        my = 0,
        pointerX = 0,
        pointerY = 0,
        lastScrim = "";
      const bg = new T.Color(),
        heroColor = new T.Color("#e1cbd0"),
        rootColor = new T.Color("#59414d"),
        bloomColor = new T.Color("#cbb6c6"),
        gardenColor = new T.Color("#e3d7c8"),
        flowerColor = new T.Color(),
        scrimColor = new T.Color();
      const colors = [heroColor, rootColor, bloomColor, gardenColor];
      const cameras = [
        [6.8, 4.3, 11],
        [6.3, 4.3, 18.6],
        [4.5, 4.6, 10.5],
        [0, 6.5, 17],
      ];
      const mobileDepth = [16, 16, 16, 16];
      const projectedAnchor = new T.Vector3();
      function draw(ms = 0, initial = false) {
        raf = 0;
        if (
          disposed ||
          failed ||
          document.hidden ||
          (!initial && !state.current.active)
        )
          return false;
        const paused = state.current.paused || initial,
          dt = Math.min((ms - last) / 1000, 0.04) || 0.016;
        last = ms;
        if (!paused) time += dt;
        const dest = state.current.progress.current;
        const cameraEase = 1 - Math.exp(-4 * dt);
        p = paused ? dest : p + (dest - p) * cameraEase;
        mx = paused ? 0 : mx + (pointerX - mx) * cameraEase;
        my = paused ? 0 : my + (pointerY - my) * cameraEase;
        const journey = journeyAt(p);
        const opening = journey.bloom;
        const awakeTarget = state.current.awake ? 1 : 0;
        awakening = paused
          ? awakeTarget
          : awakening + (awakeTarget - awakening) * cameraEase;
        const index = Math.min(2, Math.floor(journey.progress)),
          f = T.MathUtils.smoothstep(journey.progress - index, 0, 1),
          mobile = el!.clientWidth < 700;
        camera.clearViewOffset();
        camera.position.set(
          T.MathUtils.lerp(cameras[index][0], cameras[index + 1][0], f) +
            mx * 0.25,
          T.MathUtils.lerp(cameras[index][1], cameras[index + 1][1], f) +
            my * 0.12,
          T.MathUtils.lerp(cameras[index][2], cameras[index + 1][2], f) +
            (mobile
              ? T.MathUtils.lerp(mobileDepth[index], mobileDepth[index + 1], f)
              : 0),
        );
        camera.lookAt(plantAnchor.x, plantAnchor.y + 1.2, plantAnchor.z);
        camera.updateMatrixWorld(true);
        projectedAnchor.copy(plantAnchor).project(camera);
        // A fixed screen-space root keeps the plant grounded while the lens
        // gently widens to reveal what is below it. No chapter lifts the plant.
        const gardenFrame = T.MathUtils.smoothstep(journey.progress, 2, 3);
        const anchorX = (mobile ? 0.12 : 0.3) * (1 - gardenFrame);
        const anchorY = mobile ? -0.56 : -0.34 - gardenFrame * 0.16;
        camera.setViewOffset(
          el!.clientWidth,
          el!.clientHeight,
          ((projectedAnchor.x - anchorX) * el!.clientWidth) / 2,
          ((anchorY - projectedAnchor.y) * el!.clientHeight) / 2,
          el!.clientWidth,
          el!.clientHeight,
        );
        bg.copy(colors[index]).lerp(colors[index + 1], f);
        scene.background = bg;
        bg.getRGB(scrimColor, T.SRGBColorSpace);
        const scrim = `${Math.round(scrimColor.r * 255)} ${Math.round(scrimColor.g * 255)} ${Math.round(scrimColor.b * 255)}`;
        if (scrim !== lastScrim) {
          el!.parentElement?.style.setProperty("--scene-scrim", scrim);
          lastScrim = scrim;
        }
        (scene.fog as Three.FogExp2).color.copy(bg);
        const underground = journey.roots;
        groundMat.opacity = 1 - underground * 0.98;
        groundMat.depthWrite = underground < 0.01;
        rockMat.opacity = 1 - underground;
        rockMat.depthWrite = underground < 0.01;
        stone.castShadow = underground < 0.5;
        terraces.children.forEach((terrace) => {
          terrace.castShadow = underground < 0.5;
        });
        grassMat.opacity = 1 - T.MathUtils.smoothstep(underground, 0, 0.75);
        grass.visible = grassMat.opacity > 0.01;
        grassMat.depthWrite = underground < 0.01;
        roots.visible = underground > 0.01;
        roots.scale.y = 0.3 + underground * 0.7;
        rootMat.emissiveIntensity = underground * 0.6;
        const selected = [0xb66d86, 0xd3a259, 0x879aca][state.current.kind];
        petalMat.color.lerp(
          flowerColor.setHex(selected),
          paused ? 1 : 1 - Math.exp(-2.8 * dt),
        );
        petals.forEach((h, i) => {
          const growth = T.MathUtils.smoothstep(opening, 0.08, 0.72);
          h.visible = growth > 0.001;
          h.children[0].scale.setScalar(Math.max(0.001, growth));
          h.rotation.z =
            (1 - opening) * 0.72 +
            opening * (i > 7 ? 0.22 : -0.12) +
            Math.sin(time * 0.65 + i * 0.7) * 0.035 * opening;
        });
        const budPresence = 1 - T.MathUtils.smoothstep(opening, 0.12, 0.7);
        bud.visible = budPresence > 0.001;
        const budScale = Math.max(0.001, budPresence);
        bud.scale.set(
          budScale * (1 + awakening * 0.08),
          budScale * (1 + awakening * 0.04),
          budScale * (1 + awakening * 0.08),
        );
        center.visible = opening > 0.32;
        pollen.visible = opening > 0.32;
        bloom.rotation.y = time * 0.045;
        plant.rotation.z = Math.sin(time * 0.36) * 0.012;
        plant.position.copy(plantAnchor);
        const gardenGrowth = journey.meadow;
        field.visible = gardenGrowth > 0.01;
        if (field.visible) {
          fieldPoses.forEach((flower, i) => {
            dummy.position.set(flower.x, flower.y, flower.z);
            dummy.rotation.set(
              0,
              flower.rotation,
              Math.sin(time * 0.45 + i) * 0.035,
            );
            dummy.scale.setScalar(flower.size * gardenGrowth);
            dummy.updateMatrix();
            fieldMeshes.forEach((mesh) => mesh.setMatrixAt(i, dummy.matrix));
          });
          fieldMeshes.forEach((mesh) => {
            mesh.instanceMatrix.needsUpdate = true;
            mesh.computeBoundingSphere();
          });
        }
        dust.rotation.y = time * 0.015;
        dust.position.y = Math.sin(time * 0.2) * 0.3;
        arch.rotation.z = -Math.PI / 4 + p * 0.15;
        try {
          renderer.render(scene, camera);
          if (shaderFailed) {
            fallback();
            return false;
          }
        } catch {
          fallback();
          return false;
        }
        if (!paused && !initial) raf = requestAnimationFrame(draw);
        return true;
      }
      const queue = () => {
        if (!raf && !disposed && !failed) raf = requestAnimationFrame(draw);
      };
      const pointer = (e: PointerEvent) => {
        if (state.current.paused || e.pointerType !== "mouse") return;
        pointerX = (e.clientX / innerWidth - 0.5) * 2;
        pointerY = -(e.clientY / innerHeight - 0.5) * 2;
        queue();
      };
      const resize = () => {
        if (el!.clientWidth < 1 || el!.clientHeight < 1) return;
        renderer.setPixelRatio(
          Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.5),
        );
        renderer.setSize(el!.clientWidth, el!.clientHeight);
        camera.aspect = el!.clientWidth / el!.clientHeight;
        camera.updateProjectionMatrix();
        queue();
      };
      const visibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else {
          last = performance.now();
          queue();
        }
      };
      // Resource ownership already covers all geometries/materials, including
      // temporary bake meshes. Register animation/listener cleanup before awaits.
      disposers.push(() => {
        cancelAnimationFrame(raf);
        el!.parentElement?.style.removeProperty("--scene-scrim");
      });
      // compileAsync traverses hidden objects too in this Three version. Keep
      // all renderables visible and uncullable for one concealed warm-up frame
      // so vertex buffers, shadow maps and instanced variants are uploaded.
      const renderables: {
        object: Three.Object3D;
        visible: boolean;
        culled: boolean;
      }[] = [];
      scene.traverse((object) => {
        renderables.push({
          object,
          visible: object.visible,
          culled: object.frustumCulled,
        });
        object.visible = true;
        object.frustumCulled = false;
      });
      fieldPoses.forEach((flower, i) => {
        dummy.position.set(flower.x, flower.y, flower.z);
        dummy.rotation.set(0, flower.rotation, 0);
        dummy.scale.setScalar(flower.size);
        dummy.updateMatrix();
        fieldMeshes.forEach((mesh) => mesh.setMatrixAt(i, dummy.matrix));
      });
      fieldMeshes.forEach((mesh) => {
        mesh.instanceMatrix.needsUpdate = true;
      });
      camera.position.set(...(cameras[0] as [number, number, number]));
      camera.lookAt(plantAnchor.x, plantAnchor.y + 1.2, plantAnchor.z);
      scene.updateMatrixWorld(true);
      // Match compileAsync's parallel shader wait, but own the animation-frame
      // polling so unmount/context loss can cancel it without orphaned timers.
      // Poll every program: a shared material can have both mesh and instanced
      // variants, while compileAsync only checks its last currentProgram.
      renderer.compile(scene, camera);
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const parallel = gl.getExtension("KHR_parallel_shader_compile");
      const programs = (renderer.info.programs ?? []).map(
        (entry) => entry.program as WebGLProgram,
      );
      while (
        parallel &&
        programs.some(
          (program) =>
            !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR),
        )
      ) {
        if (gl.isContextLost()) {
          fallback();
          return;
        }
        if (!(await nextFrame())) return;
      }
      if (disposed || failed) return;
      if (
        programs.some(
          (program) => !gl.getProgramParameter(program, gl.LINK_STATUS),
        )
      ) {
        fallback();
        return;
      }
      if (!(await milestone(88, "Letting the light settle"))) return;
      renderer.render(scene, camera);
      if (shaderFailed) {
        fallback();
        return;
      }
      renderables.forEach(({ object, visible, culled }) => {
        object.visible = visible;
        object.frustumCulled = culled;
      });
      if (!(await milestone(96, "Waiting for the first light"))) return;
      // The warm-up uses every mesh. This frame restores the real scroll,
      // camera, visibility and paused state before the scene is revealed.
      while (document.hidden) if (!(await nextFrame())) return;
      renderer.setSize(el!.clientWidth, el!.clientHeight);
      camera.aspect = el!.clientWidth / el!.clientHeight;
      camera.updateProjectionMatrix();
      if (!draw(performance.now(), true)) return;
      if (disposed || failed) return;
      // The complete scene can now be composited behind the opaque loader.
      renderer.domElement.style.opacity = "1";
      if (gl.isContextLost()) {
        fallback();
        return;
      }
      // A fence waits without gl.finish() blocking the main thread. The first
      // real frame must finish on the GPU, not merely be queued by JavaScript.
      let fence: WebGLSync | null = gl.fenceSync(
        gl.SYNC_GPU_COMMANDS_COMPLETE,
        0,
      );
      if (!fence) {
        fallback();
        return;
      }
      disposers.push(() => {
        if (fence) gl.deleteSync(fence);
        fence = null;
      });
      gl.flush();
      const fenceStart = performance.now();
      while (fence) {
        if (disposed || failed) return;
        const status = gl.clientWaitSync(fence, 0, 0);
        if (status === gl.ALREADY_SIGNALED || status === gl.CONDITION_SATISFIED)
          break;
        if (
          status === gl.WAIT_FAILED ||
          gl.isContextLost() ||
          performance.now() - fenceStart > 10000
        ) {
          fallback();
          return;
        }
        if (!(await nextFrame())) return;
      }
      if (fence) gl.deleteSync(fence);
      fence = null;
      if (!(await nextFrame()) || !(await nextFrame())) return;
      if (disposed || failed) return;
      const observer = new ResizeObserver(resize);
      observer.observe(el!);
      addEventListener("pointermove", pointer, { passive: true });
      addEventListener("scroll", queue, { passive: true });
      document.addEventListener("visibilitychange", visibility);
      disposers.push(() => {
        observer.disconnect();
        removeEventListener("pointermove", pointer);
        removeEventListener("scroll", queue);
        document.removeEventListener("visibilitychange", visibility);
      });
      request.current = queue;
      state.current.onReady(true);
      state.current.onLoad({
        status: "ready",
        progress: 100,
        stage: "A little world, ready for you",
      });
      last = performance.now();
      queue();
    }
    setup().catch(fallback);
    return () => {
      disposed = true;
      request.current = () => {};
      cleanup();
    };
  }, []);
  return <div ref={host} className="world-canvas" />;
}
