<script lang="ts">
  import { onMount } from 'svelte'
  import Knob from './Knob.svelte'

  interface Props {
    onNavigate: (path: string) => void
  }
  let { onNavigate }: Props = $props()

  let canvasEl: HTMLCanvasElement
  let currentShader = $state(0)

  // 10 3D Gradient Shaders grounded in tasteink logo
  const gradientShaders = [
    {
      id: 0,
      name: 'Volumetric Glass Bevel',
      tag: 'GRAD-01',
      knobs: [
        { label: 'Bevel Height', min: 0.2, max: 3.5, step: 0.1, val: 1.4, color: '#38bdf8' },
        { label: 'Light Orbit', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#f472b6' },
        { label: 'Studio Tone', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#c084fc' },
      ],
    },
    {
      id: 1,
      name: 'Iridescent Ribbon Wave',
      tag: 'GRAD-02',
      knobs: [
        { label: 'Wave Amplitude', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#ec4899' },
        { label: 'Ribbon Pitch', min: 0.2, max: 3.0, step: 0.1, val: 1.1, color: '#06b6d4' },
        { label: 'Spectral Roll', min: 0.2, max: 2.5, step: 0.1, val: 1.3, color: '#fef08a' },
      ],
    },
    {
      id: 2,
      name: 'Chroma Topo Elevation',
      tag: 'GRAD-03',
      knobs: [
        { label: 'Elevation Depth', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#f97316' },
        { label: 'Contour Steps', min: 4.0, max: 30.0, step: 1.0, val: 14.0, color: '#818cf8' },
        { label: 'Rim Gradient', min: 0.2, max: 3.0, step: 0.1, val: 1.5, color: '#fb7185' },
      ],
    },
    {
      id: 3,
      name: 'Curved Matte Clay Studio',
      tag: 'GRAD-04',
      knobs: [
        { label: 'Clay Roundness', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#fbbf24' },
        { label: 'Key Warmth', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#fdba74' },
        { label: 'Ambient Shadow', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#93c5fd' },
      ],
    },
    {
      id: 4,
      name: 'Liquid Mercury Horizon',
      tag: 'GRAD-05',
      knobs: [
        { label: 'Mercury Flow', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#cbd5e1' },
        { label: 'Metal Polish', min: 0.2, max: 3.5, step: 0.1, val: 1.5, color: '#38bdf8' },
        { label: 'Sky Gradient', min: 0.2, max: 2.5, step: 0.1, val: 1.2, color: '#e879f9' },
      ],
    },
    {
      id: 5,
      name: 'Subsurface Aurora Fog',
      tag: 'GRAD-06',
      knobs: [
        { label: 'Scatter Depth', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#2dd4bf' },
        { label: 'Aurora Hue', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#a855f7' },
        { label: 'Volume Softness', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#f43f5e' },
      ],
    },
    {
      id: 6,
      name: 'Fresnel Velvet Shimmer',
      tag: 'GRAD-07',
      knobs: [
        { label: 'Velvet Sheen', min: 0.2, max: 3.5, step: 0.1, val: 1.5, color: '#f43f5e' },
        { label: 'Grazing Angle', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#fb923c' },
        { label: 'Core Falloff', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#818cf8' },
      ],
    },
    {
      id: 7,
      name: 'Prismatic Caustic Lens',
      tag: 'GRAD-08',
      knobs: [
        { label: 'Lens Curvature', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#06b6d4' },
        { label: 'Dispersion Split', min: 0.2, max: 3.5, step: 0.1, val: 1.6, color: '#f472b6' },
        { label: 'Caustic Arc', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#fef08a' },
      ],
    },
    {
      id: 8,
      name: 'Sunset Horizon Cylinder',
      tag: 'GRAD-09',
      knobs: [
        { label: 'Cylinder Warp', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#ea580c' },
        { label: 'Sunset Phase', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#db2777' },
        { label: 'Golden Radiance', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#fde047' },
      ],
    },
    {
      id: 9,
      name: 'Anisotropic Duotone Satin',
      tag: 'GRAD-10',
      knobs: [
        { label: 'Satin Brush', min: 0.2, max: 3.5, step: 0.1, val: 1.4, color: '#06b6d4' },
        { label: 'Tangent Shift', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#f43f5e' },
        { label: 'Duotone Blend', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#a855f7' },
      ],
    },
  ]

  let knobStates = $state(gradientShaders.map((s) => s.knobs.map((k) => k.val)))

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
        g.x  = a0.x  * x0.x  * 1.0;
        g.yz = a0.yz * x12.xz;
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

      // Compute 3D Surface Normal from height field
      vec3 get3DNormal(vec2 p, float heightScale) {
        float eps = 0.0035;
        float hC = getInk(p);
        float hR = getInk(p + vec2(eps, 0.0));
        float hL = getInk(p - vec2(eps, 0.0));
        float hU = getInk(p + vec2(0.0, eps));
        float hD = getInk(p - vec2(0.0, eps));
        
        vec3 dX = vec3(2.0 * eps, 0.0, (hR - hL) * heightScale);
        vec3 dY = vec3(0.0, 2.0 * eps, (hU - hD) * heightScale);
        return normalize(cross(dX, dY));
      }

      // Cosine 3D Gradient Palette
      vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
        return a + b * cos(6.28318 * (c * t + d));
      }

      vec3 blendOverlay(vec3 base, vec3 blend) {
        return mix(
          2.0 * base * blend,
          1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
          step(vec3(0.5), base)
        );
      }

      void main() {
        vec2 uv = v_uv;
        vec2 aspectUV = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        vec2 coverUV = getCoverUV(uv, u_resolution, u_image_res);
        float t = u_time;

        vec4 img = sampleClamped(coverUV);
        float ink = getInk(coverUV);
        vec3 color = img.rgb;

        // View direction
        vec3 V = vec3(0.0, 0.0, 1.0);

        // ==========================================
        // 0. Volumetric Glass Bevel (3D Studio Light)
        // ==========================================
        if (u_shader_id == 0) {
          vec3 N = get3DNormal(coverUV, 0.08 * u_k1);
          
          // Orbiting 3D studio key light
          float orb = t * 0.6 * u_k2;
          vec3 L = normalize(vec3(cos(orb), sin(orb), 0.85));
          vec3 H = normalize(L + V);

          float diff = max(0.0, dot(N, L));
          float spec = pow(max(0.0, dot(N, H)), 32.0);
          float fresnel = pow(1.0 - max(0.0, dot(N, V)), 2.5);

          // Multi-stop 3D glass gradient (peach, ultraviolet, mint, deep indigo)
          vec3 gradA = vec3(0.98, 0.55, 0.65); // Peach
          vec3 gradB = vec3(0.65, 0.35, 0.95); // Ultraviolet
          vec3 gradC = vec3(0.35, 0.95, 0.85); // Mint
          
          float gradT = N.x * 0.5 + N.y * 0.5 + 0.5;
          vec3 studioGrad = mix(gradA, gradB, sin(gradT * 3.1415 + orb * 0.5) * 0.5 + 0.5);
          studioGrad = mix(studioGrad, gradC, fresnel * 0.7);

          // Glass refraction warp
          vec2 refrUV = coverUV - N.xy * 0.02 * u_k1;
          vec4 refrImg = sampleClamped(refrUV);

          vec3 beveled = mix(refrImg.rgb, studioGrad * u_k3, ink * 0.75);
          color = beveled + vec3(spec * 1.8 * ink) + studioGrad * fresnel * ink * 1.2;
        }

        // ==========================================
        // 1. Iridescent Ribbon Wave
        // ==========================================
        else if (u_shader_id == 1) {
          float wave = sin(aspectUV.x * 5.0 * u_k2 + aspectUV.y * 3.0 + t * 0.8) * 0.5 + 0.5;
          vec2 waveOffset = vec2(cos(wave * 6.28), sin(wave * 6.28)) * 0.025 * u_k1;
          
          vec3 N = get3DNormal(coverUV + waveOffset, 0.06);
          float slope = dot(N, normalize(vec3(1.0, 1.0, 0.5)));

          // Spectral continuous cosine gradient
          vec3 spectralGrad = cosPalette(
            slope * 1.5 + wave * 0.8 + t * 0.2 * u_k3,
            vec3(0.5, 0.5, 0.5),
            vec3(0.5, 0.5, 0.5),
            vec3(1.0, 1.0, 1.0),
            vec3(0.0, 0.33, 0.67)
          );

          vec4 waveImg = sampleClamped(coverUV + waveOffset * ink);
          float waveInk = getInk(coverUV + waveOffset * ink);

          vec3 blended = blendOverlay(waveImg.rgb, spectralGrad);
          color = mix(waveImg.rgb, blended, waveInk * 0.85);
          color += spectralGrad * pow(slope, 4.0) * waveInk * 1.5;
        }

        // ==========================================
        // 2. Chroma Topo Elevation (3D Contour Isolines)
        // ==========================================
        else if (u_shader_id == 2) {
          vec3 N = get3DNormal(coverUV, 0.07 * u_k1);
          float elevation = ink * 1.0 + fbm(aspectUV * 4.0 + t * 0.1) * 0.15;
          
          // Stepped contour isolines
          float steps = u_k2;
          float topoLine = abs(fract(elevation * steps) - 0.5) * 2.0;
          float isoline = smoothstep(0.18, 0.0, topoLine);

          // Chromatographic gradient (neon coral, amber, violet, cobalt)
          vec3 topoGrad = cosPalette(
            elevation * 1.2 + t * 0.15,
            vec3(0.8, 0.5, 0.4),
            vec3(0.5, 0.4, 0.2),
            vec3(2.0, 1.0, 1.0),
            vec3(0.0, 0.25, 0.5)
          );

          float rim = pow(1.0 - max(0.0, dot(N, V)), 3.0) * u_k3;
          vec3 topoCol = mix(img.rgb, topoGrad, ink * 0.85);
          color = topoCol + vec3(isoline * 0.45 * ink) + topoGrad * rim * 1.4;
        }

        // ==========================================
        // 3. Curved Matte Clay Studio
        // ==========================================
        else if (u_shader_id == 3) {
          vec3 N = get3DNormal(coverUV, 0.12 * u_k1);
          
          // 3-Point Studio Lights: Key (warm), Fill (cool), Rim (lilac)
          vec3 keyDir = normalize(vec3(0.6, 0.8, 1.0));
          vec3 fillDir = normalize(vec3(-0.8, -0.4, 0.5));
          vec3 rimDir = normalize(vec3(0.0, -1.0, 0.2));

          float key = max(0.0, dot(N, keyDir));
          float fill = max(0.0, dot(N, fillDir));
          float rim = pow(1.0 - max(0.0, dot(N, V)), 2.0);

          vec3 keyColor = vec3(1.0, 0.85, 0.65) * u_k2;  // Warm ochre key
          vec3 fillColor = vec3(0.65, 0.82, 1.0) * u_k3; // Powder blue fill
          vec3 rimColor = vec3(0.95, 0.75, 1.0);         // Soft lilac rim

          // Smooth matte clay curvature gradient
          vec3 clay = keyColor * key * 0.75 + fillColor * fill * 0.45 + rimColor * rim * 0.6;
          
          vec3 clayBase = vec3(0.92, 0.88, 0.85);
          vec3 clayResult = mix(clayBase, clayBase * clay * 1.4, ink);
          color = mix(img.rgb, clayResult, ink * 0.95);
        }

        // ==========================================
        // 4. Liquid Mercury Horizon (3D Metal Gradient)
        // ==========================================
        else if (u_shader_id == 4) {
          vec2 flow = curlWarp(aspectUV * 3.5, t * 0.4 * u_k1) * 0.02;
          vec3 N = get3DNormal(coverUV + flow, 0.09);

          // Reflected ray into 3D horizon environment
          vec3 R = reflect(-V, N);
          float horizonAngle = R.y * 0.5 + 0.5;

          // Liquid platinum, champagne bronze, and dusky violet horizon gradient
          vec3 skyGrad = cosPalette(
            horizonAngle * 2.0 + t * 0.15 * u_k3,
            vec3(0.7, 0.65, 0.75),
            vec3(0.3, 0.35, 0.25),
            vec3(1.0, 1.0, 1.0),
            vec3(0.3, 0.6, 0.9)
          );

          float fresnel = pow(1.0 - max(0.0, dot(N, V)), 4.0) * u_k2;
          float metalSpec = pow(max(0.0, dot(R, normalize(vec3(0.5, 0.8, 1.0)))), 28.0);

          vec3 metalCol = skyGrad + vec3(metalSpec * 1.8);
          color = mix(img.rgb, metalCol, ink * 0.92);
          color += vec3(fresnel * 0.8 * ink);
        }

        // ==========================================
        // 5. Subsurface Aurora Fog (3D Volumetric Scatter)
        // ==========================================
        else if (u_shader_id == 5) {
          vec3 N = get3DNormal(coverUV, 0.06);
          
          // Subsurface backscattering inside volume
          vec3 L = normalize(vec3(sin(t * 0.5), cos(t * 0.5), -0.5));
          float sss = pow(clamp(-dot(N, L), 0.0, 1.0), 2.5) * u_k1;

          // Glowing volumetric aurora gradient (emerald teal, cyan, ultraviolet)
          vec3 auroraGrad = cosPalette(
            aspectUV.x * 2.0 + t * 0.3 * u_k2,
            vec3(0.2, 0.6, 0.7),
            vec3(0.5, 0.5, 0.4),
            vec3(1.0, 1.0, 1.0),
            vec3(0.1, 0.5, 0.8)
          );

          // Soft volumetric halo diffusion
          float volBloom = fbm(aspectUV * 6.0 + vec2(t * 0.15)) * 0.5 + 0.5;
          vec3 glow = auroraGrad * (sss * 2.5 + volBloom * 0.4 * u_k3);

          color = img.rgb + glow * (ink * 1.5 + 0.2);
        }

        // ==========================================
        // 6. Fresnel Velvet Shimmer (3D Microfiber)
        // ==========================================
        else if (u_shader_id == 6) {
          vec3 N = get3DNormal(coverUV, 0.08);
          
          // Grazing incidence angle
          float grazing = pow(1.0 - max(0.0, dot(N, V)), 2.2 * u_k2);
          float direct = max(0.0, dot(N, V));

          // Two-tone velvet gradient: Deep royal purple (core) -> Radiant peach/magenta (edges)
          vec3 corePurple = vec3(0.14, 0.04, 0.22) * u_k3;
          vec3 grazingPeach = vec3(1.0, 0.45, 0.55) * u_k1;
          vec3 edgeMagenta = vec3(0.95, 0.18, 0.75);

          vec3 velvetGrad = mix(corePurple, mix(grazingPeach, edgeMagenta, sin(t * 1.5) * 0.5 + 0.5), grazing);
          color = mix(img.rgb, velvetGrad, ink * 0.9);
          color += grazingPeach * grazing * ink * 1.6;
        }

        // ==========================================
        // 7. Prismatic Caustic Lens (3D Snell Gradient)
        // ==========================================
        else if (u_shader_id == 7) {
          vec3 N = get3DNormal(coverUV, 0.1 * u_k1);
          float eta = 1.33; // Water/glass refractive index
          
          // Snell's dispersion split per wavelength
          float disp = 0.02 * u_k2;
          float r = sampleClamped(coverUV - N.xy * (disp * 1.2)).r;
          float g = sampleClamped(coverUV - N.xy * disp).g;
          float b = sampleClamped(coverUV - N.xy * (disp * 0.8)).b;
          vec3 refr = vec3(r, g, b);

          // Caustic lens highlight arc
          float causticArc = pow(max(0.0, dot(N, normalize(vec3(cos(t), sin(t), 0.5)))), 16.0) * u_k3;
          vec3 prismColor = cosPalette(
            causticArc * 3.0 + t * 0.5,
            vec3(1.0),
            vec3(0.5),
            vec3(1.0),
            vec3(0.0, 0.33, 0.67)
          );

          color = mix(img.rgb, refr, ink * 0.85);
          color += prismColor * causticArc * ink * 2.5;
        }

        // ==========================================
        // 8. Sunset Horizon Cylinder (3D Anamorphic)
        // ==========================================
        else if (u_shader_id == 8) {
          // 3D cylindrical projection
          float cylX = aspectUV.x * 2.5 * u_k1;
          float cylZ = sqrt(max(0.0, 1.0 - cylX * cylX * 0.15));
          vec3 cylNorm = normalize(vec3(cylX * 0.4, 0.0, cylZ));

          // Rich California sunset multi-gradient (sangria, tangerine, gold, dusk)
          float sunsetT = (aspectUV.y * 1.2 + t * 0.15 * u_k2) * 0.5 + 0.5;
          vec3 sunsetGrad = cosPalette(
            sunsetT * 1.4,
            vec3(0.95, 0.5, 0.3),
            vec3(0.5, 0.4, 0.3),
            vec3(1.2, 0.8, 0.6),
            vec3(0.1, 0.3, 0.6)
          );

          vec3 N = get3DNormal(coverUV, 0.07);
          float cylShade = max(0.0, dot(mix(N, cylNorm, 0.6), normalize(vec3(0.5, 0.8, 1.0))));

          vec3 blended = blendOverlay(img.rgb, sunsetGrad);
          color = mix(img.rgb, blended, ink * 0.9);
          color += sunsetGrad * cylShade * ink * 1.3 * u_k3;
        }

        // ==========================================
        // 9. Anisotropic Duotone Satin (3D Brushed Metal)
        // ==========================================
        else if (u_shader_id == 9) {
          vec3 N = get3DNormal(coverUV, 0.08);
          // Tangent vector along brushed grain
          vec3 T = normalize(cross(N, vec3(0.0, 1.0, 0.0)));
          
          float brushAngle = t * 0.8 * u_k2;
          vec3 L = normalize(vec3(cos(brushAngle), sin(brushAngle), 0.7));
          
          // Anisotropic highlight formula
          float dotTL = dot(T, L);
          float dotTV = dot(T, V);
          float aniso = sqrt(clamp(1.0 - dotTL * dotTL, 0.0, 1.0)) * 
                        sqrt(clamp(1.0 - dotTV * dotTV, 0.0, 1.0)) - dotTL * dotTV;
          float satinSpec = pow(max(0.0, aniso), 14.0) * u_k1;

          // Duotone satin gradient (hyper cyan & electric fuchsia)
          vec3 duotoneA = vec3(0.05, 0.95, 0.98); // Hyper cyan
          vec3 duotoneB = vec3(0.98, 0.15, 0.65); // Electric fuchsia
          vec3 satinGrad = mix(duotoneA, duotoneB, sin(aspectUV.x * 4.0 + t) * 0.5 + 0.5) * u_k3;

          vec3 satin = blendOverlay(img.rgb, satinGrad);
          color = mix(img.rgb, satin, ink * 0.88);
          color += satinGrad * satinSpec * ink * 1.8;
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

<div class="gradient-page">
  <canvas bind:this={canvasEl} class="gl-canvas"></canvas>

  <!-- Top Navigation Header -->
  <header class="top-nav">
    <div class="nav-links">
      <span class="page-badge">🌈 3D GRADIENTS (10)</span>
      <button class="nav-btn" onclick={() => onNavigate('/girly')}>
        💖 Girly (10)
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/organic')}>
        🌿 Organic (15)
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/locked')}>
        🔒 Locked Keepers (7)
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/space')}>
        🚀 Space (10)
      </button>
    </div>
  </header>

  <!-- Bottom-Left Minimal Control Deck -->
  <div class="bottom-left-deck">
    <!-- Shader Names List -->
    <div class="shader-names-list">
      {#each gradientShaders as s}
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
      {#each gradientShaders[currentShader].knobs as knob, i}
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
  .gradient-page {
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
    background: rgba(6, 8, 14, 0.88);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(56, 189, 248, 0.2);
    border-radius: 18px;
    padding: 0.9rem 1.15rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.75);
    width: 320px;
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
    background: rgba(56, 189, 248, 0.3);
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
    color: #cbd5e1;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .name-item:hover {
    background: rgba(56, 189, 248, 0.1);
    color: #ffffff;
  }

  .name-item.active {
    background: rgba(56, 189, 248, 0.2);
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
