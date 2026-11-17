export type SculptureT = {
  distance: string
  palette: string
  finish: string
  camera: number
  rotation: number
  base: string
}

export const sculptures: Record<string, SculptureT> = {
  hyperfold: {
    camera: 4.4,
    rotation: 0.22,
    base: 'length(samplePoint) - 0.94',
    distance: `
      let twist = samplePoint.y * (0.5 + strength * 0.6) + clock * 0.18;
      let rotated = vec3f(cos(twist) * samplePoint.x - sin(twist) * samplePoint.z, samplePoint.y, sin(twist) * samplePoint.x + cos(twist) * samplePoint.z);
      let frequency = 5.5 + sin(clock * 0.25) * 1.2;
      let lattice = rotated * frequency;
      let gyroid = dot(sin(lattice), cos(lattice.yzx));
      let membrane = (abs(gyroid) - 0.27) / frequency * 0.58;
      distance = max(membrane, length(rotated) - 1.02);
    `,
    palette:
      '0.48 + 0.4 * cos(vec3f(0.1, 2.1, 4.3) + surfacePoint.y * 2.5 + surfacePoint.z * 2.0 + clock * 0.15)',
    finish: '0.88'
  },
  bloom: {
    camera: 3.65,
    rotation: 0.16,
    base: 'length(vec2f(length(samplePoint.xz) - 0.72, samplePoint.y)) - 0.22',
    distance: `
      let radius = length(samplePoint.xz);
      let angle = atan2(samplePoint.z, samplePoint.x);
      let foldedAngle = angle * 7.0 + samplePoint.y * 2.5 + clock * 0.32;
      let petals = 0.69 + 0.2 * cos(foldedAngle);
      let waveHeight = sin(angle * 3.0 + clock * 0.3) * 0.24;
      let radialDistance = radius - petals;
      let foldedHeight = abs(samplePoint.y - waveHeight) - 0.21;
      let outerPetals = length(vec2f(radialDistance, foldedHeight)) - 0.12;
      let innerPetals = length(vec2f(radius - 0.35 - 0.11 * sin(angle * 7.0 - clock * 0.4), samplePoint.y + 0.05)) - 0.115;
      distance = min(outerPetals, innerPetals) * 0.45;
    `,
    palette:
      'mix(vec3f(0.11, 0.028, 0.22), vec3f(0.94, 0.36, 0.5), 0.5 + 0.5 * sin(surfacePoint.y * 5.0 + surfacePoint.x * 2.0))',
    finish: '0.75'
  },
  knot: {
    camera: 3.5,
    rotation: 0.25,
    base: 'length(vec2f(length(samplePoint.xz) - 0.72, samplePoint.y)) - 0.17',
    distance: `
      let angle = atan2(samplePoint.z, samplePoint.x);
      let radial = length(samplePoint.xz);
      let cycle = angle * 3.0 + clock * 0.24;
      let centerRadius = 0.66 + 0.24 * cos(cycle);
      let centerHeight = 0.29 * sin(cycle);
      let firstStrand = length(vec2f(radial - centerRadius, samplePoint.y - centerHeight)) - 0.115;
      let secondStrand = length(vec2f(radial - 1.32 + centerRadius, samplePoint.y + centerHeight)) - 0.115;
      distance = min(firstStrand, secondStrand) * 0.57;
    `,
    palette:
      'mix(vec3f(0.025, 0.24, 0.29), vec3f(0.8, 0.88, 0.48), 0.5 + 0.5 * sin(atan2(surfacePoint.z, surfacePoint.x) * 3.0 + clock * 0.24))',
    finish: '0.95'
  },
  recursion: {
    camera: 3.7,
    rotation: 0.17,
    base: 'length(max(abs(samplePoint) - vec3f(0.7), vec3f(0.0))) + min(max(abs(samplePoint.x), max(abs(samplePoint.y), abs(samplePoint.z))) - 0.7, 0.0)',
    distance: `
      var folded = samplePoint;
      var scale = 1.0;
      for (var foldIndex = 0; foldIndex < 4; foldIndex = foldIndex + 1) {
        folded = abs(folded);
        folded = vec3f(max(folded.x, folded.y), min(folded.x, folded.y), folded.z);
        folded = vec3f(max(folded.x, folded.z), folded.y, min(folded.x, folded.z));
        let foldAngle = 0.3 + 0.16 * sin(clock * 0.2);
        folded = vec3f(folded.x, cos(foldAngle) * folded.y - sin(foldAngle) * folded.z, sin(foldAngle) * folded.y + cos(foldAngle) * folded.z);
        folded = folded * 2.5 - vec3f(1.15, 0.75, 0.52);
        scale = scale * 2.5;
      }
      let box = abs(folded) - vec3f(0.8, 0.65, 0.5);
      distance = (length(max(box, vec3f(0.0))) + min(max(box.x, max(box.y, box.z)), 0.0)) / scale;
    `,
    palette:
      'mix(vec3f(0.18, 0.025, 0.07), vec3f(0.97, 0.52, 0.16), 0.5 + 0.5 * sin(length(surfacePoint) * 11.0 + surfacePoint.y * 5.0))',
    finish: '0.62'
  },
  machinery: {
    camera: 4.2,
    rotation: 0.13,
    base: 'length(samplePoint) - 0.8',
    distance: `
      distance = length(samplePoint) - 0.45;
      for (var orbIndex = 0; orbIndex < 6; orbIndex = orbIndex + 1) {
        let phase = f32(orbIndex) * 1.0472;
        let orbit = 0.57 + 0.19 * sin(clock * 0.55 + phase * 2.0);
        let center = vec3f(cos(phase + clock * 0.2) * orbit, sin(phase * 2.0 + clock * 0.35) * 0.47, sin(phase + clock * 0.2) * orbit);
        let orbDistance = length(samplePoint - center) - 0.35;
        let blend = max(0.31 - abs(distance - orbDistance), 0.0) / 0.31;
        distance = min(distance, orbDistance) - blend * blend * 0.0775;
      }
      let engraving = sin(samplePoint.x * 30.0 + sin(samplePoint.z * 12.0)) * sin(samplePoint.y * 26.0 + clock);
      distance = distance + engraving * 0.009;
    `,
    palette:
      '0.52 + 0.38 * cos(vec3f(0.0, 2.0, 4.0) + surfacePoint.x * 2.8 + surfacePoint.y * 3.0 + clock * 0.12)',
    finish: '1.0'
  },
  orbital: {
    camera: 3.7,
    rotation: 0.15,
    base: 'length(vec2f(length(samplePoint.xy) - 0.8, samplePoint.z)) - 0.08',
    distance: `
      distance = 10.0;
      for (var ringIndex = 0; ringIndex < 7; ringIndex = ringIndex + 1) {
        let order = f32(ringIndex);
        let angle = clock * (0.14 + order * 0.025) + order * 0.45;
        let rotated = vec3f(cos(angle) * samplePoint.x - sin(angle) * samplePoint.z, samplePoint.y, sin(angle) * samplePoint.x + cos(angle) * samplePoint.z);
        let ringRadius = 0.36 + order * 0.105;
        let ringDistance = length(vec2f(length(rotated.xy) - ringRadius, rotated.z)) - 0.032;
        distance = min(distance, ringDistance);
      }
      distance = min(distance, length(samplePoint) - 0.19);
    `,
    palette:
      'mix(vec3f(0.08, 0.22, 0.42), vec3f(0.9, 0.66, 0.25), smoothstep(0.4, 1.0, length(surfacePoint)))',
    finish: '0.9'
  },
  porcelain: {
    camera: 4.2,
    rotation: 0.2,
    base: 'length(samplePoint) - 0.94',
    distance: `
      let radius = length(samplePoint);
      let longitude = atan2(samplePoint.z, samplePoint.x);
      let latitude = acos(clamp(samplePoint.y / max(radius, 0.0001), -1.0, 1.0));
      let wave = sin(longitude * 16.0 + latitude * 5.0 + clock * 0.7) * sin(latitude * 12.0 - clock * 0.6);
      let ribs = abs(wave);
      let shell = abs(radius - 0.86 - 0.075 * wave) - 0.055;
      let perforation = (ribs - 0.62) * 0.065;
      distance = max(shell, perforation) * 0.45;
    `,
    palette:
      'mix(vec3f(0.35, 0.55, 0.68), vec3f(0.96, 0.88, 0.71), smoothstep(-0.6, 0.6, surfacePoint.y))',
    finish: '0.32'
  }
}

