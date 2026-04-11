# Claude Code 指示書 — クリエイティブテック・ポートフォリオ

> **コンセプト**: 世界観に頼らず、7つの先端グラフィック/アニメーション技術で魅せるポートフォリオ。Awwwards / Codrops レベルの実装品質を目指す。
> **目的**: 就職・転職活動用ポートフォリオサイト

---

## 1. プロジェクト概要

### 1.1 技術スタック

| レイヤー | 採用技術 | バージョン |
|---------|---------|-----------|
| フレームワーク | Next.js (App Router) | 15.x |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | v4 |
| アニメーション | GSAP + ScrollTrigger | 3.12+ |
| WebGL | OGL (軽量 ~5KB) | 1.0+ |
| スムーズスクロール | Lenis | 1.1+ |
| ページ遷移 | View Transitions API + カスタム実装 | — |
| デプロイ | Cloudflare Pages (Static Export) | — |

### 1.2 Next.js 設定

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Static Export では Image Optimization API 不可
  },
  // Cloudflare Pages 向け
  trailingSlash: true,
};

export default nextConfig;
```

### 1.3 デザイン方針

- **テーマ・世界観なし** — 特定のテーマ（ギルド、図書館など）は一切使わない
- 技術そのものが主役。余白・タイポグラフィ・動きの質で差別化する
- カラーパレットはミニマルに: 白基調 + チャコール + 1アクセントカラー
- フォント: 英字は Syne / Space Grotesk / Inter、日本語は Noto Sans JP
- モバイルファースト。ただし WebGL 演出は `md:` 以上で有効化

```ts
// カラートークン例（tailwind.config.ts で定義）
const colors = {
  bg:      '#FAFAF9',   // warm white
  surface: '#F5F0EB',   // soft beige
  text:    '#1C1917',   // stone-900
  muted:   '#78716C',   // stone-500
  accent:  '#2563EB',   // blue-600 (変更可)
  border:  '#E7E5E4',   // stone-200
};
```

---

## 2. 実装する7つの技術

以下の7技術を **すべて** 実装する。各技術の実装詳細とコード例を示す。

---

### 技術① WebGL シェーダー（画像ディストーション + ホバーエフェクト）

**概要**: プロジェクトサムネイルにホバーすると、画像がゆらぎ・色収差（chromatic aberration）が発生する。OGL を使用。

**実装ファイル**: `src/components/webgl/ImagePlane.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Plane, Texture } from 'ogl';

