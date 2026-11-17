import { defineConfig } from 'shaders/config'

export default defineConfig({
  // Components are imported from 'shaders/svelte'
  framework: 'svelte',
  // Shaders project this codebase is connected to
  project: '1ccbef38-4453-4bf6-9952-07e1035aac36',
  // Where `npx shaders install` writes component files
  outDir: 'src/components/shaders',
})
