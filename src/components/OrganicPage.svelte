<script lang="ts">
  import { onMount } from 'svelte'
  import Knob from './Knob.svelte'

  interface Props {
    onNavigate: (path: string) => void
  }
  let { onNavigate }: Props = $props()

  let canvasEl: HTMLCanvasElement
  let currentShader = $state(0)

  // 15 Organic Shaders grounded in tasteink logo
  const organicShaders = [
    {
      id: 0,
      name: 'Water Surface Caustics',
      tag: 'ORGANIC-01',
      knobs: [
        { label: 'Caustics', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#38bdf8' },
        { label: 'Water Ripple', min: 0.1, max: 2.5, step: 0.1, val: 0.9, color: '#06b6d4' },
        { label: 'Sun Glint', min: 0.2, max: 3.0, step: 0.1, val: 1.1, color: '#fef08a' },
      ],
    },
    {
      id: 1,
      name: 'Ink Diffusion Bloom',
      tag: 'ORGANIC-02',
      knobs: [
        { label: 'Ink Bloom', min: 0.2, max: 3.0, step: 0.1, val: 1.1, color: '#a855f7' },
        { label: 'Wash Softness', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#818cf8' },
        { label: 'Spread Speed', min: 0.2, max: 2.5, step: 0.1, val: 0.8, color: '#ec4899' },
      ],
    },
    {
      id: 2,
      name: 'Smoke & Dissipation',
      tag: 'ORGANIC-03',
      knobs: [
        { label: 'Smoke Lift', min: 0.2, max: 3.0, step: 0.1, val: 1.0, color: '#94a3b8' },
        { label: 'Turbulence', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#cbd5e1' },
        { label: 'Wisp Density', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#c084fc' },
      ],
    },
    {
      id: 3,
      name: 'Oil Slick Iridescence',
      tag: 'ORGANIC-04',
      knobs: [
        { label: 'Film Thickness', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#f43f5e' },
        { label: 'Rainbow Sheen', min: 0.2, max: 3.0, step: 0.1, val: 1.4, color: '#eab308' },
        { label: 'Dispersion', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#06b6d4' },
      ],
    },
    {
      id: 4,
      name: 'Mycelium Hyphae Growth',
      tag: 'ORGANIC-05',
      knobs: [
        { label: 'Hyphae Reach', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#e2e8f0' },
        { label: 'Branch Detail', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#38bdf8' },
        { label: 'Spore Pulse', min: 0.2, max: 2.5, step: 0.1, val: 0.9, color: '#4ade80' },
      ],
    },
    {
      id: 5,
      name: 'Bioluminescent Moss',
      tag: 'ORGANIC-06',
      knobs: [
        { label: 'Moss Density', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#22c55e' },
        { label: 'Spore Glow', min: 0.2, max: 3.5, step: 0.1, val: 1.5, color: '#10b981' },
        { label: 'Pulse Rhythm', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#06b6d4' },
      ],
    },
    {
      id: 6,
      name: 'Thermal Heat Haze',
      tag: 'ORGANIC-07',
      knobs: [
        { label: 'Thermal Heat', min: 0.2, max: 3.0, step: 0.1, val: 1.1, color: '#f97316' },
        { label: 'Mirage Drift', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#eab308' },
        { label: 'Shimmer Rate', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#ef4444' },
      ],
    },
    {
      id: 7,
      name: 'Raindrops on Glass',
      tag: 'ORGANIC-08',
      knobs: [
        { label: 'Droplets', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#38bdf8' },
        { label: 'Refraction', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#60a5fa' },
        { label: 'Condensation', min: 0.0, max: 2.0, step: 0.1, val: 0.7, color: '#93c5fd' },
      ],
    },
    {
      id: 8,
      name: 'Coral & Lichen Growth',
      tag: 'ORGANIC-09',
      knobs: [
        { label: 'Calcification', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#14b8a6' },
        { label: 'Lichen Crust', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#a3e635' },
        { label: 'Growth Detail', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#f59e0b' },
      ],
    },
    {
      id: 9,
      name: 'Cellular Cytoplasm Flow',
      tag: 'ORGANIC-10',
      knobs: [
        { label: 'Membrane Flex', min: 0.2, max: 3.0, step: 0.1, val: 1.1, color: '#ec4899' },
        { label: 'Plasma Stream', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#8b5cf6' },
        { label: 'Viscosity', min: 0.2, max: 2.5, step: 0.1, val: 1.2, color: '#38bdf8' },
      ],
    },
    {
      id: 10,
      name: 'Parchment Fiber Bleed',
      tag: 'ORGANIC-11',
      knobs: [
        { label: 'Capillary Pull', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#d97706' },
        { label: 'Fiber Grain', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#b45309' },
        { label: 'Paper Warmth', min: 0.2, max: 2.0, step: 0.1, val: 0.9, color: '#fef3c7' },
      ],
    },
    {
      id: 11,
      name: 'Candle Amber Warmth',
      tag: 'ORGANIC-12',
      knobs: [
        { label: 'Amber Warmth', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#f59e0b' },
        { label: 'Flame Flicker', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#ef4444' },
        { label: 'Shadow Depth', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#78350f' },
      ],
    },
    {
      id: 12,
      name: 'Viscous Amber Resin',
      tag: 'ORGANIC-13',
      knobs: [
        { label: 'Resin Depth', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#f59e0b' },
        { label: 'Amber Tint', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#d97706' },
        { label: 'Surface Gloss', min: 0.2, max: 3.0, step: 0.1, val: 1.4, color: '#fef08a' },
      ],
    },
    {
      id: 13,
      name: 'Frost Dendrites',
      tag: 'ORGANIC-14',
      knobs: [
        { label: 'Frost Growth', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#38bdf8' },
        { label: 'Crystal Needles', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#e0f2fe' },
        { label: 'Ice Sparkle', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#ffffff' },
      ],
    },
    {
      id: 14,
      name: 'Abyssal Marine Drift',
      tag: 'ORGANIC-15',
      knobs: [
        { label: 'Marine Snow', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#38bdf8' },
        { label: 'Deep Rays', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#0284c7' },
        { label: 'Current Flow', min: 0.2, max: 2.5, step: 0.1, val: 0.9, color: '#06b6d4' },
      ],
    },
  ]

  // State for all knobs
  let knobStates = $state(
    organicShaders.map((s) => s.knobs.map((k) => k.val))
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

      // Hash and Noise functions
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

      // Voronoi Cellular Distance
      float voronoi(vec2 p) {
        vec2 n = floor(p);
        vec2 f = fract(p);
        float md = 8.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = hash22(n + g);
            o = 0.5 + 0.5 * sin(u_time * 0.5 + 6.2831 * o);
            vec2 r = g + o - f;
            float d = dot(r, r);
            if (d < md) md = d;
          }
        }
        return sqrt(md);
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
        // 0. Water Surface Caustics
        // ==========================================
        if (u_shader_id == 0) {
          vec2 p1 = aspectUV * 4.5 + vec2(t * 0.22, t * 0.18);
          vec2 p2 = aspectUV * 7.0 - vec2(t * 0.17, t * 0.26);
          float c1 = voronoi(p1);
          float c2 = voronoi(p2);
          float caustics = pow(c1 * c2, 1.5) * 3.2 * u_k1;

          // Water normal refraction
          vec2 ripple = curlWarp(aspectUV * 3.5, t * 0.5) * 0.015 * u_k2;
          vec4 img = sampleClamped(coverUV + ripple);

          // Sunlight caustics highlight on paper & ink
          vec3 sunColor = vec3(1.0, 0.97, 0.88);
          color = img.rgb + (sunColor * caustics * 0.45 * u_k3);
          // Subtle pool blue tint on shadow edges
          color = mix(color, color * vec3(0.92, 0.98, 1.0), 0.5);
        }

        // ==========================================
        // 1. Ink Diffusion Bloom (Sumi-e / Watercolor Wash)
        // ==========================================
        else if (u_shader_id == 1) {
          float speed = t * 0.4 * u_k3;
          vec2 curl = curlWarp(coverUV * 7.0, speed);
          
          float baseInk = getInk(coverUV);
          float bleedDist = 0.028 * u_k1;
          
          // Multi-tap organic diffusion outward from letters
          float spread = 0.0;
          for (int i = 0; i < 6; i++) {
            float ang = float(i) * (6.28318 / 6.0);
            vec2 dir = vec2(cos(ang), sin(ang)) + curl * 0.7;
            spread += getInk(coverUV + dir * bleedDist);
          }
          spread /= 6.0;

          vec4 baseCol = sampleClamped(coverUV);
          vec3 inkWash = vec3(0.12, 0.05, 0.18); // Deep velvety ink
          
          // Soft wash boundary with drying accumulation ring
          float washEdge = smoothstep(0.1, 0.4, spread) * (1.0 - baseInk);
          color = mix(baseCol.rgb, inkWash, washEdge * 0.65 * u_k2);
          color = mix(color, baseCol.rgb, baseInk);
        }

        // ==========================================
        // 2. Smoke & Tendril Dissipation
        // ==========================================
        else if (u_shader_id == 2) {
          // Buoyancy field rising upwards
          float lift = t * 0.35 * u_k1;
          vec2 smokeUV = coverUV;
          
          // Advect coordinates downward so smoke rises upward
          float turb = snoise(aspectUV * 4.0 + vec2(0.0, -lift)) * 0.04 * u_k2;
          float turb2 = snoise(aspectUV * 8.0 + vec2(turb * 2.0, -lift * 1.5)) * 0.02;
          vec2 sampleP = coverUV + vec2(turb + turb2, (turb2 - turb) * 0.8);

          vec4 img = sampleClamped(sampleP);
          float inkSource = getInk(coverUV + vec2(0.0, 0.08 * u_k1));
          
          // Tendril density
          float plume = fbm(aspectUV * 6.0 + vec2(turb, -lift * 0.8)) * 0.5 + 0.5;
          float smokeMask = inkSource * plume * u_k3;

          vec3 smokeCol = vec3(0.25, 0.18, 0.32);
          color = mix(img.rgb, smokeCol, smokeMask * 0.55);
        }

        // ==========================================
        // 3. Oil Slick Iridescence
        // ==========================================
        else if (u_shader_id == 3) {
          vec4 img = sampleClamped(coverUV);
          float ink = getInk(coverUV);
          
          // Thin film interference pattern
          float opd = (snoise(aspectUV * 6.5 + vec2(t * 0.12, -t * 0.08)) + ink * 1.8) * u_k1;
          vec3 iri = 0.5 + 0.5 * cos(6.28318 * (vec3(1.0, 0.72, 0.4) * opd + vec3(0.0, 0.33, 0.67)));
          
          // Edge gradient of the ink strokes
          float inkR = getInk(coverUV + vec2(0.003, 0.0));
          float inkU = getInk(coverUV + vec2(0.0, 0.003));
          float edge = length(vec2(inkR - ink, inkU - ink)) * 12.0;

          // Apply iridescent sheen onto the ink and fringing borders
          vec3 sheen = iri * (edge * 1.8 + ink * 0.45) * u_k2;
          color = img.rgb + sheen * (1.0 - img.rgb * 0.5);
          color = clamp(color, 0.0, 1.0);
        }

        // ==========================================
        // 4. Mycelium Hyphae Growth
        // ==========================================
        else if (u_shader_id == 4) {
          vec4 img = sampleClamped(coverUV);
          float ink = getInk(coverUV);

          // Dendritic branching hyphae
          vec2 p = aspectUV * 14.0;
          float pulse = sin(t * 1.2 * u_k3 + p.x * 0.5) * 0.5 + 0.5;
          
          // Multi-scale ridge noise
          float n1 = abs(snoise(p + vec2(t * 0.05, 0.0)));
          float n2 = abs(snoise(p * 2.1 + vec2(0.0, t * 0.04)));
          float ridge = 1.0 - smoothstep(0.0, 0.12, (n1 * 0.6 + n2 * 0.4));

          // Proximity to ink edge
          float edgeDist = 0.035 * u_k1;
          float inkNearby = 0.0;
          for (int i = 0; i < 4; i++) {
            float a = float(i) * 1.5707;
            inkNearby += getInk(coverUV + vec2(cos(a), sin(a)) * edgeDist);
          }
          inkNearby = clamp(inkNearby * 0.5 - ink * 0.8, 0.0, 1.0);

          float hyphae = ridge * inkNearby * u_k2;
          vec3 hyphaeCol = mix(vec3(0.85, 0.9, 0.98), vec3(0.4, 0.95, 0.8), pulse);
          color = mix(img.rgb, hyphaeCol, hyphae * 0.9);
        }

        // ==========================================
        // 5. Bioluminescent Moss
        // ==========================================
        else if (u_shader_id == 5) {
          vec4 img = sampleClamped(coverUV);
          float ink = getInk(coverUV);

          // Moss texture clustered around ink
          float mossNoise = fbm(aspectUV * 22.0) * 0.5 + 0.5;
          float mossCluster = ink * mossNoise * u_k1;

          // Bioluminescent spore points
          vec2 sporeGrid = floor(aspectUV * 45.0);
          float sporeSeed = hash21(sporeGrid);
          float sporeBlink = sin(t * 2.0 * u_k3 + sporeSeed * 20.0) * 0.5 + 0.5;
          float isSpore = step(0.88, sporeSeed) * sporeBlink;

          vec3 mossGreen = vec3(0.18, 0.42, 0.22);
          vec3 biolumCyan = vec3(0.1, 0.95, 0.75);

          color = mix(img.rgb, mossGreen, mossCluster * 0.65);
          color += biolumCyan * isSpore * ink * 1.8 * u_k2;
        }

        // ==========================================
        // 6. Thermal Heat Haze
        // ==========================================
        else if (u_shader_id == 6) {
          float heat = u_k1 * 0.015;
          float drift = t * 1.5 * u_k2;
          float freq = u_k3;

          // Differential refraction (Schlieren effect)
          float dy = snoise(vec2(aspectUV.x * 8.0 * freq, aspectUV.y * 5.0 - drift));
          float dx = snoise(vec2(aspectUV.x * 12.0 * freq + 2.0, aspectUV.y * 6.0 - drift * 1.2));
          vec2 refr = vec2(dx, dy) * heat;

          // Chromatic atmospheric split
          float r = sampleClamped(coverUV + refr * 1.15).r;
          float g = sampleClamped(coverUV + refr).g;
          float b = sampleClamped(coverUV + refr * 0.85).b;
          color = vec3(r, g, b);

          // Subtle thermal golden haze
          color = mix(color, color * vec3(1.04, 1.01, 0.96), 0.5);
        }

        // ==========================================
        // 7. Raindrops on Glass
        // ==========================================
        else if (u_shader_id == 7) {
          vec2 dropUV = aspectUV * 8.0 * u_k1;
          vec2 cell = floor(dropUV);
          vec2 f = fract(dropUV);
          float rnd = hash21(cell);

          vec2 dropCenter = vec2(0.5) + (hash22(cell) - 0.5) * 0.4;
          float dist = length(f - dropCenter);
          float dropSize = 0.28 * step(0.65, rnd);

          // Droplet lens refraction
          vec2 dropRefr = vec2(0.0);
          float dropMask = smoothstep(dropSize, dropSize * 0.8, dist);
          if (dropMask > 0.01) {
            vec2 norm = normalize(f - dropCenter);
            dropRefr = -norm * pow(dist / dropSize, 1.8) * 0.045 * u_k2;
          }

          // Micro condensation mist
          float mist = fbm(aspectUV * 35.0) * 0.005 * u_k3;
          vec4 img = sampleClamped(coverUV + dropRefr + vec2(mist));

          // Droplet highlight glint
          float glint = smoothstep(0.04, 0.0, length(f - dropCenter + vec2(0.08, 0.08))) * step(0.65, rnd);
          color = img.rgb + vec3(glint * 0.6);
        }

        // ==========================================
        // 8. Coral & Lichen Mineralization
        // ==========================================
        else if (u_shader_id == 8) {
          vec4 img = sampleClamped(coverUV);
          float ink = getInk(coverUV);

          // Cellular calcification
          float calc = voronoi(aspectUV * 18.0);
          float lichen = fbm(aspectUV * 12.0 + vec2(t * 0.05, 0.0)) * 0.5 + 0.5;

          // Accretion on ink borders
          float growthZone = smoothstep(0.3, 0.7, ink) * smoothstep(0.9, 0.4, ink);
          float mineral = step(0.45, calc * lichen) * growthZone * u_k1;

          vec3 lichenCol = vec3(0.55, 0.78, 0.62); // Pale sage lichen
          vec3 calcite = vec3(0.92, 0.94, 0.88);   // Calcite mineral white
          vec3 accreted = mix(lichenCol, calcite, calc);

          color = mix(img.rgb, accreted, mineral * 0.85 * u_k2);
        }

        // ==========================================
        // 9. Cellular Cytoplasm Flow
        // ==========================================
        else if (u_shader_id == 9) {
          float streamSpeed = t * 0.6 * u_k2;
          vec2 flow = curlWarp(coverUV * 9.0, streamSpeed) * 0.02 * u_k1;
          
          vec4 img = sampleClamped(coverUV + flow);
          float ink = getInk(coverUV + flow);

          // Cytoplasmic organelles drifting inside ink
          float organelle = snoise(aspectUV * 25.0 + flow * 20.0) * 0.5 + 0.5;
          float streamPattern = ink * smoothstep(0.55, 0.75, organelle);

          vec3 cytoplasmPink = vec3(0.35, 0.08, 0.28);
          vec3 bioGleam = vec3(0.7, 0.2, 0.6);

          color = mix(img.rgb, cytoplasmPink, ink * 0.4 * u_k3);
          color += bioGleam * streamPattern * 0.5;
        }

        // ==========================================
        // 10. Parchment Fiber Bleed
        // ==========================================
        else if (u_shader_id == 10) {
          // Directional cellulose fibers (horizontal grain pull)
          float grain = snoise(vec2(aspectUV.x * 2.0, aspectUV.y * 60.0)) * 0.5 + 0.5;
          vec2 fiberOffset = vec2(grain * 0.02 * u_k1, 0.0);

          vec4 img = sampleClamped(coverUV + fiberOffset);
          float ink = getInk(coverUV + fiberOffset);

          // Aged vintage paper tone
          vec3 parchment = vec3(0.96, 0.93, 0.87);
          vec3 baseTone = mix(img.rgb, img.rgb * parchment, 0.7 * u_k3);

          // Fiber bleed feathering along edges
          float feather = grain * ink * 0.3 * u_k2;
          color = mix(baseTone, vec3(0.12, 0.04, 0.16), feather);
        }

        // ==========================================
        // 11. Candle Amber Warmth
        // ==========================================
        else if (u_shader_id == 11) {
          // Natural candlelight flicker (pink noise harmonic sum)
          float flicker = (sin(t * 5.0) * 0.08 + sin(t * 11.0) * 0.04 + sin(t * 23.0) * 0.02) * u_k2;
          float flameLum = 1.0 + flicker;

          // Warm candle light radius
          float dist = length(aspectUV);
          float vignette = smoothstep(1.3, 0.2, dist);

          vec4 img = sampleClamped(coverUV);
          vec3 amberLight = vec3(1.08, 0.92, 0.72) * u_k1 * flameLum;

          // Shadow depth cast by typography
          float ink = getInk(coverUV);
          float shadow = getInk(coverUV + vec2(0.008, -0.008)) * (1.0 - ink);

          color = img.rgb * amberLight * (1.0 - shadow * 0.4 * u_k3);
          color = mix(color, color * vec3(0.95, 0.88, 0.78), 1.0 - vignette);
        }

        // ==========================================
        // 12. Viscous Amber Resin
        // ==========================================
        else if (u_shader_id == 12) {
          // Dome lens refraction
          vec2 norm = normalize(aspectUV + 0.001);
          float lens = length(aspectUV);
          vec2 resinRefr = norm * pow(lens, 2.0) * 0.025 * u_k1;

          vec4 img = sampleClamped(coverUV + resinRefr);
          
          // Fossilized golden amber tone
          vec3 amberResin = vec3(1.05, 0.88, 0.62) * u_k2;
          color = img.rgb * amberResin;

          // Glossy surface specular curved reflection
          float spec = pow(max(0.0, 1.0 - length(aspectUV - vec2(-0.25, 0.25))), 16.0);
          color += vec3(spec * 0.75 * u_k3);
        }

        // ==========================================
        // 13. Frost Dendrites
        // ==========================================
        else if (u_shader_id == 13) {
          vec4 img = sampleClamped(coverUV);
          float ink = getInk(coverUV);

          // Hexagonal / fractal crystal needles
          vec2 p = aspectUV * 16.0;
          float c1 = abs(snoise(p + vec2(t * 0.02)));
          float c2 = abs(snoise(p * 2.2 - vec2(t * 0.015)));
          float dendrite = 1.0 - smoothstep(0.0, 0.08, c1 * 0.7 + c2 * 0.3);

          // Proximity to cold ink boundaries
          float coldProximity = 0.0;
          float probe = 0.028 * u_k1;
          for (int i = 0; i < 4; i++) {
            float a = float(i) * 1.5707;
            coldProximity += getInk(coverUV + vec2(cos(a), sin(a)) * probe);
          }
          coldProximity = clamp(coldProximity * 0.6 - ink * 0.5, 0.0, 1.0);

          float frost = dendrite * coldProximity * u_k2;
          
          // Microscopic ice sparkle glint
          float sparkle = pow(hash21(floor(aspectUV * 70.0)), 28.0) * sin(t * 6.0) * u_k3;

          vec3 iceColor = vec3(0.92, 0.97, 1.0);
          color = mix(img.rgb, iceColor, frost * 0.95);
          color += vec3(sparkle * frost * 2.0);
        }

        // ==========================================
        // 14. Abyssal Marine Drift
        // ==========================================
        else if (u_shader_id == 14) {
          float current = t * 0.3 * u_k3;
          vec2 driftWarp = curlWarp(aspectUV * 3.5, current) * 0.012;
          vec4 img = sampleClamped(coverUV + driftWarp);

          // Deep abyssal oceanic light rays
          float rays = sin(aspectUV.x * 5.0 + aspectUV.y * 2.0 + t * 0.4) * 0.5 + 0.5;
          rays = pow(rays, 3.5) * 0.35 * u_k2;

          // Suspended marine snow
          vec2 snowGrid = floor(aspectUV * 30.0 + vec2(0.0, -t * 0.25));
          float isSnow = step(0.92, hash21(snowGrid));
          float snowPulse = sin(t * 2.0 + hash21(snowGrid) * 10.0) * 0.5 + 0.5;

          vec3 deepIndigo = vec3(0.92, 0.95, 1.0);
          color = img.rgb * deepIndigo + vec3(rays * 0.4);
          // Bioluminescent plankton
          color += vec3(0.2, 0.85, 1.0) * isSnow * snowPulse * 0.8 * u_k1;
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `

    // Compile shader helper
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

    // Full screen quad buffer
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

    // Uniform locations
    const uResLoc = glCtx.getUniformLocation(program, 'u_resolution')
    const uImgResLoc = glCtx.getUniformLocation(program, 'u_image_res')
    const uTimeLoc = glCtx.getUniformLocation(program, 'u_time')
    const uShaderIdLoc = glCtx.getUniformLocation(program, 'u_shader_id')
    const uK1Loc = glCtx.getUniformLocation(program, 'u_k1')
    const uK2Loc = glCtx.getUniformLocation(program, 'u_k2')
    const uK3Loc = glCtx.getUniformLocation(program, 'u_k3')
    const uTexLoc = glCtx.getUniformLocation(program, 'u_texture')

    // Create texture
    const texture = glCtx.createTexture()
    glCtx.bindTexture(glCtx.TEXTURE_2D, texture)
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE)
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE)
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.LINEAR)
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.LINEAR)

    // Placeholder 1x1 white
    glCtx.texImage2D(
      glCtx.TEXTURE_2D,
      0,
      glCtx.RGBA,
      1,
      1,
      0,
      glCtx.RGBA,
      glCtx.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255])
    )

    let imgNaturalW = 752
    let imgNaturalH = 564

    // Load tasteink.jpg
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

      // Active shader knobs
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

<div class="organic-page">
  <canvas bind:this={canvasEl} class="gl-canvas"></canvas>

  <!-- Top Navigation Header -->
  <header class="top-nav">
    <div class="nav-links">
      <span class="page-badge">ORGANIC COLLECTION (15)</span>
      <button class="nav-btn" onclick={() => onNavigate('/girly')}>
        💖 /girly (10) →
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/space')}>
        🚀 Space (10)
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
      {#each organicShaders as s}
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
      {#each organicShaders[currentShader].knobs as knob, i}
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
  .organic-page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #050608;
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
    color: #34d399;
    background: rgba(16, 185, 129, 0.12);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(16, 185, 129, 0.3);
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
    background: rgba(8, 10, 14, 0.85);
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
    max-height: 220px;
    overflow-y: auto;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 6px;
    padding-right: 4px;
  }

  /* Sleek scrollbar */
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
    background: rgba(16, 185, 129, 0.15);
    color: #6ee7b7;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #64748b;
    flex-shrink: 0;
  }

  .name-item.active .dot {
    background: #34d399;
    box-shadow: 0 0 6px #34d399;
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
