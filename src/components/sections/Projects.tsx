"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ExternalLink, X, Code2 } from "lucide-react"
import { SectionWrapper } from "@/components/ui/SectionWrapper"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { projects } from "@/content/projects"
import { cn } from "@/lib/utils"
import type { Project } from "@/types"

// カテゴリ一覧
const categories = ["All", "Web App", "Mobile", "OSS", "Other"] as const
type Category = (typeof categories)[number]

export function Projects() {
  const [activeCategory, setActiveCategory] = useState<Category>("All")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  return (
    <SectionWrapper id="projects" title="Projects" subtitle="プロジェクト">
      {/* カテゴリフィルタ */}
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-all",
              activeCategory === cat
                ? "bg-gradient-to-r from-accent-blue to-accent-purple text-white"
                : "border border-border text-text-secondary hover:text-text-primary hover:border-border-hover"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* プロジェクトカードグリッド */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* プロジェクト詳細モーダル */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}

// プロジェクトカード
function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project
  index: number
  onClick: () => void
}) {
  return (
    <motion.div
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-border-hover"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      {/* サムネイル */}
      <div className="relative aspect-video overflow-hidden bg-surface-elevated">
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* コンテンツ */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-text-primary">{project.title}</h3>
        <p className="mt-2 text-sm text-text-secondary line-clamp-2">
          {project.description}
        </p>

        {/* 技術タグ */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.techTags.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          {project.techTags.length > 3 && (
            <Badge>+{project.techTags.length - 3}</Badge>
          )}
        </div>

        {/* リンク */}
        <div className="mt-4 flex gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted transition-colors hover:text-text-primary"
              aria-label={`${project.title}のGitHubリポジトリ`}
            >
              <Code2 className="h-5 w-5" />
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted transition-colors hover:text-text-primary"
              aria-label={`${project.title}のライブデモ`}
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// プロジェクト詳細モーダル
function ProjectModal({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  return (
    <>
      {/* 背景オーバーレイ */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* モーダルコンテンツ */}
      <motion.div
        className="fixed inset-x-4 top-[10%] bottom-[10%] z-50 mx-auto max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl md:inset-x-auto md:p-8"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </button>

        {/* サムネイル */}
        <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-surface-elevated">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>

        {/* タイトル */}
        <h2 className="text-2xl font-bold text-text-primary">
          {project.title}
        </h2>

        {/* カテゴリ */}
        <Badge variant="accent" className="mt-2">
          {project.category}
        </Badge>

        {/* 説明 */}
        <p className="mt-4 leading-relaxed text-text-secondary">
          {project.longDescription}
        </p>

        {/* 技術タグ */}
        <div className="mt-6 flex flex-wrap gap-2">
          {project.techTags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        {/* リンクボタン */}
        <div className="mt-8 flex gap-4">
          {project.githubUrl && (
            <Button variant="secondary" href={project.githubUrl}>
              <Code2 className="h-4 w-4" />
              GitHub
            </Button>
          )}
          {project.demoUrl && (
            <Button href={project.demoUrl}>
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </Button>
          )}
        </div>
      </motion.div>
    </>
  )
}
