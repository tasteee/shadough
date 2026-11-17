<script lang="ts">
  import { onMount } from 'svelte'
  import Knob from './Knob.svelte'

  interface Props {
    onNavigate: (path: string) => void
  }
  let { onNavigate }: Props = $props()

  let canvasEl: HTMLCanvasElement
  let currentShader = $state(0)

  // 10 Feminine Hyperpop Shaders grounded in tasteink logo
  const girlyShaders = [
    {
      id: 0,
      name: 'Bubblegum Liquid Gloss',
      tag: 'GIRLY-01',
      knobs: [
        { label: 'Gloss Flow', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#f43f5e' },
        { label: 'Specular Shine', min: 0.2, max: 3.5, step: 0.1, val: 1.5, color: '#fbcfe8' },
        { label: 'Pink Vibrance', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#ec4899' },
      ],
    },
    {
      id: 1,
      name: 'Holo Candy Iridescence',
      tag: 'GIRLY-02',
      knobs: [
        { label: 'Holo Shift', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#c084fc' },
        { label: 'Pastel Sheen', min: 0.2, max: 3.0, step: 0.1, val: 1.4, color: '#67e8f9' },
        { label: 'Foil Dispersion', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#f472b6' },
      ],
    },
    {
      id: 2,
      name: 'Sugar Glass & Glints',
      tag: 'GIRLY-03',
      knobs: [
        { label: 'Facet Sharpness', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#fbcfe8' },
        { label: 'Diamond Sparkle', min: 0.2, max: 3.5, step: 0.1, val: 1.6, color: '#ffffff' },
        { label: 'Prism Split', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#e879f9' },
      ],
    },
    {
      id: 3,
      name: 'Strawberry Syrup Drip',
      tag: 'GIRLY-04',
      knobs: [
        { label: 'Syrup Viscosity', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#fb7185' },
        { label: 'Meniscus Edge', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#fda4af' },
        { label: 'Jelly Gloss', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#f43f5e' },
      ],
    },
    {
      id: 4,
      name: 'Cyber Angel Halo Bloom',
      tag: 'GIRLY-05',
      knobs: [
        { label: 'Angelic Halo', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#e879f9' },
        { label: 'Dream Blur', min: 0.2, max: 3.0, step: 0.1, val: 1.4, color: '#c084fc' },
        { label: 'Lavender Pulse', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#f472b6' },
      ],
    },
    {
      id: 5,
      name: 'Rose Gold Liquid Chrome',
      tag: 'GIRLY-06',
      knobs: [
        { label: 'Rose Gold Tint', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#fb7185' },
        { label: 'Metallic Polish', min: 0.2, max: 3.0, step: 0.1, val: 1.4, color: '#fef08a' },
        { label: 'Anisotropic Sheen', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#fda4af' },
      ],
    },
    {
      id: 6,
      name: 'Cosmetic Glitter Dust',
      tag: 'GIRLY-07',
      knobs: [
        { label: 'Glitter Density', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#f472b6' },
        { label: 'Twinkle Rate', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#38bdf8' },
        { label: 'Starlight Glint', min: 0.2, max: 3.5, step: 0.1, val: 1.7, color: '#ffffff' },
      ],
    },
    {
      id: 7,
      name: 'Electric Cherry Fringe',
      tag: 'GIRLY-08',
      knobs: [
        { label: 'Cherry Fringe', min: 0.2, max: 3.5, step: 0.1, val: 1.4, color: '#f43f5e' },
        { label: 'Chromatic Split', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#06b6d4' },
        { label: 'Neon Edge Glow', min: 0.2, max: 2.5, step: 0.1, val: 1.1, color: '#ec4899' },
      ],
    },
    {
      id: 8,
      name: 'Pearl Nacre & Mermaid',
      tag: 'GIRLY-09',
      knobs: [
        { label: 'Nacre Wave', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#a7f3d0' },
        { label: 'Blush Sheen', min: 0.2, max: 3.0, step: 0.1, val: 1.3, color: '#fbcfe8' },
        { label: 'Pearl Ripple', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#bae6fd' },
      ],
    },
    {
      id: 9,
      name: 'Puffy Jelly Vinyl Glaze',
      tag: 'GIRLY-10',
      knobs: [
        { label: 'Vinyl Emboss', min: 0.2, max: 3.0, step: 0.1, val: 1.4, color: '#f472b6' },
        { label: 'Gel Refraction', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#c084fc' },
        { label: 'Rim Highlight', min: 0.2, max: 3.5, step: 0.1, val: 1.6, color: '#ffffff' },
      ],
    },
  ]

  let knobStates = $state(girlyShaders.map((s) => s.knobs.map((k) => k.val)))

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

      vec2 getNormal(vec2 p) {
        float eps = 0.003;
        float nX = getInk(p + vec2(eps, 0.0)) - getInk(p - vec2(eps, 0.0));
        float nY = getInk(p + vec2(0.0, eps)) - getInk(p - vec2(0.0, eps));
        return vec2(nX, nY) / (2.0 * eps);
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

        // Base logo
        vec4 img = sampleClamped(coverUV);
        float ink = getInk(coverUV);
        vec2 norm = getNormal(coverUV);
        float edge = length(norm);
        vec3 color = img.rgb;

        // ==========================================
        // 0. Bubblegum Liquid Gloss
        // ==========================================
        if (u_shader_id == 0) {
          vec2 glossFlow = curlWarp(aspectUV * 4.5, t * 0.45 * u_k1) * 0.018;
          vec4 flowImg = sampleClamped(coverUV + glossFlow);
          float flowInk = getInk(coverUV + glossFlow);

          // Curved liquid surface normal
          vec2 curvedNorm = norm * 0.1 + glossFlow * 8.0;
          vec3 lightDir = normalize(vec3(cos(t * 0.7), sin(t * 0.7), 1.2));
          float spec = pow(max(0.0, dot(normalize(vec3(curvedNorm, 1.0)), lightDir)), 24.0) * u_k2;

          // Strawberry milk to hot pink gloss
          vec3 bubblegumHot = vec3(0.98, 0.2, 0.48) * u_k3;
          vec3 strawberryMilk = vec3(1.0, 0.78, 0.88);
          vec3 glossCol = mix(bubblegumHot, strawberryMilk, spec * 0.6);

          vec3 blended = blendOverlay(flowImg.rgb, glossCol);
          color = mix(flowImg.rgb, blended, flowInk * 0.88);
          // High-gloss specular gleam
          color += vec3(1.0, 0.95, 0.98) * spec * flowInk * 1.6;
        }

        // ==========================================
        // 1. Holo Candy Iridescence (CD-ROM Rainbow Foil)
        // ==========================================
        else if (u_shader_id == 1) {
          // Spectral grating reflection
          float holoPhase = (aspectUV.x * 3.0 + aspectUV.y * 2.0 + t * 0.35 * u_k1);
          float opd = holoPhase + edge * 2.2 * u_k3;
          
          // Pastel iridescent spectrum (lavender, mint, baby pink, soft lemon)
          vec3 holo = 0.5 + 0.5 * cos(6.28318 * (vec3(1.0, 0.75, 0.45) * opd + vec3(0.65, 0.2, 0.85)));
          holo = mix(holo, vec3(1.0), 0.25); // Pastel softening

          // Foil gleam along typography contours
          float gleam = pow(max(0.0, sin(holoPhase * 3.0 + edge * 4.0)), 6.0) * u_k2;
          
          vec3 holoTint = mix(img.rgb, holo, ink * 0.75);
          color = holoTint + holo * gleam * ink * 1.8;
          color += vec3(0.12, 0.05, 0.18) * (1.0 - ink) * 0.05; // clean paper contrast
        }

        // ==========================================
        // 2. Sugar Glass & Crystal Glints
        // ==========================================
        else if (u_shader_id == 2) {
          // Voronoi crystalline facets
          vec2 p = aspectUV * 12.0 * u_k1;
          vec2 cell = floor(p);
          vec2 f = fract(p);
          float rnd = hash21(cell);
          
          // Facet refraction
          vec2 facetRefr = (hash22(cell) - 0.5) * 0.018 * u_k3;
          vec4 refrImg = sampleClamped(coverUV + facetRefr * ink);
          
          // Prismatic diamond glints
          float glintTime = t * 3.5 + rnd * 20.0;
          float starPulse = pow(max(0.0, sin(glintTime)), 32.0);
          float glintX = smoothstep(0.02, 0.0, abs(f.x - 0.5)) * smoothstep(0.5, 0.0, abs(f.y - 0.5));
          float glintY = smoothstep(0.02, 0.0, abs(f.y - 0.5)) * smoothstep(0.5, 0.0, abs(f.x - 0.5));
          float diamondGlint = (glintX + glintY) * starPulse * step(0.7, rnd) * u_k2;

          vec3 pastelPrism = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + rnd * 6.0);
          color = refrImg.rgb + (vec3(1.0) + pastelPrism * 0.5) * diamondGlint * ink * 3.0;
        }

        // ==========================================
        // 3. Strawberry Syrup Drip
        // ==========================================
        else if (u_shader_id == 3) {
          // Slow dripping syrup advection
          float dripTime = t * 0.5 * u_k1;
          vec2 dripWarp = vec2(
            sin(aspectUV.x * 14.0 + dripTime) * 0.006,
            -abs(sin(aspectUV.x * 8.0 + dripTime * 0.6)) * 0.03 * u_k1
          );

          vec2 sampleUV = coverUV + dripWarp * ink;
          vec4 syrupImg = sampleClamped(sampleUV);
          float syrupInk = getInk(sampleUV);

          // Surface tension meniscus highlight
          float meniscus = smoothstep(0.1, 0.35, edge) * smoothstep(0.8, 0.4, edge) * u_k2;
          
          // Translucent deep strawberry red to juicy candy pink
          vec3 syrupColor = vec3(0.92, 0.08, 0.28) * u_k3;
          vec3 jellyHighlight = vec3(1.0, 0.6, 0.75);

          vec3 blended = mix(syrupImg.rgb, syrupColor, syrupInk * 0.6);
          color = blended + jellyHighlight * meniscus * syrupInk * 1.5;
        }

        // ==========================================
        // 4. Cyber Angel Halo Bloom
        // ==========================================
        else if (u_shader_id == 4) {
          // Dreamy multi-radius soft halo
          float haloPulse = sin(t * 1.8 * u_k3) * 0.15 + 0.85;
          float bloom = 0.0;
          float r = 0.015 * u_k2;
          
          for (int i = 0; i < 8; i++) {
            float ang = float(i) * (6.28318 / 8.0);
            bloom += getInk(coverUV + vec2(cos(ang), sin(ang)) * r);
          }
          bloom = (bloom / 8.0) * (1.0 - ink);

          // Celestial lavender-pink aura
          vec3 angelLavender = vec3(0.85, 0.55, 1.0);
          vec3 angelPink = vec3(1.0, 0.65, 0.85);
          vec3 haloCol = mix(angelLavender, angelPink, sin(aspectUV.x * 5.0 + t) * 0.5 + 0.5) * u_k1;

          color = img.rgb + haloCol * bloom * haloPulse * 1.8;
          color = clamp(color, 0.0, 1.0);
        }

        // ==========================================
        // 5. Rose Gold Liquid Chrome
        // ==========================================
        else if (u_shader_id == 5) {
          // Anisotropic studio metallic reflection
          vec2 chromeWarp = curlWarp(aspectUV * 3.5, t * 0.3) * 0.02;
          vec2 chNorm = normalize(norm + chromeWarp * 15.0 + vec2(0.001));

          // Anisotropic highlight stripes
          float stripe = sin(dot(chNorm, vec2(1.0, 1.5)) * 18.0 + t * 1.2) * 0.5 + 0.5;
          float spec = pow(stripe, 8.0) * u_k2;

          // Polished rose gold & champagne metallics
          vec3 roseGold = vec3(0.96, 0.62, 0.65) * u_k1;
          vec3 champagne = vec3(1.0, 0.88, 0.76);
          vec3 metalCol = mix(roseGold, champagne, spec * 0.7);

          vec3 chrome = blendOverlay(img.rgb, metalCol);
          color = mix(img.rgb, chrome, ink * 0.92);
          color += champagne * spec * ink * 1.4 * u_k3;
        }

        // ==========================================
        // 6. Cosmetic Glitter Dust
        // ==========================================
        else if (u_shader_id == 6) {
          vec2 gGrid = floor(aspectUV * (70.0 * u_k1));
          vec2 gF = fract(aspectUV * (70.0 * u_k1));
          float gSeed = hash21(gGrid);

          // Fast twinkling cosmetic glitter
          float twinkle = sin(t * 6.0 * u_k2 + gSeed * 30.0);
          float isGlitter = step(0.86, gSeed) * smoothstep(0.4, 0.95, twinkle);

          // 4-point star burst glint
          float starDist = abs(gF.x - 0.5) * abs(gF.y - 0.5);
          float star = smoothstep(0.04, 0.0, starDist) * isGlitter * u_k3;

          // Multi-hued glitter spectrum (fuchsia, cyan, gold, violet)
          vec3 glitCol = 0.5 + 0.5 * cos(6.28318 * (vec3(1.0, 0.7, 0.4) * gSeed + vec3(0.8, 0.3, 0.6)));
          
          color = img.rgb + (glitCol * 1.5 + vec3(0.5)) * star * ink * 3.2;
        }

        // ==========================================
        // 7. Electric Cherry Fringe
        // ==========================================
        else if (u_shader_id == 7) {
          float split = 0.012 * u_k2;
          float fringePulse = sin(t * 3.0) * 0.2 + 1.0;
          
          // Hyperpop chromatic aberration tearing
          float r = sampleClamped(coverUV + vec2(split * fringePulse, 0.0)).r;
          float g = sampleClamped(coverUV).g;
          float b = sampleClamped(coverUV - vec2(split * fringePulse, 0.0)).b;
          vec3 splitCol = vec3(r, g, b);

          // Saturated hot cherry & neon cyan glow on the borders
          vec3 hotCherry = vec3(1.0, 0.05, 0.35) * u_k1;
          vec3 neonCyan = vec3(0.0, 0.95, 0.95);
          
          float cherryEdge = smoothstep(0.1, 0.5, edge) * u_k3;
          color = splitCol + hotCherry * cherryEdge * (1.0 - ink * 0.5) * 1.2;
        }

        // ==========================================
        // 8. Pearl Nacre & Mermaid Sheen
        // ==========================================
        else if (u_shader_id == 8) {
          // Flowing pearl nacre interference ribbons
          float nacreWave = sin(aspectUV.x * 6.0 + aspectUV.y * 4.0 + snoise(aspectUV * 4.0 + t * 0.2) * 3.0 + t * 0.4) * 0.5 + 0.5;
          
          // Pearlescent blush, seafoam mint, and cream
          vec3 pearlBlush = vec3(1.0, 0.82, 0.88) * u_k2;
          vec3 pearlMint = vec3(0.8, 0.98, 0.92);
          vec3 pearlCream = vec3(0.98, 0.96, 0.92);

          vec3 nacre = mix(pearlBlush, pearlMint, nacreWave);
          nacre = mix(nacre, pearlCream, pow(nacreWave, 2.0));

          // Silky pearl luster on ink
          float luster = pow(max(0.0, dot(normalize(vec3(norm, 1.0)), vec3(0.0, 0.6, 0.8))), 12.0) * u_k1;
          
          vec3 pearled = blendOverlay(img.rgb, nacre);
          color = mix(img.rgb, pearled, ink * 0.85);
          color += pearlCream * luster * ink * 1.5 * u_k3;
        }

        // ==========================================
        // 9. Puffy Jelly Vinyl Glaze (Y2K Sticker)
        // ==========================================
        else if (u_shader_id == 9) {
          // 3D puffy dome curvature from typography silhouette
          float dome = sqrt(clamp(1.0 - edge * 0.35, 0.0, 1.0));
          vec2 vinylRefr = norm * 0.02 * u_k2;

          vec4 vinylImg = sampleClamped(coverUV + vinylRefr * ink);
          
          // Glossy vinyl bubble rim reflection
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          vec3 surfNorm = normalize(vec3(-norm * 0.25, 0.85));
          float fresnelRim = pow(1.0 - max(0.0, dot(surfNorm, viewDir)), 3.0) * u_k3;
          
          // Jelly sticker bubblegum glaze
          vec3 jellyPink = vec3(1.0, 0.4, 0.65) * u_k1;
          vec3 rimWhite = vec3(1.0, 0.95, 0.98);

          vec3 vinylBlended = blendOverlay(vinylImg.rgb, jellyPink);
          color = mix(vinylImg.rgb, vinylBlended, ink * 0.75);
          color += rimWhite * fresnelRim * ink * 2.2;
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

<div class="girly-page">
  <canvas bind:this={canvasEl} class="gl-canvas"></canvas>

  <!-- Top Navigation Header -->
  <header class="top-nav">
    <div class="nav-links">
      <span class="page-badge">💖 GIRLY HYPERPOP (10)</span>
      <button class="nav-btn" onclick={() => onNavigate('/gradient')}>
        🌈 3D Gradients (10) →
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
      <button class="nav-btn" onclick={() => onNavigate('/reef')}>
        🌊 Drifting Reef
      </button>
    </div>
  </header>

  <!-- Bottom-Left Minimal Control Deck -->
  <div class="bottom-left-deck">
    <!-- Shader Names List -->
    <div class="shader-names-list">
      {#each girlyShaders as s}
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
      {#each girlyShaders[currentShader].knobs as knob, i}
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
  .girly-page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #060308;
    color: #fdf2f8;
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
    color: #f43f5e;
    background: rgba(244, 63, 94, 0.15);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(244, 63, 94, 0.35);
  }

  .nav-btn {
    padding: 6px 14px;
    border-radius: 8px;
    background: rgba(12, 8, 16, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fbcfe8;
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
    background: rgba(14, 8, 18, 0.88);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(244, 63, 94, 0.2);
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
    background: rgba(244, 63, 94, 0.3);
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
    background: rgba(244, 63, 94, 0.1);
    color: #ffffff;
  }

  .name-item.active {
    background: rgba(244, 63, 94, 0.2);
    color: #fda4af;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #64748b;
    flex-shrink: 0;
  }

  .name-item.active .dot {
    background: #f43f5e;
    box-shadow: 0 0 6px #f43f5e;
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
