export type Project = {
  slug: string
  title: string
  description: string
  thumbnail: string
  tags: string[]
  challenge: string
  solution: string
  outcome: string
  links: { demo?: string; github?: string }
  screenshots: string[]
  year: number
}

export type Skill = {
  name: string
  category: 'Frontend' | 'Backend' | 'Infrastructure' | 'Tools'
  proficiency: string
  size: 'small' | 'medium' | 'large'
  icon?: string
  /** 'bubble' = 通常グリッドから外して泡カードとして別枠表示 */
  kind?: 'normal' | 'bubble'
}

export type Experience = {
  id: string
  company: string
  companyEn?: string
  logo?: string
  role: string
  period: { start: string; end: string }
  summary: string
  tags: string[]
}

export type Education = {
  id: string
  school: string
  schoolEn?: string
  logo?: string
  degree: string
  period: { start: string; end: string }
  summary: string
  tags: string[]
  /** 'bubble' = 通常の時系列タイムラインから外して泡カードとして別枠で表示 */
  kind?: 'timeline' | 'bubble'
}

export type Profile = {
  name: string
  title: string
  introduction: string[]
  email: string
  photo?: string
  social: { label: string; href: string }[]
}

export type Certification = {
  id: string
  name: string
  nameEn?: string
  issuer?: string
  acquiredAt: string
  logo?: string
}

export type NavItem = { label: string; href: string }
