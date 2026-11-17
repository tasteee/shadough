<script lang="ts">
  import { onMount } from 'svelte'
  import FluidCollectionLink from './FluidCollectionLink.svelte'

  let canvasEl: HTMLCanvasElement
  let currentShader = $state(0)
  let glitchIntensity = $state(1.0)
  let glitchSpeed = $state(1.0)
  let chromaticSpread = $state(1.2)
  let showHud = $state(true)
  let autoCycle = $state(false)

  // 5 Premium, Expert-Class Shaders
  const shadersList = [
    {
      id: 0,
      name: 'Phosphor CRT Terminal',
      tag: 'CATHODE-RAY',
      category: 'Analog Simulation',
      desc: 'Curved glass tube barrel distortion, RGB Aperture Grille phosphor triads, rolling 60Hz scanline hum & phosphor persistence bloom'
    },
    {
      id: 1,
      name: 'Analog VHS & Magnetic Tape',
      tag: 'TAPE-DECAY',
      category: 'Analog Simulation',
      desc: 'Authentic helical-scan magnetic tracking errors, head azimuth skew, NTSC luma/chroma phase delay & RF noise dropouts'
    },
    {
      id: 2,
      name: 'Prismatic Laser Diffraction',
      tag: 'SPECTRAL-OPTICS',
      category: 'Optical Refraction',
      desc: '10-tap spectral wavelength decomposition, anamorphic laser glare flares, diamond facet caustics & optical dispersion'
    },
    {
      id: 3,
      name: 'Radioactive Cyber-Nanite',
      tag: 'QUANTUM-BIO',
      category: 'Voluminescent Fluid',
      desc: 'Deep emerald-obsidian fluid with branching orthogonal PCB micro-traces, electric dielectric breakdown arcs & glowing quantum nanites'
    },
    {
      id: 4,
      name: 'Volumetric Holo-Matrix',
      tag: 'HOLO-VOXEL',
      category: '3D Hologram Projection',
      desc: 'Multi-plane 3D holographic parallax slicing, sweeping vertical laser scan-cone, hexagonal wireframe mesh & cyber reticles'
    },
  ]

  function selectShader(index: number) {
    currentShader = index
  }

  onMount(() => {
    const gl = canvasEl.getContext('webgl', {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
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

    // Master GLSL Fragment Shader: 5 Expert-Level Shaders
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;

      uniform sampler2D u_texture;
      uniform vec2 u_resolution;
      uniform vec2 u_image_res;
      uniform float u_time;
      uniform int u_shader_id;
      uniform float u_intensity;
      uniform float u_speed;
      uniform float u_chroma;

      #define PI 3.14159265359

      // Pseudo-random hash algorithms
      float hash11(float p) {
        p = fract(p * 0.1031);
        p *= p + 33.33;
        p *= p + p;
        return fract(p);
      }

      vec2 hash22(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.xx + p3.yz) * p3.zy);
      }

      float hash21(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

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

      float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5000 * snoise(p); p *= 2.02;
        f += 0.2500 * snoise(p); p *= 2.03;
        f += 0.1250 * snoise(p); p *= 2.01;
        f += 0.0625 * snoise(p);
        return f;
      }

      // Aspect contain mapping
      vec2 getCoverUV(vec2 uv, vec2 screenRes, vec2 imgRes) {
        float screenAspect = screenRes.x / screenRes.y;
        float imgAspect = imgRes.x / imgRes.y;
        vec2 scale;
        if (screenAspect > imgAspect) {
          scale = vec2(imgAspect / screenAspect, 1.0);
        } else {
          scale = vec2(1.0, screenAspect / imgAspect);
        }
        scale *= 1.12;
        return (uv - 0.5) / scale + 0.5;
      }

      vec4 sampleClamped(vec2 uv) {
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          return vec4(1.0, 1.0, 1.0, 1.0);
        }
        return texture2D(u_texture, uv);
      }

      // Hexagonal Grid distance calculation for Hologram
      vec4 hexGrid(vec2 p) {
        const vec2 s = vec2(1.0, 1.7320508);
        vec4 hC = floor(vec4(p, p - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
        vec4 h = vec4(p - hC.xy * s, p - (hC.zw + 0.5) * s);
        return dot(h.xy, h.xy) < dot(h.zw, h.zw)
          ? vec4(h.xy, hC.xy)
          : vec4(h.zw, hC.zw + 0.5);
      }

      void main() {
        vec2 uv = v_uv;
        vec2 aspectUV = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        float t = u_time * u_speed;
        vec3 color = vec3(0.0);

        // =========================================================================
        // 1. PHOSPHOR CRT TERMINAL
        // =========================================================================
        if (u_shader_id == 0) {
          // Curved barrel distortion
          vec2 crtUV = uv - 0.5;
          float r2 = dot(crtUV, crtUV);
          crtUV *= 1.0 + r2 * (0.28 * u_intensity);
          crtUV += 0.5;

          // Bezel boundary & corner vignette
          vec2 edge = smoothstep(vec2(0.0), vec2(0.04), crtUV) * smoothstep(vec2(0.0), vec2(0.04), 1.0 - crtUV);
          float border = edge.x * edge.y;

          // Autonomous beam sync jitter (slight magnetic fluctuation)
          float jitter = (hash11(floor(crtUV.y * 360.0) + floor(t * 32.0)) - 0.5) * 0.0035 * u_intensity;
          crtUV.x += jitter;

          vec2 imgUV = getCoverUV(crtUV, u_resolution, u_image_res);
          vec3 base = sampleClamped(imgUV).rgb;

          // RGB Aperture Grille subpixel triads
          float subpixel = mod(gl_FragCoord.x, 3.0);
          vec3 triad = vec3(0.65);
          if (subpixel < 1.0) triad = vec3(1.35, 0.65, 0.65);
          else if (subpixel < 2.0) triad = vec3(0.65, 1.35, 0.65);
          else triad = vec3(0.65, 0.65, 1.35);

          // Rolling scanline beam
          float scanline = sin((crtUV.y + t * 0.04) * u_resolution.y * 1.3) * 0.12 + 0.88;

          color = base * triad * scanline * border;
          // Emerald-cyan phosphor bloom along dark ink contours
          float ink = 1.0 - dot(base, vec3(0.299, 0.587, 0.114));
          color += ink * vec3(0.04, 0.65, 0.45) * 0.22 * border;
        }

        // =========================================================================
        // 2. ANALOG VHS & MAGNETIC TAPE DEGRADATION
        // =========================================================================
        else if (u_shader_id == 1) {
          vec2 vhsUV = uv;

          // Periodic rolling tracking error bar
          float trackPos = fract(t * 0.14);
          float trackDist = abs(vhsUV.y - trackPos);
          float trackBar = smoothstep(0.09, 0.0, trackDist);

          // Magnetic tape skew and high-frequency head jitter
          float skew = sin(vhsUV.y * 15.0 + t * 4.0) * 0.014 * trackBar * u_intensity;
          float tapeJitter = (hash11(vhsUV.y * 180.0 + t * 55.0) - 0.5) * 0.006 * (1.0 + trackBar * 3.5) * u_intensity;
          vhsUV.x += skew + tapeJitter;

          // NTSC / PAL luma/chroma phase delay
          float chromaShift = (0.012 + trackBar * 0.035) * u_chroma * u_intensity;
          float r = sampleClamped(getCoverUV(vhsUV + vec2(chromaShift, 0.001), u_resolution, u_image_res)).r;
          float g = sampleClamped(getCoverUV(vhsUV, u_resolution, u_image_res)).g;
          float b = sampleClamped(getCoverUV(vhsUV - vec2(chromaShift * 1.35, -0.001), u_resolution, u_image_res)).b;

          color = vec3(r, g, b);

          // RF noise & tape head dropouts
          float dropout = step(0.988, hash11(floor(vhsUV.y * 350.0) + floor(t * 30.0))) * trackBar;
          float grain = (hash21(gl_FragCoord.xy + fract(t)) - 0.5) * 0.14;

          color += grain + dropout * 0.45;
          color += trackBar * vec3(0.12, 0.16, 0.14);
        }

        // =========================================================================
        // 3. PRISMATIC LASER DIFFRACTION
        // =========================================================================
        else if (u_shader_id == 2) {
          vec2 prismUV = uv;
          vec2 centerDiff = aspectUV;
          float angle = t * 0.25;
          vec2 dispDir = vec2(cos(angle), sin(angle * 0.8));

          // 10-tap high-fidelity optical spectral dispersion
          vec3 prismCol = vec3(0.0);
          float spread = 0.042 * u_chroma * u_intensity;

          for (int i = 0; i < 10; i++) {
            float fi = float(i) / 9.0;
            vec2 offset = dispDir * (fi - 0.5) * spread;
            vec2 sUV = getCoverUV(prismUV + offset, u_resolution, u_image_res);
            vec3 c = sampleClamped(sUV).rgb;

            vec3 weight = vec3(
              smoothstep(0.42, 0.0, abs(fi - 0.15)),
              smoothstep(0.38, 0.0, abs(fi - 0.5)),
              smoothstep(0.42, 0.0, abs(fi - 0.85))
            );
            prismCol += c * weight;
          }
          prismCol /= 2.2;

          // Anamorphic horizontal laser flares
          float flare = exp(-abs(aspectUV.y) * 42.0) * (sin(aspectUV.x * 24.0 + t * 3.5) * 0.25 + 0.75) * u_intensity;
          vec3 laserCyan = vec3(0.0, 0.95, 1.0);
          vec3 laserPink = vec3(1.0, 0.08, 0.65);

          // Diamond optical caustics
          float caustic = pow(sin(aspectUV.x * 16.0 + aspectUV.y * 16.0 + t * 2.2) * 0.5 + 0.5, 7.0) * 0.28 * u_intensity;

          color = prismCol + flare * laserCyan * 0.5 + caustic * laserPink * 0.4;
        }

        // =========================================================================
        // 4. RADIOACTIVE CYBER-NANITE (EXPERT-TIER BIO-QUANTUM)
        // =========================================================================
        else if (u_shader_id == 3) {
          // Autonomous nanite fluid swirl
          float swirlAngle = snoise(aspectUV * 2.5 + t * 0.3) * PI * 1.5;
          vec2 fluidDisp = vec2(cos(swirlAngle), sin(swirlAngle)) * 0.03 * u_intensity;

          vec2 imgUV = getCoverUV(uv + fluidDisp, u_resolution, u_image_res);
          vec3 base = sampleClamped(imgUV).rgb;
          float ink = 1.0 - dot(base, vec3(0.299, 0.587, 0.114));

          // Deep emerald-obsidian bio-quantum substrate
          vec3 substrateBg = mix(vec3(0.015, 0.035, 0.025), vec3(0.03, 0.08, 0.05), length(aspectUV));

          // Procedural Orthogonal PCB Micro-Circuit Traces
          vec2 pcbGrid = abs(fract(aspectUV * 22.0) - 0.5);
          float trace = smoothstep(0.035, 0.015, min(pcbGrid.x, pcbGrid.y));

          // High-frequency dielectric breakdown / electric arc discharge
          float arcNoise = abs(fbm(aspectUV * 6.0 + vec2(t * 2.5, -t * 1.8)));
          float electricArc = pow(1.0 - arcNoise, 14.0) * 2.5 * u_intensity;

          // Glowing data packets traversing circuits
          float packet = sin(aspectUV.x * 45.0 + t * 8.0) * sin(aspectUV.y * 45.0 - t * 6.0);
          float packetGlow = smoothstep(0.7, 0.98, packet) * trace;

          // Bioluminescent Palette
          vec3 toxicEmerald = vec3(0.0, 1.0, 0.55);
          vec3 quantumCyan   = vec3(0.0, 0.88, 1.0);
          vec3 arcGold       = vec3(1.0, 0.92, 0.35);

          // Deep ink contours become active radioactive cores
          vec3 inkCore = mix(substrateBg, vec3(0.01, 0.02, 0.015), ink);
          inkCore += ink * toxicEmerald * 1.4;

          // Circuit and arc lighting
          vec3 circuitGlow = trace * quantumCyan * 0.45 + packetGlow * toxicEmerald * 1.8;
          vec3 lightning = electricArc * arcGold * (ink * 1.5 + 0.3);

          color = inkCore + circuitGlow + lightning;
          // Subtle chromatic fringing along high energy edges
          color.rb += vec2(electricArc * 0.25, -electricArc * 0.15);
        }

        // =========================================================================
        // 5. VOLUMETRIC HOLO-MATRIX (EXPERT-TIER 3D HOLOGRAPHIC PROJECTION)
        // =========================================================================
        else if (u_shader_id == 4) {
          // Autonomous 3D perspective gimbal wobble
          vec2 holoUV = uv;
          vec2 center = aspectUV;

          // Sweeping vertical laser scan-cone beam
          float scanBeamY = fract(t * 0.3);
          float scanDist = abs(uv.y - scanBeamY);
          float scanBeam = smoothstep(0.08, 0.0, scanDist);

          // Multi-layer volumetric 3D parallax depth reconstruction
          vec3 holoColor = vec3(0.0);
          float numLayers = 5.0;

          vec3 laserCyan = vec3(0.0, 0.95, 1.0);
          vec3 laserPink = vec3(1.0, 0.08, 0.65);

          for (int i = 0; i < 5; i++) {
            float depth = (float(i) - 2.0) * 0.018 * u_intensity;
            // 3D parallax offset driven by time orbit
            vec2 parallax = vec2(sin(t * 0.7 + float(i)), cos(t * 0.5 + float(i))) * depth;

            vec2 lUV = getCoverUV(holoUV + parallax, u_resolution, u_image_res);
            vec3 lCol = sampleClamped(lUV).rgb;
            float lInk = 1.0 - dot(lCol, vec3(0.299, 0.587, 0.114));

            vec3 depthHue = mix(laserCyan, laserPink, float(i) / 4.0);
            holoColor += lInk * depthHue * (0.35 + float(i) * 0.08);
          }

          // Hexagonal Holographic Wireframe Matrix Mesh
          vec4 h = hexGrid(aspectUV * 26.0);
          float hexEdge = smoothstep(0.08, 0.02, abs(length(h.xy) - 0.45));

          // Holographic CRT line raster
          float holoRaster = sin(gl_FragCoord.y * 1.8) * 0.15 + 0.85;

          // Holographic beam flicker & quantum laser speckle
          float speckle = hash21(gl_FragCoord.xy + fract(t * 20.0)) * 0.12;
          float beamFlicker = (sin(t * 60.0) * 0.05 + 0.95);

          // Tactical cyber reticle corner brackets
          vec2 reticle = abs(fract(aspectUV * 4.0) - 0.5);
          float bracket = step(0.48, max(reticle.x, reticle.y)) * step(max(reticle.x, reticle.y), 0.495) * 0.25;

          // Composite Hologram
          vec3 holoDarkVoid = vec3(0.015, 0.018, 0.028);
          color = holoDarkVoid + holoColor * holoRaster * beamFlicker;
          color += hexEdge * laserCyan * (0.35 + scanBeam * 1.2);
          color += scanBeam * laserPink * 0.65;
          color += bracket * laserCyan;
          color += speckle * laserCyan;
        }

        // Analog film grain & vignette for unified cinematic contrast
        float vignette = smoothstep(1.5, 0.45, length(aspectUV));
        float grain = (hash21(gl_FragCoord.xy + fract(t * 1.5)) - 0.5) * 0.03;
        color = color * vignette + grain;

        gl_FragColor = vec4(color, 1.0);
      }
    `

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type)!
      glCtx.shaderSource(shader, source)
      glCtx.compileShader(shader)
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader error:', glCtx.getShaderInfoLog(shader))
        glCtx.deleteShader(shader)
        return null
      }
      return shader
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
    const uIntensity = glCtx.getUniformLocation(program, 'u_intensity')
    const uSpeed = glCtx.getUniformLocation(program, 'u_speed')
    const uChroma = glCtx.getUniformLocation(program, 'u_chroma')

    // Texture
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

    // Keyboard navigation (no mouse interaction with the shader!)
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key >= '1' && e.key <= '5') {
        currentShader = parseInt(e.key) - 1
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        currentShader = (currentShader + 1) % shadersList.length
      } else if (e.key.toLowerCase() === 'h') {
        showHud = !showHud
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvasEl.width = window.innerWidth * dpr
      canvasEl.height = window.innerHeight * dpr
      glCtx.viewport(0, 0, canvasEl.width, canvasEl.height)
    }

    window.addEventListener('resize', resize)
    resize()

    // Render loop
    let animId: number
    const startTime = performance.now()
    let lastCycleTime = performance.now()

    function render(now: number) {
      const elapsed = (now - startTime) / 1000.0

      if (autoCycle && now - lastCycleTime > 7000) {
        currentShader = (currentShader + 1) % shadersList.length
        lastCycleTime = now
      }

      glCtx.uniform2f(uResolution, canvasEl.width, canvasEl.height)
      glCtx.uniform2f(uImageRes, 752.0, 564.0)
      glCtx.uniform1f(uTime, elapsed)
      glCtx.uniform1i(uShaderId, currentShader)
      glCtx.uniform1f(uIntensity, glitchIntensity)
      glCtx.uniform1f(uSpeed, glitchSpeed)
      glCtx.uniform1f(uChroma, chromaticSpread)

      glCtx.drawArrays(glCtx.TRIANGLES, 0, 6)
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', resize)
    }
  })
</script>

<div class="glitch-page">
  <!-- Autonomous WebGL Canvas (Zero mouse interference) -->
  <canvas bind:this={canvasEl} class="gl-canvas"></canvas>

  <!-- Top Navigation & Brand Header -->
  <header class="top-nav">
    <div class="nav-left">
      <a href="/" class="back-link" title="Return to Liquid Ink Home">
        ← /liquid
      </a>
      <div class="page-title">
        <span class="cyber-badge">CYBER // GLITCH 2026</span>
        <h1>tasteink</h1>
      </div>
    </div>

    <div class="nav-right">
      <FluidCollectionLink />
      <button
        class="icon-btn"
        class:active={autoCycle}
        title="Auto Cycle Shaders"
        onclick={() => (autoCycle = !autoCycle)}
      >
        {autoCycle ? '⏹ Auto ON' : '▶ Auto Cycle'}
      </button>
    </div>
  </header>

  <!-- Side Shader Selector Palette -->
  {#if showHud}
    <div class="shader-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">5 PREMIUM SHADERS</span>
        <span class="shortcut-hint">Keys [1–5]</span>
      </div>

      <div class="shader-list">
        {#each shadersList as s}
          <button
            class="shader-item"
            class:active={currentShader === s.id}
            onclick={() => selectShader(s.id)}
          >
            <div class="item-top">
              <span class="item-num">0{s.id + 1}</span>
              <span class="item-tag">{s.tag}</span>
            </div>
            <div class="item-name">{s.name}</div>
            <div class="item-category">{s.category}</div>
            <div class="item-desc">{s.desc}</div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Bottom Controls Deck -->
    <div class="bottom-deck">
      <div class="deck-sliders">
        <div class="slider-col">
          <div class="slider-label">
            <span>EFFECT INTENSITY</span>
            <span class="slider-num">{glitchIntensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            bind:value={glitchIntensity}
            class="cyber-slider cyan"
          />
        </div>

        <div class="slider-col">
          <div class="slider-label">
            <span>ANIMATION VELOCITY</span>
            <span class="slider-num">{glitchSpeed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            bind:value={glitchSpeed}
            class="cyber-slider emerald"
          />
        </div>

        <div class="slider-col">
          <div class="slider-label">
            <span>CHROMATIC DISPERSION</span>
            <span class="slider-num">{chromaticSpread.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="3.0"
            step="0.1"
            bind:value={chromaticSpread}
            class="cyber-slider pink"
          />
        </div>
      </div>

      <div class="deck-hints">
        <span>Autonomous mathematical physics (no mouse distortion)</span>
        <span>•</span>
        <span>Space: next shader</span>
        <span>•</span>
        <span>H: hide HUD</span>
      </div>
    </div>
  {:else}
    <button class="show-hud-btn" onclick={() => (showHud = true)}>
      ⚡ Show Controls (H)
    </button>
  {/if}
</div>

<style>
  .glitch-page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #020204;
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
    cursor: default;
    touch-action: none;
  }

  /* Top Navigation */
  .top-nav {
    position: absolute;
    top: 1.25rem;
    left: 1.5rem;
    right: 1.5rem;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    pointer-events: none;
  }

  .nav-left, .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
    pointer-events: auto;
  }

  .back-link {
    padding: 7px 14px;
    border-radius: 10px;
    background: rgba(10, 14, 22, 0.85);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #38bdf8;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    transition: all 0.2s ease;
  }

  .back-link:hover {
    background: rgba(14, 165, 233, 0.2);
    border-color: #38bdf8;
    transform: translateX(-2px);
  }

  .page-title {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cyber-badge {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #00ff88;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #ffffff;
    text-shadow: 0 0 16px rgba(0, 255, 136, 0.4);
  }

  .icon-btn {
    padding: 7px 14px;
    border-radius: 10px;
    background: rgba(10, 14, 22, 0.85);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #cbd5e1;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
  }

  .icon-btn.active {
    border-color: #00ff88;
    color: #00ff88;
    background: rgba(0, 255, 136, 0.15);
    box-shadow: 0 0 14px rgba(0, 255, 136, 0.3);
  }

  /* Left/Side Shader Palette */
  .shader-sidebar {
    position: absolute;
    top: 5.5rem;
    left: 1.5rem;
    bottom: 8.5rem;
    width: 340px;
    z-index: 20;
    background: rgba(8, 11, 16, 0.85);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-16px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .sidebar-title {
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #00ff88;
  }

  .shortcut-hint {
    font-size: 0.68rem;
    color: #64748b;
    font-family: monospace;
  }

  .shader-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .shader-item {
    text-align: left;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .shader-item:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateX(4px);
  }

  .shader-item.active {
    background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(6, 182, 212, 0.18));
    border-color: #00ff88;
    box-shadow: 0 4px 20px -2px rgba(0, 255, 136, 0.35);
  }

  .item-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-num {
    font-size: 0.72rem;
    font-family: monospace;
    font-weight: 800;
    color: #64748b;
  }

  .shader-item.active .item-num {
    color: #00ff88;
  }

  .item-tag {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    padding: 2px 7px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
  }

  .shader-item.active .item-tag {
    background: rgba(0, 255, 136, 0.3);
    color: #00ff88;
  }

  .item-name {
    font-size: 0.92rem;
    font-weight: 800;
    color: #ffffff;
  }

  .item-category {
    font-size: 0.7rem;
    font-weight: 600;
    color: #38bdf8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .item-desc {
    font-size: 0.74rem;
    color: #94a3b8;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Bottom Controls Deck */
  .bottom-deck {
    position: absolute;
    bottom: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    z-index: 20;
    padding: 1rem 1.5rem;
    border-radius: 20px;
    background: rgba(8, 11, 16, 0.85);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .deck-sliders {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .slider-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #94a3b8;
  }

  .slider-num {
    font-family: monospace;
    color: #ffffff;
  }

  .cyber-slider {
    width: 100%;
    cursor: pointer;
  }

  .cyber-slider.cyan { accent-color: #06b6d4; }
  .cyber-slider.emerald { accent-color: #00ff88; }
  .cyber-slider.pink { accent-color: #ec4899; }

  .deck-hints {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 0.72rem;
    color: #64748b;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 0.6rem;
  }

  .show-hud-btn {
    position: absolute;
    bottom: 1.5rem;
    left: 1.5rem;
    z-index: 20;
    padding: 10px 18px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.88);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    transition: all 0.2s ease;
  }

  .show-hud-btn:hover {
    background: rgba(30, 41, 59, 0.95);
    border-color: #00ff88;
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(0, 255, 136, 0.35);
  }

  @media (max-width: 900px) {
    .shader-sidebar {
      width: 280px;
    }
  }

  @media (max-width: 680px) {
    .shader-sidebar {
      display: none;
    }
  }
</style>
