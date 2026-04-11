import type { Skill } from "@/types"

// スキルデータ
export const skills: Skill[] = [
  // Frontend
  {
    name: "TypeScript",
    icon: "FileCode2",
    category: "Frontend",
    proficiency: "Expert",
    size: "large",
  },
  {
    name: "React",
    icon: "Atom",
    category: "Frontend",
    proficiency: "Expert",
    size: "large",
  },
  {
    name: "Next.js",
    icon: "Globe",
    category: "Frontend",
    proficiency: "Advanced",
    size: "medium",
  },
  {
    name: "Tailwind CSS",
    icon: "Palette",
    category: "Frontend",
    proficiency: "Advanced",
    size: "medium",
  },
  {
    name: "Vue.js",
    icon: "Layers",
    category: "Frontend",
    proficiency: "Intermediate",
    size: "small",
  },

  // Backend
  {
    name: "Node.js",
    icon: "Server",
    category: "Backend",
    proficiency: "Advanced",
    size: "large",
  },
  {
    name: "Python",
    icon: "Terminal",
    category: "Backend",
    proficiency: "Advanced",
    size: "medium",
  },
  {
    name: "PostgreSQL",
    icon: "Database",
    category: "Backend",
    proficiency: "Advanced",
    size: "medium",
  },
  {
    name: "GraphQL",
    icon: "Network",
    category: "Backend",
    proficiency: "Intermediate",
    size: "small",
  },

  // Tools
  {
    name: "Git",
    icon: "GitBranch",
    category: "Tools",
    proficiency: "Expert",
    size: "medium",
  },
  {
    name: "Docker",
    icon: "Container",
    category: "Tools",
    proficiency: "Advanced",
    size: "medium",
  },
  {
    name: "AWS",
    icon: "Cloud",
    category: "Tools",
    proficiency: "Intermediate",
    size: "small",
  },
  {
    name: "CI/CD",
    icon: "RefreshCw",
    category: "Tools",
    proficiency: "Advanced",
    size: "small",
  },

  // Other
  {
    name: "Figma",
    icon: "PenTool",
    category: "Other",
    proficiency: "Intermediate",
    size: "medium",
  },
  {
    name: "Agile/Scrum",
    icon: "Users",
    category: "Other",
    proficiency: "Advanced",
    size: "small",
  },
]
