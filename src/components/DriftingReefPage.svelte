<script lang="ts">
  import { onMount } from 'svelte'
  import Knob from './Knob.svelte'

  interface Props {
    onNavigate: (path: string) => void
  }
  let { onNavigate }: Props = $props()

  let canvasEl: HTMLCanvasElement
  let currentLayer = $state(0) // 0: Core Erosion, 1: + Particle Drift, 2: + VHS Tape Smear, 3: + Falling Neon Lines

  const reefLayers = [
    {
      id: 0,
      name: 'Drifting Reef (Core)',
      tag: 'PRESET-ACTIVE',
      desc: 'Hydraulic erosion noise (#fa2f6c coral to #1dbac4 cyan) overlay masked to typography',
      knobs: [
        { label: 'Erosion Scale', min: 1.0, max: 10.0, step: 0.1, val: 4.7, color: '#fa2f6c' },
        { label: 'Contrast', min: 0.5, max: 3.5, step: 0.1, val: 1.8, color: '#1dbac4' },
        { label: 'Balance', min: -1.0, max: 1.0, step: 0.05, val: -0.45, color: '#fef08a' },
      ],
    },
    {
      id: 1,
      name: 'Reef + Particle Drift',
      tag: 'LAYER-PARTICLES',
      desc: '39,000 luminant suspended particles with wobble and depth shading',
      knobs: [
        { label: 'Particle Count', min: 0.2, max: 3.0, step: 0.1, val: 1.2, color: '#38bdf8' },
        { label: 'Wobble Depth', min: 0.2, max: 2.5, step: 0.1, val: 1.0, color: '#a855f7' },
        { label: 'Reef Opacity', min: 0.2, max: 1.0, step: 0.05, val: 0.85, color: '#fa2f6c' },
      ],
    },
    {
      id: 2,
      name: 'Reef + VHS Smear',
      tag: 'LAYER-VHS',
      desc: 'Analog chromatic VHS smear (1.92) & wobble (1.42) from preset',
      knobs: [
        { label: 'VHS Smear', min: 0.2, max: 3.5, step: 0.1, val: 1.9, color: '#ec4899' },
        { label: 'Tape Wobble', min: 0.2, max: 3.0, step: 0.1, val: 1.4, color: '#06b6d4' },
        { label: 'Scanline Noise', min: 0.0, max: 1.0, step: 0.02, val: 0.08, color: '#eab308' },
      ],
    },
    {
      id: 3,
      name: 'Reef + Falling Lines',
      tag: 'LAYER-FALLING',
      desc: '119° angled kinetic falling neon laser lines across erosion contours',
      knobs: [
        { label: 'Line Density', min: 4.0, max: 32.0, step: 1.0, val: 16.0, color: '#4ade80' },
        { label: 'Fall Speed', min: 0.1, max: 2.0, step: 0.05, val: 0.51, color: '#f43f5e' },
        { label: 'Trail Length', min: 0.1, max: 1.0, step: 0.05, val: 0.54, color: '#38bdf8' },
      ],
    },
  ]

  let knobStates = $state(reefLayers.map((l) => l.knobs.map((k) => k.val)))

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
      uniform int u_layer_id;
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

      // Photoshop Overlay blend mode
      vec3 blendOverlay(vec3 base, vec3 blend) {
        return mix(
          2.0 * base * blend,
          1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
          step(vec3(0.5), base)
        );
      }

      // Hydraulic Erosion Noise generator (Seed 74)
      float hydraulicErosion(vec2 p, float scale, float contrast, float balance, float t) {
        vec2 pos = p * (scale * 0.75) + vec2(9.62, 21.46); // seed 74 offset
        float sum = 0.0;
        float amp = 0.62;
        float freq = 1.0;
        
        for (int i = 0; i < 4; i++) {
          // Hydraulic gradient carving
          float eps = 0.01;
          float nX = snoise(pos * freq + vec2(eps, 0.0) + vec2(t * 0.04, -t * 0.03)) - 
                     snoise(pos * freq - vec2(eps, 0.0) + vec2(t * 0.04, -t * 0.03));
          float nY = snoise(pos * freq + vec2(0.0, eps) + vec2(t * 0.04, -t * 0.03)) - 
                     snoise(pos * freq - vec2(0.0, eps) + vec2(t * 0.04, -t * 0.03));
          vec2 g = vec2(nX, nY) / (2.0 * eps);

          pos += g * 0.08;
          float n = snoise(pos * freq);
          // Sharp erosion canyon ridges
          float ridge = 1.0 - abs(n);
          sum += ridge * amp;
          freq *= 2.02;
          amp *= 0.52;
        }

        float v = (sum - 0.5) * (contrast + 0.6) + 0.5 + balance * 0.5;
        return clamp(v, 0.0, 1.0);
      }

      void main() {
        vec2 uv = v_uv;
        vec2 aspectUV = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        vec2 coverUV = getCoverUV(uv, u_resolution, u_image_res);
        float t = u_time;

        // Base image
        vec4 img = sampleClamped(coverUV);
        float ink = getInk(coverUV);

        // Core Erosion Parameters from preset
        float scale = (u_layer_id == 0) ? u_k1 : 4.7;
        float contrast = (u_layer_id == 0) ? u_k2 : 1.8;
        float balance = (u_layer_id == 0) ? u_k3 : -0.45;
        float opacity = (u_layer_id == 1) ? u_k3 : 0.85;

        // Hydraulic Erosion Field
        float v = hydraulicErosion(aspectUV, scale, contrast, balance, t);
        
        // Exact gradient stops: #fa2f6c (coral) -> #1dbac4 (cyan)
        vec3 stopA = vec3(0.980, 0.184, 0.424); // #fa2f6c
        vec3 stopB = vec3(0.114, 0.729, 0.769); // #1dbac4
        vec3 erosionCol = mix(stopA, stopB, v);

        // Overlay blend masked to the typography (maskSource: tasteink)
        vec3 blended = blendOverlay(img.rgb, erosionCol);
        vec3 color = mix(img.rgb, blended, opacity * ink);

        // ==========================================
        // Layer 1: + 39,000 Particle Field
        // ==========================================
        if (u_layer_id == 1) {
          float pScale = 38.0 * u_k1;
          vec2 pGrid = floor(aspectUV * pScale);
          float pSeed = hash21(pGrid);
          
          float wobble = sin(t * 1.5 + pSeed * 12.0) * 0.58 * u_k2;
          float isParticle = step(0.92, pSeed);
          
          // Screen blend particles
          vec3 pCol = mix(stopA, stopB, hash11(pSeed * 10.0));
          color += pCol * isParticle * ink * (0.8 + wobble * 0.4);
        }

        // ==========================================
        // Layer 2: + VHS Smear & Wobble
        // ==========================================
        else if (u_layer_id == 2) {
          float smear = 0.015 * u_k1;
          float wobble = sin(aspectUV.y * 25.0 + t * 4.0) * 0.008 * u_k2;
          
          float r = sampleClamped(coverUV + vec2(wobble + smear, 0.0)).r;
          float g = sampleClamped(coverUV + vec2(wobble, 0.0)).g;
          float b = sampleClamped(coverUV + vec2(wobble - smear, 0.0)).b;
          
          float noise = (hash21(aspectUV * 200.0 + vec2(t * 15.0)) - 0.5) * u_k3;
          vec3 vhsImg = vec3(r, g, b) + noise;
          
          vec3 vhsBlended = blendOverlay(vhsImg, erosionCol);
          color = mix(vhsImg, vhsBlended, opacity * ink);
        }

        // ==========================================
        // Layer 3: + Falling Neon Lines (119 degrees)
        // ==========================================
        else if (u_layer_id == 3) {
          float ang = 119.0 * PI / 180.0;
          vec2 lineDir = vec2(cos(ang), sin(ang));
          float proj = dot(aspectUV, lineDir) - t * u_k2;
          
          float lines = sin(proj * u_k1) * 0.5 + 0.5;
          lines = pow(lines, 8.0) * u_k3;

          vec3 neonGreen = vec3(0.227, 0.980, 0.039); // #3afa0a
          vec3 neonPink = vec3(0.902, 0.027, 0.290);  // #e6074a
          vec3 lineCol = mix(neonGreen, neonPink, v);

          color += lineCol * lines * ink * 1.5;
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
    const uLayerIdLoc = glCtx.getUniformLocation(program, 'u_layer_id')
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
      glCtx.uniform1i(uLayerIdLoc, currentLayer)

      const curKnobs = knobStates[currentLayer] || [4.7, 1.8, -0.45]
      glCtx.uniform1f(uK1Loc, curKnobs[0] ?? 4.7)
      glCtx.uniform1f(uK2Loc, curKnobs[1] ?? 1.8)
      glCtx.uniform1f(uK3Loc, curKnobs[2] ?? -0.45)

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

<div class="reef-page">
  <canvas bind:this={canvasEl} class="gl-canvas"></canvas>

  <!-- Top Navigation Header -->
  <header class="top-nav">
    <div class="nav-links">
      <span class="page-badge">🌊 DRIFTING REEF</span>
      <button class="nav-btn" onclick={() => onNavigate('/girly')}>
        💖 /girly (10) →
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/space')}>
        🚀 Space (10)
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/organic')}>
        🌿 Organic (15)
      </button>
      <button class="nav-btn" onclick={() => onNavigate('/locked')}>
        🔒 Locked Keepers (7)
      </button>
    </div>
  </header>

  <!-- Bottom-Left Minimal Control Deck -->
  <div class="bottom-left-deck">
    <!-- Preset Layer List -->
    <div class="layer-names-list">
      {#each reefLayers as layer}
        <button
          class="name-item"
          class:active={currentLayer === layer.id}
          onclick={() => (currentLayer = layer.id)}
        >
          <span class="dot"></span>
          <span class="name">{layer.name}</span>
          <span class="tag">{layer.tag}</span>
        </button>
      {/each}
    </div>

    <!-- Rotary Knobs for current active layer -->
    <div class="knobs-rack">
      {#each reefLayers[currentLayer].knobs as knob, i}
        <Knob
          label={knob.label}
          bind:value={knobStates[currentLayer][i]}
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
  .reef-page {
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
    color: #fa2f6c;
    background: rgba(250, 47, 108, 0.12);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(250, 47, 108, 0.3);
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
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    padding: 0.9rem 1.15rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.75);
    width: 320px;
  }

  .layer-names-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 6px;
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
    background: rgba(250, 47, 108, 0.15);
    color: #fda4af;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #64748b;
    flex-shrink: 0;
  }

  .name-item.active .dot {
    background: #fa2f6c;
    box-shadow: 0 0 6px #fa2f6c;
  }

  .name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tag {
    font-size: 0.65rem;
    font-family: monospace;
    opacity: 0.6;
    background: rgba(255, 255, 255, 0.06);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .knobs-rack {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 12px;
    padding-top: 4px;
  }
</style>
