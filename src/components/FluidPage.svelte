<script lang="ts">
  import * as Svelte from 'svelte'
  import * as Shaders from 'shaders/svelte'
  import * as FluidPresets from '../lib/fluidPresets'
  import * as FluidShader from '../lib/fluidShader'
  import FluidPresetButton from './FluidPresetButton.svelte'
  import '../base.css'
  import './FluidPage.css'

  let selectedIndex = $state(0)
  let speed = $state(1)
  let strength = $state(1)
  let isPaused = $state(false)
  let isUnavailable = $state(false)
  let isReady = $state(false)
  let isOriginal = $state(false)
  let sourceUrl = $state('/tasteink-fluid.png')
  let sourceChoice = $state('logo')
  let uploadError = $state('')
  let uploadedUrl = $state<string | undefined>(undefined)
  const selectedPreset = $derived(FluidPresets.fluidPresets[selectedIndex])
  const selectedShader = $derived(FluidShader.fluidShaders[selectedIndex])
  const animationSpeed = $derived(isPaused ? 0 : speed)
  const playbackLabel = $derived(
    isPaused ? 'Play animation' : 'Pause animation'
  )
  const playbackSymbol = $derived(isPaused ? '▷' : 'Ⅱ')
  const speedLabel = $derived(`${speed.toFixed(2)}×`)
  const strengthLabel = $derived(`${strength.toFixed(2)}×`)
  const numberLabel = $derived(String(selectedIndex + 1).padStart(2, '0'))
  const statusLabel = $derived(isPaused ? 'Still frame' : 'In motion')
  const hasLoadingState = $derived(!isReady && !isUnavailable)
  const originalAmount = $derived(isOriginal ? 1 : 0)
  const originalLabel = $derived(
    selectedPreset.isSculpture ? 'Base geometry' : 'Original image'
  )
  const sourceLabel = $derived(
    selectedPreset.isSculpture ? 'Procedural geometry' : 'Source-driven effect'
  )
  const isEffect = $derived(!isOriginal)
  const hasSourceControls = $derived(!selectedPreset.isSculpture)
  const transformationMaximum = $derived(selectedPreset.isSculpture ? 1 : 2)

  const handleSelect = (index: number) => {
    selectedIndex = index
    isOriginal = false
    strength = 1
    return
  }
  const handleTogglePlayback = () => {
    isPaused = !isPaused
    return
  }
  const handleReset = () => {
    speed = 1
    strength = 1
    return
  }
  const handleReady = () => {
    isReady = true
    return
  }
  const handleUnavailable = () => {
    isUnavailable = true
    return
  }
  const handleShowOriginal = () => {
    isOriginal = true
    return
  }
  const handleShowEffect = () => {
    isOriginal = false
    return
  }
  const handleSourceChange = () => {
    uploadError = ''
    if (sourceChoice === 'logo') {
      sourceUrl = '/tasteink-fluid.png'
      return
    }
    if (sourceChoice === 'type') {
      sourceUrl = '/studio-type.svg'
      return
    }
    if (sourceChoice === 'shapes') {
      sourceUrl = '/studio-shapes.svg'
      return
    }
    if (uploadedUrl) sourceUrl = uploadedUrl
    return
  }
  const handleUpload = async (event: Event) => {
    const input = event.currentTarget
    const isInput = input instanceof HTMLInputElement
    if (!isInput) return
    const selectedFile = input.files?.[0]
    if (!selectedFile) return
    const isImage = selectedFile.type.startsWith('image/')
    if (!isImage) {
      uploadError = 'Choose an image file.'
      return
    }
    const candidateUrl = URL.createObjectURL(selectedFile)
    const candidateImage = new Image()
    candidateImage.src = candidateUrl
    try {
      await candidateImage.decode()
    } catch (imageError) {
      URL.revokeObjectURL(candidateUrl)
      uploadError =
        'This image could not be decoded. Try a PNG, JPEG, or WebP file.'
      console.error('Source image decoding failed', imageError)
      return
    }
    if (uploadedUrl) URL.revokeObjectURL(uploadedUrl)
    uploadedUrl = candidateUrl
    sourceUrl = candidateUrl
    sourceChoice = 'upload'
    uploadError = ''
    return
  }
  Svelte.onMount(() => {
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )
    isPaused = motionPreference.matches
    return
  })
  Svelte.onDestroy(() => {
    if (uploadedUrl) URL.revokeObjectURL(uploadedUrl)
    return
  })
</script>

<svelte:head>
  <title>Fluid — Shader experiments</title>
  <meta
    name="description"
    content="Fifteen shader experiments: fractal sculptures, volumetric reconstruction, fractured images, kinetic geometry, and source comparisons."
  />
</svelte:head>

