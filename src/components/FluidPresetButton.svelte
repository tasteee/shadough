<script lang="ts">
  import type * as FluidTypes from '../lib/fluidPresets'
  import './FluidPresetButton.css'

  type FluidPresetButtonPropsT = {
    preset: FluidTypes.FluidPresetT
    index: number
    isSelected: boolean
    onSelect: (index: number) => void
  }

  const props: FluidPresetButtonPropsT = $props()
  const numberLabel = $derived(String(props.index + 1).padStart(2, '0'))
  const handleSelect = () => {
    props.onSelect(props.index)
    return
  }
</script>

<button
  class="fluidPresetButton"
  class:isSelected={props.isSelected}
  aria-pressed={props.isSelected}
  onclick={handleSelect}
>
  <span class="fluidPresetNumber">{numberLabel}</span>
  <span class="fluidPresetName">{props.preset.name}</span>
  <span class="fluidPresetSwatch" style:background-color={props.preset.color}
  ></span>
</button>