// --- Fragment Shader: ホバー時の歪み + 色収差 ---
const fragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uHover;       // 0.0 → 1.0 (hover progress)
  uniform float uTime;
  uniform vec2 uMouse;        // normalized mouse position
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // マウス位置からの距離で歪み量を計算
    float dist = distance(uv, uMouse);
    float strength = uHover * 0.03 * smoothstep(0.5, 0.0, dist);

    // 歪み (wave distortion)
    uv.x += sin(uv.y * 15.0 + uTime * 2.0) * strength;
    uv.y += cos(uv.x * 15.0 + uTime * 2.0) * strength;

    // Chromatic Aberration (RGB分離)
    float aberration = uHover * 0.008;
    float r = texture2D(uTexture, uv + vec2(aberration, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(aberration, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

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
`;

interface Props {
  src: string;
  alt: string;
  className?: string;
}

export default function ImagePlane({ src, alt, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';

    const geometry = new Plane(gl, { widthSegments: 20, heightSegments: 20 });
    const texture = new Texture(gl);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => { texture.image = img; };

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTexture: { value: texture },
        uHover:   { value: 0 },
        uTime:    { value: 0 },
        uMouse:   { value: [0.5, 0.5] },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    // Hover animation (lerp)
    let rafId: number;
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate);
      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uHover.value += (hoverRef.current - program.uniforms.uHover.value) * 0.05;
      program.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y];
      renderer.render({ scene: mesh });
    };

    // Resize
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Mouse events
    const onEnter = () => { hoverRef.current = 1; };
    const onLeave = () => { hoverRef.current = 0; };
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('mousemove', onMove);

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('mousemove', onMove);
      container.removeChild(gl.canvas);
    };
  }, [src]);

  return (
    <div ref={containerRef} className={className} aria-label={alt} role="img" />
  );
}
```

**使い方**: `<ImagePlane src="/projects/app1.jpg" alt="プロジェクト名" className="aspect-[16/9] w-full" />`

---

### 技術② コンポジットレンダリング（シーン遷移）

**概要**: 2つのシーン（例: Hero → Projects セクション）をオフスクリーンのレンダーターゲットに描画し、グレースケールマスクでブレンドする。スクロール連動でシーンAからBへシームレスに切り替わる。

**実装ファイル**: `src/components/webgl/CompositeTransition.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { Renderer, RenderTarget, Program, Mesh, Plane, Texture } from 'ogl';

const compositeFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uSceneA;
  uniform sampler2D uSceneB;
  uniform sampler2D uMask;       // グレースケール遷移マスク
  uniform float uProgress;       // 0.0 → 1.0 (scroll progress)
  varying vec2 vUv;

  void main() {
    float maskValue = texture2D(uMask, vUv).r;
    // progress に応じてマスクのしきい値を変える
    float threshold = smoothstep(uProgress - 0.1, uProgress + 0.1, maskValue);
    vec4 colorA = texture2D(uSceneA, vUv);
    vec4 colorB = texture2D(uSceneB, vUv);
    gl_FragColor = mix(colorB, colorA, threshold);
  }
`;

// 使用時: ScrollTrigger で uProgress を 0→1 にアニメーション
// const tl = gsap.timeline({
//   scrollTrigger: {
//     trigger: '#composite-section',
//     start: 'top top',
//     end: 'bottom top',
//     scrub: 1,
//   },
// });
// tl.to(program.uniforms.uProgress, { value: 1 });
```

**マスクテクスチャ**: グレースケールのグラデーション画像（円形、斜線、ノイズなど）を `/public/masks/` に配置。マスクの形でトランジションの見え方が変わる。

**参考**: Codrops の "Composite Rendering" 記事 — RenderTarget を使ったシーンブレンド手法。

---

### 技術③ カスタムカーソル + ホバーインタラクション

**概要**: デフォルトカーソルを非表示にし、カスタムカーソル（小さい丸 + 大きいリング）を表示。ホバーターゲットに近づくと磁気的に吸い寄せられ、形状が変化する。

**実装ファイル**: `src/components/ui/CustomCursor.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current!;
    const ring = ringRef.current!;

    // Lerp で遅延追従
    const pos = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    // アニメーションループ
    const ticker = () => {
      pos.x += (mouse.x - pos.x) * 0.15;
      pos.y += (mouse.y - pos.y) * 0.15;
      gsap.set(dot, { x: mouse.x, y: mouse.y });
      gsap.set(ring, { x: pos.x, y: pos.y });
    };
    gsap.ticker.add(ticker);

    // ホバーターゲット: data-cursor="hover" を持つ要素
    const targets = document.querySelectorAll('[data-cursor="hover"]');
    targets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        gsap.to(ring, { scale: 2.5, borderColor: '#2563EB', duration: 0.3 });
        gsap.to(dot, { scale: 0, duration: 0.2 });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(ring, { scale: 1, borderColor: '#1C1917', duration: 0.3 });
        gsap.to(dot, { scale: 1, duration: 0.2 });
      });
    });

    // 磁気効果 (magnetic)
    const magnets = document.querySelectorAll('[data-cursor="magnetic"]');
    magnets.forEach((el) => {
      el.addEventListener('mousemove', (e: Event) => {
        const me = e as MouseEvent;
        const rect = (el as HTMLElement).getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (me.clientX - cx) * 0.3;
        const dy = (me.clientY - cy) * 0.3;
        gsap.to(el, { x: dx, y: dy, duration: 0.3 });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      });
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      gsap.ticker.remove(ticker);
    };
  }, []);

  return (
    <>
      {/* 小さい点: マウス直追従 */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-900 mix-blend-difference"
      />
      {/* 大きいリング: lerp で遅延追従 */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-900 mix-blend-difference"
      />
    </>
  );
}
```

**CSS 追加**: `body { cursor: none; }` をグローバルスタイルに設定（md以上のみ）。

**使い方**: ホバー対象に `data-cursor="hover"` を、磁気効果には `data-cursor="magnetic"` を付与。

---

### 技術④ テキストアニメーション（SplitText + スクロール連動）

**概要**: テキストを1文字ずつ分割し、スクロールに連動して色が切り替わる（グレー → 黒）。見出しには stagger アニメーション。

**実装ファイル**: `src/components/ui/TextReveal.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  stagger?: number;
  scrub?: boolean;
}

