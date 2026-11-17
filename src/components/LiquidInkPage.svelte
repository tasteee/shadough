<script lang="ts">
  import { onMount } from 'svelte'
  import FluidCollectionLink from './FluidCollectionLink.svelte'

  interface Props {
    onNavigateGlitch: () => void
  }
  let { onNavigateGlitch }: Props = $props()

  let canvasEl: HTMLCanvasElement
  let currentMode = $state(0) // 0: Liquid Chrome, 1: Velvet Ink, 2: Prismatic, 3: Cyberpunk
  let intensity = $state(1.0)
  let showControls = $state(true)
  let isPointerDown = $state(false)

  const modes = [
    { name: 'Liquid Chrome', desc: 'Molten metallic reflections & chromatic flow' },
    { name: 'Velvet Ink Bleed', desc: 'Deep fluid dispersal with bioluminescent edges' },
    { name: 'Spectral Prismatic', desc: 'Heavy optical glass refraction & dispersion' },
    { name: 'Cyberpunk Ion', desc: 'Hyper-saturated cyan & magenta plasma discharge' },
  ]

  onMount(() => {
    const gl = canvasEl.getContext('webgl', {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    })

    if (!gl) {
      console.error('WebGL not supported')
      return
    }
    const glCtx: WebGLRenderingContext = gl

    // Vertex Shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        v_uv.y = 1.0 - v_uv.y;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    // High-End Fragment Shader
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;

      uniform sampler2D u_texture;
      uniform vec2 u_resolution;
      uniform vec2 u_image_res;
      uniform vec2 u_mouse;
      uniform vec2 u_mouse_vel;
      uniform float u_time;
      uniform float u_click_time;
      uniform vec2 u_click_pos;
      uniform int u_mode;
      uniform float u_intensity;

      // Simplex 2D noise
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
        scale *= 1.15;
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
        vec2 aspectCorrectUV = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

        vec2 mouseAspect = (u_mouse * u_resolution - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        float mouseDist = length(aspectCorrectUV - mouseAspect);
        float mouseRadius = 0.42;
        float mouseInfluence = smoothstep(mouseRadius, 0.0, mouseDist);
        vec2 mousePush = u_mouse_vel * mouseInfluence * 1.8;

        vec2 mouseDir = aspectCorrectUV - mouseAspect;
        vec2 mouseSwirl = vec2(-mouseDir.y, mouseDir.x) * mouseInfluence * 0.08;

        float clickAge = u_time - u_click_time;
        vec2 clickAspect = (u_click_pos * u_resolution - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        float clickDist = length(aspectCorrectUV - clickAspect);
        vec2 shockWave = vec2(0.0);
        if (clickAge > 0.0 && clickAge < 2.5) {
          float wavePos = clickAge * 0.9;
          float waveDist = abs(clickDist - wavePos);
          float waveAmp = smoothstep(0.12, 0.0, waveDist) * exp(-clickAge * 1.4);
          vec2 normWaveDir = normalize(aspectCorrectUV - clickAspect + vec2(0.0001));
          shockWave = normWaveDir * sin(waveDist * 40.0 - clickAge * 15.0) * waveAmp * 0.05;
        }

        float timeScale = u_time * 0.55;
        vec2 fluidFlow = curlWarp(aspectCorrectUV * 1.8, timeScale) * 0.045 * u_intensity;

        vec2 totalDisp = (fluidFlow + mousePush + mouseSwirl + shockWave) * u_intensity;

        float dispStrength = 0.018 * u_intensity;
        if (u_mode == 2) dispStrength *= 2.8;
        if (u_mode == 3) dispStrength *= 3.5;

        vec2 dispR = totalDisp * (1.0 + dispStrength * 25.0);
        vec2 dispG = totalDisp;
        vec2 dispB = totalDisp * (1.0 - dispStrength * 25.0);

        vec2 uvR = getCoverUV(uv + dispR, u_resolution, u_image_res);
        vec2 uvG = getCoverUV(uv + dispG, u_resolution, u_image_res);
        vec2 uvB = getCoverUV(uv + dispB, u_resolution, u_image_res);

        float colR = sampleClamped(uvR).r;
        float colG = sampleClamped(uvG).g;
        float colB = sampleClamped(uvB).b;
        vec3 texCol = vec3(colR, colG, colB);

        float inkMask = 1.0 - dot(texCol, vec3(0.299, 0.587, 0.114));
        float height = smoothstep(0.05, 0.85, inkMask);

        float eps = 2.0 / u_resolution.y;
        float hL = 1.0 - dot(sampleClamped(getCoverUV(uv + totalDisp - vec2(eps, 0.0), u_resolution, u_image_res)).rgb, vec3(0.299, 0.587, 0.114));
        float hR = 1.0 - dot(sampleClamped(getCoverUV(uv + totalDisp + vec2(eps, 0.0), u_resolution, u_image_res)).rgb, vec3(0.299, 0.587, 0.114));
        float hD = 1.0 - dot(sampleClamped(getCoverUV(uv + totalDisp - vec2(0.0, eps), u_resolution, u_image_res)).rgb, vec3(0.299, 0.587, 0.114));
        float hU = 1.0 - dot(sampleClamped(getCoverUV(uv + totalDisp + vec2(0.0, eps), u_resolution, u_image_res)).rgb, vec3(0.299, 0.587, 0.114));

        float bumpStrength = 3.5;
        vec3 normal = normalize(vec3((hL - hR) * bumpStrength, (hD - hU) * bumpStrength, 0.85));

        vec3 lightPos1 = vec3(cos(u_time * 0.7) * 1.2, sin(u_time * 0.5) * 1.2, 1.2);
        vec3 lightPos2 = vec3(sin(u_time * 0.9) * -1.0, cos(u_time * 0.8) * -1.0, 0.9);
        vec3 viewDir = vec3(0.0, 0.0, 1.0);

        vec3 l1 = normalize(lightPos1 - vec3(aspectCorrectUV, 0.0));
        vec3 l2 = normalize(lightPos2 - vec3(aspectCorrectUV, 0.0));

        vec3 h1 = normalize(l1 + viewDir);
        vec3 h2 = normalize(l2 + viewDir);

        float spec1 = pow(max(dot(normal, h1), 0.0), 48.0);
        float spec2 = pow(max(dot(normal, h2), 0.0), 32.0);
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

        vec3 refl = reflect(-viewDir, normal);
        vec3 iridCyan = vec3(0.0, 0.95, 0.92);
        vec3 iridMagenta = vec3(1.0, 0.08, 0.58);
        vec3 iridViolet = vec3(0.55, 0.25, 0.95);

        vec3 envColor = mix(iridCyan, iridMagenta, refl.x * 0.5 + 0.5);
        envColor = mix(envColor, iridViolet, refl.y * 0.5 + 0.5);

        vec3 finalColor = vec3(0.0);

        if (u_mode == 0) {
          vec3 chromeBase = mix(vec3(0.04, 0.04, 0.07), vec3(0.85, 0.88, 0.95), height);
          vec3 chromeHighlights = (spec1 * iridCyan * 1.8 + spec2 * iridMagenta * 1.5);
          vec3 edgeFresnel = fresnel * envColor * (height * 1.5 + 0.3);
          
          finalColor = chromeBase + chromeHighlights + edgeFresnel;
          finalColor += (vec3(colR, colG, colB) - vec3(colG)) * height * 1.8;

        } else if (u_mode == 1) {
          vec3 fluidBg = mix(vec3(0.02, 0.03, 0.05), vec3(0.08, 0.05, 0.12), length(aspectCorrectUV));
          vec3 deepInk = vec3(0.03, 0.01, 0.05);
          vec3 glowingEdge = mix(iridMagenta, iridCyan, sin(aspectCorrectUV.x * 8.0 + u_time) * 0.5 + 0.5) * 2.2;
          
          float edgeFactor = smoothstep(0.1, 0.5, height) * (1.0 - smoothstep(0.5, 0.85, height));
          finalColor = mix(fluidBg, deepInk, height);
          finalColor += edgeFactor * glowingEdge;
          finalColor += (spec1 * iridCyan + spec2 * iridMagenta) * height * 0.8;

        } else if (u_mode == 2) {
          vec3 baseClean = texCol;
          vec3 glassDispersion = vec3(colR, colG, colB);
          vec3 causticRipples = vec3(spec1 * 0.8 + spec2 * 0.6);
          
          finalColor = mix(glassDispersion, envColor * 0.8 + causticRipples, fresnel * 0.65);
          finalColor *= mix(vec3(0.92, 0.94, 0.98), vec3(1.15, 1.05, 1.25), fresnel);

        } else if (u_mode == 3) {
          vec3 neonCyan = vec3(0.0, 1.0, 0.85);
          vec3 neonPink = vec3(1.0, 0.05, 0.5);
          
          float scanline = sin(gl_FragCoord.y * 1.5 + u_time * 10.0) * 0.04;
          vec3 cyberBg = vec3(0.02, 0.01, 0.04);
          
          vec3 cyberInk = mix(neonCyan, neonPink, normal.x * 0.5 + 0.5) * height * 2.4;
          vec3 fringe = abs(vec3(colR - colG, colG - colB, colB - colR)) * 3.5;
          
          finalColor = cyberBg + cyberInk + fringe + (spec1 + spec2) * neonCyan;
          finalColor += scanline;
        }

        float vignette = smoothstep(1.5, 0.45, length(aspectCorrectUV));
        float grain = (fract(sin(dot(uv * u_time, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.035;
        
        finalColor = finalColor * vignette + grain;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type)!
      glCtx.shaderSource(shader, source)
      glCtx.compileShader(shader)
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader compile error:', glCtx.getShaderInfoLog(shader))
        glCtx.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = createShader(glCtx, glCtx.VERTEX_SHADER, vsSource)
    const fragmentShader = createShader(glCtx, glCtx.FRAGMENT_SHADER, fsSource)
    if (!vertexShader || !fragmentShader) return

    const program = glCtx.createProgram()!
    glCtx.attachShader(program, vertexShader)
    glCtx.attachShader(program, fragmentShader)
    glCtx.linkProgram(program)

    if (!glCtx.getProgramParameter(program, glCtx.LINK_STATUS)) {
      console.error('Program link error:', glCtx.getProgramInfoLog(program))
      return
    }

    glCtx.useProgram(program)

    const positionBuffer = glCtx.createBuffer()
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, positionBuffer)
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
    const uMouse = glCtx.getUniformLocation(program, 'u_mouse')
    const uMouseVel = glCtx.getUniformLocation(program, 'u_mouse_vel')
    const uTime = glCtx.getUniformLocation(program, 'u_time')
    const uClickTime = glCtx.getUniformLocation(program, 'u_click_time')
    const uClickPos = glCtx.getUniformLocation(program, 'u_click_pos')
    const uMode = glCtx.getUniformLocation(program, 'u_mode')
    const uIntensity = glCtx.getUniformLocation(program, 'u_intensity')

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

    const image = new Image()
    image.src = '/tasteink.jpg'
    image.onload = () => {
      glCtx.bindTexture(glCtx.TEXTURE_2D, texture)
      glCtx.pixelStorei(glCtx.UNPACK_FLIP_Y_WEBGL, false)
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, glCtx.RGBA, glCtx.UNSIGNED_BYTE, image)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.LINEAR)
      glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.LINEAR)
    }

    let targetMouse = { x: 0.5, y: 0.5 }
    let smoothMouse = { x: 0.5, y: 0.5 }
    let mouseVelocity = { x: 0.0, y: 0.0 }
    let lastTime = performance.now()
    let clickTime = -10.0
    let clickPos = { x: 0.5, y: 0.5 }

    function handlePointerMove(e: MouseEvent | TouchEvent) {
      const rect = canvasEl.getBoundingClientRect()
      let clientX = 0
      let clientY = 0

      if (e instanceof MouseEvent) {
        clientX = e.clientX
        clientY = e.clientY
      } else if (e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      }

      targetMouse.x = (clientX - rect.left) / rect.width
      targetMouse.y = (clientY - rect.top) / rect.height
    }

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      isPointerDown = true
      handlePointerMove(e)
      clickTime = (performance.now() - startTime) / 1000.0
      clickPos.x = targetMouse.x
      clickPos.y = targetMouse.y
    }

    function handlePointerUp() {
      isPointerDown = false
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('touchmove', handlePointerMove, { passive: true })
    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('touchstart', handlePointerDown, { passive: true })
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchend', handlePointerUp)

    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        currentMode = (currentMode + 1) % modes.length
      } else if (e.key.toLowerCase() === 'h') {
        showControls = !showControls
      }
    })

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight
      canvasEl.width = width * dpr
      canvasEl.height = height * dpr
      glCtx.viewport(0, 0, canvasEl.width, canvasEl.height)
    }

    window.addEventListener('resize', resize)
    resize()

    let animId: number
    const startTime = performance.now()

    function render(now: number) {
      const dt = Math.min((now - lastTime) / 1000.0, 0.1)
      lastTime = now
      const elapsed = (now - startTime) / 1000.0

      const prevX = smoothMouse.x
      const prevY = smoothMouse.y
      smoothMouse.x += (targetMouse.x - smoothMouse.x) * (isPointerDown ? 0.35 : 0.12)
      smoothMouse.y += (targetMouse.y - smoothMouse.y) * (isPointerDown ? 0.35 : 0.12)

      mouseVelocity.x = (smoothMouse.x - prevX) / (dt + 0.001)
      mouseVelocity.y = (smoothMouse.y - prevY) / (dt + 0.001)

      const maxVel = 5.0
      mouseVelocity.x = Math.max(-maxVel, Math.min(maxVel, mouseVelocity.x))
      mouseVelocity.y = Math.max(-maxVel, Math.min(maxVel, mouseVelocity.y))

      glCtx.uniform2f(uResolution, canvasEl.width, canvasEl.height)
      glCtx.uniform2f(uImageRes, 752.0, 564.0)
      glCtx.uniform2f(uMouse, smoothMouse.x, smoothMouse.y)
      glCtx.uniform2f(uMouseVel, mouseVelocity.x, mouseVelocity.y)
      glCtx.uniform1f(uTime, elapsed)
      glCtx.uniform1f(uClickTime, clickTime)
      glCtx.uniform2f(uClickPos, clickPos.x, clickPos.y)
      glCtx.uniform1i(uMode, currentMode)
      glCtx.uniform1f(uIntensity, intensity)

      glCtx.drawArrays(glCtx.TRIANGLES, 0, 6)

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('touchstart', handlePointerDown)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchend', handlePointerUp)
      window.removeEventListener('resize', resize)
    }
  })
