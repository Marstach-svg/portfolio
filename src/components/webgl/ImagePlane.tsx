'use client'

import { useEffect, useRef } from 'react'
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  WebGLRenderer,
} from 'three'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ShaderMaterial auto-injects position / uv / modelViewMatrix / projectionMatrix
const vertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

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

    const renderer = new WebGLRenderer({ alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;'

    const scene = new Scene()
    // Orthographic camera fitting a 1x1 plane at z=0
    const camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
    camera.position.z = 1

    const geometry = new PlaneGeometry(1, 1, 20, 20)

    const texture = new Texture()

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      texture.image = img
      texture.needsUpdate = true
    }
    img.src = src

    const material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTexture: { value: texture },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: [0.5, 0.5] },
      },
      transparent: false,
    })

    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    let rafId: number
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate)
      material.uniforms.uTime.value = t * 0.001
      material.uniforms.uHover.value +=
        (hoverRef.current - material.uniforms.uHover.value) * 0.05
      material.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y]
      renderer.render(scene, camera)
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height, false)
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
      geometry.dispose()
      material.dispose()
      texture.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
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