export default function TextReveal({
  children,
  tag: Tag = 'p',
  className = '',
  stagger = 0.02,
  scrub = true,
}: Props) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // 手動 SplitText（GSAP SplitText プラグインの代替）
    const text = el.textContent || '';
    el.innerHTML = '';

    const chars: HTMLSpanElement[] = [];
    for (const char of text) {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.color = '#78716C'; // muted (初期色)
      el.appendChild(span);
      chars.push(span);
    }

    if (scrub) {
      // スクロール連動: 1文字ずつ色が変わる
      gsap.to(chars, {
        color: '#1C1917', // text color
        stagger: stagger,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1,
        },
      });
    } else {
      // 出現アニメーション (stagger)
      gsap.from(chars, {
        y: 40,
        opacity: 0,
        rotateX: -90,
        stagger: stagger,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [children, stagger, scrub]);

  // @ts-expect-error — dynamic tag
  return <Tag ref={containerRef} className={className}>{children}</Tag>;
}
```

**使い方**:
```tsx
<TextReveal tag="h2" className="text-5xl font-bold" scrub>
  Creative Developer
</TextReveal>

<TextReveal tag="h1" className="text-7xl font-black" scrub={false} stagger={0.03}>
  RYOKEN
</TextReveal>
```

---

### 技術⑤ スムーズスクロール + Lerp（Lenis）

**概要**: ブラウザのネイティブスクロールを Lenis で慣性スクロールに置き換え。GSAP ScrollTrigger と連携。

**実装ファイル**: `src/components/providers/SmoothScrollProvider.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,        // スクロールの滑らかさ (大きいほど遅延)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      touchMultiplier: 2,   // モバイル用
      infinite: false,
    });
    lenisRef.current = lenis;

    // Lenis → GSAP ScrollTrigger 同期
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

**`app/layout.tsx` での使用**:
```tsx
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <SmoothScrollProvider>
          <CustomCursor />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
```

---

### 技術⑥ パーティクル + フローティングエレメント

**概要**: Hero セクションの背景に浮遊するパーティクルを配置。マウスに反応して揺れる。OGL の Points を使用。

**実装ファイル**: `src/components/webgl/ParticleField.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

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

    // 浮遊アニメーション
    pos.x += sin(uTime * 0.5 + aRandom * 6.28) * 0.3;
    pos.y += cos(uTime * 0.3 + aRandom * 6.28) * 0.4;
    pos.z += sin(uTime * 0.4 + aRandom * 3.14) * 0.2;

    // マウスからの距離で反発
    float distToMouse = distance(pos.xy, uMouse * 4.0 - 2.0);
    float repel = smoothstep(1.5, 0.0, distToMouse) * 0.5;
    pos.xy += normalize(pos.xy - (uMouse * 4.0 - 2.0)) * repel;

    vAlpha = 0.3 + aRandom * 0.7;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (4.0 + aRandom * 4.0) * (1.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const particleFragment = /* glsl */ `
  precision highp float;
  varying float vAlpha;

  void main() {
    // 丸いポイントにする
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = vAlpha * smoothstep(0.5, 0.2, dist);
    gl_FragColor = vec4(0.6, 0.6, 0.6, alpha); // soft gray particles
  }
