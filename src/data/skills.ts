import type { Skill } from '@/types'

const cdnBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'

export const skills: Skill[] = [
  // Frontend
  { name: 'JavaScript', category: 'Frontend', proficiency: '実務4年', size: 'large', icon: `${cdnBase}/javascript/javascript-original.svg` },
  { name: 'TypeScript', category: 'Frontend', proficiency: '実務4年', size: 'large', icon: `${cdnBase}/typescript/typescript-original.svg` },
  { name: 'React', category: 'Frontend', proficiency: '実務4年', size: 'large', icon: `${cdnBase}/react/react-original.svg` },
  { name: 'Next.js', category: 'Frontend', proficiency: '実務3年', size: 'medium', icon: `${cdnBase}/nextjs/nextjs-original.svg` },
  { name: 'Hono', category: 'Frontend', proficiency: '実務1年', size: 'medium', icon: '/images/skills/hono.png' },
  { name: 'Bun', category: 'Frontend', proficiency: '学習中', size: 'small', icon: `${cdnBase}/bun/bun-original.svg` },
  { name: 'Biome', category: 'Frontend', proficiency: '実務1年', size: 'small', icon: '/images/skills/biome.svg' },
  { name: 'Tailwind CSS', category: 'Frontend', proficiency: '実務3年', size: 'medium', icon: `${cdnBase}/tailwindcss/tailwindcss-original.svg` },
  { name: 'Bootstrap', category: 'Frontend', proficiency: '実務2年', size: 'small', icon: `${cdnBase}/bootstrap/bootstrap-original.svg` },

  // Backend
  { name: 'Python', category: 'Backend', proficiency: '実務2年', size: 'medium', icon: `${cdnBase}/python/python-original.svg` },
  { name: 'Django', category: 'Backend', proficiency: '実務2年', size: 'medium', icon: `${cdnBase}/django/django-plain.svg` },
  { name: 'Flask', category: 'Backend', proficiency: '実務1年', size: 'medium', icon: `${cdnBase}/flask/flask-original.svg` },
  { name: 'FastAPI', category: 'Backend', proficiency: '実務1年', size: 'medium', icon: `${cdnBase}/fastapi/fastapi-original.svg` },
  { name: '各種DB', category: 'Backend', proficiency: '実務3年', size: 'medium', icon: `${cdnBase}/postgresql/postgresql-original.svg` },
  { name: 'Java', category: 'Backend', proficiency: '少し経験', size: 'small', icon: `${cdnBase}/java/java-original.svg`, kind: 'bubble' },
  { name: 'Go', category: 'Backend', proficiency: '少し経験', size: 'small', icon: `${cdnBase}/go/go-original.svg`, kind: 'bubble' },

  // Infrastructure
  { name: 'Google Cloud', category: 'Infrastructure', proficiency: '実務2年', size: 'medium', icon: `${cdnBase}/googlecloud/googlecloud-original.svg` },
  { name: 'AWS', category: 'Infrastructure', proficiency: '実務2年', size: 'medium', icon: `${cdnBase}/amazonwebservices/amazonwebservices-original-wordmark.svg` },
  { name: 'Azure', category: 'Infrastructure', proficiency: '学習中', size: 'small', icon: `${cdnBase}/azure/azure-original.svg` },
  { name: 'Docker', category: 'Infrastructure', proficiency: '実務2年', size: 'medium', icon: `${cdnBase}/docker/docker-original.svg` },
  { name: 'GitHub Actions', category: 'Infrastructure', proficiency: '実務2年', size: 'medium', icon: `${cdnBase}/githubactions/githubactions-original.svg` },
]
