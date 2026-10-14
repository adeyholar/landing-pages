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
      renderer.transmissionResolutionScale = mobile ? 0.65 : 1;
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
          color: 0xf5fcff,
          metalness: 0,
          roughness: 0.025,
          transmission: 0.94,
          thickness: 0.24,
          ior: 1.46,
          attenuationColor: 0x8cbbbd,
          attenuationDistance: 8,
          clearcoat: 0.2,
          clearcoatRoughness: 0.07,
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
        new T.TorusGeometry(2.72, 0.075, mobile ? 16 : 24, mobile ? 128 : 192),
      );
      const fineGeo = own(
        new T.TorusGeometry(2.84, 0.018, 12, mobile ? 128 : 192),
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
        own(new T.SphereGeometry(2.61, mobile ? 64 : 96, mobile ? 32 : 48)),
        glass,
      );
      // A convex optical body catches reflections along its rounded perimeter.
      lens.scale.z = 0.047;
      rings[0].add(lens);
      lens.position.z = 0.06;
      const iris = new T.Group();
      rings[1].add(iris);
      // A turned retaining plate covers each blade's outer edge. The curved
      // overlapping blades have no free-floating tips or disconnected mounts.
      const plateShape = new T.Shape();
      plateShape.absarc(0, 0, 2.7, 0, Math.PI * 2, false);
      const plateHole = new T.Path();
      plateHole.absarc(0, 0, 2.34, 0, Math.PI * 2, true);
      plateShape.holes.push(plateHole);
      const plateGeo = own(
        new T.ExtrudeGeometry(plateShape, {
          depth: 0.085,
          bevelEnabled: true,
          bevelSegments: 3,
          bevelSize: 0.016,
          bevelThickness: 0.012,
          curveSegments: 96,
          steps: 1,
        }),
      );
      const plate = new T.Mesh(plateGeo, darkMetal);
      plate.position.z = 0.13;
      iris.add(plate);
      const bladeShape = new T.Shape();
      const polar = (r: number, a: number) =>
        [r * Math.cos(a), r * Math.sin(a)] as const;
      bladeShape.moveTo(...polar(2.55, -0.14));
      bladeShape.absarc(0, 0, 2.55, -0.14, 0.9, false);
      bladeShape.quadraticCurveTo(...polar(1.7, 1.03), ...polar(0.78, 0.9));
      bladeShape.absarc(0, 0, 0.78, 0.9, 0.16, true);
      bladeShape.quadraticCurveTo(...polar(1.68, -0.1), ...polar(2.55, -0.14));
      const bladeGeo = own(
        new T.ExtrudeGeometry(bladeShape, {
          depth: 0.012,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.006,
          bevelThickness: 0.004,
          curveSegments: 48,
        }),
      );
      const bladeMaterials = [0x41454b, 0x4a4e53, 0x383c43].map((color) =>
        own(
          new T.MeshStandardMaterial({
            color,
            metalness: 0.92,
            roughness: 0.34,
          }),
        ),
      );
      const screwGeo = own(new T.CylinderGeometry(0.052, 0.052, 0.045, 20));
      screwGeo.rotateX(Math.PI / 2);
      const screwSlotGeo = own(new T.BoxGeometry(0.066, 0.008, 0.003));
      for (let i = 0; i < 9; i++) {
        const angle = (i * Math.PI * 2) / 9;
        const blade = new T.Mesh(bladeGeo, bladeMaterials[i % 3]);
        blade.rotation.z = angle;
        blade.position.z = 0.04 + i * 0.006;
        iris.add(blade);
        const screw = new T.Mesh(screwGeo, paleMetal);
        screw.position.set(
          Math.cos(angle) * 2.52,
          Math.sin(angle) * 2.52,
          0.25,
        );
        const slot = new T.Mesh(screwSlotGeo, darkMetal);
        slot.position.z = 0.024;
        slot.rotation.z = angle + 0.4;
        screw.add(slot);
        iris.add(screw);
      }
      // Fixed collars stay attached to the rings; telescopic rails join them.
      const axles = new T.Group();
      instrument.add(axles);
      const rails: Three.Mesh[] = [];
      const axisGeo = own(new T.CylinderGeometry(0.024, 0.024, 1, 20));
      const collarGeo = own(new T.SphereGeometry(0.083, 20, 12));
      const attachment = new T.Vector3(),
        railEnd = new T.Vector3();
      const direction = new T.Vector3(),
        yAxis = new T.Vector3(0, 1, 0);
      for (let i = 0; i < 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const bar = new T.Mesh(axisGeo, copper);
        axles.add(bar);
        rails.push(bar);
        rings.forEach((ring) => {
          const collar = new T.Mesh(collarGeo, paleMetal);
          collar.position.set(Math.cos(a) * 2.72, Math.sin(a) * 2.72, 0);
          ring.add(collar);
        });
      }
      const assemblyMaterials = new Map<Three.Material, Three.Material>();
      assembly.traverse((object) => {
        if (!(object instanceof T.Mesh) || object === corona) return;
        const material = object.material as Three.Material;
        let local = assemblyMaterials.get(material);
        if (!local) {
          local = own(material.clone());
          local.transparent = true;
          assemblyMaterials.set(material, local);
        }
        object.material = local;
      });
      const lensMaterial = lens.material as Three.MeshPhysicalMaterial;
      const irisMaterials = new Set<Three.Material>();
      iris.traverse((object) => {
        if (!(object instanceof T.Mesh)) return;
        const material = own((object.material as Three.Material).clone());
        object.material = material;
        irisMaterials.add(material);
      });
      const railMaterial = own(copper.clone());
      railMaterial.transparent = true;
      rails.forEach((rail) => {
        rail.material = railMaterial;
      });
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
      const starCanvas = document.createElement("canvas");
      starCanvas.width = starCanvas.height = 32;
      const starContext = starCanvas.getContext("2d");
      if (!starContext) throw new Error("Star texture unavailable");
      const starGlow = starContext.createRadialGradient(16, 16, 0, 16, 16, 16);
      starGlow.addColorStop(0, "rgba(255,255,255,1)");
      starGlow.addColorStop(0.2, "rgba(255,255,255,0.9)");
      starGlow.addColorStop(0.5, "rgba(255,255,255,0.25)");
      starGlow.addColorStop(1, "rgba(255,255,255,0)");
      starContext.fillStyle = starGlow;
      starContext.fillRect(0, 0, 32, 32);
      const starTexture = own(new T.CanvasTexture(starCanvas));
      const starMat = own(
        new T.PointsMaterial({
          map: starTexture,
          alphaTest: 0.005,
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
        new T.TorusGeometry(4.1, 0.055, 16, mobile ? 128 : 192),
      );
      const gateTrim = own(new T.TorusGeometry(4.24, 0.012, 10, 160));
      const gates: Three.Group[] = [];
      const gateMaterials: Three.Material[][] = [];
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
        const materials: Three.Material[] = [];
        gate.traverse((object) => {
          if (!(object instanceof T.Mesh)) return;
          const material = own((object.material as Three.Material).clone());
          material.transparent = true;
          object.material = material;
          materials.push(material);
        });
        gateMaterials.push(materials);
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
      const solarMat = own(
        new T.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uOpacity: { value: 0 } },
          vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
          fragmentShader: `varying vec2 vUv; uniform float uOpacity;
          void main(){
            float r=length((vUv-.5)*2.);
            if(r>1.) discard;
            float limb=sqrt(max(0.,1.-r*r));
            float grain=sin(vUv.x*831.)*sin(vUv.y*723.)*.012;
            vec3 color=mix(vec3(.8,.30,.075),vec3(1.,.84,.53),.32+.68*limb)+grain;
            gl_FragColor=vec4(color,uOpacity);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        }),
      );
      const sun = new T.Mesh(own(new T.PlaneGeometry(3.6, 3.6)), solarMat);
      sun.position.z = -0.08;
      alignment.add(sun);
      const finalMoon = new T.Mesh(sphere, moonMat);
      finalMoon.scale.setScalar(0.8);
      finalMoon.position.z = 0.35;
      alignment.add(finalMoon);
      const orbit = new T.Mesh(
        own(new T.TorusGeometry(3.2, 0.022, 16, 192)),
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
      const alignmentMaterials = new Set<Three.Material>();
      alignment.traverse((object) => {
        if (
          !(object instanceof T.Mesh) ||
          object === alignmentCorona ||
          object === sun ||
          object === finalMoon
        )
          return;
        const material = own((object.material as Three.Material).clone());
        material.transparent = true;
        object.material = material;
        alignmentMaterials.add(material);
      });
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
        const ease = 1 - Math.exp(-9 * dt);
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
          f = i === 0 ? j.unfold : i === 1 ? j.passage : j.alignment,
          narrow = element!.clientWidth < 700;
        cam.copy(cameras[i]).lerp(cameras[i + 1], f);
        focus.copy(targets[i]).lerp(targets[i + 1], f);
        if (narrow) cam.z += 5;
        cam.x += mx * 0.22;
        cam.y += my * 0.14;
        camera.clearViewOffset();
        camera.position.copy(cam);
        camera.lookAt(focus);
        camera.updateMatrixWorld();
        target
          .set(j.p < 1 ? 0.75 * (1 - j.unfold) : 0, 0, -25 * j.passage)
          .project(camera);
        const anchorX = narrow
          ? 0
          : 0.36 - j.passage * 0.08 + j.alignment * 0.12;
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
        assembly.scale.setScalar(1 - j.unfold * (narrow ? 0.48 : 0.18));
        assemblyMaterials.forEach((material) => {
          material.opacity = 1 - j.depart;
          material.depthWrite =
            material !== lensMaterial && material.opacity > 0.995;
        });
        lensMaterial.opacity =
          T.MathUtils.smoothstep(j.unfold, 0.35, 0.8) *
          (1 - T.MathUtils.smoothstep(j.p, 1.08, 1.35));
        assembly.position.x = 0.75 * (1 - j.unfold);
        assembly.rotation.y = -j.unfold * 0.45;
        assembly.rotation.x = j.unfold * 0.24;
        assembly.visible = j.depart < 1;
        moon.position.x = -j.unfold * 4.2;
        moon.position.y = j.unfold * 1.1;
        moon.scale.setScalar(1 - j.unfold * 0.68);
        moon.rotation.y = time * 0.018;
        coronaMat.uniforms.uTime.value = time;
        coronaMat.uniforms.uStrength.value =
          (1 - j.unfold * 0.88) * (1 - j.depart);
        corona.scale.setScalar(1 - j.unfold * 0.68);
        corona.position.x = moon.position.x;
        corona.position.y = moon.position.y;
        rings.forEach((ring, n) => {
          ring.position.z = (n - 1) * (0.16 + j.unfold * 2.9);
          ring.rotation.x = (1 - j.unfold) * (0.7 + n * 0.38);
          ring.rotation.y = (1 - j.unfold) * (0.22 + n * 0.28);
          ring.rotation.z = time * 0.012 * (n % 2 ? -1 : 1) * (1 - j.unfold);
        });
        iris.visible = j.unfold > 0.15;
        irisMaterials.forEach((material) => {
          material.opacity =
            T.MathUtils.smoothstep(j.unfold, 0.35, 0.85) * (1 - j.depart);
          material.depthWrite = material.opacity > 0.995;
        });
        lens.visible = lensMaterial.opacity > 0.001;
        rings.forEach((ring) => ring.updateMatrix());
        rails.forEach((rail, n) => {
          const a = (n * Math.PI * 2) / 3;
          attachment
            .set(Math.cos(a) * 2.72, Math.sin(a) * 2.72, 0)
            .applyMatrix4(rings[0].matrix);
          railEnd
            .set(Math.cos(a) * 2.72, Math.sin(a) * 2.72, 0)
            .applyMatrix4(rings[2].matrix);
          direction.subVectors(railEnd, attachment);
          rail.position.copy(attachment).add(railEnd).multiplyScalar(0.5);
          rail.scale.y = direction.length();
          rail.quaternion.setFromUnitVectors(yAxis, direction.normalize());
        });
        railMaterial.opacity =
          T.MathUtils.smoothstep(j.unfold, 0.65, 0.95) * (1 - j.depart);
        railMaterial.depthWrite = railMaterial.opacity > 0.995;
        axles.visible = railMaterial.opacity > 0.001;
        passage.visible = j.p > 0.2;
        gates.forEach((gate, n) => {
          gate.rotation.z = n * 0.13 + time * 0.007 * (n % 2 ? -1 : 1);
          const distance = camera.position.z - gate.position.z;
          const visibility =
            T.MathUtils.smoothstep(distance, 2.8, 7) *
            T.MathUtils.smoothstep(j.p, 1.12, 1.85) *
            (1 - j.alignment * 0.82);
          gate.visible = visibility > 0.001;
          gateMaterials[n].forEach((material) => {
            material.opacity = visibility;
            material.depthWrite = visibility > 0.995;
          });
        });
        const alignmentPresence = T.MathUtils.smoothstep(j.p, 1.25, 1.82);
        alignment.visible = alignmentPresence > 0.001;
        alignmentMaterials.forEach((material) => {
          material.opacity = alignmentPresence;
          material.depthWrite = alignmentPresence > 0.995;
        });
        solarMat.uniforms.uOpacity.value = alignmentPresence;
        alignment.scale.setScalar(
          narrow ? 0.6 - j.alignment * 0.12 : 1 - j.alignment * 0.16,
        );
        alignment.rotation.z = j.alignment * 0.05;
        const offset = (alignmentValue - 50) / 50;
        finalMoon.position.x = offset * 1.9;
        finalMoon.position.y = Math.abs(offset) * 0.15;
        (
          alignmentCorona.material as Three.ShaderMaterial
        ).uniforms.uTime.value = time;
        (
          alignmentCorona.material as Three.ShaderMaterial
        ).uniforms.uStrength.value =
          (0.6 + j.alignment * 0.4) * alignmentPresence;
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
      addEventListener("umbra:progress", queue);
      document.addEventListener("visibilitychange", visibility);
      callbacks.push(() => {
        observer.disconnect();
        removeEventListener("pointermove", pointer);
        removeEventListener("umbra:progress", queue);
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