`;

export default function ParticleField({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio, 2) });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';

    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 5;

    const COUNT = 500;
    const positions = new Float32Array(COUNT * 3);
    const randoms = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 8; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4; // z
      randoms[i] = Math.random();
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      aRandom:  { size: 1, data: randoms },
    });

    const program = new Program(gl, {
      vertex: particleVertex,
      fragment: particleFragment,
      uniforms: {
        uTime:  { value: 0 },
        uMouse: { value: [0.5, 0.5] },
      },
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    const mouse = { x: 0.5, y: 0.5 };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMove);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };
    resize();
    window.addEventListener('resize', resize);

    let rafId: number;
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate);
      program.uniforms.uTime.value = t * 0.001;
      program.uniforms.uMouse.value = [mouse.x, mouse.y];
      renderer.render({ scene: mesh, camera });
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      container.removeChild(gl.canvas);
    };
  }, []);

  return <div ref={containerRef} className={`pointer-events-none ${className ?? ''}`} />;
}
```

---

### 技術⑦ ページ遷移アニメーション（View Transitions API）

**概要**: ページ遷移時にカスタムトランジション（ワイプ、フェード、スケール）を実行。Next.js App Router + View Transitions API を利用。フォールバックとして GSAP でアニメーション。

**実装ファイル**: `src/components/providers/PageTransition.tsx`

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';

interface Props {
  children: ReactNode;
}

export default function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return;

    // 遷移アニメーション
    const tl = gsap.timeline();

    // Phase 1: オーバーレイが画面を覆う
    tl.fromTo(
      overlay,
      { scaleY: 0, transformOrigin: 'bottom' },
      { scaleY: 1, duration: 0.5, ease: 'power3.inOut' }
    );

    // Phase 2: コンテンツが入れ替わった後にオーバーレイが退く
    tl.fromTo(
      overlay,
      { transformOrigin: 'top' },
      { scaleY: 0, duration: 0.5, ease: 'power3.inOut', delay: 0.1 }
    );

    // Phase 3: 新しいコンテンツのフェードイン
    tl.fromTo(
      container,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    );
  }, [pathname]);

  return (
    <>
      {/* トランジションオーバーレイ */}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[9990] origin-bottom scale-y-0 bg-stone-900"
      />
      <div ref={containerRef}>{children}</div>
    </>
  );
}
```

**`app/layout.tsx` への統合**:
```tsx
<SmoothScrollProvider>
  <CustomCursor />
  <PageTransition>
    {children}
  </PageTransition>
</SmoothScrollProvider>
```

---

## 3. ページ構成とセクション設計

### 3.1 ページ一覧

```
app/
├── layout.tsx           // グローバルレイアウト (Lenis, Cursor, Transition)
├── page.tsx             // ホームページ (ワンページ構成)
├── projects/
│   └── [slug]/
│       └── page.tsx     // プロジェクト詳細ページ
└── about/
    └── page.tsx         // About ページ (任意)
