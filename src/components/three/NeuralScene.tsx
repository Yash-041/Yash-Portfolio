import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ───────────────── Scene configuration ─────────────────
   Tweak these to change the look/feel of the hero constellation. */
const CONFIG = {
  nodesDesktop: 150,
  nodesMobile: 70,
  /** Max distance between two nodes for a connecting line. */
  linkDistance: 1.55,
  /** Radius around the cursor where nodes react and link to it. */
  mouseRadius: 2.4,
  /** How strongly nodes are pulled toward the cursor (0 = off). */
  mouseAttraction: 0.012,
  /** Base drift speed of nodes. */
  drift: 0.0035,
  /** Constellation volume (x, y, z half-extents). */
  bounds: new THREE.Vector3(7.5, 4.2, 2.6),
  /** Idle Y rotation speed (rad/s). */
  rotationSpeed: 0.045,
  palette: ['#00F0FF', '#8B5CF6', '#FF2E97', '#00F0FF', '#5EEBFF'],
  paletteLight: ['#007F9E', '#6A3DE0', '#C8166F', '#0A5BD8'],
}

const pointVertex = /* glsl */ `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  uniform float uPixelRatio;
  uniform float uTime;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // subtle "breathing" per node based on its position
    float pulse = 0.85 + 0.15 * sin(uTime * 2.0 + position.x * 3.0 + position.y * 2.0);
    gl_PointSize = size * pulse * uPixelRatio * (220.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`
const pointFragment = /* glsl */ `
  varying vec3 vColor;
  uniform float uAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.18, 0.0, d);
    float halo = pow(smoothstep(0.5, 0.0, d), 2.2) * 0.55;
    float a = (core + halo) * uAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor + core * 0.4, a);
  }
`

type NetworkProps = { light: boolean; mouse: MutableRefObject<{ x: number; y: number; active: boolean }> }

/** Writes one RGBA-coloured segment into the pre-allocated buffers (no allocations per frame). */
function writeSegment(
  lp: Float32Array, lc: Float32Array, s: number,
  ax: number, ay: number, az: number, bx: number, by: number, bz: number,
  ar: number, ag: number, ab: number, aa: number,
  br: number, bg: number, bb: number, ba: number,
) {
  const o = s * 6
  lp[o] = ax; lp[o + 1] = ay; lp[o + 2] = az
  lp[o + 3] = bx; lp[o + 4] = by; lp[o + 5] = bz
  const k = s * 8
  lc[k] = ar; lc[k + 1] = ag; lc[k + 2] = ab; lc[k + 3] = aa
  lc[k + 4] = br; lc[k + 5] = bg; lc[k + 6] = bb; lc[k + 7] = ba
}