// Expand the same distance estimator for tracing, normals,
// and occlusion so their geometry cannot drift apart.
const buildDistanceEvaluation = (sculpture: SculptureT) => {
  return `
    var distance = 0.0;
    ${sculpture.distance}
    let baseDistance = ${sculpture.base};
    distance = mix(baseDistance, distance, min(strength, 1.0) * (1.0 - original));
  `
}

export const buildSculptureBody = (sculpture: SculptureT) => {
  const evaluateDistance = buildDistanceEvaluation(sculpture)
  return `
    let clock = time;
    let screen = (uv - 0.5) * vec2f(aspect, -1.0);
    let orbit = clock * ${sculpture.rotation} + 0.35;
    let elevation = 0.22 + sin(clock * 0.18) * 0.16;
    let camera = vec3f(sin(orbit) * cos(elevation), sin(elevation), cos(orbit) * cos(elevation)) * ${sculpture.camera};
    let forward = normalize(-camera);
    let right = normalize(cross(forward, vec3f(0.0, 1.0, 0.0)));
    let up = cross(right, forward);
    let ray = normalize(forward * 1.75 + right * screen.x + up * screen.y);
    var travel = 0.0;
    var hasHit = false;
    var nearest = 1.0;
    for (var marchStep = 0; marchStep < 120; marchStep = marchStep + 1) {
      let samplePoint = camera + ray * travel;
      ${evaluateDistance}
      nearest = min(nearest, abs(distance));
      if (distance < 0.0015) { hasHit = true; break; }
      travel = travel + max(distance * 0.78, 0.001);
      if (travel > 7.5) { break; }
    }
    let background = vec3f(0.006, 0.008, 0.014);
    var color = background;
    if (hasHit) {
      let surfacePoint = camera + ray * travel;
      let offsets = array<vec3f, 4>(vec3f(1.0, -1.0, -1.0), vec3f(-1.0, -1.0, 1.0), vec3f(-1.0, 1.0, -1.0), vec3f(1.0, 1.0, 1.0));
      var normal = vec3f(0.0);
      for (var normalIndex = 0; normalIndex < 4; normalIndex = normalIndex + 1) {
        let samplePoint = surfacePoint + offsets[normalIndex] * 0.0018;
        ${evaluateDistance}
        normal = normal + offsets[normalIndex] * distance;
      }
      normal = normalize(normal);
      var occlusion = 0.0;
      for (var ambientIndex = 1; ambientIndex < 4; ambientIndex = ambientIndex + 1) {
        let offsetDistance = f32(ambientIndex) * 0.065;
        let samplePoint = surfacePoint + normal * offsetDistance;
        ${evaluateDistance}
        occlusion = occlusion + max(offsetDistance - distance, 0.0) * 1.6;
      }
      let ambient = clamp(1.0 - occlusion, 0.22, 1.0);
      let light = normalize(vec3f(-0.6, 0.9, 1.1));
      let diffuse = max(dot(normal, light), 0.0);
      let reflection = reflect(ray, normal);
      let fresnel = pow(1.0 - max(dot(normal, -ray), 0.0), 4.0);
      let broadLight = pow(max(dot(reflection, normalize(vec3f(-0.4, 1.0, 0.7))), 0.0), 18.0);
      let stripLight = pow(max(1.0 - abs(reflection.x * 0.65 + reflection.y * 0.35 - 0.35), 0.0), 70.0);
      let rimLight = pow(max(dot(reflection, normalize(vec3f(0.9, 0.2, -0.7))), 0.0), 12.0);
      let pigment = ${sculpture.palette};
      let metallic = ${sculpture.finish};
      let surfaceLight = pigment * (0.15 + diffuse * 0.65) * ambient;
      let reflectedLight = (broadLight * vec3f(1.0, 0.86, 0.72) + stripLight * vec3f(0.63, 0.85, 1.0) + rimLight * vec3f(0.6, 0.23, 0.85)) * (0.35 + metallic);
      let edgeLight = fresnel * mix(vec3f(0.1, 0.23, 0.3), pigment, 0.35);
      color = surfaceLight + reflectedLight * ambient + edgeLight;
      color = color / (0.8 + color);
    }
    return vec4f(color, 1.0);
  `
}
