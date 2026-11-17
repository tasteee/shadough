<script lang="ts">
  interface Props {
    label: string
    value: number
    min?: number
    max?: number
    step?: number
    unit?: string
    color?: string
    onChange?: (val: number) => void
  }

  let {
    label,
    value = $bindable(),
    min = 0,
    max = 1,
    step = 0.01,
    unit = '',
    color = '#38bdf8',
    onChange,
  }: Props = $props()

  let isDragging = $state(false)
  let startY = 0
  let startValue = 0

  // Calculate angle for knob pointer: -135deg to +135deg (270deg sweep)
  let fraction = $derived(Math.max(0, Math.min(1, (value - min) / (max - min || 1))))
  let angle = $derived(-135 + fraction * 270)

  function onPointerDown(e: MouseEvent | TouchEvent) {
    isDragging = true
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
    startY = clientY
    startValue = value

    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('touchmove', onPointerMove, { passive: false })
    window.addEventListener('mouseup', onPointerUp)
    window.addEventListener('touchend', onPointerUp)
  }

  function onPointerMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return
    if (e.cancelable) e.preventDefault()

    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
    const deltaY = startY - clientY // moving up increases value
    const range = max - min
    const sensitivity = 150 // pixels to traverse full range

    let next = startValue + (deltaY / sensitivity) * range
    next = Math.max(min, Math.min(max, next))

    if (step > 0) {
      next = Math.round(next / step) * step
    }

    value = next
    if (onChange) onChange(value)
  }

  function onPointerUp() {
    isDragging = false
    window.removeEventListener('mousemove', onPointerMove)
    window.removeEventListener('touchmove', onPointerMove)
    window.removeEventListener('mouseup', onPointerUp)
    window.removeEventListener('touchend', onPointerUp)
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    const dir = e.deltaY < 0 ? 1 : -1
    const delta = (dir * (max - min)) / 40
    let next = Math.max(min, Math.min(max, value + delta))
    if (step > 0) {
      next = Math.round(next / step) * step
    }
    value = next
    if (onChange) onChange(value)
  }
</script>

<div
  class="knob-container"
  class:dragging={isDragging}
  role="slider"
  tabindex="0"
  aria-label={label}
  aria-valuenow={value}
  aria-valuemin={min}
  aria-valuemax={max}
  onmousedown={onPointerDown}
  ontouchstart={onPointerDown}
  onwheel={onWheel}
>
  <div class="knob-dial">
    <svg viewBox="0 0 44 44" class="dial-svg">
      <!-- Background Arc -->
      <circle
        cx="22"
        cy="22"
        r="18"
        class="track"
        stroke-dasharray="84.82 113.1"
        stroke-dashoffset="-28.27"
      />
      <!-- Active Value Arc -->
      <circle
        cx="22"
        cy="22"
        r="18"
        class="fill"
        style="stroke: {color}; stroke-dasharray: {fraction * 84.82} 113.1;"
        stroke-dashoffset="-28.27"
      />
    </svg>

    <!-- Dial Body & Indicator Tick -->
    <div
      class="dial-cap"
      style="transform: rotate({angle}deg);"
    >
      <div class="pointer-tick" style="background: {color};"></div>
    </div>
  </div>

  <div class="knob-meta">
    <span class="knob-label">{label}</span>
    <span class="knob-val" style="color: {color};">
      {value.toFixed(step < 0.1 ? 2 : 1)}{unit}
    </span>
  </div>
</div>

<style>
  .knob-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: ns-resize;
    user-select: none;
    outline: none;
  }

  .knob-dial {
    position: relative;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dial-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotate(90deg);
  }

  .track {
    fill: none;
    stroke: rgba(255, 255, 255, 0.15);
    stroke-width: 3;
    stroke-linecap: round;
  }

  .fill {
    fill: none;
    stroke-width: 3.2;
    stroke-linecap: round;
    transition: stroke-dasharray 0.05s linear;
  }

  .dial-cap {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #14161f;
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
    position: relative;
    display: flex;
    justify-content: center;
    transition: transform 0.05s linear;
  }

  .knob-container.dragging .dial-cap {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
  }

  .pointer-tick {
    position: absolute;
    top: 2px;
    width: 2px;
    height: 7px;
    border-radius: 1px;
  }

  .knob-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
  }

  .knob-label {
    font-size: 0.68rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .knob-val {
    font-size: 0.74rem;
    font-family: monospace;
    font-weight: 700;
  }
</style>