</script>

<div class="shader-page">
  <canvas bind:this={canvasEl} class="gl-canvas"></canvas>

  <!-- Top Jump to /glitch Button -->
  <header class="top-nav">
    <FluidCollectionLink />
    <button class="glitch-pill-btn" onclick={onNavigateGlitch}>
      <span class="bolt">⚡</span>
      <span>10 Glitch & Cyber Shaders (/glitch) →</span>
    </button>
  </header>

  {#if showControls}
    <div class="hud-container">
      <div class="hud-card">
        <div class="hud-top">
          <div class="hud-title-wrap">
            <span class="logo-pill">WebGL</span>
            <div>
              <h2>tasteink</h2>
              <span class="hud-meta">Molten Fluid Displacement</span>
            </div>
          </div>
          <button
            class="minimize-btn"
            title="Hide HUD (or press 'H')"
            onclick={() => (showControls = false)}
          >
            ✕
          </button>
        </div>

        <div class="mode-selector">
          {#each modes as mode, i}
            <button
              class="mode-btn"
              class:active={currentMode === i}
              onclick={() => (currentMode = i)}
            >
              <span class="mode-name">{mode.name}</span>
              <span class="mode-desc">{mode.desc}</span>
            </button>
          {/each}
        </div>

        <div class="slider-box">
          <div class="slider-header">
            <span>Fluid Distortion Intensity</span>
            <span class="slider-val">{intensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            bind:value={intensity}
            class="glow-slider"
          />
        </div>

        <div class="hud-footer">
          <span class="hint-pill">Move cursor to swirl</span>
          <span class="hint-pill">Click for ripple shockwave</span>
          <span class="hint-pill">Space: switch mode</span>
          <span class="hint-pill">H: hide HUD</span>
        </div>
      </div>
    </div>
  {:else}
    <button class="restore-hud-btn" onclick={() => (showControls = true)}>
      ⚡ Controls
    </button>
  {/if}
</div>

<style>
  .shader-page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #030305;
  }

  .gl-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    cursor: crosshair;
    touch-action: none;
  }

  .top-nav {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 20;
    pointer-events: auto;
  }

  .glitch-pill-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 999px;
    background: rgba(10, 12, 20, 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(236, 72, 153, 0.4);
    color: #ffffff;
    font-size: 0.86rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(236, 72, 153, 0.25);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .glitch-pill-btn:hover {
    background: rgba(236, 72, 153, 0.25);
    border-color: #ec4899;
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(236, 72, 153, 0.45);
  }

  .bolt {
    color: #f43f5e;
    font-size: 1rem;
  }

  .hud-container {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    z-index: 10;
    pointer-events: auto;
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .hud-card {
    width: 360px;
    padding: 1.5rem;
    border-radius: 24px;
    background: rgba(10, 12, 18, 0.72);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8),
                0 0 0 1px rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    color: #e2e8f0;
  }

  .hud-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hud-title-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-pill {
    padding: 3px 9px;
    border-radius: 8px;
    background: linear-gradient(135deg, #06b6d4, #ec4899);
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    box-shadow: 0 0 12px rgba(6, 182, 212, 0.4);
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: #ffffff;
  }

  .hud-meta {
    font-size: 0.74rem;
    color: #94a3b8;
  }

  .minimize-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #94a3b8;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    transition: all 0.2s ease;
  }

  .minimize-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    transform: scale(1.05);
  }

  .mode-selector {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mode-btn {
    text-align: left;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(3px);
  }

  .mode-btn.active {
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(236, 72, 153, 0.2));
    border-color: rgba(6, 182, 212, 0.5);
    box-shadow: 0 4px 15px -2px rgba(6, 182, 212, 0.25);
  }

  .mode-name {
    font-size: 0.88rem;
    font-weight: 700;
    color: #ffffff;
  }

  .mode-btn.active .mode-name {
    color: #38bdf8;
  }

  .mode-desc {
    font-size: 0.74rem;
    color: #94a3b8;
  }

  .slider-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    color: #cbd5e1;
    font-weight: 500;
  }

  .slider-val {
    color: #38bdf8;
    font-family: monospace;
    font-weight: 700;
  }

  .glow-slider {
    width: 100%;
    accent-color: #ec4899;
    cursor: pointer;
  }

  .hud-footer {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 0.85rem;
  }

  .hint-pill {
    font-size: 0.68rem;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.05);
    padding: 3px 8px;
    border-radius: 6px;
  }

  .restore-hud-btn {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    z-index: 10;
    padding: 10px 18px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #ffffff;
    font-weight: 600;
    font-size: 0.88rem;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    transition: all 0.2s ease;
  }

  .restore-hud-btn:hover {
    background: rgba(30, 41, 59, 0.95);
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(6, 182, 212, 0.3);
  }

  @media (max-width: 600px) {
    .hud-container {
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
    }
    .hud-card {
      width: auto;
    }
  }
</style>
