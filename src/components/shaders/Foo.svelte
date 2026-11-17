<script lang="ts">
  // @ts-nocheck
  import {
    Shader,
    AngularBlur,
    ConcentricSpin,
    FlutedGlass,
    Heart,
    Holographic,
    IsometricCubes,
    MeshGradient,
    Text,
  } from 'shaders/svelte'

  interface Props {
    class?: string
    style?: string
    heartCenter?: any
    heartRadius?: number
    heartVisible?: boolean
    cubesVisible?: boolean
    cubesColorA?: string
    cubesColorB?: string
    flutedGlassRefraction?: number
    flutedGlassFrequency?: number
    flutedGlassAngle?: number
    flutedGlassSpeed?: number
    meshGradientSpeed?: number
    spinIntensity?: number
    spinSpeed?: number
    blurIntensity?: number
    textVisible?: boolean
    textString?: string
    textCenter?: any
    textMaskMode?: boolean
    textMaskId?: string
    [key: string]: any
  }

  let {
    class: className = '',
    style = '',
    heartCenter = { x: 0.51, y: 0.45 },
    heartRadius = 0.3514,
    heartVisible = true,
    cubesVisible = true,
    cubesColorA = '#fa168a',
    cubesColorB = '#ff9419',
    flutedGlassRefraction = 2.65,
    flutedGlassFrequency = 4,
    flutedGlassAngle = 195,
    flutedGlassSpeed = 0.7,
    meshGradientSpeed = 1.6,
    spinIntensity = 97,
    spinSpeed = 0.3,
    blurIntensity = 68,
    textVisible = false,
    textString = 'meow meow\nbaby pup\nmeowsers',
    textCenter = { x: 0.2, y: 0.36 },
    textMaskMode = false,
    textMaskId = '',
    ...rest
  }: Props = $props()
</script>

<Shader colorSpace="srgb" toneMapping="neutral" class={className} {style} {...rest}>
  <Text
    id={textMaskId || undefined}
    center={textCenter}
    text={textString}
    visible={textVisible} />
  <MeshGradient
    blendMode="normal-oklab"
    count={3}
    drift={0.05}
    seed={48}
    smoothness={3.41}
    speed={meshGradientSpeed}
    stops={[
      { color: '#0f1712', position: 0.2018 },
      { color: '#edf7f5', position: 0.8924 },
      { color: '#2c97de', position: 1 }
    ]}
    swirl={-0.84}
    variation={0.9}
    visible={true}
    wrapping={0.65}
    maskSource={textMaskMode && textMaskId ? textMaskId : undefined} />
  <IsometricCubes
    cells={2}
    colorA={cubesColorA}
    colorB={cubesColorB}
    colorVariation={0.81}
    lineColor="#e5a8f0"
    maskSource="idmw7jutl8mtnjsl35b"
    rotation={91}
    softness={0.74}
    thickness={2.7}
    visible={cubesVisible} />
  <AngularBlur
    id="idmw7iwfre5uyfnkoxj"
    falloff={0.44}
    highlights={0.32}
    intensity={blurIntensity}
    jitter={0.5}
    visible={true} />
  <Heart
    blendMode="linearDodge"
    center={heartCenter}
    color="#e9edf0"
    radius={heartRadius}
    strokeColor="#06324f"
    strokePosition="inside"
    strokeThickness={0.015}
    visible={heartVisible} />
  <FlutedGlass
    aberration={0.39}
    angle={flutedGlassAngle}
    edges="stretch"
    frequency={flutedGlassFrequency}
    highlight={1.72}
    highlightColor="#ebeff0"
    highlightSoftness={0.99}
    lightAngle={58}
    refraction={flutedGlassRefraction}
    shape="waves"
    softness={0.67}
    speed={flutedGlassSpeed}
    visible={true} />
  <Holographic
    id="idmw7jutl8mtnjsl35b"
    center={{
      x: 0.09,
      y: 0.72
    }}
    crinkle={0.72}
    crinkleScale={1.06}
    edgeSoftness={0.35}
    hueShift={211}
    rotation={15}
    roughness={0.03}
    scale={2.66}
    shape={{
      type: 'circleSDF',
      radius: 0.35
    }}
    shapeType="circleSDF"
    sparkle={0.23}
    speed={1.56}
    visible={false} />
  <ConcentricSpin
    intensity={spinIntensity}
    maskSource="idmw7iwfre5uyfnkoxj"
    rings={29}
    seed={50}
    smoothness={0.27}
    speed={spinSpeed}
    speedRandomness={0.03} />
</Shader>
