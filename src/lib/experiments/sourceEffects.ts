const sourcePrelude = `
  let clock = time;
  let screen = (uv - 0.5) * vec2f(aspect, 1.0);
  let source = textureSampleLevel(childTexture, childSampler, uv, 0.0);
  if (original > 0.5) { return source; }
`

export const sourceEffects: Record<string, string> = {
  fracture: `
    ${sourcePrelude}
    let gridSize = vec2f(13.0, 9.0);
    let gridPosition = uv * gridSize;
    let homeCell = floor(gridPosition);
    let cycle = 0.5 - 0.5 * cos(clock * 0.6);
    let explosion = pow(cycle, 1.6) * strength;
    var color = vec3f(0.007, 0.009, 0.018);
    for (var neighborY = -2; neighborY <= 2; neighborY = neighborY + 1) {
      for (var neighborX = -2; neighborX <= 2; neighborX = neighborX + 1) {
        let cell = homeCell + vec2f(f32(neighborX), f32(neighborY));
        let seed = fract(sin(dot(cell, vec2f(127.1, 311.7))) * 43758.5453);
        let center = cell + 0.5;
        let radial = normalize(center / gridSize - 0.5 + vec2f(0.0001));
        let translation = radial * explosion * (0.6 + seed * 1.3);
        let angle = explosion * (seed - 0.5) * 4.5;
        let delta = gridPosition - center - translation;
        let rotated = vec2f(cos(angle) * delta.x - sin(angle) * delta.y, sin(angle) * delta.x + cos(angle) * delta.y);
        let shrink = 1.0 - explosion * 0.18;
        let local = rotated / shrink;
        let isInside = max(abs(local.x), abs(local.y)) < 0.48;
        if (isInside) {
          let samplePosition = (center + local) / gridSize;
          let sampleColor = textureSampleLevel(childTexture, childSampler, samplePosition, 0.0);
          let coverage = 1.0 - smoothstep(0.15, 0.85, dot(sampleColor.rgb, vec3f(0.3333)));
          let edge = 1.0 - smoothstep(0.43, 0.48, max(abs(local.x), abs(local.y)));
          let palette = 0.5 + 0.45 * cos(vec3f(0.2, 2.2, 4.3) + seed * 4.0 + explosion * 2.0);
          let faceLight = 0.4 + 0.6 * abs(cos(angle + local.x));
          color = mix(color, palette * faceLight + (1.0 - edge) * 0.35, coverage);
        }
      }
    }
    return vec4f(color, 1.0);
  `,
  echo: `
    ${sourcePrelude}
    var color = vec3f(0.004, 0.006, 0.014);
    for (var echoIndex = 32; echoIndex >= 0; echoIndex = echoIndex - 1) {
      let order = f32(echoIndex) / 32.0;
      let history = clock - order * 3.8;
      let scale = exp(order * 1.65 * strength);
      let angle = order * sin(clock * 0.28) * 1.4 * strength;
      let offset = vec2f(sin(history * 0.8), cos(history * 0.65)) * order * 0.28 * strength;
      let relative = screen * scale - offset;
      let rotated = vec2f(cos(angle) * relative.x - sin(angle) * relative.y, sin(angle) * relative.x + cos(angle) * relative.y);
      let samplePosition = rotated / vec2f(aspect, 1.0) + 0.5;
      let sampleColor = textureSampleLevel(childTexture, childSampler, samplePosition, 0.0);
      let coverage = 1.0 - smoothstep(0.12, 0.7, dot(sampleColor.rgb, vec3f(0.3333)));
      let edgeSampleA = textureSampleLevel(childTexture, childSampler, samplePosition + vec2f(0.0018, 0.0025) * scale, 0.0);
      let edgeSampleB = textureSampleLevel(childTexture, childSampler, samplePosition - vec2f(0.0018, 0.0025) * scale, 0.0);
      let coverageA = 1.0 - smoothstep(0.12, 0.7, dot(edgeSampleA.rgb, vec3f(0.3333)));
      let coverageB = 1.0 - smoothstep(0.12, 0.7, dot(edgeSampleB.rgb, vec3f(0.3333)));
      let outline = max(abs(coverage - coverageA), abs(coverage - coverageB));
      let palette = 0.45 + 0.43 * cos(vec3f(0.0, 2.1, 4.2) + order * 6.0 + clock * 0.2);
      color = color + palette * (0.25 + 0.75 * (1.0 - order)) * (outline * 0.85 + coverage * 0.009);
    }
    return vec4f(color, 1.0);
  `,
  singularity: `
    ${sourcePrelude}
    let center = vec2f(sin(clock * 0.21) * 0.22, cos(clock * 0.17) * 0.08);
    let point = screen - center;
    let radius = length(point);
    let angle = atan2(point.y, point.x);
    let influence = exp(-radius * 2.7) * strength;
    let twist = influence * (3.8 + sin(clock * 0.4) * 2.2);
    let bent = vec2f(cos(angle + twist), sin(angle + twist)) * (radius + influence * 0.12);
    let samplePosition = (bent + center) / vec2f(aspect, 1.0) + 0.5;
    let sampled = textureSampleLevel(childTexture, childSampler, samplePosition, 0.0);
    let coverage = 1.0 - smoothstep(0.1, 0.75, dot(sampled.rgb, vec3f(0.3333)));
    let chromaSample = textureSampleLevel(childTexture, childSampler, samplePosition + normalize(point + 0.001) * influence * 0.018, 0.0);
    let chromaInk = 1.0 - smoothstep(0.1, 0.75, dot(chromaSample.rgb, vec3f(0.3333)));
    let horizon = 0.1 + strength * 0.055;
    let ring = exp(-abs(radius - horizon) * 135.0);
    let accretion = exp(-abs(radius - horizon * 1.5) * 22.0) * pow(0.5 + 0.5 * sin(angle * 26.0 + log(max(radius, 0.001)) * 15.0 - clock * 2.0), 3.0);
    var color = vec3f(0.009, 0.008, 0.018) + coverage * vec3f(0.68, 0.52, 0.92) + max(chromaInk - coverage, 0.0) * vec3f(0.04, 0.7, 1.0);
    color = color + ring * vec3f(1.2, 0.63, 0.2) + accretion * vec3f(0.85, 0.16, 0.04);
    color = color * smoothstep(horizon * 0.88, horizon, radius);
    return vec4f(color, 1.0);
  `,
  volume: `
    ${sourcePrelude}
    var accumulated = vec3f(0.0);
    var transmittance = 1.0;
    let rotation = sin(clock * 0.23) * 0.45;
    let sampleJitter = fract(sin(dot(uv * viewport, vec2f(12.9898, 78.233))) * 43758.5453);
    for (var volumeStep = 0; volumeStep < 64; volumeStep = volumeStep + 1) {
      let depth = (f32(volumeStep) + sampleJitter) / 64.0;
      let depthPosition = (depth - 0.5) * 0.6;
      let perspective = 1.0 + depthPosition * 0.35;
      let point = screen * perspective + vec2f(depthPosition * rotation, depthPosition * 0.16);
      let turbulence = sin(point.x * 17.0 + depth * 9.0 + clock) * cos(point.y * 19.0 - depth * 6.0 - clock * 0.7);
      let secondary = sin(point.x * 32.0 - point.y * 26.0 + depth * 15.0 + clock * 1.2);
      let displacement = vec2f(sin(depth * 12.0 + point.y * 12.0 + clock), cos(depth * 9.0 + point.x * 10.0 - clock)) * 0.05 * strength;
      let samplePosition = (point + displacement) / vec2f(aspect, 1.0) + 0.5;
      let sampled = textureSampleLevel(childTexture, childSampler, samplePosition, 0.0);
      let ink = 1.0 - smoothstep(0.15, 0.75, dot(sampled.rgb, vec3f(0.3333)));
      let wisps = smoothstep(-0.35, 0.75, turbulence + secondary * 0.35);
      let density = ink * wisps * 0.12 * sin(depth * 3.14159);
      let palette = mix(vec3f(0.1, 0.85, 1.1), vec3f(1.0, 0.12, 0.28), depth);
      let emission = palette * (0.8 + pow(wisps, 8.0) * 2.0);
      accumulated = accumulated + transmittance * density * emission;
      transmittance = transmittance * (1.0 - density);
    }
    let color = accumulated + vec3f(0.005, 0.009, 0.018) * transmittance;
    return vec4f(color, 1.0);
  `,
  loom: `
    ${sourcePrelude}
    let lineCount = 110.0;
    var color = vec3f(0.004, 0.009, 0.016);
    let row = floor(uv.y * lineCount);
    for (var rowOffset = -10; rowOffset <= 10; rowOffset = rowOffset + 1) {
      let sourceRow = row + f32(rowOffset);
      let sourceY = sourceRow / lineCount;
      let sourceX = uv.x + sin(sourceY * 13.0 + clock * 0.4) * 0.015 * strength;
      let sampled = textureSampleLevel(childTexture, childSampler, vec2f(sourceX, sourceY), 0.0);
      let ink = 1.0 - smoothstep(0.12, 0.8, dot(sampled.rgb, vec3f(0.3333)));
      let wave = sin(uv.x * 28.0 + sourceY * 9.0 - clock * 1.1) * 0.5 + sin(uv.x * 53.0 - clock * 0.5) * 0.18;
      let elevation = ink * (0.038 + wave * 0.035) * strength;
      let curve = sourceY - elevation;
      let lineDistance = abs(uv.y - curve);
      let filament = exp(-lineDistance * 2100.0);
      let halo = exp(-lineDistance * 450.0) * 0.1;
      let palette = 0.5 + 0.48 * cos(vec3f(0.1, 2.2, 4.4) + sourceY * 5.0 + clock * 0.2);
      let brightness = 0.08 + ink * (0.65 + wave * 0.3);
      color = color + palette * brightness * (filament + halo);
    }
    return vec4f(color, 1.0);
  `,
  holograph: `
    ${sourcePrelude}
    let pixelCount = vec2f(250.0, 160.0);
    let expansion = 0.5 - 0.5 * cos(clock * 0.55);
    let displacement = vec2f(sin(screen.y * 8.0 + clock * 0.5), cos(screen.x * 7.0 - clock * 0.6)) * expansion * 0.11 * strength;
    let warped = uv + displacement;
    let cell = floor(warped * pixelCount);
    let local = fract(warped * pixelCount) - 0.5;
    let sampled = textureSampleLevel(childTexture, childSampler, (cell + 0.5) / pixelCount, 0.0);
    let ink = 1.0 - smoothstep(0.12, 0.8, dot(sampled.rgb, vec3f(0.3333)));
    let seed = fract(sin(dot(cell, vec2f(127.1, 311.7))) * 43758.5453);
    let scan = sin(cell.x * 0.04 + cell.y * 0.05 - clock * 1.1);
    let spot = exp(-dot(local, local) * (24.0 + expansion * 50.0));
    let sparkle = pow(max(sin(seed * 36.0 + clock * 1.7), 0.0), 24.0);
    let palette = mix(vec3f(0.12, 0.8, 1.0), vec3f(1.0, 0.12, 0.42), scan * 0.5 + 0.5);
    var color = vec3f(0.003, 0.006, 0.014) + ink * palette * spot * (0.8 + sparkle * 3.0);
    for (var trailIndex = 1; trailIndex < 8; trailIndex = trailIndex + 1) {
      let trail = f32(trailIndex);
      let trailPosition = warped - vec2f(trail * 0.0025, trail * 0.004) * expansion * strength;
      let trailCell = floor(trailPosition * pixelCount);
      let trailLocal = fract(trailPosition * pixelCount) - 0.5;
      let trailSample = textureSampleLevel(childTexture, childSampler, (trailCell + 0.5) / pixelCount, 0.0);
      let trailInk = 1.0 - smoothstep(0.12, 0.8, dot(trailSample.rgb, vec3f(0.3333)));
      let trailSpot = exp(-dot(trailLocal, trailLocal) * 45.0);
      color = color + trailInk * palette * trailSpot * (1.0 - trail / 8.0) * 0.1;
    }
    return vec4f(color, 1.0);
  `,
  tunnel: `
    ${sourcePrelude}
    let radius = max(length(screen), 0.0001);
    let angle = atan2(screen.y, screen.x);
    let tunnelDepth = 0.19 / radius;
    let angularCoordinate = angle / 6.28318 + clock * 0.015;
    let travelingDepth = tunnelDepth + clock * 0.1;
    let tilePosition = vec2f(fract(angularCoordinate * 6.0), fract(travelingDepth));
    let radialWarp = sin(angle * 6.0 + tunnelDepth * 2.0 - clock * 0.4) * 0.035 * strength;
    let sampled = textureSampleLevel(childTexture, childSampler, tilePosition + radialWarp, 0.0);
    let ink = 1.0 - smoothstep(0.1, 0.8, dot(sampled.rgb, vec3f(0.3333)));
    let stripe = pow(1.0 - abs(sin(angularCoordinate * 6.0 * 3.14159)), 28.0);
    let depthLine = pow(1.0 - abs(sin(travelingDepth * 3.14159)), 28.0);
    let palette = 0.5 + 0.48 * cos(vec3f(0.2, 2.0, 4.2) + tunnelDepth * 1.7 - clock * 0.4);
    let fog = exp(-tunnelDepth * 0.85);
    let color = (ink * palette * 0.8 + (stripe + depthLine) * palette * 0.65) * fog + vec3f(0.004, 0.005, 0.012);
    return vec4f(color, 1.0);
  `,
  relief: `
    ${sourcePrelude}
    let orbit = 0.24 + sin(clock * 0.25) * 0.22;
    let camera = vec3f(sin(orbit) * 3.4, 1.7, cos(orbit) * 3.4);
    let forward = normalize(vec3f(0.0, 0.0, 0.13) - camera);
    let right = normalize(cross(forward, vec3f(0.0, 1.0, 0.0)));
    let up = cross(right, forward);
    let ray = normalize(forward * 1.65 + right * screen.x - up * screen.y);
    var travel = 2.2;
    var color = vec3f(0.005, 0.008, 0.014);
    for (var marchStep = 0; marchStep < 110; marchStep = marchStep + 1) {
      let point = camera + ray * travel;
      let cellSize = 0.028;
      let cell = floor(point.xy / cellSize);
      let cellCenter = (cell + 0.5) * cellSize;
      let samplePosition = cellCenter * vec2f(0.31, -0.5) + 0.5;
      let sampled = textureSampleLevel(childTexture, childSampler, samplePosition, 0.0);
      let coverage = 1.0 - smoothstep(0.12, 0.8, dot(sampled.rgb, vec3f(0.3333)));
      let wave = sin(cellCenter.x * 5.0 + clock) * cos(cellCenter.y * 8.0 - clock * 0.7);
      let height = coverage * (0.15 + strength * (0.3 + wave * 0.2));
      let relative = vec3f(point.xy - cellCenter, point.z - height * 0.5);
      let box = abs(relative) - vec3f(cellSize * 0.43, cellSize * 0.43, height * 0.5);
      let distance = length(max(box, vec3f(0.0))) + min(max(box.x, max(box.y, box.z)), 0.0);
      let isHit = distance < 0.0015 && coverage > 0.1 && abs(point.x) < 1.6 && abs(point.y) < 1.0;
      if (isHit) {
        var faceLight = 0.38;
        if (box.z > max(box.x, box.y)) { faceLight = 1.0; }
        if (box.x > max(box.y, box.z)) { faceLight = 0.65; }
        let palette = mix(vec3f(0.035, 0.18, 0.3), vec3f(0.85, 0.65, 0.3), smoothstep(0.0, 0.6, height));
        color = palette * faceLight + vec3f(0.04, 0.11, 0.16) * wave;
        break;
      }
      travel = travel + max(min(distance * 0.7, 0.035), 0.009);
      if (travel > 5.2) { break; }
    }
    return vec4f(max(color, vec3f(0.0)), 1.0);
  `
}
