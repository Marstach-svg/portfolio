"use client"

import { SectionWrapper } from "@/components/ui/SectionWrapper"
import { Timeline } from "@/components/ui/Timeline"
import { experiences } from "@/content/experience"

export function Experience() {
  // 経歴データをタイムラインの形式に変換
  const timelineItems = experiences.map((exp) => ({
    id: exp.id,
    title: exp.company,
    subtitle: exp.role,
    period: `${exp.period.start} — ${exp.period.end}`,
    description: exp.summary,
    tags: exp.tags,
  }))

  return (
    <SectionWrapper id="experience" title="Experience" subtitle="職歴">
      <Timeline items={timelineItems} />
    </SectionWrapper>
  )
}
