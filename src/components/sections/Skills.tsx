"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as LucideIcons from "lucide-react"
import { SectionWrapper } from "@/components/ui/SectionWrapper"
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid"
import { skills } from "@/content/skills"
import { cn } from "@/lib/utils"
import type { Skill } from "@/types"

// カテゴリ一覧
const categories = ["All", "Frontend", "Backend", "Tools", "Other"] as const
type Category = (typeof categories)[number]

// 習熟度ラベルの色
const proficiencyColors: Record<Skill["proficiency"], string> = {
  Beginner: "text-yellow-400",
  Intermediate: "text-blue-400",
  Advanced: "text-purple-400",
  Expert: "text-green-400",
}

// Lucide アイコンを動的に取得
function getIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as any
  const Icon = icons[iconName]
  return (Icon || LucideIcons.Code2) as React.ComponentType<{ className?: string }>
}

export function Skills() {
  const [activeCategory, setActiveCategory] = useState<Category>("All")

  const filteredSkills =
    activeCategory === "All"
      ? skills
      : skills.filter((s) => s.category === activeCategory)

  return (
    <SectionWrapper id="skills" title="Skills" subtitle="技術スタック">
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

      {/* スキルグリッド */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <BentoGrid>
            {filteredSkills.map((skill) => {
              const Icon = getIcon(skill.icon)
              return (
                <BentoItem key={skill.name} size={skill.size}>
                  <div
                    className={cn(
                      "flex h-full flex-col",
                      skill.size === "large" ? "gap-4" : "gap-3"
                    )}
                  >
                    <Icon
                      className={cn(
                        "text-accent-blue",
                        skill.size === "large" ? "h-10 w-10" : "h-6 w-6"
                      )}
                    />
                    <div>
                      <h3
                        className={cn(
                          "font-bold text-text-primary",
                          skill.size === "large" ? "text-xl" : "text-base"
                        )}
                      >
                        {skill.name}
                      </h3>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          proficiencyColors[skill.proficiency]
                        )}
                      >
                        {skill.proficiency}
                      </span>
                    </div>
                    {skill.size === "large" && (
                      <p className="text-sm text-text-muted">
                        主要な技術として日常的に使用
                      </p>
                    )}
                  </div>
                </BentoItem>
              )
            })}
          </BentoGrid>
        </motion.div>
      </AnimatePresence>
    </SectionWrapper>
  )
}
