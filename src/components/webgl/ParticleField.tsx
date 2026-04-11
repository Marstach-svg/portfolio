'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const particleVertex = /* glsl */ `
  attribute vec3 position;
  attribute float aRandom;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
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

    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) })
    const gl = renderer.gl
    container.appendChild(gl.canvas)
    gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'

    const camera = new Camera(gl, { fov: 45 })
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

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      aRandom: { size: 1, data: randoms },
    })

    const program = new Program(gl, {
      vertex: particleVertex,
      fragment: particleFragment,
      uniforms: {
        uTime: { value: 0 },
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

    if (prefersReduced) {
      renderer.render({ scene: mesh, camera })
    } else {
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
    }

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
    }
  }, [prefersReduced])

  return <div ref={containerRef} className={`pointer-events-none ${className ?? ''}`} />
}
