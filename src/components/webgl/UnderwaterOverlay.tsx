'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Plane } from 'ogl'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const overlayVertex = /* glsl */ `
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

// Underwater distortion + caustics + light rays
const overlayFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Smooth noise
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
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;

    // --- Caustic light patterns ---
    vec2 causticUv = uv * vec2(aspect, 1.0);

    float c1 = sin(causticUv.x * 12.0 + uTime * 0.6) * sin(causticUv.y * 10.0 - uTime * 0.4);
    float c2 = sin(causticUv.x * 8.0 - uTime * 0.9) * sin(causticUv.y * 14.0 + uTime * 0.5);
    float c3 = sin(causticUv.x * 16.0 + uTime * 0.3) * sin(causticUv.y * 12.0 - uTime * 0.7);

    float caustics = (c1 + c2 + c3) / 3.0;
    caustics = caustics * 0.5 + 0.5;
    caustics = pow(caustics, 4.0);

    // --- Light rays from top ---
    float rayAngle = uv.x * 3.0 + uTime * 0.15;
    float ray = pow(max(sin(rayAngle * 8.0), 0.0), 12.0);
    float rayFade = smoothstep(1.0, 0.3, uv.y);  // stronger at top
    ray *= rayFade * 0.12;

    // --- Water color with depth gradient ---
    float depth = uv.y;  // 0 = bottom (deeper), 1 = top (shallower)

    // Deeper = darker, top = lighter
    vec3 deepColor    = vec3(0.01, 0.04, 0.12);
    vec3 shallowColor = vec3(0.04, 0.14, 0.30);

    vec3 waterTint = mix(deepColor, shallowColor, depth);

    // Add caustics (brighter near top)
    vec3 causticColor = vec3(0.12, 0.22, 0.35) * caustics * (0.3 + depth * 0.7);

    // Add light rays
    vec3 rayColor = vec3(0.15, 0.25, 0.40) * ray;

    // Subtle animated distortion noise
    float distortNoise = noise(uv * 3.0 + uTime * 0.2) * 0.02;

    vec3 finalColor = waterTint + causticColor + rayColor;

    // Overall alpha — semi-transparent overlay
    float alpha = 0.75 + distortNoise;

    // Slightly less opaque near the very top for softer transition
    alpha *= smoothstep(0.0, 0.15, 1.0 - uv.y) * 0.3 + 0.7;

    gl_FragColor = vec4(finalColor, alpha);
  }
`

export default function UnderwaterOverlay({ className }: { className?: string }) {
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

    const geometry = new Plane(gl)

    const program = new Program(gl, {
      vertex: overlayVertex,
      fragment: overlayFragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [window.innerWidth, window.innerHeight] },
      },
      transparent: true,
      depthTest: false,
    })

    const mesh = new Mesh(gl, { geometry, program })

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height)
      program.uniforms.uResolution.value = [width, height]
    }
    resize()
    window.addEventListener('resize', resize)

    let rafId: number
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate)
      program.uniforms.uTime.value = t * 0.001
      renderer.render({ scene: mesh })
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
    }
  }, [prefersReduced])

  if (prefersReduced) {
    return (
      <div className={`${className ?? ''}`}>
        <div className="absolute inset-0 bg-[#0a1a3a]/70" />
      </div>
    )
  }

  return <div ref={containerRef} className={`pointer-events-none ${className ?? ''}`} />
}
