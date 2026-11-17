import * as ShaderStandard from 'shaders/std'
import * as FluidPresets from './fluidPresets'
import * as Sculptures from './experiments/sculptures'
import * as SourceEffects from './experiments/sourceEffects'
import type * as FluidTypes from './fluidPresets'

const getShaderBody = (preset: FluidTypes.FluidPresetT): string => {
  const sculpture = Sculptures.sculptures[preset.key]
  if (sculpture) return Sculptures.buildSculptureBody(sculpture)

  const sourceBody = SourceEffects.sourceEffects[preset.key]
  if (sourceBody) return sourceBody

  throw new Error(`Missing shader implementation: ${preset.key}`)
}

const buildFluidShader = (preset: FluidTypes.FluidPresetT) => {
  const shaderBody = getShaderBody(preset)
  const effect = ShaderStandard.wgsl({ body: shaderBody })
  const definition = ShaderStandard.defineShader({
    name: `StudioExperiment_${preset.key}`,
    animatedTime: { speed: 'speed' },
    props: {
      speed: { default: 1 },
      strength: { default: 1 },
      original: { default: 0 }
    },
    effect
  })
  return definition
}

export const fluidShaders = FluidPresets.fluidPresets.map(buildFluidShader)
