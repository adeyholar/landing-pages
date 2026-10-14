"use client";

import { useEffect, useRef, type RefObject } from "react";
import { LIVERIES, foldAt, smooth, type LoadState } from "@/lib/flight";
import type * as Three from "three";
import {
  createPaperPanels,
  FIRST_CREASE,
  SECOND_CREASE,
  WING_CREASE,
} from "@/lib/paper";

type Props = {
  scroll: RefObject<number>;
  inView: RefObject<boolean>;
  paused: boolean;
  kind: number;
  wind: number;
  launch: number;
  onLoad: (state: LoadState) => void;
};
type Point = readonly [number, number];

export function World(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const current = useRef(props);
  const wake = useRef<() => void>(() => {});
  useEffect(() => {
    current.current = props;
    wake.current();
  }, [props]);

  useEffect(() => {
    const container = host.current;
    const shell = container?.closest<HTMLElement>(".aero-shell");
    if (!container) return;
    let disposed = false;
    let frame = 0;
    let gpuFrame = 0;
    let failed = false;
    let releaseFence = () => {};
    let cleanup = () => {};
    const resources: { dispose: () => void }[] = [];
    const own = <T extends { dispose: () => void }>(resource: T): T => {
      resources.push(resource);
      return resource;
    };
    const update = (progress: number, stage: string) => {
      if (!disposed)
        current.current.onLoad({ status: "loading", progress, stage });
    };
    const fail = () => {
      if (!disposed && !failed) {
        failed = true;
        cancelAnimationFrame(frame);
        cancelAnimationFrame(gpuFrame);
        current.current.onLoad({
          status: "fallback",
          progress: 100,
          stage: "Your illustrated flight is ready",
        });
      }
    };
    const boot = async () => {
      update(8, "Unpacking one very ordinary sheet");
      const T = await import("three");
      if (disposed) return;
      const mobile = () => innerWidth < 760;
      let width = innerWidth,
        height = innerHeight;
      const renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "low-power",
      });
      own(renderer);
      renderer.setPixelRatio(
        Math.min(devicePixelRatio, mobile() ? 1.25 : 1.65),
      );
      renderer.setSize(width, height);
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.96;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFShadowMap;
      renderer.domElement.setAttribute("aria-hidden", "true");
      container.appendChild(renderer.domElement);
      const contextLost = (event: Event) => {
        event.preventDefault();
        fail();
      };
      renderer.domElement.addEventListener("webglcontextlost", contextLost);
      cleanup = () => {
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          contextLost,
        );
        renderer.domElement.remove();
      };
      renderer.debug.checkShaderErrors = true;
      renderer.debug.onShaderError = () => fail();
      const scene = new T.Scene();
      const cream = new T.Color("#f4f1e7"),
        blue = new T.Color("#2046ed");
      scene.background = cream.clone();
      scene.fog = new T.Fog(cream, 24, 60);
      const camera = new T.PerspectiveCamera(34, width / height, 0.1, 100);
      const hemi = new T.HemisphereLight("#ffffff", "#928b7f", 1.25);
      scene.add(hemi);
      const key = new T.DirectionalLight("#fff9ec", 3.2);
      key.position.set(-5, 9, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(mobile() ? 1024 : 2048, mobile() ? 1024 : 2048);
      key.shadow.camera.left = -7;
      key.shadow.camera.right = 7;
      key.shadow.camera.top = 7;
      key.shadow.camera.bottom = -7;
      key.shadow.camera.near = 0.1;
      key.shadow.camera.far = 35;
      key.shadow.normalBias = 0.035;
      key.shadow.bias = -0.00025;
      key.shadow.radius = 4;
      scene.add(key, key.target);
      const fill = new T.DirectionalLight("#c0d0ff", 0.7);
      fill.position.set(5, 4, -7);
      scene.add(fill);
      const plane = new T.Group();
      scene.add(plane);
      update(28, "Giving the paper a little substance");

      const texture = (index: number, back = false) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1024;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Paper texture unavailable");
        const livery = LIVERIES[index];
        ctx.fillStyle = back
          ? ["#d8cfb9", "#162f9f", "#a92d24"][index]
          : index === 0
            ? "#fffaf0"
            : livery.color;
        ctx.fillRect(0, 0, 1024, 1024);
        let seed = 12345;
        const random = () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
        for (let i = 0; i < 34000; i++) {
          ctx.fillStyle =
            random() > 0.5 ? "rgba(255,255,255,.07)" : "rgba(27,31,46,.025)";
          const x = random() * 1024,
            y = random() * 1024;
          ctx.fillRect(x, y, random() * 2 + 0.4, 0.6);
        }
        ctx.fillStyle = livery.ink;
        ctx.strokeStyle = livery.ink;
        if (!back) {
          // Print inside the stable wing region, beyond both leading creases.
          // The wordmark stays whole after folding instead of becoming scraps.
          for (const [x, y, rotation] of [
            [820, 900, -Math.PI / 2],
            [204, 650, Math.PI / 2],
          ]) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.font = "bold 90px Arial";
            ctx.fillText("AÉRO", 0, 0);
            ctx.font = "14px monospace";
            ctx.fillText(`AE—001 / ${livery.code}`, 0, 24);
            ctx.restore();
          }
          ctx.fillRect(99, 970, 275, 9);
          ctx.fillRect(650, 970, 275, 9);
        }
        const map = own(new T.CanvasTexture(canvas));
        map.colorSpace = T.SRGBColorSpace;
        map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        return map;
      };
      const papers = LIVERIES.map((_, i) => [
        own(
          new T.MeshPhysicalMaterial({
            map: texture(i),
            roughness: 0.91,
            metalness: 0,
            sheen: 0.12,
            sheenRoughness: 1,
            sheenColor: "#ffffff",
          }),
        ),
        own(
          new T.MeshStandardMaterial({
            map: texture(i, true),
            roughness: 0.96,
          }),
        ),
        own(
          new T.MeshStandardMaterial({
            color: i === 0 ? "#e6e1d5" : LIVERIES[i].color,
            roughness: 0.97,
          }),
        ),
      ]);
      const surfaces: { mesh: Three.Mesh; materials: Three.Material[][] }[] =
        [];
      // Each surface has genuine paper thickness. Every hinge shares the same
      // geometric edge with its parent, including while the scroll is reversed.
      const surface = (points: Point[], origin: Point = [0, 0], layer = 0) => {
        const positions: number[] = [],
          uvs: number[] = [];
        const groups: {
          start: number;
          count: number;
          materialIndex: number;
        }[] = [];
        const triangles = T.ShapeUtils.triangulateShape(
          points.map(([x, z]) => new T.Vector2(x, z)),
          [],
        );
        const add = (p: Point, y: number) => {
          positions.push(p[0] - origin[0], y, p[1] - origin[1]);
          uvs.push((p[0] + 1.7) / 3.4, 1 - (p[1] + 2.8) / 5.4);
        };
        for (const face of triangles) {
          add(points[face[2]], 0.003);
          add(points[face[1]], 0.003);
          add(points[face[0]], 0.003);
        }
        groups.push({
          start: 0,
          count: triangles.length * 3,
          materialIndex: 0,
        });
        for (const face of triangles) {
          add(points[face[0]], -0.003);
          add(points[face[1]], -0.003);
          add(points[face[2]], -0.003);
        }
        groups.push({
          start: triangles.length * 3,
          count: triangles.length * 3,
          materialIndex: 1,
        });
        const start = positions.length / 3;
        for (let i = 0; i < points.length; i++) {
          const a = points[i],
            b = points[(i + 1) % points.length];
          add(a, 0.003);
          add(b, 0.003);
          add(a, -0.003);
          add(b, 0.003);
          add(b, -0.003);
          add(a, -0.003);
        }
        groups.push({ start, count: points.length * 6, materialIndex: 2 });
        const geometry = own(new T.BufferGeometry());
        geometry.setAttribute(
          "position",
          new T.Float32BufferAttribute(positions, 3),
        );
        geometry.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
        groups.forEach((group) =>
          geometry.addGroup(group.start, group.count, group.materialIndex),
        );
        geometry.computeVertexNormals();
        const materials = papers.map((set) =>
          set.map((material) => {
            const layered = own(material.clone());
            layered.polygonOffset = true;
            layered.polygonOffsetFactor = -layer * 0.015;
            layered.polygonOffsetUnits = -layer * 0.2;
            return layered;
          }),
        );
        const mesh = new T.Mesh(geometry, materials[0]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        surfaces.push({ mesh, materials });
        return mesh;
      };
      const panels: {
        pivot: Three.Group;
        first: boolean;
        second: boolean;
        wing: boolean;
        sign: number;
      }[] = [];
      const paperPanels = createPaperPanels();
      for (const sign of [-1, 1]) {
        for (const panel of paperPanels) {
          const pivot = new T.Group();
          pivot.position.z = -2.8;
          const points: Point[] = panel.points.map(([x, z]) => [
            x * sign,
            z - 2.8,
          ]);
          if (sign < 0) points.reverse();
          const layer = Number(panel.first) + Number(panel.second) * 2;
          pivot.add(surface(points, [0, -2.8], layer));
          plane.add(pivot);
          panels.push({
            pivot,
            sign,
            first: panel.first,
            second: panel.second,
            wing: panel.wing,
          });
        }
      }
      const axis = new T.Vector3();
      const turn = new T.Quaternion();
      const groundMaterial = own(
        new T.MeshBasicMaterial({ color: cream, toneMapped: false }),
      );
      const ground = new T.Mesh(
        own(new T.PlaneGeometry(200, 200)),
        groundMaterial,
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2.6;
      ground.receiveShadow = false;
      scene.add(ground);
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = shadowCanvas.height = 128;
      const shadowContext = shadowCanvas.getContext("2d")!;
      const gradient = shadowContext.createRadialGradient(
        64,
        64,
        5,
        64,
        64,
        62,
      );
      gradient.addColorStop(0, "rgba(30,38,62,.19)");
      gradient.addColorStop(0.5, "rgba(30,38,62,.06)");
      gradient.addColorStop(1, "rgba(30,38,62,0)");
      shadowContext.fillStyle = gradient;
      shadowContext.fillRect(0, 0, 128, 128);
      const shadowMaterial = own(
        new T.MeshBasicMaterial({
          map: own(new T.CanvasTexture(shadowCanvas)),
          transparent: true,
          depthWrite: false,
        }),
      );
      const contact = new T.Mesh(
        own(new T.PlaneGeometry(5.7, 6.8)),
        shadowMaterial,
      );
      contact.rotation.x = -Math.PI / 2;
      contact.position.y = -2.57;
      scene.add(contact);
      const arches = new T.Group();
      scene.add(arches);
      const ringMaterials = ["#2046ed", "#e84b32", "#efd762"].map((color) =>
        own(
          new T.MeshStandardMaterial({
            color,
            roughness: 0.46,
            metalness: 0.06,
            transparent: true,
            opacity: 0,
          }),
        ),
      );
      for (let i = 0; i < 7; i++) {
        const arch = new T.Mesh(
          own(new T.TorusGeometry(3.65 + (i % 2) * 0.5, 0.105, 16, 140)),
          ringMaterials[i % 3],
        );
        arch.position.set(
          Math.sin(i * 0.9) * 0.65,
          1.1 + Math.cos(i) * 0.25,
          -7 - i * 5.4,
        );
        arch.rotation.z = i * 0.16;
        arch.castShadow = false;
        arches.add(arch);
        if (i % 2 === 0) {
          const label = new T.Mesh(
            own(new T.BoxGeometry(0.09, 0.55, 0.09)),
            ringMaterials[i % 3],
          );
          label.position.set(
            arch.position.x - 3.68,
            arch.position.y,
            arch.position.z,
          );
          arches.add(label);
        }
      }
      for (let i = 0; i < 4; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const curve = new T.CatmullRomCurve3(
          Array.from(
            { length: 12 },
            (_, j) =>
              new T.Vector3(
                side * (4.1 + Math.sin(j * 0.7 + i) * 0.65),
                -0.6 + i * 0.6 + Math.cos(j * 0.8) * 0.45,
                2 - j * 4.8,
              ),
          ),
        );
        const line = new T.Mesh(
          own(new T.TubeGeometry(curve, 140, 0.028, 6, false)),
          ringMaterials[i % 3],
        );
        arches.add(line);
      }
      // A quiet, oversized arc is the hero's first hint of the airspace ahead.
      const heroArcMaterial = own(
        new T.MeshStandardMaterial({
          color: "#2046ed",
          roughness: 0.7,
          transparent: true,
          opacity: 0.75,
        }),
      );
      const heroArc = new T.Mesh(
        own(new T.TorusGeometry(4.1, 0.022, 8, 140, Math.PI * 1.58)),
        heroArcMaterial,
      );
      heroArc.position.set(2.5, 0.5, -3.8);
      heroArc.rotation.z = -0.7;
      scene.add(heroArc);
      update(69, "Checking a few entirely imaginary currents");
      let lastTime = 0,
        time = 0,
        previousLaunch = current.current.launch,
        throwAt = -100,
        rendered = false,
        lastKind = -1;
      let pointerX = 0,
        pointerY = 0,
        easedX = 0,
        easedY = 0;
      let lastReadingPalette = "";
      const luminance = (color: Three.Color) =>
        0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
      const cobaltLight = luminance(blue);
      const redLight = luminance(new T.Color("#e84b32"));
      const yellowLight = luminance(new T.Color("#efd762"));
      const contrast = (a: number, b: number) =>
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      const anchor = new T.Vector3(),
        look = new T.Vector3(),
        projection = new T.Vector3();
      const keys = [
        {
          p: 0,
          position: [0, 0.05, 0],
          cam: [0, 5.9, 11.2],
          look: [0, 0, -0.1],
          rotation: [-0.04, 2.48, -0.12],
          target: [0.43, -0.02],
        },
        {
          p: 1.04,
          position: [0, 0.1, 0],
          cam: [0, 10.5, 8.1],
          look: [0, 0, 0],
          rotation: [0, -0.26, -0.12],
          target: [0.43, 0.17],
        },
        {
          p: 1.8,
          position: [0, 0.45, -1],
          cam: [0, 4.5, 9.2],
          look: [0, 0.3, -1.8],
          rotation: [0, -0.15, -0.06],
          target: [0.4, -0.05],
        },
        {
          p: 2.1,
          position: [0, 0.65, -6],
          cam: [0, 3.8, 3.2],
          look: [0, 0.6, -7],
          rotation: [0.04, -0.04, 0.03],
          target: [0.27, -0.09],
        },
        {
          p: 2.62,
          position: [0.2, 1.2, -23],
          cam: [-0.8, 4.8, -14],
          look: [0.2, 0.7, -24],
          rotation: [0.02, 0.22, -0.2],
          target: [0.22, -0.09],
        },
        {
          p: 3,
          position: [0, 0.15, -34],
          cam: [0, 5.9, -22.5],
          look: [0, 0, -34.5],
          rotation: [-0.03, 2.48, -0.14],
          target: [-0.43, -0.25],
        },
      ];
      const render = (now: number) => {
        frame = 0;
        if (disposed || failed || document.hidden) return;
        const state = current.current;
        const dt = Math.min(0.05, lastTime ? (now - lastTime) / 1000 : 0.016);
        lastTime = now;
        const moving = !state.paused && state.inView.current;
        if (moving) time += dt;
        const p = Math.min(3, Math.max(0, state.scroll.current));
        let before = keys[0],
          after = keys[keys.length - 1];
        for (let i = 0; i < keys.length - 1; i++)
          if (p >= keys[i].p && p <= keys[i + 1].p) {
            before = keys[i];
            after = keys[i + 1];
            break;
          }
        const t = smooth(before.p, after.p, p);
        const mix = (a: number, b: number) => T.MathUtils.lerp(a, b, t);
        anchor.set(
          mix(before.position[0], after.position[0]),
          mix(before.position[1], after.position[1]),
          mix(before.position[2], after.position[2]),
        );
        camera.position.set(
          mix(before.cam[0], after.cam[0]),
          mix(before.cam[1], after.cam[1]),
          mix(before.cam[2], after.cam[2]),
        );
        look.set(
          mix(before.look[0], after.look[0]),
          mix(before.look[1], after.look[1]),
          mix(before.look[2], after.look[2]),
        );
        plane.rotation.set(
          mix(before.rotation[0], after.rotation[0]),
          mix(before.rotation[1], after.rotation[1]),
          mix(before.rotation[2], after.rotation[2]),
        );
        const fold = foldAt(p);
        plane.scale.setScalar(
          mobile() ? 0.59 + 0.28 * fold : 0.79 + 0.21 * fold,
        );
        for (const panel of panels) {
          const { sign, pivot } = panel;
          pivot.quaternion.setFromAxisAngle(
            axis.set(0, 0, 1),
            sign * 1.16 * smooth(0.56, 0.76, fold),
          );
          if (panel.wing)
            pivot.quaternion.multiply(
              turn.setFromAxisAngle(
                axis.set(sign * WING_CREASE[0], 0, WING_CREASE[1]).normalize(),
                -sign * 1.04 * smooth(0.76, 1, fold),
              ),
            );
          if (panel.second)
            pivot.quaternion.multiply(
              turn.setFromAxisAngle(
                axis
                  .set(sign * SECOND_CREASE[0], 0, SECOND_CREASE[1])
                  .normalize(),
                sign * Math.PI * smooth(0.28, 0.56, fold),
              ),
            );
          if (panel.first)
            pivot.quaternion.multiply(
              turn.setFromAxisAngle(
                axis
                  .set(sign * FIRST_CREASE[0], 0, FIRST_CREASE[1])
                  .normalize(),
                sign * Math.PI * smooth(0, 0.28, fold),
              ),
            );
        }
        if (state.kind !== lastKind) {
          surfaces.forEach(({ mesh, materials }) => {
            mesh.material = materials[state.kind];
          });
          lastKind = state.kind;
        }
        if (state.launch !== previousLaunch) {
          previousLaunch = state.launch;
          throwAt = time;
        }
        const personal = smooth(2.8, 3, p);
        anchor.y += ((state.wind - 45) / 70) * personal;
        if (moving) {
          const thrown = Math.max(0, Math.min(1, (time - throwAt) / 2.3));
          const arc = Math.sin(thrown * Math.PI);
          anchor.y += arc * 2.2 * personal;
          anchor.z -= arc * 7 * personal;
          anchor.x += Math.sin(thrown * Math.PI * 2) * 1.5 * personal;
          plane.rotation.z += Math.sin(thrown * Math.PI * 2) * 0.3 * personal;
          plane.rotation.x -= arc * 0.18 * personal;
          anchor.y += Math.sin(time * 0.7) * 0.065;
          plane.rotation.z += Math.sin(time * 0.47) * 0.018;
        } else if (state.launch > 0) {
          plane.rotation.z += (state.launch % 2 ? 0.1 : -0.1) * personal;
        }
        easedX = T.MathUtils.damp(easedX, moving ? pointerX : 0, 4, dt);
        easedY = T.MathUtils.damp(easedY, moving ? pointerY : 0, 4, dt);
        plane.rotation.y += easedX * 0.065;
        plane.rotation.x += easedY * 0.035;
        plane.position.copy(anchor);
        let targetX = mix(before.target[0], after.target[0]);
        let targetY = mix(before.target[1], after.target[1]);
        if (mobile()) {
          const personalStage = smooth(2.7, 3, p);
          targetX = 0;
          targetY = T.MathUtils.lerp(
            T.MathUtils.lerp(-0.14, -0.4, fold),
            0.07,
            personalStage,
          );
          camera.position.z += 5.3;
          camera.position.y += 1.5;
        }
        camera.clearViewOffset();
        camera.lookAt(look);
        camera.updateMatrixWorld();
        // Position the *resting* anchor, so the updraft and throw remain visible.
        projection
          .set(
            mix(before.position[0], after.position[0]),
            mix(before.position[1], after.position[1]),
            mix(before.position[2], after.position[2]),
          )
          .project(camera);
        camera.setViewOffset(
          width,
          height,
          ((projection.x - targetX) * width) / 2,
          ((targetY - projection.y) * height) / 2,
          width,
          height,
        );
        const blueprint = smooth(0.78, 1.02, p) * (1 - smooth(1.7, 1.98, p));
        (scene.background as Three.Color).copy(cream).lerp(blue, blueprint);
        (scene.fog as Three.Fog).color.copy(scene.background as Three.Color);
        // Choose a readable ink from the *same linear-light background*.
        // Never crossfade two foregrounds: the midpoint could match the sky.
        const light = luminance(scene.background as Three.Color);
        const ink =
          contrast(light, cobaltLight) >= 4.5
            ? "#2046ed"
            : light <= 0.18
              ? "#ffffff"
              : "#030303";
        const accent =
          contrast(light, redLight) >= 3
            ? "#e84b32"
            : contrast(light, yellowLight) >= 3
              ? "#efd762"
              : ink;
        const palette = `${ink}/${accent}`;
        if (palette !== lastReadingPalette) {
          shell?.style.setProperty("--narrative-ink", ink);
          shell?.style.setProperty("--narrative-accent", accent);
          lastReadingPalette = palette;
        }
        const transitioning = blueprint > 0 && blueprint < 1 ? "true" : "false";
        if (shell && shell.dataset.skyTransition !== transitioning)
          shell.dataset.skyTransition = transitioning;
        groundMaterial.color.copy(cream).lerp(blue, blueprint);
        ground.position.z = anchor.z;
        ground.position.y = -2.6 - smooth(1.75, 2.1, p) * 1.5;
        contact.position.set(anchor.x, ground.position.y + 0.025, anchor.z);
        shadowMaterial.opacity = 1 - smooth(1.75, 2.1, p) * 0.6;
        key.position.set(anchor.x - 5, anchor.y + 9, anchor.z + 6);
        key.target.position.copy(anchor);
        key.target.updateMatrixWorld();
        heroArcMaterial.opacity = 0.65 * (1 - smooth(0.25, 1, p));
        ringMaterials.forEach((material) => {
          material.opacity =
            smooth(1.72, 2.02, p) * (1 - smooth(2.72, 3, p) * 0.88);
        });
        arches.visible = p > 1.71;
        try {
          renderer.render(scene, camera);
          if (failed) return;
          if (!rendered) {
            rendered = true;
            update(96, "Your departure gate is open");
            const gl = renderer.getContext() as WebGL2RenderingContext;
            const fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            if (!fence) {
              fail();
              return;
            }
            let fenceReleased = false;
            releaseFence = () => {
              if (!fenceReleased) {
                gl.deleteSync(fence);
                fenceReleased = true;
              }
            };
            gl.flush();
            const started = performance.now();
            const confirmFrame = () => {
              gpuFrame = 0;
              if (disposed || failed) return;
              const status = gl.clientWaitSync(fence, 0, 0);
              if (
                status === gl.WAIT_FAILED ||
                (status === gl.TIMEOUT_EXPIRED &&
                  !document.hidden &&
                  performance.now() - started > 10000)
              ) {
                releaseFence();
                fail();
                return;
              }
              if (status === gl.TIMEOUT_EXPIRED) {
                gpuFrame = requestAnimationFrame(confirmFrame);
                return;
              }
              releaseFence();
              current.current.onLoad({
                status: "ready",
                progress: 100,
                stage: "Ready for a little elsewhere",
              });
            };
            gpuFrame = requestAnimationFrame(confirmFrame);
          }
        } catch {
          fail();
          return;
        }
        if (moving) frame = requestAnimationFrame(render);
      };
      let compiled = false;
      const request = () => {
        if (compiled && !disposed && !failed && !frame && !document.hidden)
          frame = requestAnimationFrame(render);
      };
      wake.current = request;
      const resize = () => {
        width = innerWidth;
        height = innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(
          Math.min(devicePixelRatio, mobile() ? 1.25 : 1.65),
        );
        renderer.setSize(width, height);
        request();
      };
      const pointer = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        pointerX = (event.clientX / width) * 2 - 1;
        pointerY = (event.clientY / height) * 2 - 1;
      };
      const visibility = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        request();
      };
      addEventListener("resize", resize);
      addEventListener("aero:progress", request);
      addEventListener("pointermove", pointer, { passive: true });
      document.addEventListener("visibilitychange", visibility);
      const cleanRenderer = cleanup;
      cleanup = () => {
        cleanRenderer();
        removeEventListener("resize", resize);
        removeEventListener("aero:progress", request);
        removeEventListener("pointermove", pointer);
        document.removeEventListener("visibilitychange", visibility);
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          contextLost,
        );
        key.shadow.map?.dispose();
        renderer.domElement.remove();
      };
      update(86, "Finding the light on the first fold");
      for (const materials of papers)
        for (const material of materials)
          if (material.map) renderer.initTexture(material.map);
      // Three's compileAsync owns an uncancellable timer. Poll the extension
      // ourselves so a quiet-mode escape can dispose an in-flight compilation.
      scene.updateMatrixWorld(true);
      renderer.compile(scene, camera);
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const parallel = gl.getExtension("KHR_parallel_shader_compile");
      const programs = (renderer.info.programs ?? []).map(
        (program) => program.program as WebGLProgram,
      );
      const confirmShaders = () => {
        gpuFrame = 0;
        if (disposed || failed) return;
        try {
          if (gl.isContextLost()) {
            fail();
            return;
          }
          if (
            parallel &&
            programs.some(
              (program) =>
                !gl.getProgramParameter(
                  program,
                  parallel.COMPLETION_STATUS_KHR,
                ),
            )
          ) {
            gpuFrame = requestAnimationFrame(confirmShaders);
            return;
          }
          if (
            programs.some(
              (program) => !gl.getProgramParameter(program, gl.LINK_STATUS),
            )
          ) {
            fail();
            return;
          }
          compiled = true;
          request();
        } catch {
          fail();
        }
      };
      confirmShaders();
    };
    void boot().catch(() => {
      fail();
    });
    return () => {
      disposed = true;
      wake.current = () => {};
      cancelAnimationFrame(frame);
      cancelAnimationFrame(gpuFrame);
      releaseFence();
      cleanup();
      shell?.style.removeProperty("--narrative-ink");
      shell?.style.removeProperty("--narrative-accent");
      if (shell) delete shell.dataset.skyTransition;
      resources.forEach((resource) => resource.dispose());
    };
  }, []);
  return <div className="world-canvas" ref={host} />;
}
