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
}

export type Experience = {
  id: string
  company: string
  role: string
  period: { start: string; end: string }
  summary: string
  tags: string[]
}

export type Education = {
  id: string
  school: string
  degree: string
  period: { start: string; end: string }
  summary: string
  tags: string[]
}

export type Profile = {
  name: string
  nameEn: string
  title: string
  introduction: string[]
  email: string
  photo?: string
  social: { label: string; href: string }[]
}

export type NavItem = { label: string; href: string }
