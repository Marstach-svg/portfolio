'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const bubbleVertex = /* glsl */ `
  attribute vec3 position;
  attribute float aSize;
  attribute float aSpeed;
  attribute float aOffset;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform vec2 uMouse;

  varying float vAlpha;
  varying float vSize;

  void main() {
    vec3 pos = position;

    // Rise upward — cycle with mod so bubbles loop
    float cycle = mod(pos.y + uTime * aSpeed * 0.3 + aOffset * 10.0, 8.0) - 4.0;
    pos.y = cycle;

    // Gentle horizontal wobble
    pos.x += sin(uTime * 0.8 + aOffset * 6.28) * 0.15 * aSize;
    pos.x += sin(uTime * 1.3 + aOffset * 3.14) * 0.08;

    // Slight z wobble for depth
    pos.z += cos(uTime * 0.5 + aOffset * 4.0) * 0.1;

    // Mouse interaction — bubbles gently pushed away
    vec2 mouseWorld = uMouse * 6.0 - 3.0;
    float distToMouse = distance(pos.xy, mouseWorld);
    float push = smoothstep(1.5, 0.0, distToMouse) * 0.4;
    pos.xy += normalize(pos.xy - mouseWorld + 0.001) * push;

    vSize = aSize;
    vAlpha = 0.15 + aSize * 0.35;
    // Fade at top and bottom
    float edgeFade = smoothstep(-4.0, -3.0, pos.y) * smoothstep(4.0, 3.0, pos.y);
    vAlpha *= edgeFade;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (3.0 + aSize * 12.0) * (1.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`

const bubbleFragment = /* glsl */ `
  precision highp float;
  varying float vAlpha;
  varying float vSize;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Bubble: bright rim, transparent center
    float rim = smoothstep(0.3, 0.48, dist) * smoothstep(0.5, 0.46, dist);
    float inner = smoothstep(0.5, 0.1, dist) * 0.08;
    float highlight = smoothstep(0.25, 0.15, length(center - vec2(-0.15, 0.15))) * 0.5;

    float alpha = (rim * 0.6 + inner + highlight) * vAlpha;

    // Slight blue-white tint
    vec3 color = mix(
      vec3(0.5, 0.75, 0.9),   // blue tint
      vec3(0.9, 0.95, 1.0),   // white highlight
      highlight
    );

    gl_FragColor = vec4(color, alpha);
  }
`

export default function BubbleField({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (prefersReduced) return

    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) })
    const gl = renderer.gl
    container.appendChild(gl.canvas)
    gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'

    const camera = new Camera(gl, { fov: 45 })
    camera.position.z = 5

    const COUNT = 120
    const positions = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    const speeds = new Float32Array(COUNT)
    const offsets = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 6  // x spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8  // y spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3  // z depth
      sizes[i] = 0.2 + Math.random() * 0.8
      speeds[i] = 0.5 + Math.random() * 1.5
      offsets[i] = Math.random()
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      aSize:    { size: 1, data: sizes },
      aSpeed:   { size: 1, data: speeds },
      aOffset:  { size: 1, data: offsets },
    })

    const program = new Program(gl, {
      vertex: bubbleVertex,
      fragment: bubbleFragment,
      uniforms: {
        uTime:  { value: 0 },
        uMouse: { value: [0.5, 0.5] },
      },
      transparent: true,
      depthTest: false,
    })

    const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program })
    const mouse = { x: 0.5, y: 0.5 }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = 1.0 - e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height)
      camera.perspective({ aspect: width / height })
    }
    resize()
    window.addEventListener('resize', resize)

    let rafId: number
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate)
      program.uniforms.uTime.value = t * 0.001
      program.uniforms.uMouse.value = [mouse.x, mouse.y]
      renderer.render({ scene: mesh, camera })
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
    }
  }, [prefersReduced])

  if (prefersReduced) return null

  return <div ref={containerRef} className={`pointer-events-none ${className ?? ''}`} />
}
