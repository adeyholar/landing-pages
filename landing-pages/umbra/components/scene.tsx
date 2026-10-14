"use client";
import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type * as Three from "three";
import { journeyAt } from "@/lib/journey";
import type { LoadState } from "@/lib/loading";

type Props = {
  progress: MutableRefObject<number>;
  alignment: number;
  paused: boolean;
  active: boolean;
  onLoad: (value: LoadState) => void;
};
export function Scene(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    state = useRef(props),
    request = useRef(() => {});
  useEffect(() => {
    state.current = props;
    request.current();
  }, [props]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false,
      failed = false,
      cleaned = false,
      raf = 0;
    const resources = new Set<{ dispose: () => void }>();
    const callbacks: (() => void)[] = [];
    const frames = new Map<number, (alive: boolean) => void>();
    const own = <T extends { dispose: () => void }>(resource: T): T => {
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
      cancelAnimationFrame(raf);
      frames.forEach((resolve, id) => {
        cancelAnimationFrame(id);
        resolve(false);
      });
      frames.clear();
      callbacks.reverse().forEach((fn) => {
        try {
          fn();
        } catch {}
      });
      [...resources].reverse().forEach((item) => {
        try {
          item.dispose();
        } catch {}
      });
      resources.clear();
    };
    const fallback = () => {
      if (disposed || failed) return;
      failed = true;
      cleanup();
      state.current.onLoad({
        status: "fallback",
        progress: 100,
        stage: "A still view of the universe",
      });
    };
    const frame = () =>
      new Promise<boolean>((resolve) => {
        if (disposed || failed) {
          resolve(false);
          return;
        }
        const id = requestAnimationFrame(() => {
          frames.delete(id);
          resolve(!disposed && !failed);
        });
        frames.set(id, resolve);
      });
    const stage = async (progress: number, label: string) => {
      if (disposed || failed) return false;
      state.current.onLoad({ status: "loading", progress, stage: label });
      return (await frame()) && (await frame());
    };
    async function setup() {
      if (!(await stage(4, "Finding a little darkness"))) return;
      const [T, { RoomEnvironment }] = await Promise.all([
        import("three"),
        import("three/addons/environments/RoomEnvironment.js"),
      ]);
      if (disposed || failed) return;
      const mobile = element!.clientWidth < 700;
      const renderer = own(
        new T.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }),
      );
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.6));
      renderer.setSize(element!.clientWidth, element!.clientHeight);
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.domElement.style.opacity = "0";
      element!.appendChild(renderer.domElement);
      callbacks.push(() => renderer.domElement.remove());
      let shaderFailed = false;
      renderer.debug.onShaderError = () => {
        shaderFailed = true;
      };
      const contextLost = (event: Event) => {
        event.preventDefault();
        fallback();
      };
      renderer.domElement.addEventListener("webglcontextlost", contextLost);
      callbacks.push(() =>
        renderer.domElement.removeEventListener(
          "webglcontextlost",
          contextLost,
        ),
      );
      const scene = new T.Scene();
      scene.background = new T.Color(0x080d16);
      scene.fog = new T.FogExp2(0x080d16, 0.006);
      const camera = new T.PerspectiveCamera(
        39,
        element!.clientWidth / element!.clientHeight,
        0.1,
        180,
      );
      camera.position.set(0, 0.5, 15);
      const environment = own(new RoomEnvironment()),
        pmrem = own(new T.PMREMGenerator(renderer));
      const env = own(pmrem.fromScene(environment, 0.03));
      scene.environment = env.texture;
      scene.environmentIntensity = 0.65;
      release(environment);
      release(pmrem);
      scene.add(new T.HemisphereLight(0x8aa5ca, 0x090908, 0.35));
      const key = new T.DirectionalLight(0xf4b77c, 3);
      key.position.set(7, 4, 8);
      scene.add(key);
      const edge = new T.DirectionalLight(0x8eaac8, 1.6);
      edge.position.set(-8, 3, -2);
      scene.add(edge);
      const glow = new T.PointLight(0xf6b77b, 42, 24, 2);
      glow.position.set(0, 0, 2);
      scene.add(glow);
      if (!(await stage(20, "Polishing the instruments"))) return;
      const copper = own(
        new T.MeshStandardMaterial({
          color: 0xc38b62,
          metalness: 0.86,
          roughness: 0.29,
        }),
      );
      const darkMetal = own(
        new T.MeshStandardMaterial({
          color: 0x20252c,
          metalness: 0.82,
          roughness: 0.35,
        }),
      );
      const paleMetal = own(
        new T.MeshStandardMaterial({
          color: 0xc4c2b7,
          metalness: 0.87,
          roughness: 0.22,
        }),
      );
      const lit = own(
        new T.MeshBasicMaterial({
          color: 0xf6bc87,
          transparent: true,
          opacity: 0.95,
        }),
      );
      const glass = own(
        new T.MeshPhysicalMaterial({
          color: 0x779999,
          metalness: 0.1,
          roughness: 0.11,
          transparent: true,
          opacity: 0.14,
          transmission: 0,
          side: T.DoubleSide,
          depthWrite: false,
        }),
      );
      const sphere = own(
        new T.SphereGeometry(2.22, mobile ? 72 : 112, mobile ? 48 : 72),
      );
      // Small smooth depressions catch grazing light without turning the moon
      // into a low-poly rock. Normals are recomputed after the displacement.
      const positions = sphere.attributes.position;
      const craters = Array.from({ length: 23 }, (_, i) =>
        new T.Vector3(
          Math.sin(i * 27.3),
          Math.cos(i * 9.2),
          Math.sin(i * 15.7),
        ).normalize(),
      );
      const point = new T.Vector3();
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i).normalize();
        let dent = 0;
        for (let j = 0; j < craters.length; j++) {
          const d = point.distanceTo(craters[j]),
            size = 0.045 + (j % 5) * 0.021;
          dent +=
            -Math.exp(-Math.pow(d / size, 4)) * 0.018 +
            Math.exp(-Math.pow((d - size) / (size * 0.22), 2)) * 0.004;
        }
        const scale = 2.22 + dent;
        positions.setXYZ(i, point.x * scale, point.y * scale, point.z * scale);
      }
      sphere.computeVertexNormals();
      const moonMat = own(
        new T.MeshStandardMaterial({
          color: 0x0a0c10,
          roughness: 0.98,
          metalness: 0.08,
        }),
      );
      const assembly = new T.Group();
      scene.add(assembly);
      const moon = new T.Mesh(sphere, moonMat);
      moon.position.z = 0.18;
      assembly.add(moon);
      const coronaMat = own(
        new T.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: T.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uStrength: { value: 1 },
            uWarm: { value: new T.Color(0xffbf80) },
          },
          vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
          fragmentShader: `precision highp float; varying vec2 vUv; uniform float uTime; uniform float uStrength; uniform vec3 uWarm;
        void main(){vec2 p=(vUv-.5)*2.; float r=length(p); float a=atan(p.y,p.x); float rim=.375;
        float rays=pow(.5+.5*sin(a*37.+sin(a*13.)*1.3+uTime*.07),4.);
        float halo=exp(-max(r-rim,0.)*12.)*(.24+rays*.24); float fine=exp(-abs(r-rim)*170.);
        float outer=exp(-max(r-rim,0.)*5.)*.045; float cutoff=smoothstep(rim-.014,rim+.008,r);
        float diamond=exp(-pow((a+.46)*13.,2.))*exp(-abs(r-rim)*40.)*1.1;
        float strength=(halo+fine*.8+outer+diamond)*cutoff*uStrength;
        gl_FragColor=vec4(mix(uWarm,vec3(1.,.94,.8),fine),strength*(1.-smoothstep(.75,1.,r))); }`,
        }),
      );
      const corona = new T.Mesh(own(new T.PlaneGeometry(12, 12)), coronaMat);
      corona.position.z = -0.1;
      assembly.add(corona);
      const instrument = new T.Group();
      assembly.add(instrument);
      const rings: Three.Group[] = [];
      const ringGeo = own(
        new T.TorusGeometry(2.72, 0.075, 12, mobile ? 96 : 144),
      );
      const fineGeo = own(
        new T.TorusGeometry(2.84, 0.018, 6, mobile ? 96 : 144),
      );
      const tickGeo = own(new T.BoxGeometry(0.015, 0.09, 0.015));
      const dummy = new T.Object3D();
      for (let i = 0; i < 3; i++) {
        const group = new T.Group();
        group.add(new T.Mesh(ringGeo, i === 1 ? paleMetal : copper));
        const trim = new T.Mesh(fineGeo, darkMetal);
        group.add(trim);
        const ticks = own(new T.InstancedMesh(tickGeo, paleMetal, 80));
        for (let n = 0; n < 80; n++) {
          const a = (n / 80) * Math.PI * 2;
          dummy.position.set(Math.cos(a) * 2.85, Math.sin(a) * 2.85, 0);
          dummy.rotation.set(0, 0, a - Math.PI / 2);
          dummy.scale.set(1, n % 5 ? 0.65 : 1.6, 1);
          dummy.updateMatrix();
          ticks.setMatrixAt(n, dummy.matrix);
        }
        group.add(ticks);
        instrument.add(group);
        rings.push(group);
      }
      const lens = new T.Mesh(
        own(new T.CircleGeometry(2.55, mobile ? 72 : 112)),
        glass,
      );
      instrument.add(lens);
      const iris = new T.Group();
      instrument.add(iris);
      const bladeShape = new T.Shape();
      bladeShape.moveTo(0.35, -0.18);
      bladeShape.quadraticCurveTo(1.2, -0.6, 2.36, -0.15);
      bladeShape.lineTo(2.38, 0.7);
      bladeShape.quadraticCurveTo(0.65, 0.38, 0.35, -0.18);
      const bladeGeo = own(
        new T.ExtrudeGeometry(bladeShape, {
          depth: 0.035,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 1,
          bevelSize: 0.012,
          bevelThickness: 0.01,
          curveSegments: 18,
        }),
      );
      const blades: Three.Mesh[] = [];
      for (let i = 0; i < 9; i++) {
        const blade = new T.Mesh(bladeGeo, i % 3 ? darkMetal : copper);
        blade.rotation.z = (i * Math.PI * 2) / 9;
        blade.position.z = i * 0.013;
        iris.add(blade);
        blades.push(blade);
      }
      const axisGeo = own(new T.CylinderGeometry(0.018, 0.018, 6.8, 8));
      const axles = new T.Group();
      instrument.add(axles);
      for (let i = 0; i < 3; i++) {
        const bar = new T.Mesh(axisGeo, copper);
        bar.rotation.x = Math.PI / 2;
        const a = (i * Math.PI * 2) / 3;
        bar.position.set(Math.cos(a) * 2.72, Math.sin(a) * 2.72, 0);
        axles.add(bar);
      }
      if (!(await stage(46, "Measuring the space between"))) return;
      const starCount = mobile ? 1050 : 2350;
      const starGeo = own(new T.BufferGeometry()),
        starPositions = new Float32Array(starCount * 3),
        starColors = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const a = i * 2.39996,
          r = 5 + Math.sqrt(((i * 73) % 997) / 997) * 38;
        starPositions[i * 3] = Math.cos(a) * r;
        starPositions[i * 3 + 1] = Math.sin(a) * r;
        starPositions[i * 3 + 2] = 14 - ((i * 137) % 1200) / 10;
        const warm = i % 7 === 0;
        starColors.set(warm ? [0.9, 0.59, 0.35] : [0.65, 0.75, 0.9], i * 3);
      }
      starGeo.setAttribute("position", new T.BufferAttribute(starPositions, 3));
      starGeo.setAttribute("color", new T.BufferAttribute(starColors, 3));
      const starMat = own(
        new T.PointsMaterial({
          size: mobile ? 0.07 : 0.065,
          vertexColors: true,
          transparent: true,
          opacity: 0.82,
          sizeAttenuation: true,
          depthWrite: false,
        }),
      );
      const stars = new T.Points(starGeo, starMat);
      scene.add(stars);
      // A real corridor gives the camera something to pass through: concentric
      // machined gates continue far behind the final alignment instrument.
      const passage = new T.Group();
      scene.add(passage);
      const gateGeo = own(
        new T.TorusGeometry(4.1, 0.055, 10, mobile ? 96 : 144),
      );
      const gateTrim = own(new T.TorusGeometry(4.24, 0.012, 5, 128));
      const gates: Three.Group[] = [];
      for (let i = 0; i < 8; i++) {
        const gate = new T.Group();
        gate.position.z = -8 - i * 8;
        gate.add(new T.Mesh(gateGeo, darkMetal));
        gate.add(new T.Mesh(gateTrim, i % 2 ? copper : lit));
        const spokes = own(
          new T.InstancedMesh(
            own(new T.BoxGeometry(0.03, 0.22, 0.06)),
            copper,
            24,
          ),
        );
        for (let n = 0; n < 24; n++) {
          const a = (n / 24) * Math.PI * 2;
          dummy.position.set(Math.cos(a) * 4.15, Math.sin(a) * 4.15, 0);
          dummy.rotation.set(0, 0, a - Math.PI / 2);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          spokes.setMatrixAt(n, dummy.matrix);
        }
        gate.add(spokes);
        passage.add(gate);
        gates.push(gate);
      }
      const alignment = new T.Group();
      alignment.position.set(0, 0, -25);
      scene.add(alignment);
      const alignmentCorona = new T.Mesh(corona.geometry, coronaMat.clone());
      own(alignmentCorona.material);
      alignmentCorona.scale.setScalar(0.8);
      alignment.add(alignmentCorona);
      const finalMoon = new T.Mesh(sphere, moonMat);
      finalMoon.scale.setScalar(0.8);
      finalMoon.position.z = 0.35;
      alignment.add(finalMoon);
      const orbit = new T.Mesh(
        own(new T.TorusGeometry(3.2, 0.022, 8, 144)),
        copper,
      );
      orbit.rotation.x = 0.45;
      alignment.add(orbit);
      const satellite = new T.Mesh(
        own(new T.SphereGeometry(0.13, 24, 16)),
        paleMetal,
      );
      orbit.add(satellite);
      const constellationGeo = own(new T.BufferGeometry());
      const constellationPositions = new Float32Array(9 * 3);
      constellationGeo.setAttribute(
        "position",
        new T.BufferAttribute(constellationPositions, 3),
      );
      const constellationMat = own(
        new T.LineBasicMaterial({
          color: 0x927057,
          transparent: true,
          opacity: 0.45,
        }),
      );
      const constellation = new T.Line(constellationGeo, constellationMat);
      alignment.add(constellation);
      if (!(await stage(68, "Waking the distant stars"))) return;
      let time = 0,
        last = 0,
        progress = state.current.progress.current,
        alignmentValue = state.current.alignment,
        px = 0,
        py = 0,
        mx = 0,
        my = 0,
        lastStar = -1;
      const target = new T.Vector3(),
        cam = new T.Vector3(),
        focus = new T.Vector3();
      const cameras = [
        new T.Vector3(0, 0.7, 15),
        new T.Vector3(6.2, 2.5, 12.5),
        new T.Vector3(0.8, 0.1, -10),
        new T.Vector3(0, 0.25, -14),
      ];
      const targets = [
        new T.Vector3(0.8, 0, 0),
        new T.Vector3(0, 0, -1),
        new T.Vector3(0, 0, -28),
        new T.Vector3(0, 0, -25),
      ];
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
          dt = Math.min((ms - last) / 1000, 0.045) || 0.016;
        last = ms;
        if (!paused) time += dt;
        const ease = 1 - Math.exp(-5 * dt);
        progress = paused
          ? state.current.progress.current
          : progress + (state.current.progress.current - progress) * ease;
        alignmentValue = paused
          ? state.current.alignment
          : alignmentValue +
            (state.current.alignment - alignmentValue) *
              (1 - Math.exp(-7 * dt));
        mx = paused ? 0 : mx + (px - mx) * ease;
        my = paused ? 0 : my + (py - my) * ease;
        const j = journeyAt(progress),
          i = Math.min(2, Math.floor(j.p)),
          f = T.MathUtils.smoothstep(j.p - i, 0, 1),
          narrow = element!.clientWidth < 700;
        cam.copy(cameras[i]).lerp(cameras[i + 1], f);
        focus.copy(targets[i]).lerp(targets[i + 1], f);
        if (narrow) cam.z += (1 - j.passage) * 5 + j.alignment * 7;
        cam.x += mx * 0.22;
        cam.y += my * 0.14;
        camera.clearViewOffset();
        camera.position.copy(cam);
        camera.lookAt(focus);
        camera.updateMatrixWorld();
        target
          .set(j.p < 1 ? 0.75 * (1 - j.unfold) : 0, 0, -25 * j.passage)
          .project(camera);
        const anchorX = narrow ? 0 : 0.32 - j.passage * 0.16;
        const alignmentAnchor =
          1 -
          (Math.min(element!.clientHeight * 0.65, 410) * 2) /
            element!.clientHeight;
        const anchorY = narrow
          ? T.MathUtils.lerp(-0.39, alignmentAnchor, j.alignment)
          : -0.02;
        camera.setViewOffset(
          element!.clientWidth,
          element!.clientHeight,
          ((target.x - anchorX) * element!.clientWidth) / 2,
          ((anchorY - target.y) * element!.clientHeight) / 2,
          element!.clientWidth,
          element!.clientHeight,
        );
        assembly.position.x = 0.75 * (1 - j.unfold);
        assembly.rotation.y = -j.unfold * 0.45;
        assembly.rotation.x = j.unfold * 0.24;
        assembly.visible = j.p < 2.2;
        moon.position.x = -j.unfold * 4.2;
        moon.position.y = j.unfold * 1.1;
        moon.scale.setScalar(1 - j.unfold * 0.68);
        moon.rotation.y = time * 0.018;
        coronaMat.uniforms.uTime.value = time;
        coronaMat.uniforms.uStrength.value = 1 - j.unfold * 0.88;
        corona.scale.setScalar(1 - j.unfold * 0.68);
        corona.position.x = moon.position.x;
        corona.position.y = moon.position.y;
        rings.forEach((ring, n) => {
          ring.position.z = (n - 1) * (0.16 + j.unfold * 2.9);
          ring.rotation.x = (1 - j.unfold) * (0.7 + n * 0.38);
          ring.rotation.y = (1 - j.unfold) * (0.22 + n * 0.28);
          ring.rotation.z = time * 0.018 * (n % 2 ? -1 : 1);
        });
        iris.scale.setScalar(0.82 + j.unfold * 0.18);
        iris.visible = j.unfold > 0.03;
        lens.visible = j.unfold > 0.05;
        lens.position.z = -j.unfold * 2.8;
        blades.forEach((blade, n) => {
          blade.rotation.z = (n * Math.PI * 2) / 9 + j.unfold * 0.26;
        });
        axles.scale.z = Math.max(0.001, j.unfold);
        axles.visible = j.unfold > 0.05;
        passage.visible = j.p > 0.2;
        gates.forEach((gate, n) => {
          gate.rotation.z = n * 0.13 + time * 0.007 * (n % 2 ? -1 : 1);
        });
        alignment.visible = j.p > 1.25;
        alignment.rotation.z = j.alignment * 0.05;
        const offset = (alignmentValue - 50) / 50;
        finalMoon.position.x = offset * 1.9;
        finalMoon.position.y = Math.abs(offset) * 0.15;
        (
          alignmentCorona.material as Three.ShaderMaterial
        ).uniforms.uTime.value = time;
        (
          alignmentCorona.material as Three.ShaderMaterial
        ).uniforms.uStrength.value = 0.6 + j.alignment * 0.4;
        orbit.rotation.y = offset * 0.6 + Math.sin(time * 0.12) * 0.07;
        satellite.position.set(
          Math.cos(alignmentValue * 0.055) * 3.2,
          Math.sin(alignmentValue * 0.055) * 3.2,
          0,
        );
        if (Math.abs(lastStar - alignmentValue) > 0.01) {
          for (let n = 0; n < 9; n++) {
            const a = n * 0.62 + (alignmentValue / 100) * 1.1,
              r = 2.6 + Math.sin(n * 2.4) * 0.7;
            constellationPositions.set(
              [Math.cos(a) * r, Math.sin(a) * r, 0.8],
              n * 3,
            );
          }
          constellationGeo.attributes.position.needsUpdate = true;
          constellationGeo.computeBoundingSphere();
          lastStar = alignmentValue;
        }
        constellation.visible = j.alignment > 0.05;
        constellationMat.opacity = j.alignment * 0.4;
        stars.rotation.z = time * 0.0015;
        glow.position.set(
          camera.position.x + 3,
          camera.position.y + 2,
          camera.position.z - 3,
        );
        try {
          renderer.render(scene, camera);
        } catch {
          fallback();
          return false;
        }
        if (shaderFailed) {
          fallback();
          return false;
        }
        if (!paused && !initial) raf = requestAnimationFrame(draw);
        return true;
      }
      const queue = () => {
        if (!raf && !disposed && !failed) raf = requestAnimationFrame(draw);
      };
      const resize = () => {
        if (element!.clientWidth < 1 || element!.clientHeight < 1) return;
        renderer.setSize(element!.clientWidth, element!.clientHeight);
        renderer.setPixelRatio(
          Math.min(devicePixelRatio, element!.clientWidth < 700 ? 1.25 : 1.6),
        );
        camera.aspect = element!.clientWidth / element!.clientHeight;
        camera.updateProjectionMatrix();
        queue();
      };
      const pointer = (event: PointerEvent) => {
        if (state.current.paused || event.pointerType !== "mouse") return;
        px = (event.clientX / innerWidth) * 2 - 1;
        py = 1 - (event.clientY / innerHeight) * 2;
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
      // Compile every material and instanced variant, including chapters that
      // begin outside the camera. Our polling is cancellable on teardown.
      scene.updateMatrixWorld(true);
      renderer.compile(scene, camera);
      const gl = renderer.getContext() as WebGL2RenderingContext,
        parallel = gl.getExtension("KHR_parallel_shader_compile");
      const programs = (renderer.info.programs ?? []).map(
        (program) => program.program as WebGLProgram,
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
        if (!(await frame())) return;
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
      if (!(await stage(89, "Letting the light arrive"))) return;
      const culling: [Three.Object3D, boolean][] = [];
      scene.traverse((object) => {
        culling.push([object, object.frustumCulled]);
        object.frustumCulled = false;
      });
      renderer.render(scene, camera);
      culling.forEach(([object, culled]) => {
        object.frustumCulled = culled;
      });
      if (shaderFailed) {
        fallback();
        return;
      }
      if (!(await stage(96, "One last alignment"))) return;
      while (document.hidden) if (!(await frame())) return;
      if (!draw(performance.now(), true)) return;
      let fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!fence) {
        fallback();
        return;
      }
      callbacks.push(() => {
        if (fence) gl.deleteSync(fence);
        fence = null;
      });
      gl.flush();
      while (fence) {
        const value = gl.clientWaitSync(fence, 0, 0);
        if (value === gl.ALREADY_SIGNALED || value === gl.CONDITION_SATISFIED)
          break;
        if (value === gl.WAIT_FAILED || gl.isContextLost()) {
          fallback();
          return;
        }
        if (!(await frame())) return;
      }
      if (fence) gl.deleteSync(fence);
      fence = null;
      renderer.domElement.style.opacity = "1";
      if (!(await frame()) || !(await frame())) return;
      const observer = new ResizeObserver(resize);
      observer.observe(element!);
      addEventListener("pointermove", pointer, { passive: true });
      addEventListener("scroll", queue, { passive: true });
      document.addEventListener("visibilitychange", visibility);
      callbacks.push(() => {
        observer.disconnect();
        removeEventListener("pointermove", pointer);
        removeEventListener("scroll", queue);
        document.removeEventListener("visibilitychange", visibility);
      });
      request.current = queue;
      state.current.onLoad({
        status: "ready",
        progress: 100,
        stage: "Your eyes are ready",
      });
      last = performance.now();
      queue();
    }
    setup().catch(fallback);
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);
  return <div className="scene-canvas" ref={host} />;
}
