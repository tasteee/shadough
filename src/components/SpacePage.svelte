<script lang="ts">
  import { onMount } from 'svelte'
  import Knob from './Knob.svelte'

  interface Props {
    onNavigate: (path: string) => void
  }
  let { onNavigate }: Props = $props()

  let canvasEl: HTMLCanvasElement
  let currentShader = $state(0)

  // 10 Space-inspired shaders grounded in tasteink logo
  const spaceShaders = [
    {
      id: 0,
      name: 'Gravitational Lensing',
      tag: 'SPACE-01',
      knobs: [
        { label: 'Singularity Mass', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#38bdf8' },
        { label: 'Orbit Radius', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#818cf8' },
        { label: 'Photon Ring', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#fef08a' },
      ],
    },
    {
      id: 1,
      name: 'Accretion Disk Plasma',
      tag: 'SPACE-02',
      knobs: [
        { label: 'Plasma Shear', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#f97316' },
        { label: 'Doppler Boost', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#06b6d4' },
        { label: 'Viscous Heat', min: 0.2, max: 3.0, step: 0.1, val: 1.4, color: '#ef4444' },
      ],
    },
    {
      id: 2,
      name: 'Solar Corona & Flares',
      tag: 'SPACE-03',
      knobs: [
        { label: 'Corona Reach', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#fbbf24' },
        { label: 'Magnetic Loops', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#f59e0b' },
        { label: 'Flare Energy', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#ea580c' },
      ],
    },
    {
      id: 3,
      name: 'Nebular Ionization',
      tag: 'SPACE-04',
      knobs: [
        { label: 'H-Alpha Glow', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#ec4899' },
        { label: 'O-III Cyan Gas', min: 0.2, max: 3.0, step: 0.1, val: 1.1, color: '#06b6d4' },
        { label: 'Dust Absorption', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#a855f7' },
      ],
    },
    {
      id: 4,
      name: 'Pulsar Beam Sweep',
      tag: 'SPACE-05',
      knobs: [
        { label: 'Beam Sweep', min: 0.2, max: 3.0, step: 0.1, val: 1.0, color: '#38bdf8' },
        { label: 'Synchrotron Lum', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#67e8f9' },
        { label: 'Magnetic Ripple', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#c084fc' },
      ],
    },
    {
      id: 5,
      name: 'Supernova Shockwave',
      tag: 'SPACE-06',
      knobs: [
        { label: 'Shock Velocity', min: 0.2, max: 3.0, step: 0.1, val: 1.0, color: '#f43f5e' },
        { label: 'Compression Shell', min: 0.2, max: 3.0, step: 0.1, val: 1.4, color: '#fb923c' },
        { label: 'Cooling Filaments', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#38bdf8' },
      ],
    },
    {
      id: 6,
      name: 'Quantum Vacuum Foam',
      tag: 'SPACE-07',
      knobs: [
        { label: 'Vacuum Density', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#a855f7' },
        { label: 'Metric Jitter', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#38bdf8' },
        { label: 'Pair Creation', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#f43f5e' },
      ],
    },
    {
      id: 7,
      name: 'Comet Ion Outgassing',
      tag: 'SPACE-08',
      knobs: [
        { label: 'Ion Jet Lift', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#06b6d4' },
        { label: 'Solar Wind', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#38bdf8' },
        { label: 'Dust Sublimation', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#fef08a' },
      ],
    },
    {
      id: 8,
      name: 'Cosmic Ray Cascades',
      tag: 'SPACE-09',
      knobs: [
        { label: 'Particle Flux', min: 0.2, max: 3.0, step: 0.1, val: 1.1, color: '#60a5fa' },
        { label: 'Cherenkov Flash', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#38bdf8' },
        { label: 'Ionization Track', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#c084fc' },
      ],
    },
    {
      id: 9,
      name: 'Wormhole Throat Warp',
      tag: 'SPACE-10',
      knobs: [
        { label: 'Curvature Shear', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#a855f7' },
        { label: 'Exotic Matter', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#22c55e' },
        { label: 'Throat Ring', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#ec4899' },
      ],
    },
  ]

  let knobStates = $state(
    spaceShaders.map((s) => s.knobs.map((k) => k.val))
  )

  onMount(() => {
    const gl = canvasEl.getContext('webgl', {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    })
    if (!gl) return
    const glCtx: WebGLRenderingContext = gl

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        v_uv.y = 1.0 - v_uv.y;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fsSource = `
      precision highp float;
      varying vec2 v_uv;

      uniform sampler2D u_texture;
      uniform vec2 u_resolution;
      uniform vec2 u_image_res;
      uniform float u_time;
      uniform int u_shader_id;
      uniform float u_k1;
      uniform float u_k2;
      uniform float u_k3;

      #define PI 3.14159265359

      float hash11(float p) {
        p = fract(p * 0.1031);
        p *= p + 33.33;
        p *= p + p;
        return fract(p);
      }

      float hash21(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      vec2 hash22(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.xx + p3.yz) * p3.zy);
      }

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,
                            0.366025403784439,
                           -0.577350269189626,
                            0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
              + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      float fbm(vec2 p) {
        float total = 0.0;
        float amp = 0.5;
        for (int i = 0; i < 4; i++) {
          total += snoise(p) * amp;
          p = p * 2.05 + vec2(1.7, 9.2);
          amp *= 0.5;
        }
        return total;
      }

      vec2 curlWarp(vec2 p, float t) {
        float n1 = snoise(p * 2.2 + vec2(t * 0.18, -t * 0.12));
        float n2 = snoise(p * 3.8 + vec2(-t * 0.15, t * 0.22) + vec2(n1 * 1.2));
        float n3 = snoise(p * 6.5 + vec2(t * 0.25, t * 0.18) + vec2(n2 * 0.8));
        return vec2(n2 - n3, n1 + n3) * 0.5;
      }

      vec2 getCoverUV(vec2 uv, vec2 screenRes, vec2 imgRes) {
        float screenAspect = screenRes.x / screenRes.y;
        float imgAspect = imgRes.x / imgRes.y;
        vec2 scale;
        if (screenAspect > imgAspect) {
          scale = vec2(imgAspect / screenAspect, 1.0);
        } else {
          scale = vec2(1.0, screenAspect / imgAspect);
        }
        scale *= 1.14;
        return (uv - 0.5) / scale + 0.5;
      }

      vec4 sampleClamped(vec2 uv) {
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          return vec4(0.97, 0.97, 0.98, 1.0);
        }
        return texture2D(u_texture, uv);
      }

      float getInk(vec2 p) {
        vec4 c = sampleClamped(p);
        return smoothstep(0.72, 0.25, dot(c.rgb, vec3(0.299, 0.587, 0.114)));
      }

      void main() {
        vec2 uv = v_uv;
        vec2 aspectUV = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        vec2 coverUV = getCoverUV(uv, u_resolution, u_image_res);
        vec3 color = vec3(0.97, 0.97, 0.98);
        float t = u_time;

        // ==========================================
        // 0. Gravitational Lensing (Black Hole Geodesic Deflection)
        // ==========================================
        if (u_shader_id == 0) {
          // Micro black hole orbiting smoothly
          float orbSpeed = t * 0.45;
          vec2 bhPos = vec2(cos(orbSpeed * 0.7) * 0.35, sin(orbSpeed) * 0.2) * u_k2;
          
          vec2 toBH = aspectUV - bhPos;
          float r = length(toBH);
          float einsteinR = 0.16 * u_k1;
          
          // Geodesic deflection: light rays bend inward towards the mass
          vec2 deflection = normalize(toBH + 1e-4) * (einsteinR * einsteinR / (r + 0.008));
          vec2 lensedUV = coverUV - deflection * 0.28;

          vec4 img = sampleClamped(lensedUV);

          // Photon sphere ring highlight
          float photonRing = smoothstep(0.015, 0.0, abs(r - einsteinR * 0.95)) * u_k3;
          vec3 ringColor = vec3(0.85, 0.95, 1.0);

          // Event horizon shadow at the core
          float horizon = smoothstep(einsteinR * 0.32, einsteinR * 0.22, r);

          color = mix(img.rgb, vec3(0.02, 0.01, 0.05), horizon);
          color += ringColor * photonRing * 1.5;
        }

        // ==========================================
        // 1. Accretion Disk Plasma
        // ==========================================
        else if (u_shader_id == 1) {
          // Spiral coordinate around typography center
          vec2 center = aspectUV;
          float r = length(center);
          float angle = atan(center.y, center.x);

          // Viscous differential rotation (Keplerian shear: inner rotates faster)
          float omega = 1.8 / (r + 0.18) * u_k1;
          float shearAngle = angle + omega * t * 0.35;
          vec2 shearedP = vec2(cos(shearAngle), sin(shearAngle)) * r;

          vec2 plasmaFlow = curlWarp(shearedP * 6.0, t * 0.8) * 0.02;
          vec4 img = sampleClamped(coverUV + plasmaFlow);
          float ink = getInk(coverUV + plasmaFlow);

          // Doppler boosting (approaching side is brighter/bluer)
          float doppler = sin(shearAngle) * 0.5 + 0.5;
          doppler = pow(doppler, 1.5) * u_k2;

          // Hot plasma filament radiation
          float plasma = fbm(vec2(r * 18.0 - t * 0.6, shearAngle * 4.0)) * 0.5 + 0.5;
          float disk = smoothstep(0.48, 0.12, r) * smoothstep(0.04, 0.14, r);
          
          vec3 hotPlasma = mix(vec3(1.0, 0.45, 0.1), vec3(0.3, 0.8, 1.0), doppler);
          color = img.rgb + (hotPlasma * plasma * disk * ink * 2.2 * u_k3);
        }

        // ==========================================
        // 2. Solar Corona & Prominence Flares
        // ==========================================
        else if (u_shader_id == 2) {
          vec4 img = sampleClamped(coverUV);
          float ink = getInk(coverUV);

          // Magnetic flux loop prominences arching outward from letter contours
          vec2 p = aspectUV * 10.0;
          float coronaStreamers = fbm(p + vec2(0.0, -t * 0.4)) * 0.5 + 0.5;
          
          // Radial distance from ink boundary
          float edgeProximity = 0.0;
          float flareDist = 0.038 * u_k1;
          for (int i = 0; i < 6; i++) {
            float a = float(i) * (6.28318 / 6.0);
            edgeProximity += getInk(coverUV + vec2(cos(a), sin(a)) * flareDist);
          }
          edgeProximity = clamp(edgeProximity * 0.4 - ink * 0.7, 0.0, 1.0);

          // Coronal magnetic turbulence
          float magLoops = sin(aspectUV.x * 24.0 + snoise(aspectUV * 8.0 + t * 0.5) * 6.0) * 0.5 + 0.5;
          float flare = edgeProximity * coronaStreamers * mix(1.0, magLoops, u_k2);

          vec3 coronaGold = vec3(1.0, 0.82, 0.4);
          vec3 flareOrange = vec3(1.0, 0.35, 0.08);
          vec3 emit = mix(coronaGold, flareOrange, flare) * flare * 2.2 * u_k3;

          color = img.rgb + emit * (1.0 - img.rgb * 0.4);
        }

        // ==========================================
        // 3. Nebular Ionization (H-Alpha & O-III Gas Drift)
        // ==========================================
        else if (u_shader_id == 3) {
          // Drifting cosmic cloud filaments
          vec2 gasUV = aspectUV * 3.5;
          vec2 gasFlow = curlWarp(gasUV, t * 0.25) * 0.03;

          vec4 img = sampleClamped(coverUV + gasFlow * 0.3);
          float ink = getInk(coverUV + gasFlow * 0.3);

          // Dual emission bands: Hydrogen-alpha (magenta 656nm) & Doubly Ionized Oxygen (cyan 500nm)
          float hAlpha = fbm(gasUV * 1.8 + vec2(t * 0.08, -t * 0.05)) * 0.5 + 0.5;
          float oIII = fbm(gasUV * 2.4 - vec2(t * 0.06, t * 0.07)) * 0.5 + 0.5;

          vec3 colHAlpha = vec3(0.9, 0.15, 0.48) * u_k1; // Deep H-Alpha Magenta
          vec3 colOIII = vec3(0.12, 0.88, 0.82) * u_k2;   // O-III Cyan

          // Gas absorbs into paper and radiates intensely along the ink
          vec3 nebularGas = (colHAlpha * pow(hAlpha, 2.0) + colOIII * pow(oIII, 2.2)) * 0.45;
          color = img.rgb + nebularGas * (ink * 1.8 + 0.25 * u_k3);
          color = clamp(color, 0.0, 1.0);
        }

        // ==========================================
        // 4. Pulsar Beam Sweep & Magnetosphere
        // ==========================================
        else if (u_shader_id == 4) {
          // Rotating lighthouse synchrotron relativistic beam
          float sweep = t * 1.4 * u_k1;
          float beamAngle = mod(sweep, 6.28318);
          
          vec2 p = aspectUV;
          float angle = atan(p.y, p.x);
          float diffAngle = abs(mod(angle - beamAngle + PI, 2.0 * PI) - PI);
          
          // Tight relativistic cone
          float beam = exp(-diffAngle * diffAngle * 35.0);
          float beamCollimation = smoothstep(1.2, 0.05, length(p));
          float pulse = beam * beamCollimation;

          // Magnetic field ripples
          float ripple = sin(length(aspectUV) * 45.0 - t * 4.0) * 0.5 + 0.5;
          vec2 warp = normalize(aspectUV + 1e-4) * ripple * 0.008 * pulse * u_k3;

          vec4 img = sampleClamped(coverUV + warp);
          float ink = getInk(coverUV + warp);

          // Synchrotron intense cyan-white flash
          vec3 beamColor = vec3(0.65, 0.92, 1.0) * u_k2;
          color = img.rgb + beamColor * pulse * (ink * 1.5 + 0.4);
        }

        // ==========================================
        // 5. Supernova Remnant Shockwave
        // ==========================================
        else if (u_shader_id == 5) {
          // Supersonic expanding blast wave cycle
          float cycle = mod(t * 0.35 * u_k1, 2.8);
          float shockRadius = cycle * 0.65;
          
          float r = length(aspectUV);
          float distToShock = abs(r - shockRadius);
          
          // Shock compression shell
          float shell = smoothstep(0.045, 0.0, distToShock) * smoothstep(1.5, 0.2, shockRadius) * u_k2;
          
          // Shock-induced cooling filaments
          float filament = fbm(aspectUV * 25.0 + vec2(t * 0.2)) * 0.5 + 0.5;
          shell *= (0.6 + 0.4 * filament * u_k3);

          // Post-shock refractive compression
          vec2 shockDisp = normalize(aspectUV + 1e-4) * shell * 0.02;
          vec4 img = sampleClamped(coverUV - shockDisp);

          vec3 shockIonization = vec3(1.0, 0.35, 0.25); // Supersonic ionization
          vec3 coolingCyan = vec3(0.2, 0.85, 1.0);
          vec3 shellCol = mix(shockIonization, coolingCyan, filament);

          color = img.rgb + shellCol * shell * 2.0;
        }

        // ==========================================
        // 6. Quantum Vacuum Foam (Spacetime Jitter & Virtual Pairs)
        // ==========================================
        else if (u_shader_id == 6) {
          // High-frequency quantum metric fluctuations
          vec2 qGrid = floor(aspectUV * 90.0);
          float metricJitter = (hash21(qGrid + vec2(floor(t * 18.0))) - 0.5) * 0.012 * u_k2;
          
          vec2 foamUV = coverUV + vec2(metricJitter, -metricJitter);
          vec4 img = sampleClamped(foamUV);
          float ink = getInk(coverUV);

          // Casimir energy density around typography boundaries
          float foamNoise = snoise(aspectUV * 40.0 + t * 4.0);
          float virtualPair = smoothstep(0.82, 0.98, abs(foamNoise)) * ink * u_k1;

          // Virtual photon pair emission (spectral violet and cyan)
          vec3 pairViolet = vec3(0.75, 0.3, 1.0);
          vec3 pairCyan = vec3(0.1, 0.95, 1.0);
          vec3 vacuumEmission = mix(pairViolet, pairCyan, hash11(t * 10.0)) * virtualPair * 2.0 * u_k3;

          color = img.rgb + vacuumEmission;
        }

        // ==========================================
        // 7. Comet Ion Outgassing & Sublimation
        // ==========================================
        else if (u_shader_id == 7) {
          // Solar wind flowing from top-left to bottom-right
          vec2 windDir = normalize(vec2(1.0, -0.6));
          float wind = t * 1.5 * u_k2;

          // Outgassing jet streamlines trailing from letter borders
          vec2 jetP = aspectUV - windDir * wind * 0.15;
          float streamline = snoise(vec2(dot(aspectUV, vec2(-windDir.y, windDir.x)) * 18.0, dot(aspectUV, windDir) * 6.0 - wind)) * 0.5 + 0.5;

          // Trace backward along wind to sample typography emission source
          float sourceInk = 0.0;
          for (int i = 0; i < 5; i++) {
            float dist = float(i) * 0.015 * u_k1;
            sourceInk += getInk(coverUV - windDir * dist) * (1.0 - float(i) * 0.18);
          }
          sourceInk = clamp(sourceInk * 0.35, 0.0, 1.0);

          vec4 img = sampleClamped(coverUV);
          float ink = getInk(coverUV);

          // Comet ion tail fluorescent cyan glow and dust tail golden tint
          vec3 ionTail = vec3(0.15, 0.9, 0.95) * 1.8;
          vec3 dustTail = vec3(1.0, 0.88, 0.5) * u_k3;
          vec3 tailCol = mix(dustTail, ionTail, streamline);

          float tailMask = sourceInk * streamline * (1.0 - ink * 0.8);
          color = img.rgb + tailCol * tailMask * 0.9;
        }

        // ==========================================
        // 8. Cosmic Ray Particle Cascades (Cherenkov Tracks)
        // ==========================================
        else if (u_shader_id == 8) {
          vec4 img = sampleClamped(coverUV);
          float ink = getInk(coverUV);

          // Relativistic cosmic particle track generation
          float rayTime = floor(t * 7.0 * u_k1);
          vec2 rayOrigin = hash22(vec2(rayTime, 13.7)) * 2.0 - 1.0;
          vec2 rayAngle = normalize(hash22(vec2(rayTime, 99.1)) - 0.5);
          
          // Line distance to particle track
          vec2 toPoint = aspectUV - rayOrigin;
          float lineProj = dot(toPoint, rayAngle);
          vec2 perp = toPoint - rayAngle * lineProj;
          float trackDist = length(perp);

          // Cherenkov ionization track
          float track = smoothstep(0.006, 0.0, trackDist) * smoothstep(-0.6, 0.6, lineProj) * smoothstep(0.6, -0.6, lineProj);
          float cherenkovPulse = sin(fract(t * 7.0 * u_k1) * PI);
          float flash = track * cherenkovPulse * u_k2;

          // Secondary particle shower micro-blips
          vec2 showerGrid = floor(aspectUV * 55.0);
          float showerRnd = hash21(showerGrid + vec2(rayTime));
          float microBlip = step(0.97, showerRnd) * cherenkovPulse * ink * u_k3;

          vec3 cherenkovBlue = vec3(0.1, 0.65, 1.0) * 2.5;
          vec3 showerGlint = vec3(0.85, 0.95, 1.0) * 1.8;

          color = img.rgb + cherenkovBlue * flash + showerGlint * microBlip;
        }

        // ==========================================
        // 9. Wormhole Throat Warp
        // ==========================================
        else if (u_shader_id == 9) {
          // Traversable Lorentzian wormhole mouth
          vec2 throatPos = vec2(sin(t * 0.4) * 0.25, cos(t * 0.3) * 0.15);
          vec2 delta = aspectUV - throatPos;
          float r = length(delta);
          
          float throatRadius = 0.22 * u_k1;
          // Hyperbolic radial spatial shear
          float warpFactor = throatRadius / (pow(r, 1.4) + 0.04);
          vec2 wormholeUV = coverUV + delta * warpFactor * 0.18;

          vec4 img = sampleClamped(wormholeUV);

          // Exotic negative matter ring stabilization
          float exoticRing = smoothstep(0.02, 0.0, abs(r - throatRadius)) * u_k3;
          float innerThroat = smoothstep(throatRadius, throatRadius * 0.2, r);

          vec3 exoticEnergy = vec3(0.4, 1.0, 0.6) * u_k2; // Negative matter emerald
          vec3 throatVoid = vec3(0.08, 0.02, 0.15);

          color = mix(img.rgb, throatVoid, innerThroat * 0.85);
          color += exoticEnergy * exoticRing * 2.0;
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `

    function compileShader(type: number, src: string): WebGLShader | null {
      const s = glCtx.createShader(type)
      if (!s) return null
      glCtx.shaderSource(s, src)
      glCtx.compileShader(s)
      if (!glCtx.getShaderParameter(s, glCtx.COMPILE_STATUS)) {
        console.error('Shader compile error:', glCtx.getShaderInfoLog(s))
        glCtx.deleteShader(s)
        return null
      }
      return s
    }

    const vs = compileShader(glCtx.VERTEX_SHADER, vsSource)
    const fs = compileShader(glCtx.FRAGMENT_SHADER, fsSource)
    if (!vs || !fs) return

    const program = glCtx.createProgram()
    if (!program) return
    glCtx.attachShader(program, vs)
    glCtx.attachShader(program, fs)
    glCtx.linkProgram(program)
    if (!glCtx.getProgramParameter(program, glCtx.LINK_STATUS)) {
      console.error('Program link error:', glCtx.getProgramInfoLog(program))
      return
    }
    glCtx.useProgram(program)

    const posBuffer = glCtx.createBuffer()
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, posBuffer)
    glCtx.bufferData(
      glCtx.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      glCtx.STATIC_DRAW
    )

    const aPosLoc = glCtx.getAttribLocation(program, 'a_position')
    glCtx.enableVertexAttribArray(aPosLoc)
    glCtx.vertexAttribPointer(aPosLoc, 2, glCtx.FLOAT, false, 0, 0)

    const uResLoc = glCtx.getUniformLocation(program, 'u_resolution')
    const uImgResLoc = glCtx.getUniformLocation(program, 'u_image_res')
    const uTimeLoc = glCtx.getUniformLocation(program, 'u_time')
    const uShaderIdLoc = glCtx.getUniformLocation(program, 'u_shader_id')
    const uK1Loc = glCtx.getUniformLocation(program, 'u_k1')
    const uK2Loc = glCtx.getUniformLocation(program, 'u_k2')
    const uK3Loc = glCtx.getUniformLocation(program, 'u_k3')
    const uTexLoc = glCtx.getUniformLocation(program, 'u_texture')

    const texture = glCtx.createTexture()
    glCtx.bindTexture(glCtx.TEXTURE_2D, texture)
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE)
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE)
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.LINEAR)
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.LINEAR)

    let imgNaturalW = 752
    let imgNaturalH = 564

    const img = new Image()
    img.src = '/tasteink.jpg'
    img.onload = () => {
      imgNaturalW = img.naturalWidth || 752
      imgNaturalH = img.naturalHeight || 564
      glCtx.bindTexture(glCtx.TEXTURE_2D, texture)
      glCtx.pixelStorei(glCtx.UNPACK_FLIP_Y_WEBGL, 0)
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, glCtx.RGBA, glCtx.UNSIGNED_BYTE, img)
    }

    let animId: number
    const startTime = performance.now()

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.floor(window.innerWidth * dpr)
      const h = Math.floor(window.innerHeight * dpr)
      if (canvasEl.width !== w || canvasEl.height !== h) {
        canvasEl.width = w
        canvasEl.height = h
        glCtx.viewport(0, 0, w, h)
      }
    }

    window.addEventListener('resize', resize)
    resize()

    function render() {
      animId = requestAnimationFrame(render)
      resize()

      const elapsed = (performance.now() - startTime) / 1000.0

      glCtx.useProgram(program)
      glCtx.uniform2f(uResLoc, canvasEl.width, canvasEl.height)
      glCtx.uniform2f(uImgResLoc, imgNaturalW, imgNaturalH)
      glCtx.uniform1f(uTimeLoc, elapsed)
      glCtx.uniform1i(uShaderIdLoc, currentShader)

      const curKnobs = knobStates[currentShader] || [1.0, 1.0, 1.0]
      glCtx.uniform1f(uK1Loc, curKnobs[0] ?? 1.0)
      glCtx.uniform1f(uK2Loc, curKnobs[1] ?? 1.0)
      glCtx.uniform1f(uK3Loc, curKnobs[2] ?? 1.0)

      glCtx.activeTexture(glCtx.TEXTURE0)
      glCtx.bindTexture(glCtx.TEXTURE_2D, texture)
      glCtx.uniform1i(uTexLoc, 0)

      glCtx.drawArrays(glCtx.TRIANGLES, 0, 6)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      glCtx.deleteProgram(program)
      glCtx.deleteShader(vs)
      glCtx.deleteShader(fs)
      glCtx.deleteBuffer(posBuffer)
      glCtx.deleteTexture(texture)
    }
  })
</script>

<div class="space-page">
  <canvas bind:this={canvasEl} class="gl-canvas"></canvas>

  <!-- Top Navigation Header -->
  <header class="top-nav">
    <div class="nav-links">
      <span class="page-badge">SPACE COLLECTION (10)</span>
      <button class="nav-btn" onclick={() => onNavigate('/girly')}>
        💖 /girly (10) →
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/organic')}>
        🌿 Organic (15)
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/locked')}>
        🔒 Locked Keepers (7)
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/glitch')}>
        Glitch (10)
      </button>
    </div>
  </header>

  <!-- Bottom-Left Minimal Control Deck -->
  <div class="bottom-left-deck">
    <!-- Shader Names List -->
    <div class="shader-names-list">
      {#each spaceShaders as s}
        <button
          class="name-item"
          class:active={currentShader === s.id}
          onclick={() => (currentShader = s.id)}
        >
          <span class="dot"></span>
          <span class="num">{s.id < 9 ? '0' + (s.id + 1) : s.id + 1}</span>
          <span class="name">{s.name}</span>
        </button>
      {/each}
    </div>

    <!-- Rotary Knobs for currently active shader -->
    <div class="knobs-rack">
      {#each spaceShaders[currentShader].knobs as knob, i}
        <Knob
          label={knob.label}
          bind:value={knobStates[currentShader][i]}
          min={knob.min}
          max={knob.max}
          step={knob.step}
          color={knob.color}
        />
      {/each}
    </div>
  </div>
</div>

<style>
  .space-page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #030408;
    color: #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
    user-select: none;
  }

  .gl-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .top-nav {
    position: absolute;
    top: 1.25rem;
    left: 1.5rem;
    z-index: 20;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .page-badge {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.12);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(56, 189, 248, 0.3);
  }

  .nav-btn {
    padding: 6px 14px;
    border-radius: 8px;
    background: rgba(10, 12, 18, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #cbd5e1;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
  }

  /* Bottom-Left Minimal Control Deck */
  .bottom-left-deck {
    position: absolute;
    bottom: 1.5rem;
    left: 1.5rem;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: rgba(6, 8, 14, 0.85);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    padding: 0.9rem 1.15rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.75);
    width: 310px;
  }

  .shader-names-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 200px;
    overflow-y: auto;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 6px;
    padding-right: 4px;
  }

  .shader-names-list::-webkit-scrollbar {
    width: 4px;
  }
  .shader-names-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .name-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 6px;
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .name-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
  }

  .name-item.active {
    background: rgba(56, 189, 248, 0.15);
    color: #7dd3fc;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #64748b;
    flex-shrink: 0;
  }

  .name-item.active .dot {
    background: #38bdf8;
    box-shadow: 0 0 6px #38bdf8;
  }

  .num {
    font-size: 0.7rem;
    font-family: monospace;
    opacity: 0.65;
    flex-shrink: 0;
  }

  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .knobs-rack {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 12px;
    padding-top: 4px;
  }
</style>
