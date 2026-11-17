<script lang="ts">
  import * as Svelte from 'svelte'
  import GradientPage from './components/GradientPage.svelte'
  import GirlyPage from './components/GirlyPage.svelte'
  import DriftingReefPage from './components/DriftingReefPage.svelte'
  import SpacePage from './components/SpacePage.svelte'
  import OrganicPage from './components/OrganicPage.svelte'
  import LockedPage from './components/LockedPage.svelte'
  import GlitchPage from './components/GlitchPage.svelte'
  import LiquidInkPage from './components/LiquidInkPage.svelte'
  import FluidPage from './components/FluidPage.svelte'

  let currentPath = $state(
    typeof window !== 'undefined' ? window.location.pathname : '/gradient'
  )

  const isGradientPage = $derived(
    currentPath === '/gradient' || currentPath === '/gradient/' ||
    currentPath === '/3d-gradient' || currentPath === '/3d-gradient/' ||
    currentPath === '/'
  )
  const isGirlyPage = $derived(currentPath === '/girly' || currentPath === '/girly/')
  const isReefPage = $derived(
    currentPath === '/reef' || currentPath === '/reef/' ||
    currentPath === '/drifting-reef' || currentPath === '/drifting-reef/'
  )
  const isSpacePage = $derived(currentPath === '/space' || currentPath === '/space/')
  const isLockedPage = $derived(currentPath === '/locked' || currentPath === '/locked/')
  const isOrganicPage = $derived(currentPath === '/organic' || currentPath === '/organic/')
  const isGlitchPage = $derived(currentPath === '/glitch' || currentPath === '/glitch/')
  const isFluidPage = $derived(currentPath === '/fluid' || currentPath === '/fluid/')
  const isLiquidPage = $derived(currentPath === '/liquid' || currentPath === '/liquid/')

  Svelte.onMount(() => {
    const onPopState = () => {
      currentPath = window.location.pathname
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  })

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path)
    currentPath = path
  }
</script>

{#if isGradientPage}
  <GradientPage onNavigate={navigateTo} />
{:else if isGirlyPage}
  <GirlyPage onNavigate={navigateTo} />
{:else if isReefPage}
  <DriftingReefPage onNavigate={navigateTo} />
{:else if isSpacePage}
  <SpacePage onNavigate={navigateTo} />
{:else if isOrganicPage}
  <OrganicPage onNavigate={navigateTo} />
{:else if isLockedPage}
  <LockedPage onNavigate={navigateTo} />
{:else if isGlitchPage}
  <GlitchPage />
{:else if isFluidPage}
  <FluidPage />
{:else if isLiquidPage}
  <LiquidInkPage onNavigateGlitch={() => navigateTo('/glitch')} />
{:else}
  <GradientPage onNavigate={navigateTo} />
{/if}
