export type FluidPresetT = {
  key: string
  name: string
  family: string
  description: string
  technique: string
  color: string
  isSculpture: boolean
}

export const fluidPresets: FluidPresetT[] = [
  {
    key: 'hyperfold',
    name: 'Hyperfold',
    family: '01 / Topological sculpture',
    color: '#b1d0b2',
    isSculpture: true,
    description:
      'A sphere opens into an intricate, twisting labyrinth. The camera travels around its perforated skin, revealing the structure inside.',
    technique:
      'Sphere → twisted gyroid membrane. Ray marching, finite-difference normals, ambient occlusion, and thin-film studio reflections.'
  },
  {
    key: 'fracture',
    name: 'Fracture ballet',
    family: '02 / Image fragmentation',
    color: '#bdb0ec',
    isSculpture: false,
    description:
      'The source breaks into independently rotating fragments, expands into space, and locks back together. Watch an entire reconstruction cycle.',
    technique:
      'Image → moving shards. Each fragment samples its original coordinates while its position, angle, scale, and illumination change independently.'
  },
  {
    key: 'bloom',
    name: 'Bloom machine',
    family: '03 / Parametric sculpture',
    color: '#e5a1bc',
    isSculpture: true,
    description:
      'Nested metallic petals fold through one another. A rotating, impossible flower with open cavities and a luminous inner crown.',
    technique:
      'Torus → nested radial folds. Angular repetition, sinusoidal cross-sections, sphere tracing, and reflection lighting.'
  },
  {
    key: 'volume',
    name: 'Volume memory',
    family: '04 / Volumetric reconstruction',
    color: '#8fcce3',
    isSculpture: false,
    description:
      'The flat source becomes a suspended volume of luminous matter. Cyan and crimson wisps separate in depth, curl, and reform.',
    technique:
      'Image luminance → density. Sixty-four jittered depth samples integrate turbulent density, emission, and light absorption through the source.'
  },
  {
    key: 'knot',
    name: 'Double bind',
    family: '05 / Interwoven geometry',
    color: '#cbd99c',
    isSculpture: true,
    description:
      'Two uninterrupted metallic loops weave over and under one another, changing from a familiar ring into a spatial puzzle.',
    technique:
      'Torus → interwoven strands. Polar coordinates define oscillating tube paths; an orbiting camera exposes the crossings.'
  },
  {
    key: 'echo',
    name: 'Chronochrome',
    family: '06 / Temporal extrusion',
    color: '#eab17d',
    isSculpture: false,
    description:
      'Thirty-three displaced versions of the source build a winding chromatic tunnel. The mark becomes architecture made from its own echoes.',
    technique:
      'Image → layered time offsets. Delayed transforms, exponential scaling, rotation, and ordered compositing build the extrusion.'
  },
  {
    key: 'recursion',
    name: 'Recursive relic',
    family: '07 / Fractal geometry',
    color: '#dc996f',
    isSculpture: true,
    description:
      'A compact crystal unfolds into an elaborate hierarchy of repeating branches, chambers, and miniature structures.',
    technique:
      'Box → iterated folded space. Four recursive folds and scale compensation produce a ray-marched three-dimensional fractal.'
  },
  {
    key: 'loom',
    name: 'Signal loom',
    family: '08 / Filament reconstruction',
    color: '#89cfb3',
    isSculpture: false,
    description:
      'The source is woven from fine spectral filaments. Its dark regions lift the threads into a moving relief of peaks and troughs.',
    technique:
      'Image → 110 displaced scan curves. Source luminance controls the height of each continuous filament, with independent moving waves.'
  },
  {
    key: 'machinery',
    name: 'Soft machinery',
    family: '09 / Smooth-union sculpture',
    color: '#bca8df',
    isSculpture: true,
    description:
      'Reflective bodies orbit, merge, stretch into bridges, and separate again. Fine surface engravings pass continuously through every joint.',
    technique:
      'Sphere → smooth-union orbital bodies. Polynomial distance blending changes the topology without seams; surface displacement adds fine detail.'
  },
  {
    key: 'singularity',
    name: 'Event horizon',
    family: '10 / Gravitational lens',
    color: '#edb37c',
    isSculpture: false,
    description:
      'A traveling singularity grabs the source and pulls its lettering into a spiral around a bright photon ring.',
    technique:
      'Image → nonlinear polar lens. Radial attraction and angular distortion bend source coordinates, with chromatic separation and an accretion ring.'
  },
  {
    key: 'orbital',
    name: 'Orbital archive',
    family: '11 / Kinetic sculpture',
    color: '#d8c28d',
    isSculpture: true,
    description:
      'Seven nested metallic orbits open, align, and intersect around a small core. The silhouette changes continuously as their rotations drift apart.',
    technique:
      'Ring → nested independent coordinate frames. Seven toroidal distance fields rotate at different rates and are rendered as one solid scene.'
  },
  {
    key: 'relief',
    name: 'Pixel cathedral',
    family: '12 / Voxel relief',
    color: '#a6c7d6',
    isSculpture: false,
    description:
      'The source rises from the screen as thousands of small columns. A traveling height wave turns the mark into a kinetic architectural model.',
    technique:
      'Image → three-dimensional columns. Quantized source luminance drives box height; a moving camera and surface normals reveal the vertical faces.'
  },
  {
    key: 'porcelain',
    name: 'Lace automaton',
    family: '13 / Perforated geometry',
    color: '#dccdb4',
    isSculpture: true,
    description:
      'A thin ceramic shell becomes a moving lacework of openings, ribs, and woven edges. Light reveals the hollow body beneath.',
    technique:
      'Sphere → perforated shell. Spherical coordinates modulate thickness and cut animated openings through a signed-distance surface.'
  },
  {
    key: 'holograph',
    name: 'Point / counterpoint',
    family: '14 / Point reconstruction',
    color: '#8bbcd7',
    isSculpture: false,
    description:
      'Thousands of luminous samples rebuild the source as a flowing point cloud, with spectral scanning and short drifting trails.',
    technique:
      'Image → sampled points. A fixed source grid feeds animated coordinate displacement, point falloff, scintillation, and delayed trails.'
  },
  {
    key: 'tunnel',
    name: 'Infinite imprint',
    family: '15 / Spatial remapping',
    color: '#b5a1e0',
    isSculpture: false,
    description:
      'The source wraps around the walls of an endless six-sided passage. Repetition becomes a luminous, moving space you travel through.',
    technique:
      'Image → cylindrical tunnel. Reciprocal radius maps screen distance to depth; polar angle wraps repeated source panels around the walls.'
  }
]
