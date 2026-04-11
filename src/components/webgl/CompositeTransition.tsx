'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Plane, Texture } from 'ogl'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const compositeVertex = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const compositeFragment = /* glsl */ `
  precision highp float;
  uniform float uProgress;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;

  // Simplex-like noise for mask
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    float n = noise(vUv * 6.0);
    n = n * 0.5 + 0.5;

    float threshold = smoothstep(uProgress - 0.15, uProgress + 0.15, n);

    vec3 color = mix(uColorB, uColorA, threshold);
    float alpha = smoothstep(0.0, 0.05, uProgress) * smoothstep(1.0, 0.95, uProgress);

    gl_FragColor = vec4(color, alpha * 0.6);
  }
`

interface Props {
  triggerId: string
  className?: string
}

export default function CompositeTransition({ triggerId, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!isDesktop || prefersReduced) return

    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) })
    const gl = renderer.gl
    container.appendChild(gl.canvas)
    gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'

    const geometry = new Plane(gl)

    const program = new Program(gl, {
      vertex: compositeVertex,
      fragment: compositeFragment,
      uniforms: {
        uProgress: { value: 0 },
        uColorA: { value: [0.98, 0.98, 0.976] },  // bg color
        uColorB: { value: [0.96, 0.94, 0.92] },    // surface color
      },
      transparent: true,
      depthTest: false,
    })

    const mesh = new Mesh(gl, { geometry, program })

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height)
    }
    resize()
    window.addEventListener('resize', resize)

    let rafId: number
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      renderer.render({ scene: mesh })
    }
    rafId = requestAnimationFrame(animate)

    const trigger = ScrollTrigger.create({
      trigger: `#${triggerId}`,
      start: 'top 80%',
      end: 'top 20%',
      scrub: 1,
      onUpdate: (self) => {
        program.uniforms.uProgress.value = self.progress
      },
    })

    return () => {
      cancelAnimationFrame(rafId)
      trigger.kill()
      window.removeEventListener('resize', resize)
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
    }
  }, [triggerId, isDesktop, prefersReduced])

  if (!isDesktop || prefersReduced) return null

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none relative h-32 ${className ?? ''}`}
    />
  )
}
