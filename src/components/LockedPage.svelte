<script lang="ts">
  import { onMount } from 'svelte'
  import Knob from './Knob.svelte'

  interface Props {
    onNavigate: (path: string) => void
  }
  let { onNavigate }: Props = $props()

  let canvasEl: HTMLCanvasElement
  let currentShader = $state(0)

  // 7 Locked Keepers with custom defined knobs
  const lockedShaders = [
    {
      id: 0,
      name: 'Liquid Chrome',
      tag: 'LIQUID-01',
      knobs: [
        { label: 'Intensity', min: 0.2, max: 3.0, step: 0.1, val: 1.0, color: '#38bdf8' },
        { label: 'Speed', min: 0.2, max: 3.0, step: 0.1, val: 1.0, color: '#a855f7' },
        { label: 'Specularity', min: 0.5, max: 3.0, step: 0.1, val: 1.5, color: '#f43f5e' },
      ],
    },
    {
      id: 1,
      name: 'Velvet Ink Bleed',
      tag: 'LIQUID-02',
      knobs: [
        { label: 'Dispersion', min: 0.2, max: 3.0, step: 0.1, val: 1.0, color: '#38bdf8' },
        { label: 'Glow Edge', min: 0.5, max: 4.0, step: 0.1, val: 2.2, color: '#ec4899' },
        { label: 'Flow Rate', min: 0.2, max: 3.0, step: 0.1, val: 1.0, color: '#22c55e' },
      ],
    },
    {
      id: 2,
      name: 'Spectral Prismatic',
      tag: 'LIQUID-03',
      knobs: [
        { label: 'Refraction', min: 0.5, max: 4.0, step: 0.1, val: 2.0, color: '#38bdf8' },
        { label: 'Dispersion', min: 0.5, max: 3.5, step: 0.1, val: 1.4, color: '#eab308' },
        { label: 'Caustics', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#f43f5e' },
      ],
    },
    {
      id: 3,
      name: 'Cyberpunk Ion',
      tag: 'LIQUID-04',
      knobs: [
        { label: 'Ion Plasma', min: 0.5, max: 3.5, step: 0.1, val: 1.6, color: '#06b6d4' },
        { label: 'Fringe Split', min: 0.5, max: 4.0, step: 0.1, val: 2.5, color: '#ec4899' },
        { label: 'Scanlines', min: 0.0, max: 1.0, step: 0.05, val: 0.5, color: '#a855f7' },
      ],
    },
    {
      id: 4,
      name: 'Phosphor CRT Terminal',
      tag: 'GLITCH-01',
      knobs: [
        { label: 'Curvature', min: 0.0, max: 1.0, step: 0.02, val: 0.35, color: '#00ff88' },
        { label: 'Beam Jitter', min: 0.0, max: 2.5, step: 0.1, val: 1.0, color: '#38bdf8' },
        { label: 'Scanline Hum', min: 0.2, max: 2.0, step: 0.1, val: 1.0, color: '#eab308' },
      ],
    },
    {
      id: 5,
      name: 'Analog VHS & Tape Tear',
      tag: 'GLITCH-02',
      knobs: [
        { label: 'Tape Skew', min: 0.2, max: 3.0, step: 0.1, val: 1.0, color: '#f43f5e' },
        { label: 'Tracking Bar', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#06b6d4' },
        { label: 'Chroma Phase', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#a855f7' },
      ],
    },
    {
      id: 6,
      name: 'Prismatic Laser Diffraction',
      tag: 'GLITCH-03',
      knobs: [
        { label: 'Spread Width', min: 0.2, max: 3.5, step: 0.1, val: 1.2, color: '#38bdf8' },
        { label: 'Laser Flare', min: 0.2, max: 3.0, step: 0.1, val: 1.0, color: '#ec4899' },
        { label: 'Dispersion', min: 0.2, max: 3.0, step: 0.1, val: 1.4, color: '#22c55e' },
      ],
    },
  ]

  // Reactive state for each shader's knobs
  let knobStates = $state(
    lockedShaders.map((s) => s.knobs.map((k) => k.val))
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
          return vec4(1.0, 1.0, 1.0, 1.0);
        }
        return texture2D(u_texture, uv);
      }

      void main() {
        vec2 uv = v_uv;
        vec2 aspectUV = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        vec3 color = vec3(0.0);

        // =====================================================================
        // SHADERS 0 - 3: The 4 Original Liquid Shaders
        // =====================================================================
        if (u_shader_id >= 0 && u_shader_id <= 3) {
          float t = u_time * 0.55 * u_k2;
          float intensity = u_k1;
          vec2 fluidFlow = curlWarp(aspectUV * 1.8, t) * 0.045 * intensity;

          float dispStrength = 0.018 * intensity;
          if (u_shader_id == 2) dispStrength *= 2.8;
          if (u_shader_id == 3) dispStrength *= 3.5;

          vec2 dispR = fluidFlow * (1.0 + dispStrength * 25.0);
          vec2 dispG = fluidFlow;
          vec2 dispB = fluidFlow * (1.0 - dispStrength * 25.0);

          float colR = sampleClamped(getCoverUV(uv + dispR, u_resolution, u_image_res)).r;
          float colG = sampleClamped(getCoverUV(uv + dispG, u_resolution, u_image_res)).g;
          float colB = sampleClamped(getCoverUV(uv + dispB, u_resolution, u_image_res)).b;
          vec3 texCol = vec3(colR, colG, colB);

          float inkMask = 1.0 - dot(texCol, vec3(0.299, 0.587, 0.114));
          float height = smoothstep(0.05, 0.85, inkMask);

          float eps = 2.0 / u_resolution.y;
          float hL = 1.0 - dot(sampleClamped(getCoverUV(uv + fluidFlow - vec2(eps, 0.0), u_resolution, u_image_res)).rgb, vec3(0.299, 0.587, 0.114));
          float hR = 1.0 - dot(sampleClamped(getCoverUV(uv + fluidFlow + vec2(eps, 0.0), u_resolution, u_image_res)).rgb, vec3(0.299, 0.587, 0.114));
          float hD = 1.0 - dot(sampleClamped(getCoverUV(uv + fluidFlow - vec2(0.0, eps), u_resolution, u_image_res)).rgb, vec3(0.299, 0.587, 0.114));
          float hU = 1.0 - dot(sampleClamped(getCoverUV(uv + fluidFlow + vec2(0.0, eps), u_resolution, u_image_res)).rgb, vec3(0.299, 0.587, 0.114));

          vec3 normal = normalize(vec3((hL - hR) * 3.5, (hD - hU) * 3.5, 0.85));

          vec3 lightPos1 = vec3(cos(t * 1.2) * 1.2, sin(t * 0.9) * 1.2, 1.2);
          vec3 lightPos2 = vec3(sin(t * 1.5) * -1.0, cos(t * 1.4) * -1.0, 0.9);
          vec3 viewDir = vec3(0.0, 0.0, 1.0);

          vec3 l1 = normalize(lightPos1 - vec3(aspectUV, 0.0));
          vec3 l2 = normalize(lightPos2 - vec3(aspectUV, 0.0));

          float spec1 = pow(max(dot(normal, normalize(l1 + viewDir)), 0.0), 48.0);
          float spec2 = pow(max(dot(normal, normalize(l2 + viewDir)), 0.0), 32.0);
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

          vec3 refl = reflect(-viewDir, normal);
          vec3 iridCyan = vec3(0.0, 0.95, 0.92);
          vec3 iridMagenta = vec3(1.0, 0.08, 0.58);
          vec3 iridViolet = vec3(0.55, 0.25, 0.95);
          vec3 envColor = mix(iridCyan, iridMagenta, refl.x * 0.5 + 0.5);
          envColor = mix(envColor, iridViolet, refl.y * 0.5 + 0.5);

          if (u_shader_id == 0) {
            // Liquid Chrome
            vec3 chromeBase = mix(vec3(0.04, 0.04, 0.07), vec3(0.85, 0.88, 0.95), height);
            vec3 chromeHighlights = (spec1 * iridCyan * 1.8 + spec2 * iridMagenta * 1.5) * u_k3;
            vec3 edgeFresnel = fresnel * envColor * (height * 1.5 + 0.3);
            color = chromeBase + chromeHighlights + edgeFresnel;
            color += (vec3(colR, colG, colB) - vec3(colG)) * height * 1.8;

          } else if (u_shader_id == 1) {
            // Velvet Ink Bleed
            vec3 fluidBg = mix(vec3(0.02, 0.03, 0.05), vec3(0.08, 0.05, 0.12), length(aspectUV));
            vec3 deepInk = vec3(0.03, 0.01, 0.05);
            vec3 glowingEdge = mix(iridMagenta, iridCyan, sin(aspectUV.x * 8.0 + t * 2.0) * 0.5 + 0.5) * u_k2;
            float edgeFactor = smoothstep(0.1, 0.5, height) * (1.0 - smoothstep(0.5, 0.85, height));
            color = mix(fluidBg, deepInk, height);
            color += edgeFactor * glowingEdge;
            color += (spec1 * iridCyan + spec2 * iridMagenta) * height * 0.8;

          } else if (u_shader_id == 2) {
            // Spectral Prismatic
            vec3 glassDispersion = vec3(colR, colG, colB);
            vec3 causticRipples = vec3(spec1 * 0.8 + spec2 * 0.6) * u_k3;
            color = mix(glassDispersion, envColor * 0.8 + causticRipples, fresnel * 0.65);
            color *= mix(vec3(0.92, 0.94, 0.98), vec3(1.15, 1.05, 1.25), fresnel);

          } else if (u_shader_id == 3) {
            // Cyberpunk Ion
            vec3 neonCyan = vec3(0.0, 1.0, 0.85);
            vec3 neonPink = vec3(1.0, 0.05, 0.5);
            float scanline = sin(gl_FragCoord.y * 1.5 + t * 15.0) * 0.06 * u_k3;
            vec3 cyberBg = vec3(0.02, 0.01, 0.04);
            vec3 cyberInk = mix(neonCyan, neonPink, normal.x * 0.5 + 0.5) * height * 2.4;
            vec3 fringe = abs(vec3(colR - colG, colG - colB, colB - colR)) * u_k2;
            color = cyberBg + cyberInk + fringe + (spec1 + spec2) * neonCyan;
            color += scanline;
          }

          float vignette = smoothstep(1.5, 0.45, length(aspectUV));
          float grain = (fract(sin(dot(uv * u_time, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.035;
          color = color * vignette + grain;
        }

        // =====================================================================
        // SHADER 4: Phosphor CRT Terminal (Original from Step 340)
        // =====================================================================
        else if (u_shader_id == 4) {
          float t = u_time;
          vec2 crtUV = uv - 0.5;
          float r2 = dot(crtUV, crtUV);
          crtUV *= 1.0 + r2 * (u_k1);
          crtUV += 0.5;

          float border = smoothstep(0.0, 0.04, crtUV.x) * smoothstep(1.0, 0.96, crtUV.x) *
                         smoothstep(0.0, 0.04, crtUV.y) * smoothstep(1.0, 0.96, crtUV.y);

          float beamJitter = (hash11(floor(crtUV.y * 480.0) + floor(t * 30.0)) - 0.5) * 0.004 * u_k2;
          crtUV.x += beamJitter;

          vec2 imgUV = getCoverUV(crtUV, u_resolution, u_image_res);
          vec3 base = sampleClamped(imgUV).rgb;

          float subpixel = mod(gl_FragCoord.x, 3.0);
          vec3 mask = vec3(0.5);
          if (subpixel < 1.0) mask = vec3(1.2, 0.7, 0.7);
          else if (subpixel < 2.0) mask = vec3(0.7, 1.2, 0.7);
          else mask = vec3(0.7, 0.7, 1.2);

          float scan = sin(crtUV.y * u_resolution.y * 1.5 + t * 4.0) * (0.15 * u_k3) + 0.85;

          color = base * mask * scan * border;
          color += (1.0 - base) * vec3(0.0, 0.8, 0.6) * 0.18 * border;
        }

        // =====================================================================
        // SHADER 5: Analog VHS & Tape Tear (Original from Step 340)
        // =====================================================================
        else if (u_shader_id == 5) {
          float t = u_time;
          vec2 vhsUV = uv;

          float trackPos = fract(t * 0.25);
          float trackDist = abs(vhsUV.y - trackPos);
          float trackingBar = smoothstep(0.08, 0.0, trackDist) * u_k2;

          float skew = sin(vhsUV.y * 18.0 + t * 5.0) * 0.015 * trackingBar * u_k1;
          float tapeJitter = (hash11(vhsUV.y * 120.0 + t * 60.0) - 0.5) * 0.008 * (1.0 + trackingBar * 4.0);
          vhsUV.x += skew + tapeJitter * u_k1;

          float chromaShift = (0.012 + trackingBar * 0.035) * u_k3;
          vec2 uvR = getCoverUV(vhsUV + vec2(chromaShift, 0.0), u_resolution, u_image_res);
          vec2 uvG = getCoverUV(vhsUV, u_resolution, u_image_res);
          vec2 uvB = getCoverUV(vhsUV - vec2(chromaShift * 1.4, 0.0), u_resolution, u_image_res);

          color.r = sampleClamped(uvR).r;
          color.g = sampleClamped(uvG).g;
          color.b = sampleClamped(uvB).b;

          float grain = (hash21(gl_FragCoord.xy + fract(t)) - 0.5) * 0.12;
          color += grain;
          color += trackingBar * vec3(0.12, 0.18, 0.15);
        }

        // =====================================================================
        // SHADER 6: Prismatic Laser Diffraction (Original from Step 340)
        // =====================================================================
        else if (u_shader_id == 6) {
          float t = u_time;
          vec2 laserUV = uv;
          vec2 centerDiff = aspectUV;
          float angle = atan(centerDiff.y, centerDiff.x);

          float streak = exp(-abs(aspectUV.y) * 40.0) * u_k2;

          vec3 prismCol = vec3(0.0);
          float spread = 0.035 * u_k3 * u_k1;

          for (int i = 0; i < 8; i++) {
            float fi = float(i) / 7.0;
            vec2 offset = vec2(cos(angle), sin(angle)) * (fi - 0.5) * spread;
            vec2 sampleUV = getCoverUV(laserUV + offset, u_resolution, u_image_res);
            vec3 sCol = sampleClamped(sampleUV).rgb;

            vec3 weight = vec3(
              sin(fi * PI) * 0.8 + 0.2,
              sin((fi - 0.3) * PI) * 0.8 + 0.2,
              sin((fi - 0.6) * PI) * 0.8 + 0.2
            );
            prismCol += sCol * weight;
          }
          prismCol /= 4.0;

          vec3 laserCyan = vec3(0.0, 1.0, 0.95);
          color = prismCol + streak * laserCyan * 0.6;
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const s = glCtx.createShader(type)!
      glCtx.shaderSource(s, source)
      glCtx.compileShader(s)
      if (!glCtx.getShaderParameter(s, glCtx.COMPILE_STATUS)) {
        console.error('Shader error:', glCtx.getShaderInfoLog(s))
        glCtx.deleteShader(s)
        return null
      }
      return s
    }

    const vs = createShader(glCtx, glCtx.VERTEX_SHADER, vsSource)
    const fs = createShader(glCtx, glCtx.FRAGMENT_SHADER, fsSource)
    if (!vs || !fs) return

    const program = glCtx.createProgram()!
    glCtx.attachShader(program, vs)
    glCtx.attachShader(program, fs)
    glCtx.linkProgram(program)
    if (!glCtx.getProgramParameter(program, glCtx.LINK_STATUS)) {
      console.error('Link error:', glCtx.getProgramInfoLog(program))
      return
    }

    glCtx.useProgram(program)

    const posBuf = glCtx.createBuffer()
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, posBuf)
    glCtx.bufferData(
      glCtx.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      glCtx.STATIC_DRAW
    )

    const posAttr = glCtx.getAttribLocation(program, 'a_position')
    glCtx.enableVertexAttribArray(posAttr)
    glCtx.vertexAttribPointer(posAttr, 2, glCtx.FLOAT, false, 0, 0)

    const uResolution = glCtx.getUniformLocation(program, 'u_resolution')
    const uImageRes = glCtx.getUniformLocation(program, 'u_image_res')
    const uTime = glCtx.getUniformLocation(program, 'u_time')
    const uShaderId = glCtx.getUniformLocation(program, 'u_shader_id')
    const uK1 = glCtx.getUniformLocation(program, 'u_k1')
    const uK2 = glCtx.getUniformLocation(program, 'u_k2')
    const uK3 = glCtx.getUniformLocation(program, 'u_k3')

    const texture = glCtx.createTexture()
    glCtx.bindTexture(glCtx.TEXTURE_2D, texture)
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

    const img = new Image()
    img.src = '/tasteink.jpg'
    img.onload = () => {
      glCtx.bindTexture(glCtx.TEXTURE_2D, texture)
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, glCtx.RGBA, glCtx.UNSIGNED_BYTE, img)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.LINEAR)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.LINEAR)
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvasEl.width = window.innerWidth * dpr
      canvasEl.height = window.innerHeight * dpr
      glCtx.viewport(0, 0, canvasEl.width, canvasEl.height)
    }

    window.addEventListener('resize', resize)
    resize()

    let animId: number
    const startTime = performance.now()

    function render(now: number) {
      const elapsed = (now - startTime) / 1000.0

      const currentKnobs = knobStates[currentShader] || [1.0, 1.0, 1.0]

      glCtx.uniform2f(uResolution, canvasEl.width, canvasEl.height)
      glCtx.uniform2f(uImageRes, 752.0, 564.0)
      glCtx.uniform1f(uTime, elapsed)
      glCtx.uniform1i(uShaderId, currentShader)
      glCtx.uniform1f(uK1, currentKnobs[0] ?? 1.0)
      glCtx.uniform1f(uK2, currentKnobs[1] ?? 1.0)
      glCtx.uniform1f(uK3, currentKnobs[2] ?? 1.0)

      glCtx.drawArrays(glCtx.TRIANGLES, 0, 6)
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  })
</script>

<div class="locked-page">
  <canvas bind:this={canvasEl} class="gl-canvas"></canvas>

  <!-- Top Navigation -->
  <header class="top-nav">
    <div class="nav-links">
      <span class="page-badge">🔒 LOCKED KEEPERS (7)</span>
      <button class="nav-btn" onclick={() => onNavigate('/girly')}>
        💖 /girly (10) →
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/organic')}>
        🌿 Organic (15)
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/space')}>
        🚀 Space (10)
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
      {#each lockedShaders as s}
        <button
          class="name-item"
          class:active={currentShader === s.id}
          onclick={() => (currentShader = s.id)}
        >
          <span class="dot"></span>
          <span class="num">0{s.id + 1}</span>
          <span class="name">{s.name}</span>
        </button>
      {/each}
    </div>

    <!-- Rotary Knobs for currently active shader -->
    <div class="knobs-rack">
      {#each lockedShaders[currentShader].knobs as knob, i}
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
  .locked-page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #030305;
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
    color: #eab308;
    background: rgba(234, 179, 8, 0.12);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(234, 179, 8, 0.3);
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
    gap: 12px;
    background: rgba(8, 10, 16, 0.82);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    padding: 1rem 1.25rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
    max-width: 320px;
  }

  .shader-names-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 8px;
  }

  .name-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 8px;
    border-radius: 6px;
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.82rem;
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
    background: rgba(234, 179, 8, 0.15);
    color: #fef08a;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #64748b;
  }

  .name-item.active .dot {
    background: #eab308;
    box-shadow: 0 0 6px #eab308;
  }

  .num {
    font-size: 0.7rem;
    font-family: monospace;
    opacity: 0.7;
  }

  .knobs-rack {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 12px;
    padding-top: 4px;
  }
</style>
