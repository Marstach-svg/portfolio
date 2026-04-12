'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Geometry, Program, Mesh } from 'ogl'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

// Screen-space NDC — no camera, positions directly in [-1, 1]
const bubbleVertex = /* glsl */ `
  attribute vec2 aBase;
  attribute float aSize;
  attribute float aSpeed;
  attribute float aOffset;

  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uAspect;
  uniform float uVisibility;  // 0 → 1 from scroll progress

  varying float vAlpha;

  void main() {
    vec2 pos = aBase;

    // Rise upward, cycle through y range [-1.4, 1.4]
    float cycle = mod(pos.y - 1.4 + uTime * aSpeed * 0.18 + aOffset * 4.0, 2.8);
    pos.y = cycle - 1.4;

    // Horizontal wobble
    pos.x += sin(uTime * 0.7 + aOffset * 6.28) * 0.04;
    pos.x += sin(uTime * 1.4 + aOffset * 3.14) * 0.02;

    // Mouse repulsion
    vec2 toMouse = pos - uMouse;
    toMouse.x *= uAspect;
    float distToMouse = length(toMouse);
    float push = smoothstep(0.35, 0.0, distToMouse) * 0.12;
    pos += normalize(toMouse + vec2(0.0001)) * push;

    // Fade at top/bottom of cycle
    float fadeIn  = smoothstep(-1.35, -1.15, pos.y);
    float fadeOut = 1.0 - smoothstep(1.15, 1.35, pos.y);
    vAlpha = (0.28 + aSize * 0.38) * fadeIn * fadeOut * uVisibility;

    // Strong size contrast: small are tiny, large are huge (quadratic)
    gl_PointSize = 12.0 + aSize * aSize * 260.0;
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`

const bubbleFragment = /* glsl */ `
  precision highp float;
  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Thin rim — narrow band near edge
    float rimInner = smoothstep(0.44, 0.47, dist);
    float rimOuter = 1.0 - smoothstep(0.47, 0.49, dist);
    float rim = rimInner * rimOuter;

    // Soft inner body — very faint glow
    float inner = (1.0 - smoothstep(0.0, 0.46, dist)) * 0.06;

    // Large soft specular highlight (upper-left) — main light source
    vec2 hlCenter = center - vec2(-0.18, 0.18);
    float hlDist = length(hlCenter);
    float highlightSoft = (1.0 - smoothstep(0.0, 0.22, hlDist)) * 0.6;
    float highlightCore = (1.0 - smoothstep(0.0, 0.08, hlDist)) * 1.0;
    float highlight = highlightSoft + highlightCore;

    // Small secondary highlight (lower-right) — reflection for depth
    vec2 hl2Center = center - vec2(0.18, -0.18);
    float highlight2 = (1.0 - smoothstep(0.0, 0.07, length(hl2Center))) * 0.35;

    float alpha = (rim * 0.9 + inner + highlight * 0.75 + highlight2 * 0.6) * vAlpha;

    vec3 color = mix(
      vec3(0.65, 0.85, 0.98),
      vec3(1.0, 1.0, 1.0),
      clamp(highlight, 0.0, 1.0)
    );

    gl_FragColor = vec4(color, alpha);
  }
`

interface Props {
  className?: string
  triggerId?: string
}

export default function BubbleField({ className, triggerId }: Props) {
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

    // Sparse, subtle background bubbles
    const COUNT = 6
    const base = new Float32Array(COUNT * 2)
    const sizes = new Float32Array(COUNT)
    const speeds = new Float32Array(COUNT)
    const offsets = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      base[i * 2]     = (Math.random() - 0.5) * 2.4
      base[i * 2 + 1] = (Math.random() - 0.5) * 2.4
      // Bimodal-ish: bias either small or large for contrast
      const r = Math.random()
      sizes[i]   = r < 0.5 ? r * 0.6 : 0.6 + (r - 0.5) * 0.8
      speeds[i]  = 0.4 + Math.random() * 1.2
      offsets[i] = Math.random()
    }

    const geometry = new Geometry(gl, {
      aBase:   { size: 2, data: base },
      aSize:   { size: 1, data: sizes },
      aSpeed:  { size: 1, data: speeds },
      aOffset: { size: 1, data: offsets },
    })

    const program = new Program(gl, {
      vertex: bubbleVertex,
      fragment: bubbleFragment,
      uniforms: {
        uTime:       { value: 0 },
        uMouse:      { value: [0, 0] },
        uAspect:     { value: 1 },
        uVisibility: { value: triggerId ? 0 : 1 },
      },
      transparent: true,
      depthTest: false,
    })

    const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program })

    const mouse = { x: 0, y: 0 }
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2.0 - 1.0
      mouse.y = -((e.clientY / window.innerHeight) * 2.0 - 1.0)
    }
    window.addEventListener('mousemove', onMove)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      renderer.setSize(width, height)
      program.uniforms.uAspect.value = width / height
    }
    resize()
    window.addEventListener('resize', resize)

    let rafId: number
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate)
      program.uniforms.uTime.value = t * 0.001
      program.uniforms.uMouse.value = [mouse.x, mouse.y]
      renderer.render({ scene: mesh })
    }
    rafId = requestAnimationFrame(animate)

    // Link visibility to scroll progress so bubbles fade in with wave
    let trigger: ScrollTrigger | undefined
    if (triggerId) {
      trigger = ScrollTrigger.create({
        trigger: `#${triggerId}`,
        start: 'top+=10% top',
        end: 'bottom center',
        scrub: 0.8,
        onUpdate: (self) => {
          program.uniforms.uVisibility.value = self.progress
        },
      })
    }

    return () => {
      cancelAnimationFrame(rafId)
      trigger?.kill()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
    }
  }, [prefersReduced, triggerId])

  if (prefersReduced) return null

  return <div ref={containerRef} className={`pointer-events-none ${className ?? ''}`} />
}