```

### 3.2 ホームページ セクション構成

#### セクション A: Hero

```
┌─────────────────────────────────────────────┐
│  [ParticleField 背景]                        │
│                                             │
│        名前 (TextReveal, stagger入り)         │
│        肩書き (Creative Developer)            │
│        スクロールインジケーター ↓              │
│                                             │
└─────────────────────────────────────────────┘
```

- ParticleField が背景全体に浮遊
- 名前はテキストアニメーション（技術④）で1文字ずつ出現
- スクロールインジケーターは GSAP で上下ループアニメーション

#### セクション B: About（スクロール連動テキスト）

```
┌─────────────────────────────────────────────┐
│                                             │
│  自己紹介文 (TextReveal, scrub=true)          │
│  → スクロールに連動して文字が1つずつ着色       │
│                                             │
│  スキルタグ (stagger でフェードイン)            │
│                                             │
└─────────────────────────────────────────────┘
```

- 自己紹介テキストがスクロールに連動してグレー→黒に変化（技術④）
- スキルタグはスクロールで順次出現

#### セクション C: Projects（WebGL ホバー + CompositeTransition）

```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌───────────┐  ┌───────────┐              │
│  │ ImagePlane │  │ ImagePlane │              │
│  │ (hover→    │  │ (hover→    │              │
│  │  distort)  │  │  distort)  │              │
│  └───────────┘  └───────────┘              │
│                                             │
│  各カードに:                                 │
│    - プロジェクト名                           │
│    - 技術タグ                                │
│    - Challenge → Solution → Outcome          │
│                                             │
└─────────────────────────────────────────────┘
```

- サムネイルは ImagePlane（技術①）でホバー時にシェーダーエフェクト
- セクション遷移時に CompositeTransition（技術②）が発動
- 各プロジェクトは「課題 → 解決策 → 成果」のストーリー構造（採用担当者向け）

#### セクション D: Contact

```
┌─────────────────────────────────────────────┐
│                                             │
│  "Let's work together"                      │
│  (TextReveal, big typography)               │
│                                             │
│  [Email] [GitHub] [LinkedIn]                │
│  ↑ data-cursor="magnetic" で磁気効果         │
│                                             │
└─────────────────────────────────────────────┘
```

- SNS リンクに磁気カーソル効果（技術③）
- メールアドレスのリンクも magnetic

---

## 4. プロジェクト詳細ページ (`projects/[slug]/page.tsx`)

```
ページ遷移アニメーション (技術⑦) で入場
  ↓
Hero画像 (ImagePlane + パララックス)
  ↓
プロジェクト情報:
  - 概要
  - 使用技術
  - 課題 (Challenge)
  - 解決策 (Solution)
  - 成果 (Outcome)
  - スクリーンショット / デモリンク
  ↓
次のプロジェクトへのリンク (magnetic cursor)
```

---

## 5. データ構造

プロジェクトデータは JSON/TS で管理（DB不要）:

```ts
// src/data/projects.ts
export interface Project {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;    // /public/projects/xxx.jpg
  tags: string[];
  challenge: string;
  solution: string;
  outcome: string;
  links: {
    demo?: string;
    github?: string;
  };
  screenshots: string[];
  year: number;
}

export const projects: Project[] = [
  {
    slug: 'project-name',
    title: 'プロジェクト名',
    description: '概要テキスト',
    thumbnail: '/projects/project-name/thumb.jpg',
    tags: ['Next.js', 'TypeScript', 'Prisma'],
    challenge: '解決すべき課題の説明',
    solution: '採用したアプローチと技術的な工夫',
    outcome: '定量的な成果（パフォーマンス改善率など）',
    links: { demo: 'https://...', github: 'https://...' },
    screenshots: ['/projects/project-name/ss1.jpg'],
    year: 2026,
  },
  // ...
];
```

---

## 6. パフォーマンス最適化

### 6.1 WebGL の条件付きロード

```tsx
// src/hooks/useMediaQuery.ts
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

// 使用: WebGL コンポーネントをデスクトップのみで表示
// const isDesktop = useMediaQuery('(min-width: 768px)');
// {isDesktop && <ParticleField />}
```

### 6.2 reduce-motion 対応

```tsx
// src/hooks/useReducedMotion.ts
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
}
```

reduce-motion が有効な場合:
- パーティクルは静止
- テキストアニメーションは即時表示
- ページ遷移はシンプルなフェード
- カスタムカーソルは無効

### 6.3 画像最適化

- サムネイル: WebP 形式、幅 800px 以下
- OG画像: 1200×630px
- `<img>` に `loading="lazy"` と `decoding="async"`
- WebGL テクスチャ用画像は 2のべき乗サイズ推奨

### 6.4 バンドルサイズ管理

```
目標バンドルサイズ:
  - First Load JS: < 150KB (gzipped)
  - OGL:          ~5KB
  - GSAP:         ~30KB
  - Lenis:        ~10KB
  - 合計ライブラリ: ~45KB (gzipped)
```

- dynamic import で WebGL コンポーネントを遅延ロード:
```tsx
import dynamic from 'next/dynamic';

