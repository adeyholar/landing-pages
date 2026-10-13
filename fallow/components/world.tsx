"use client";
import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type * as Three from "three";
type Props = {
  progress: MutableRefObject<number>;
  awake: boolean;
  kind: number;
  paused: boolean;
  active: boolean;
  onReady: (ready: boolean) => void;
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
    let disposed = false,
      cleanup = () => {};
    async function setup() {
      const T = await import("three");
      const { RoomEnvironment } =
        await import("three/addons/environments/RoomEnvironment.js");
      const { mergeVertices, mergeGeometries } =
        await import("three/addons/utils/BufferGeometryUtils.js");
      if (disposed) return;
      let renderer: Three.WebGLRenderer;
      try {
        renderer = new T.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        state.current.onReady(false);
        return;
      }
      cleanup = () => {
        renderer.dispose();
        renderer.domElement.remove();
      };
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
      const room = new RoomEnvironment(),
        pmrem = new T.PMREMGenerator(renderer),
        env = pmrem.fromScene(room, 0.04);
      scene.environment = env.texture;
      scene.environmentIntensity = 0.65;
      room.dispose();
      pmrem.dispose();
      scene.add(new T.HemisphereLight(0xffede1, 0x7a4559, 1.3));
      const sun = new T.DirectionalLight(0xffe8ce, 3.2);
      sun.position.set(-5, 10, 6);
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
      const groundMat = new T.MeshStandardMaterial({
        color: 0x9e8188,
        roughness: 1,
        transparent: true,
      });
      const floor = new T.Mesh(new T.PlaneGeometry(160, 160), groundMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.25;
      floor.receiveShadow = true;
      scene.add(floor);
      const rockMat = new T.MeshStandardMaterial({
        color: 0x9f8a84,
        roughness: 0.9,
      });
      const rockSource = new T.IcosahedronGeometry(1, 10);
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
      const rockGeo = mergeVertices(rockSource);
      rockGeo.computeVertexNormals();
      rockSource.dispose();
      const stone = new T.Mesh(rockGeo, rockMat);
      stone.scale.set(3.2, 0.72, 2.5);
      stone.position.set(0.3, -0.55, 0);
      stone.castShadow = true;
      stone.receiveShadow = true;
      scene.add(stone);
      const terraces = new T.Group();
      for (let i = 0; i < 10; i++) {
        const s = new T.Mesh(rockGeo, rockMat);
        s.scale.set(2 + 0.6 * Math.sin(i), 0.45, 1.2);
        s.position.set(Math.sin(i * 0.8) * 5, -0.75, -3.5 - i * 2.7);
        s.rotation.y = i * 0.9;
        s.castShadow = true;
        s.receiveShadow = true;
        terraces.add(s);
      }
      scene.add(terraces);
      const moon = new T.Mesh(
        new T.SphereGeometry(5, 64, 40),
        new T.MeshStandardMaterial({ color: 0xe9c1b7, roughness: 0.55 }),
      );
      moon.position.set(-15, 6, -22);
      scene.add(moon);
      const wireMat = new T.MeshStandardMaterial({
        color: 0xd1b5a4,
        metalness: 0.7,
        roughness: 0.25,
      });
      const arch = new T.Mesh(
        new T.TorusGeometry(6, 0.025, 6, 128, Math.PI * 1.5),
        wireMat,
      );
      arch.position.set(0, 1.1, -5);
      arch.rotation.z = -Math.PI / 4;
      scene.add(arch);
      const petalSource = new T.SphereGeometry(1, 40, 28);
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
          lateral * (0.47 + u * 0.14) * (0.28 + u * 0.72),
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
      const petalGeo = mergeVertices(petalSource);
      petalGeo.computeVertexNormals();
      petalSource.dispose();
      const petalMat = new T.MeshPhysicalMaterial({
        color: 0xb66d86,
        roughness: 0.43,
        metalness: 0,
        clearcoat: 0.24,
        clearcoatRoughness: 0.48,
        sheen: 0.45,
        sheenColor: new T.Color(0xf6c1ca),
        sheenRoughness: 0.65,
        vertexColors: true,
      });
      const leafMat = new T.MeshStandardMaterial({
        color: 0x77794d,
        roughness: 0.62,
        metalness: 0,
      });
      const stemMat = new T.MeshStandardMaterial({
        color: 0x71754c,
        roughness: 0.55,
      });
      const goldMat = new T.MeshStandardMaterial({
        color: 0xc99a55,
        roughness: 0.38,
        metalness: 0.6,
      });
      const stalkPath = new T.CatmullRomCurve3([
        new T.Vector3(0, 0, 0),
        new T.Vector3(-0.15, 0.8, 0.05),
        new T.Vector3(0.12, 1.8, 0),
        new T.Vector3(0, 2.6, 0),
      ]);
      const stalkGeo = new T.TubeGeometry(stalkPath, 48, 0.05, 12, false);
      const bloom = new T.Group();
      bloom.rotation.x = 0.58;
      bloom.position.y = 2.6;
      const petals: Three.Group[] = [];
      for (let i = 0; i < 16; i++) {
        const hinge = new T.Group();
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
      const center = new T.Mesh(new T.SphereGeometry(0.34, 32, 24), goldMat);
      center.scale.y = 0.55;
      center.position.y = 0.1;
      bloom.add(center);
      const pollen = new T.InstancedMesh(
        new T.SphereGeometry(0.027, 8, 6),
        goldMat,
        150,
      );
      const dummy = new T.Object3D();
      for (let i = 0; i < 150; i++) {
        const phi = i * 2.39996,
          r = 0.32 * Math.sqrt(i / 150);
        dummy.position.set(
          Math.cos(phi) * r,
          0.12 + 0.17 * Math.sqrt(1 - (r * r) / 0.103),
          Math.sin(phi) * r,
        );
        dummy.updateMatrix();
        pollen.setMatrixAt(i, dummy.matrix);
      }
      bloom.add(pollen);
      // The dormant form is a single closed surface. Folding every open
      // petal into the same narrow space creates intersecting triangles.
      const budSource = new T.SphereGeometry(1, 64, 48);
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
      const budGeometry = mergeVertices(budSource);
      budGeometry.computeVertexNormals();
      budSource.dispose();
      const bud = new T.Mesh(budGeometry, petalMat);
      bud.name = "closed-bud";
      bloom.add(bud);
      const calyx = new T.Mesh(new T.SphereGeometry(0.34, 32, 24), leafMat);
      calyx.position.y = 0.025;
      calyx.scale.set(0.92, 0.35, 0.92);
      bloom.add(calyx);
      const plant = new T.Group();
      plant.add(new T.Mesh(stalkGeo, stemMat));
      plant.add(bloom);
      for (let i = 0; i < 3; i++) {
        const leaf = new T.Mesh(petalGeo, leafMat);
        leaf.position.y = 0.45 + i * 0.42;
        leaf.rotation.y = i * 2.6;
        leaf.rotation.z = 0.18 + i * 0.13;
        leaf.scale.set(0.58, 0.4, 0.52);
        plant.add(leaf);
      }
      scene.add(plant);
      const field = new T.Group();
      const fieldCount = innerWidth < 600 ? 11 : 21;
      const fieldPoses: {
        x: number;
        z: number;
        size: number;
        rotation: number;
      }[] = [];
      for (let i = 0; i < fieldCount; i++) {
        const angle = i * 2.39996;
        const radius = 3 + Math.sqrt(i) * 1.7;
        fieldPoses.push({
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius - 3,
          size: 0.3 + (i % 5) * 0.08,
          rotation: i * 1.5,
        });
      }
      // Bake the open flower once per material. The entire meadow uses four
      // instanced draws instead of hundreds of individual petal meshes.
      const template = plant.clone(true);
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
        const part = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
        part.deleteAttribute("uv");
        if (mesh.material !== petalMat) part.deleteAttribute("color");
        group.push(part);
        parts.set(mesh.material, group);
      });
      const fieldMeshes: Three.InstancedMesh[] = [];
      parts.forEach((geometries, material) => {
        const geometry = mergeGeometries(geometries);
        geometries.forEach((part) => part.dispose());
        if (!geometry) return;
        const mesh = new T.InstancedMesh(geometry, material, fieldCount);
        mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
        fieldMeshes.push(mesh);
        field.add(mesh);
      });
      scene.add(field);
      const grassGeo = new T.PlaneGeometry(0.025, 1, 1, 4);
      grassGeo.translate(0, 0.5, 0);
      const grass = new T.InstancedMesh(grassGeo, leafMat, 900);
      for (let i = 0; i < 900; i++) {
        const angle = i * 2.39996,
          r = Math.sqrt(i / 900) * 3;
        dummy.position.set(
          Math.cos(angle) * r,
          0.05,
          Math.sin(angle) * r * 0.75,
        );
        dummy.rotation.set(0, i, 0.1 * Math.sin(i));
        dummy.scale.set(1, 0.12 + ((Math.sin(i * 127) + 1) / 2) * 0.4, 1);
        dummy.updateMatrix();
        grass.setMatrixAt(i, dummy.matrix);
      }
      scene.add(grass);
      const roots = new T.Group();
      const rootMat = new T.MeshStandardMaterial({
        color: 0xd7b09b,
        emissive: 0x603531,
        emissiveIntensity: 0.4,
        roughness: 0.65,
      });
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
          new T.TubeGeometry(
            new T.CatmullRomCurve3(points),
            20,
            0.012 + (i % 3) * 0.005,
            5,
            false,
          ),
          rootMat,
        );
        roots.add(root);
      }
      scene.add(roots);
      const dustGeo = new T.BufferGeometry(),
        dustPos = new Float32Array(120 * 3);
      for (let i = 0; i < 120; i++) {
        dustPos[i * 3] = Math.sin(i * 91) * 14;
        dustPos[i * 3 + 1] = (Math.cos(i * 17) + 1) * 5;
        dustPos[i * 3 + 2] = Math.sin(i * 21) * 12;
      }
      dustGeo.setAttribute("position", new T.BufferAttribute(dustPos, 3));
      const dust = new T.Points(
        dustGeo,
        new T.PointsMaterial({
          color: 0xffead3,
          size: 0.035,
          transparent: true,
          opacity: 0.65,
        }),
      );
      scene.add(dust);
      let raf = 0,
        time = 0,
        last = 0,
        p = state.current.progress.current,
        opening = 0,
        mx = 0,
        my = 0,
        pointerX = 0,
        pointerY = 0,
        lost = false;
      const bg = new T.Color(),
        heroColor = new T.Color("#e1cbd0"),
        rootColor = new T.Color("#59414d"),
        bloomColor = new T.Color("#cbb6c6"),
        gardenColor = new T.Color("#e3d7c8"),
        flowerColor = new T.Color();
      const colors = [heroColor, rootColor, bloomColor, gardenColor];
      const cameras = [
          [6.8, 4.3, 11],
          [5, 1, 9],
          [4.5, 5.3, 8.3],
          [0, 6.5, 17],
        ],
        targets = [
          [-1.4, 1.6, 0],
          [-1, -0.65, 0],
          [-1.5, 2.4, 0],
          [0, 1.7, 0],
        ],
        mobileLift = [2.6, 0.4, 2.7, 3.3];
      function draw(ms = 0) {
        raf = 0;
        if (disposed || lost || document.hidden || !state.current.active)
          return;
        const paused = state.current.paused,
          dt = Math.min((ms - last) / 1000, 0.04) || 0.016;
        last = ms;
        if (!paused) time += dt;
        const dest = state.current.progress.current;
        const cameraEase = 1 - Math.exp(-4 * dt);
        p = paused ? dest : p + (dest - p) * cameraEase;
        mx = paused ? 0 : mx + (pointerX - mx) * cameraEase;
        my = paused ? 0 : my + (pointerY - my) * cameraEase;
        const targetOpen = state.current.awake || p > 1.3 ? 1 : 0;
        opening = paused
          ? targetOpen
          : opening + (targetOpen - opening) * (1 - Math.exp(-2.2 * dt));
        const index = Math.min(2, Math.floor(p)),
          f = T.MathUtils.smoothstep(Math.min(1, p - index), 0, 1),
          mobile = innerWidth < 700,
          heroFraming = 1 - T.MathUtils.smoothstep(p, 0, 1),
          shortViewportLift = Math.max(0, 780 - innerHeight) * 0.02;
        camera.position.set(
          T.MathUtils.lerp(cameras[index][0], cameras[index + 1][0], f) +
            mx * 0.35,
          T.MathUtils.lerp(cameras[index][1], cameras[index + 1][1], f) +
            my * 0.2,
          T.MathUtils.lerp(cameras[index][2], cameras[index + 1][2], f) +
            (mobile ? 7 : 0),
        );
        camera.lookAt(
          T.MathUtils.lerp(targets[index][0], targets[index + 1][0], f) +
            (mobile ? 0.7 : -0.45 * heroFraming),
          T.MathUtils.lerp(targets[index][1], targets[index + 1][1], f) +
            (mobile
              ? 0.85 +
                shortViewportLift +
                T.MathUtils.lerp(mobileLift[index], mobileLift[index + 1], f)
              : 0),
          0,
        );
        bg.copy(colors[index]).lerp(colors[index + 1], f);
        scene.background = bg;
        (scene.fog as Three.FogExp2).color.copy(bg);
        const underground = Math.max(0, 1 - Math.abs(p - 1) * 1.6);
        groundMat.opacity = 1 - underground * 0.98;
        stone.scale.y = 0.72 * (1 - underground * 0.8);
        stone.position.y = -0.55 - underground * 3;
        grass.visible = underground < 0.65;
        roots.visible = underground > 0.12;
        roots.scale.y = 0.3 + underground * 0.7;
        rootMat.emissiveIntensity = underground * 1.2;
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
        bud.scale.setScalar(Math.max(0.001, budPresence));
        center.visible = opening > 0.32;
        pollen.visible = opening > 0.32;
        bloom.rotation.y = time * 0.045;
        plant.rotation.z = Math.sin(time * 0.36) * 0.025;
        plant.position.y =
          Math.sin(time * 0.6) * 0.035 + (mobile ? underground * 4.8 : 0);
        const gardenGrowth = T.MathUtils.smoothstep(p, 2.15, 3);
        field.visible = gardenGrowth > 0.01;
        field.scale.y = Math.max(0.001, gardenGrowth);
        if (field.visible) {
          fieldPoses.forEach((flower, i) => {
            dummy.position.set(flower.x, -0.8, flower.z);
            dummy.rotation.set(
              0,
              flower.rotation,
              Math.sin(time * 0.45 + i) * 0.035,
            );
            dummy.scale.setScalar(flower.size);
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
        renderer.render(scene, camera);
        if (!paused) raf = requestAnimationFrame(draw);
      }
      const queue = () => {
        if (!raf && !disposed && !lost) raf = requestAnimationFrame(draw);
      };
      request.current = queue;
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
      const contextLost = (e: Event) => {
        e.preventDefault();
        lost = true;
        cancelAnimationFrame(raf);
        raf = 0;
        renderer.domElement.style.opacity = "0";
        state.current.onReady(false);
      };
      const contextRestored = () => {
        lost = false;
        renderer.domElement.style.opacity = "1";
        state.current.onReady(true);
        queue();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(el!);
      addEventListener("pointermove", pointer, { passive: true });
      addEventListener("scroll", queue, { passive: true });
      document.addEventListener("visibilitychange", visibility);
      renderer.domElement.addEventListener("webglcontextlost", contextLost);
      renderer.domElement.addEventListener(
        "webglcontextrestored",
        contextRestored,
      );
      queue();
      state.current.onReady(true);
      cleanup = () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
        removeEventListener("pointermove", pointer);
        removeEventListener("scroll", queue);
        document.removeEventListener("visibilitychange", visibility);
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          contextLost,
        );
        renderer.domElement.removeEventListener(
          "webglcontextrestored",
          contextRestored,
        );
        const geos = new Set<Three.BufferGeometry>(),
          mats = new Set<Three.Material>();
        scene.traverse((o) => {
          const m = o as Three.Mesh;
          if (m.geometry) geos.add(m.geometry);
          if (m.material)
            (Array.isArray(m.material) ? m.material : [m.material]).forEach(
              (x) => mats.add(x),
            );
        });
        geos.forEach((g) => g.dispose());
        mats.forEach((m) => m.dispose());
        env.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
    setup().catch(() => {
      cleanup();
    });
    return () => {
      disposed = true;
      request.current = () => {};
      cleanup();
    };
  }, []);
  return <div ref={host} className="world-canvas" />;
}
