import type { MDXComponents } from "mdx/types"

// MDXカスタムコンポーネント
export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="mb-6 mt-10 text-3xl font-bold tracking-tight text-text-primary"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mb-4 mt-8 text-2xl font-bold tracking-tight text-text-primary"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mb-3 mt-6 text-xl font-bold text-text-primary"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mb-4 leading-relaxed text-text-secondary" {...props} />
  ),
  a: (props) => (
    <a
      className="text-accent-blue underline decoration-accent-blue/30 underline-offset-4 transition-colors hover:text-accent-purple"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  ul: (props) => (
    <ul className="mb-4 ml-6 list-disc space-y-2 text-text-secondary" {...props} />
  ),
  ol: (props) => (
    <ol
      className="mb-4 ml-6 list-decimal space-y-2 text-text-secondary"
      {...props}
    />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mb-4 border-l-4 border-accent-blue pl-4 italic text-text-muted"
      {...props}
    />
  ),
  code: (props) => {
    // インラインコードかブロックコードかを判定
    const isBlock =
      typeof props.children === "string" && props.children.includes("\n")
    if (isBlock) {
      return (
        <code
          className="block overflow-x-auto rounded-xl bg-surface-elevated p-4 text-sm text-text-primary font-mono"
          {...props}
        />
      )
    }
    return (
      <code
        className="rounded-md bg-surface-elevated px-1.5 py-0.5 text-sm font-mono text-accent-blue"
        {...props}
      />
    )
  },
  pre: (props) => (
    <pre
      className="mb-4 overflow-x-auto rounded-xl border border-border bg-surface-elevated p-4 text-sm"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-border" />,
  strong: (props) => (
    <strong className="font-bold text-text-primary" {...props} />
  ),
}
