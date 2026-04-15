'use client'

import { useEffect, useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ShaderMaterial auto-injects `position`, `modelViewMatrix`, `projectionMatrix`,
// so we declare only the CUSTOM attributes / uniforms.
const particleVertex = /* glsl */ `
  attribute float aRandom;
  uniform float uTime;
  uniform vec2 uMouse;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    pos.x += sin(uTime * 0.5 + aRandom * 6.28) * 0.3;
    pos.y += cos(uTime * 0.3 + aRandom * 6.28) * 0.4;
    pos.z += sin(uTime * 0.4 + aRandom * 3.14) * 0.2;

    float distToMouse = distance(pos.xy, uMouse * 4.0 - 2.0);
    float repel = smoothstep(1.5, 0.0, distToMouse) * 0.5;
    pos.xy += normalize(pos.xy - (uMouse * 4.0 - 2.0)) * repel;

    vAlpha = 0.3 + aRandom * 0.7;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (4.0 + aRandom * 4.0) * (1.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`

const particleFragment = /* glsl */ `
  precision highp float;
  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = vAlpha * smoothstep(0.5, 0.2, dist);
    gl_FragColor = vec4(0.6, 0.6, 0.6, alpha);
  }
`

export default function ParticleField({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new WebGLRenderer({ alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    container.appendChild(renderer.domElement)
    renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;'

    const scene = new Scene()
    const camera = new PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 5

    const COUNT = 500
    const positions = new Float32Array(COUNT * 3)
    const randoms = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
      randoms[i] = Math.random()
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('aRandom', new BufferAttribute(randoms, 1))

    const material = new ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: [0.5, 0.5] },
      },
      transparent: true,
      depthTest: false,
    })

    const points = new Points(geometry, material)
    scene.add(points)

    const mouse = { x: 0.5, y: 0.5 }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = 1.0 - e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    let rafId: number | null = null
    let running = false
    let inView = true
    let docVisible = !document.hidden

    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate)
      material.uniforms.uTime.value = t * 0.001
      material.uniforms.uMouse.value = [mouse.x, mouse.y]
      renderer.render(scene, camera)
    }

    const start = () => {
      if (running || prefersReduced) return
      running = true
      rafId = requestAnimationFrame(animate)
    }
    const stop = () => {
      if (!running) return
      running = false
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = null
    }
    const sync = () => {
      if (inView && docVisible) start()
      else stop()
    }

    if (prefersReduced) {
      renderer.render(scene, camera)
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          inView = entries[0]?.isIntersecting ?? true
          sync()
        },
        { rootMargin: '100px' }
      )
      io.observe(container)
      const onVis = () => {
        docVisible = !document.hidden
        sync()
      }
      document.addEventListener('visibilitychange', onVis)
      sync()

      // Stash disposers for cleanup
      ;(container as HTMLDivElement & { __pfDispose?: () => void }).__pfDispose = () => {
        io.disconnect()
        document.removeEventListener('visibilitychange', onVis)
      }
    }

    return () => {
      stop()
      const c = container as HTMLDivElement & { __pfDispose?: () => void }
      c.__pfDispose?.()
      delete c.__pfDispose
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [prefersReduced])

  return (
    <div ref={containerRef} className={`pointer-events-none ${className ?? ''}`} />
  )
}
