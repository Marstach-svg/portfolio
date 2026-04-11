'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Plane } from 'ogl'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const waveVertex = /* glsl */ `
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

// Wave shader: draws an animated wave line with water fill below
const waveFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uProgress;   // 0 → 1 scroll progress (wave rises)
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Deep ocean colors
  vec3 deepWater   = vec3(0.02, 0.06, 0.15);   // very deep navy
  vec3 midWater    = vec3(0.04, 0.12, 0.28);    // deep blue
  vec3 shallowWater = vec3(0.08, 0.22, 0.38);   // slightly lighter

  float wave(float x, float freq, float speed, float amp) {
    return sin(x * freq + uTime * speed) * amp;
  }

  void main() {
    vec2 uv = vUv;

    // Wave line position: starts at bottom (progress=0), rises to top (progress=1)
    // The "water level" moves from y=0 up to y=1
    float waterLevel = uProgress;

    // Composite wave shape — multiple sine waves for organic feel
    float waveX = uv.x * 3.14159 * 2.0;
    float waveShape = 0.0;
    waveShape += wave(waveX, 2.0, 1.8, 0.025);
    waveShape += wave(waveX, 3.5, 2.5, 0.015);
    waveShape += wave(waveX, 5.0, 1.2, 0.010);
    waveShape += wave(waveX, 8.0, 3.0, 0.005);

    // Current wave line y position
    float waveLine = waterLevel + waveShape;

    // Is this pixel below the wave? (underwater)
    float isUnderwater = 1.0 - smoothstep(waveLine - 0.003, waveLine + 0.003, uv.y);

    // Depth gradient: deeper = darker
    float depth = 1.0 - ((uv.y) / max(waterLevel, 0.001));
    depth = clamp(depth, 0.0, 1.0);

    vec3 waterColor = mix(shallowWater, deepWater, depth * 0.7);

    // Subtle caustic light pattern on the water
    float caustic1 = sin(uv.x * 20.0 + uTime * 0.8) * sin(uv.y * 15.0 - uTime * 0.5);
    float caustic2 = sin(uv.x * 15.0 - uTime * 1.2) * sin(uv.y * 20.0 + uTime * 0.7);
    float caustics = (caustic1 + caustic2) * 0.5 + 0.5;
    caustics = pow(caustics, 3.0) * 0.15;

    waterColor += caustics * vec3(0.15, 0.25, 0.35) * (1.0 - depth * 0.5);

    // Foam / bright line at the wave crest
    float foam = smoothstep(0.006, 0.0, abs(uv.y - waveLine));
    foam *= smoothstep(0.0, 0.1, uProgress); // only show when wave exists
    vec3 foamColor = vec3(0.7, 0.85, 0.95);

    // Combine
    vec3 color = mix(waterColor, foamColor, foam * 0.8);
    float alpha = isUnderwater * smoothstep(0.0, 0.05, uProgress);

    // Add foam glow above the wave line
    float foamGlow = smoothstep(0.04, 0.0, uv.y - waveLine) * smoothstep(0.0, 0.05, uProgress);
    alpha = max(alpha, foamGlow * 0.3);

    gl_FragColor = vec4(color, alpha);
  }
`

interface Props {
  triggerId: string
  className?: string
}

export default function WaveTransition({ triggerId, className }: Props) {
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
      vertex: waveVertex,
      fragment: waveFragment,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
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

    const trigger = ScrollTrigger.create({
      trigger: `#${triggerId}`,
      start: 'top bottom',
      end: 'top top',
      scrub: 1.5,
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
  }, [triggerId, prefersReduced])

  if (prefersReduced) {
    return (
      <div className={`${className ?? ''}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a1a3a]" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`pointer-events-none ${className ?? ''}`} />
  )
}
