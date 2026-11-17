<script lang="ts">
  import {
    Shader,
    Blur,
    Checkerboard,
    DiamondWipe,
    ErosionNoise,
    FallingLines,
    ImageTexture,
    ParticleField,
    Saturation,
    Solarize,
    TiltShift,
    VHS,
  } from 'shaders/svelte'

  interface Props {
    enableParticles?: boolean
    enableVHS?: boolean
    enableFallingLines?: boolean
    erosionScale?: number
    erosionContrast?: number
    erosionBalance?: number
    erosionOpacity?: number
  }

  let {
    enableParticles = false,
    enableVHS = false,
    enableFallingLines = false,
    erosionScale = 4.7,
    erosionContrast = 1.8,
    erosionBalance = -0.45,
    erosionOpacity = 0.85,
  }: Props = $props()
</script>

<div class="drifting-reef-container">
  <Shader class="w-full h-full">
    <ImageTexture
      id="idmw7mhmidey3g6redd"
      blendMode="multiply"
      boundingBox={{
        x: { unit: 'uv', value: -0.0001 },
        y: { unit: 'uv', value: -0.0032 },
        width: { unit: 'px', value: 1912 },
        height: { unit: 'px', value: 1437 },
        origin: 'center',
      }}
      url="/tasteink.jpg"
      visible={true}
    />
    <ErosionNoise
      balance={erosionBalance}
      blendMode="overlay"
      contrast={erosionContrast}
      maskSource="idmw7mhmidey3g6redd"
      opacity={erosionOpacity}
      scale={erosionScale}
      seed={74}
      stops={[
        { color: '#fa2f6c', position: 0 },
        { color: '#1dbac4', position: 1 },
      ]}
      visible={true}
    />
    <ParticleField
      blendMode="screen"
      count={39000}
      cursorMode="pull"
      cursorRadius={0.18}
      cursorStrength={0.39}
      depth={0.95}
      depthShading={0.78}
      depthSource="luminanceInverted"
      maskSource="idmw7mhmidey3g6redd"
      offsetX={0.01}
      particleSize={1.18}
      visible={enableParticles}
      wobble={0.58}
      zoom={1.07}
    />
    <VHS
      blendMode="screen"
      maskSource="idmw7mhmidey3g6redd"
      scanlineNoise={0.02}
      smear={1.92}
      speed={0.3}
      visible={enableVHS}
      wobble={1.42}
    />
    <FallingLines
      angle={119}
      balance={0.59}
      colorA="#3afa0aad"
      colorB="#e6074a00"
      colorSpace="oklch"
      density={16}
      maskSource="idmw7mhmidey3g6redd"
      maskType="luminanceInverted"
      rounding={0.11}
      speed={0.51}
      speedVariance={0.96}
      strokeWidth={0.54}
      trailLength={0.54}
      visible={enableFallingLines}
    />
  </Shader>
</div>

<style>
  .drifting-reef-container {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
</style>