function Network({ light, mouse }: NetworkProps) {
  const group = useRef<THREE.Group>(null)
  const { viewport, gl, size } = useThree()
  const count = size.width < 768 ? CONFIG.nodesMobile : CONFIG.nodesDesktop
  const maxSegments = count * 10

  // Static per-node data (positions, velocities, colours, sizes)
  const data = useMemo(() => {
    const palette = (light ? CONFIG.paletteLight : CONFIG.palette).map((c) => new THREE.Color(c))
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const b = CONFIG.bounds
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * b.x
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * b.y
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * b.z
      velocities[i * 3] = (Math.random() - 0.5) * CONFIG.drift
      velocities[i * 3 + 1] = (Math.random() - 0.5) * CONFIG.drift
      velocities[i * 3 + 2] = (Math.random() - 0.5) * CONFIG.drift
      const c = palette[i % palette.length]
      colors.set([c.r, c.g, c.b], i * 3)
      sizes[i] = Math.random() < 0.08 ? 2.6 : 0.9 + Math.random() * 1.1 // a few "hub" neurons
    }
    return { positions, velocities, colors, sizes, palette }
  }, [count, light])

  const pointGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(data.colors, 3))
    g.setAttribute('size', new THREE.BufferAttribute(data.sizes, 1))
    return g
  }, [data])

  const pointMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pointVertex,
        fragmentShader: pointFragment,
        uniforms: {
          uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
          uTime: { value: 0 },
          uAlpha: { value: light ? 0.9 : 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: light ? THREE.NormalBlending : THREE.AdditiveBlending,
      }),
    [gl, light],
  )

  // Line buffers are pre-allocated; drawRange limits what's rendered each frame
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxSegments * 6), 3).setUsage(THREE.DynamicDrawUsage))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(maxSegments * 8), 4).setUsage(THREE.DynamicDrawUsage))
    return g
  }, [maxSegments])

  const lineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: light ? THREE.NormalBlending : THREE.AdditiveBlending,
      }),
    [light],
  )

  useEffect(
    () => () => {
      pointGeo.dispose()
      pointMat.dispose()
      lineGeo.dispose()
      lineMat.dispose()
    },
    [pointGeo, pointMat, lineGeo, lineMat],
  )

  const mouseWorld = useMemo(() => new THREE.Vector3(), [])
  const mouseLocal = useMemo(() => new THREE.Vector3(), [])
  const cursorColor = useMemo(() => new THREE.Color(light ? '#C8166F' : '#FF2E97'), [light])

  // ANIMATION: per-frame simulation — drift, cursor attraction, dynamic links
  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    pointMat.uniforms.uTime.value = t
    // Idle rotation + mouse parallax (lerped for smoothness)
    const m = mouse.current
    g.rotation.y += CONFIG.rotationSpeed * Math.min(delta, 0.05)
    g.rotation.x += ((m.active ? m.y * 0.18 : 0) - g.rotation.x) * 0.04
    g.position.x += ((m.active ? m.x * 0.35 : 0) - g.position.x) * 0.04

    // Cursor → local space of the rotating group
    mouseWorld.set((m.x * viewport.width) / 2, (m.y * viewport.height) / 2, 0)
    mouseLocal.copy(mouseWorld)
    g.worldToLocal(mouseLocal)

    const p = data.positions
    const v = data.velocities
    const b = CONFIG.bounds
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      if (m.active) {
        const dx = mouseLocal.x - p[ix]
        const dy = mouseLocal.y - p[ix + 1]
        const dz = mouseLocal.z - p[ix + 2]
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (d < CONFIG.mouseRadius && d > 0.3) {
          const f = (1 - d / CONFIG.mouseRadius) * CONFIG.mouseAttraction
          p[ix] += dx * f
          p[ix + 1] += dy * f
          p[ix + 2] += dz * f
        }
      }
      p[ix] += v[ix]
      p[ix + 1] += v[ix + 1]
      p[ix + 2] += v[ix + 2]
      // Bounce off the volume bounds
      if (Math.abs(p[ix]) > b.x) v[ix] *= -1
      if (Math.abs(p[ix + 1]) > b.y) v[ix + 1] *= -1
      if (Math.abs(p[ix + 2]) > b.z) v[ix + 2] *= -1
    }
    pointGeo.attributes.position.needsUpdate = true

    // Rebuild connection lines
    const lp = lineGeo.attributes.position.array as Float32Array
    const lc = lineGeo.attributes.color.array as Float32Array
    const c = data.colors
    const maxD = CONFIG.linkDistance
    const maxD2 = maxD * maxD
    let s = 0
    for (let i = 0; i < count && s < maxSegments; i++) {
      const ix = i * 3
      for (let j = i + 1; j < count && s < maxSegments; j++) {
        const jx = j * 3
        const dx = p[ix] - p[jx]
        const dy = p[ix + 1] - p[jx + 1]
        const dz = p[ix + 2] - p[jx + 2]
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 > maxD2) continue
        const a = (1 - Math.sqrt(d2) / maxD) * (light ? 0.5 : 0.65)
        writeSegment(lp, lc, s, p[ix], p[ix + 1], p[ix + 2], p[jx], p[jx + 1], p[jx + 2],
          c[ix], c[ix + 1], c[ix + 2], a, c[jx], c[jx + 1], c[jx + 2], a)
        s++
      }
      // Glowing synapses from the cursor to nearby nodes
      if (m.active && s < maxSegments) {
        const dx = p[ix] - mouseLocal.x
        const dy = p[ix + 1] - mouseLocal.y
        const dz = p[ix + 2] - mouseLocal.z
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (d < CONFIG.mouseRadius) {
          const a = (1 - d / CONFIG.mouseRadius) * 0.9
          writeSegment(lp, lc, s, p[ix], p[ix + 1], p[ix + 2], mouseLocal.x, mouseLocal.y, mouseLocal.z,
            c[ix], c[ix + 1], c[ix + 2], a, cursorColor.r, cursorColor.g, cursorColor.b, a * 0.4)
          s++
        }
      }
    }
    lineGeo.setDrawRange(0, s * 2)
    lineGeo.attributes.position.needsUpdate = true
    lineGeo.attributes.color.needsUpdate = true
  })

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo} material={lineMat} frustumCulled={false} />
      <points geometry={pointGeo} material={pointMat} frustumCulled={false} />
    </group>
  )
}

type NeuralSceneProps = { active: boolean; light: boolean }

/** Lazy-loaded hero background. Rendering pauses when the hero is off-screen (`active`). */
export default function NeuralScene({ active, light }: NeuralSceneProps) {
  // Track the pointer on window so the canvas can stay pointer-events:none
  const mouse = useRef({ x: 0, y: 0, active: false })
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
      mouse.current.active = e.pointerType === 'mouse'
    }
    const onLeave = () => (mouse.current.active = false)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 55 }}
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <Network light={light} mouse={mouse} />
    </Canvas>
  )
}