const ParticleField = dynamic(() => import('@/components/webgl/ParticleField'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-bg" />,
});
```

---

## 7. Cloudflare Pages デプロイ

### 7.1 ビルド設定

```yaml
# Cloudflare Pages ダッシュボード設定
Build command: npx next build
Build output directory: out
Node.js version: 20
```

### 7.2 _headers ファイル

```
# public/_headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
```

### 7.3 _redirects ファイル

```
# public/_redirects
/  /index.html  200
```

---

## 8. ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── projects/
│   │   └── [slug]/
│   │       └── page.tsx
│   └── about/
│       └── page.tsx
├── components/
│   ├── providers/
│   │   ├── SmoothScrollProvider.tsx   // 技術⑤ Lenis
│   │   └── PageTransition.tsx         // 技術⑦ 遷移
│   ├── webgl/
│   │   ├── ImagePlane.tsx             // 技術① シェーダー
│   │   ├── ParticleField.tsx          // 技術⑥ パーティクル
│   │   └── CompositeTransition.tsx    // 技術② コンポジット
│   ├── ui/
│   │   ├── CustomCursor.tsx           // 技術③ カーソル
│   │   ├── TextReveal.tsx             // 技術④ テキスト
│   │   ├── ScrollIndicator.tsx
│   │   └── ProjectCard.tsx
│   └── sections/
│       ├── Hero.tsx
│       ├── About.tsx
│       ├── Projects.tsx
│       └── Contact.tsx
├── data/
│   └── projects.ts
├── hooks/
│   ├── useMediaQuery.ts
│   └── useReducedMotion.ts
└── lib/
    └── utils.ts
```

---

## 9. SEO & アクセシビリティ

```tsx
// app/layout.tsx — metadata
export const metadata: Metadata = {
  title: 'RYOKEN | Creative Developer',
  description: 'フロントエンドエンジニアのポートフォリオ。WebGL、アニメーション、インタラクティブデザインを駆使した作品を紹介。',
  openGraph: {
    title: 'RYOKEN | Creative Developer',
    description: 'フロントエンドエンジニアのポートフォリオ',
    images: ['/og.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};
```

- すべてのセクションに適切な `aria-label`
- WebGL キャンバスに `role="img"` + `aria-label`
- reduce-motion 対応（技術⑤参照）
- キーボードナビゲーション可能
- Lighthouse スコア目標: Performance 90+, Accessibility 100, Best Practices 100, SEO 100

---

## 10. 実装の優先順位

1. **Phase 1 — 基盤**: Next.js プロジェクト作成 → Tailwind v4 設定 → Lenis（技術⑤）→ ページ構成
2. **Phase 2 — 核**: TextReveal（技術④）→ CustomCursor（技術③）→ Hero セクション
3. **Phase 3 — WebGL**: ImagePlane（技術①）→ ParticleField（技術⑥）→ Projects セクション
4. **Phase 4 — 遷移**: PageTransition（技術⑦）→ CompositeTransition（技術②）
5. **Phase 5 — 仕上げ**: レスポンシブ → パフォーマンス最適化 → SEO → デプロイ

---

## 11. 依存パッケージ

```bash
# プロジェクト作成
npx create-next-app@latest portfolio --typescript --tailwind --app --src-dir

# 必須パッケージ
npm install gsap lenis ogl

# 開発用
npm install -D @types/node
```

**注意**: GSAP の ScrollTrigger は `gsap` パッケージに含まれている（追加インストール不要）。`import { ScrollTrigger } from 'gsap/ScrollTrigger'` でインポート可能。

---

## 12. 重要な注意事項

- **テーマ・世界観は一切つけない**。純粋に技術とデザインの質で勝負する。
- **Arnaud Rocca のポートフォリオ**（Codrops ケーススタディ）を参考: GSAP モーションシステム + OGL の流体 WebGL がベンチマーク。
- **Static Export (`output: 'export'`)** なので API Routes / Server Actions は使用不可。データはすべて静的。
- カスタムカーソルと WebGL は **デスクトップ (md以上)** でのみ有効。モバイルでは通常のスクロール + フェードアニメーションにフォールバック。
- `'use client'` ディレクティブを WebGL / アニメーション系コンポーネントに忘れずに付与。