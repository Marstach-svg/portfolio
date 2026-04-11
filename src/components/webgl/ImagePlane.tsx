'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Plane, Texture } from 'ogl'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const fragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    float dist = distance(uv, uMouse);
    float strength = uHover * 0.03 * smoothstep(0.5, 0.0, dist);

    uv.x += sin(uv.y * 15.0 + uTime * 2.0) * strength;
    uv.y += cos(uv.x * 15.0 + uTime * 2.0) * strength;

    float aberration = uHover * 0.008;
    float r = texture2D(uTexture, uv + vec2(aberration, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(aberration, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`

const vertex = /* glsl */ `
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

interface Props {
  src: string
  alt: string
  className?: string
}

export default function ImagePlane({ src, alt, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!isDesktop || prefersReduced) return

    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) })
    const gl = renderer.gl
    container.appendChild(gl.canvas)
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'

    const geometry = new Plane(gl, { widthSegments: 20, heightSegments: 20 })
    const texture = new Texture(gl)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    img.onload = () => {
      texture.image = img
    }

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTexture: { value: texture },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: [0.5, 0.5] },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    let rafId: number
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate)
      program.uniforms.uTime.value = t * 0.001
      program.uniforms.uHover.value +=
        (hoverRef.current - program.uniforms.uHover.value) * 0.05
      program.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y]
      renderer.render({ scene: mesh })
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height)
    }
    resize()
    window.addEventListener('resize', resize)

    const onEnter = () => {
      hoverRef.current = 1
    }
    const onLeave = () => {
      hoverRef.current = 0
    }
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height
    }

    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)
    container.addEventListener('mousemove', onMove)

    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      container.removeEventListener('mousemove', onMove)
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
    }
  }, [src, isDesktop, prefersReduced])

  if (!isDesktop || prefersReduced) {
    return (
      <div className={className}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  }

  return <div ref={containerRef} className={className} aria-label={alt} role="img" />
}