<div class="fluidPage">
  <header class="fluidHeader">
    <a class="fluidWordmark" href="/"
      >taste<span>ink</span><span class="fluidBrandDivider">/</span><span
        class="fluidBrandLabel">Shader lab</span
      ></a
    >
    <nav class="fluidNavigation" aria-label="Shader collections">
      <a href="/">Liquid ink</a><a href="/glitch">Glitch</a><a
        href="/fluid"
        aria-current="page">Fluid <span>15</span></a
      >
    </nav>
  </header>
  <div class="fluidIntroduction">
    <div>
      <p class="fluidEyebrow">Volume 02 / Beyond the surface</p>
      <h1>Fluid<span class="fluidTitleDot">.</span></h1>
    </div>
    <p class="fluidIntroText">
      15 experiments in transformation.<br />Break the image. Build a world.
    </p>
  </div>
  <main class="fluidWorkspace">
    <aside class="fluidLibrary" aria-label="Shader experiments">
      <div class="fluidLibraryHeading">
        <h2>The collection</h2>
        <span>01 — 15</span>
      </div>
      <div class="fluidPresetList">
        {#each FluidPresets.fluidPresets as preset, presetIndex}
          {@const isSelected = selectedIndex === presetIndex}
          <FluidPresetButton
            {preset}
            index={presetIndex}
            {isSelected}
            onSelect={handleSelect}
          />
        {/each}
      </div>
      <p class="fluidLibraryFootnote">07 sculptures / 08 source effects</p>
    </aside>
    <section class="fluidViewer" aria-label="Selected shader experiment">
      <div class="fluidViewerToolbar">
        <span class="fluidSourceLabel">{sourceLabel}</span>
        <div class="fluidComparison" aria-label="Compare source and effect">
          <button
            class:isActive={isOriginal}
            aria-pressed={isOriginal}
            onclick={handleShowOriginal}>{originalLabel}</button
          >
          <button
            class:isActive={isEffect}
            aria-pressed={isEffect}
            onclick={handleShowEffect}>Effect</button
          >
        </div>
      </div>
      <div
        class="fluidStage"
        role="img"
        aria-label={selectedPreset.description}
      >
        {#if isUnavailable}<img
            class="fluidFallback"
            src={sourceUrl}
            alt="Unprocessed source"
          />{/if}
        <Shaders.Shader
          class="fluidCanvas"
          disableTelemetry
          colorSpace="srgb"
          onready={handleReady}
          onunavailable={handleUnavailable}
        >
          <Shaders.ImageTexture url={sourceUrl} objectFit="cover" />
          <Shaders.CustomShader
            src={selectedShader}
            speed={animationSpeed}
            {strength}
            original={originalAmount}
          />
        </Shaders.Shader>
        <div class="fluidStageCaption">
          <span>{selectedPreset.family}</span><span>{statusLabel}</span>
        </div>
        {#if hasLoadingState}<span class="fluidStatus" role="status"
            >Preparing fluid study…</span
          >{/if}
        {#if isUnavailable}<span class="fluidStatus" role="status"
            >Static preview · WebGPU is unavailable in this browser.</span
          >{/if}
      </div>
      <div class="fluidStudyDetails" aria-live="polite">
        <div class="fluidStudyTitle">
          <span>{numberLabel}</span>
          <h2>{selectedPreset.name}</h2>
        </div>
        <p>{selectedPreset.description}</p>
      </div>
      <div class="fluidLearningPanel">
        <details class="fluidTechnique">
          <summary>How this works</summary>
          <p>{selectedPreset.technique}</p>
        </details>
        {#if hasSourceControls}
          <div class="fluidSourceControls">
            <label for="fluidSource">Source</label>
            <select
              id="fluidSource"
              bind:value={sourceChoice}
              onchange={handleSourceChange}
            >
              <option value="logo">Your logo</option><option value="type"
                >Typography</option
              ><option value="shapes">Shapes</option>
              {#if uploadedUrl}<option value="upload">Uploaded image</option
                >{/if}
            </select>
            <label class="fluidUpload"
              >Upload image<input
                type="file"
                accept="image/*"
                onchange={handleUpload}
              /></label
            >
          </div>
        {/if}
        {#if uploadError}<p class="fluidUploadError" role="alert">
            {uploadError}
          </p>{/if}
      </div>
      <div class="fluidControls">
        <button
          class="fluidPlayback"
          onclick={handleTogglePlayback}
          aria-label={playbackLabel}
          aria-pressed={isPaused}
          disabled={isUnavailable}
          ><span aria-hidden="true">{playbackSymbol}</span
          >{playbackLabel}</button
        >
        <label class="fluidSlider"
          ><span>Speed <output>{speedLabel}</output></span><input
            aria-label="Animation speed"
            type="range"
            min="0.2"
            max="2"
            step="0.05"
            bind:value={speed}
            disabled={isUnavailable}
          /></label
        >
        <label class="fluidSlider"
          ><span>Transformation <output>{strengthLabel}</output></span><input
            aria-label="Transformation"
            type="range"
            min="0"
            max={transformationMaximum}
            step="0.05"
            bind:value={strength}
            disabled={isUnavailable}
          /></label
        >
        <button class="fluidReset" onclick={handleReset}>Reset</button>
      </div>
    </section>
  </main>
  <footer class="fluidFooter">
    <span>TASTEINK / SHADER EXPERIMENTS</span><span
      >Autonomous motion · No pointer input</span
    >
  </footer>
</div>
