'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Plane } from 'ogl'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

// Fullscreen quad — no camera/matrices
const waterVertex = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

// Combined shader: wave rises, water fills below with caustics + light rays
const waterFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uProgress;     // 0 → 1 wave rise progress
  varying vec2 vUv;

  vec3 shallowColor = vec3(0.05, 0.18, 0.36);
  vec3 midColor     = vec3(0.02, 0.08, 0.20);
  vec3 deepColor    = vec3(0.005, 0.02, 0.08);

  void main() {
    vec2 uv = vUv;

    // --- Wave line: rises from y=-0.1 at progress 0 to y=1.1 at progress 1 ---
    // Extra range ensures it leaves the screen fully underwater at progress=1
    float waterLevel = mix(-0.05, 1.15, uProgress);

    // Wave shape — multiple sines for organic feel
    float waveX = uv.x * 6.283;
    float waveShape = 0.0;
    waveShape += sin(waveX * 1.8 + uTime * 1.3) * 0.025;
    waveShape += sin(waveX * 3.2 + uTime * 1.8) * 0.018;
    waveShape += sin(waveX * 5.5 + uTime * 2.2) * 0.010;
    waveShape += sin(waveX * 9.0 + uTime * 0.8) * 0.005;

    float waveLine = waterLevel + waveShape;

    // --- Is this pixel underwater? ---
    float underwater = 1.0 - smoothstep(waveLine - 0.003, waveLine + 0.003, uv.y);

    // --- Depth from surface (0 = at surface, 1 = deep) ---
    float depth = clamp((waveLine - uv.y) * 1.2, 0.0, 1.0);

    // --- Water color gradient ---
    vec3 waterColor = mix(shallowColor, midColor, depth);
    waterColor = mix(waterColor, deepColor, pow(depth, 2.0));

    // --- Caustics (bright light patterns) ---
    float c1 = sin(uv.x * 14.0 + uTime * 0.7) * sin(uv.y * 11.0 - uTime * 0.5);
    float c2 = sin(uv.x * 9.0 - uTime * 1.0) * sin(uv.y * 15.0 + uTime * 0.6);
    float c3 = sin(uv.x * 18.0 + uTime * 0.4) * sin(uv.y * 13.0 - uTime * 0.8);
    float caustics = (c1 + c2 + c3) / 3.0;
    caustics = caustics * 0.5 + 0.5;
    caustics = pow(caustics, 5.0);

    // Caustics brighter near the surface
    waterColor += caustics * vec3(0.18, 0.30, 0.45) * (1.0 - depth * 0.6);

    // --- Light rays from above ---
    float rayX = uv.x * 3.5 + sin(uTime * 0.2) * 0.3;
    float ray = pow(max(sin(rayX * 6.0), 0.0), 10.0);
    float rayFade = smoothstep(0.7, 0.0, depth);  // stronger near surface
    waterColor += vec3(0.20, 0.35, 0.55) * ray * rayFade * 0.25;

    // --- Foam at wave crest (bright line) ---
    float crestDist = abs(uv.y - waveLine);
    float foam = 1.0 - smoothstep(0.0, 0.008, crestDist);
    foam *= smoothstep(0.0, 0.03, uProgress);
    foam *= smoothstep(1.05, 0.95, uProgress);  // fade when fully up

    // --- Soft glow above wave line ---
    float aboveDist = uv.y - waveLine;
    float glow = (1.0 - smoothstep(0.0, 0.04, aboveDist)) * step(0.0, aboveDist);
    glow *= smoothstep(0.0, 0.03, uProgress);

    vec3 foamColor = vec3(0.85, 0.93, 1.0);

    // Combine
    vec3 color = mix(waterColor, foamColor, foam);
    color = mix(color, foamColor * 0.9, glow * 0.5);

    float alpha = underwater + glow * 0.5 + foam * 0.8;
    alpha = clamp(alpha, 0.0, 1.0);
    alpha *= smoothstep(0.0, 0.02, uProgress);

    gl_FragColor = vec4(color, alpha);
  }
`

interface Props {
  triggerId: string
  className?: string
}

export default function WaterScene({ triggerId, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) })
    const gl = renderer.gl
    container.appendChild(gl.canvas)
    gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'

    // Plane in NDC (width/height = 2 so [-1,1] covers full screen)
    const geometry = new Plane(gl, { width: 2, height: 2 })

    const program = new Program(gl, {
      vertex: waterVertex,
      fragment: waterFragment,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: prefersReduced ? 1 : 0 },
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
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate)
      if (!prefersReduced) program.uniforms.uTime.value = t * 0.001
      renderer.render({ scene: mesh })
    }
    rafId = requestAnimationFrame(animate)

    let trigger: ScrollTrigger | undefined
    if (!prefersReduced) {
      trigger = ScrollTrigger.create({
        trigger: `#${triggerId}`,
        // Start a bit after user begins scrolling, finish before Hero fully leaves
        start: 'top+=10% top',
        end: 'bottom center',
        scrub: 0.8,
        onUpdate: (self) => {
          program.uniforms.uProgress.value = self.progress
        },
      })
    }

    return () => {
      cancelAnimationFrame(rafId)
      trigger?.kill()
      window.removeEventListener('resize', resize)
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
    }
  }, [triggerId, prefersReduced])

  return <div ref={containerRef} className={`pointer-events-none ${className ?? ''}`} />
}
