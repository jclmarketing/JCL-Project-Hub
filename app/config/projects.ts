export type ProjectType = "static" | "vite" | "nextjs" | "wordpress";

export interface Project {
  slug: string;
  name: string;
  description: string;
  type: ProjectType;
  category: string;
  color: string;
  externalUrl?: string;
}

export const projects: Project[] = [
  // Static HTML Sites
  {
    slug: "arco-locksmiths",
    name: "Arco Locksmiths",
    description: "Locksmith services website",
    type: "static",
    category: "Client Website",
    color: "#3B82F6",
  },
  {
    slug: "cp-electrics",
    name: "CP Electrics",
    description: "Electrical services website",
    type: "static",
    category: "Client Website",
    color: "#F59E0B",
  },
  {
    slug: "current-tech-solutions",
    name: "Current Tech Solutions",
    description: "Tech solutions company website",
    type: "static",
    category: "Client Website",
    color: "#10B981",
  },
  {
    slug: "averis-electrical",
    name: "Averis Electrical",
    description: "Electrical contractor website",
    type: "static",
    category: "Client Website",
    color: "#8B5CF6",
  },
  {
    slug: "simon-paul-hair",
    name: "Simon Paul Hair",
    description: "Hair salon website",
    type: "static",
    category: "Client Website",
    color: "#EC4899",
  },
  {
    slug: "holmlea-locksmith",
    name: "Holmlea Locksmith",
    description: "Locksmith services website",
    type: "static",
    category: "Client Website",
    color: "#6366F1",
  },
  {
    slug: "ap-sweepz-redesign",
    name: "AP Sweepz",
    description: "Chimney sweep services redesign",
    type: "static",
    category: "Redesign",
    color: "#F97316",
  },
  {
    slug: "excel-asbestos-redesign",
    name: "Excel Asbestos",
    description: "Asbestos removal services redesign",
    type: "static",
    category: "Redesign",
    color: "#EF4444",
  },
  {
    slug: "patterniq-redesign",
    name: "PatternIQ",
    description: "PatternIQ platform redesign",
    type: "static",
    category: "Redesign",
    color: "#14B8A6",
  },
  {
    slug: "agency-portfolio",
    name: "Agency Portfolio",
    description: "Digital agency portfolio site",
    type: "static",
    category: "Portfolio",
    color: "#A855F7",
  },
  {
    slug: "ai-agency-portfolio",
    name: "AI Agency Portfolio",
    description: "AI-focused agency portfolio",
    type: "static",
    category: "Portfolio",
    color: "#06B6D4",
  },
  // TODO: Portfolio-Website needs npm install + build (heavy Three.js deps)
  // Uncomment once built and copied to public/projects/Portfolio-Website
  // {
  //   slug: "Portfolio-Website",
  //   name: "Portfolio Website",
  //   description: "Personal portfolio with React & Three.js",
  //   type: "vite",
  //   category: "Portfolio",
  //   color: "#F43F5E",
  // },
  // Next.js Projects (built to static export)
  {
    slug: "agent-dashboard",
    name: "Agent Dashboard",
    description: "AI agent monitoring dashboard",
    type: "nextjs",
    category: "App",
    color: "#2563EB",
  },
  {
    slug: "primera-redesign",
    name: "Primera Redesign",
    description: "Primera website redesign",
    type: "nextjs",
    category: "Redesign",
    color: "#DC2626",
  },
  // WordPress (external links)
  {
    slug: "mighty-theme",
    name: "Mighty Theme",
    description: "Custom WordPress theme",
    type: "wordpress",
    category: "WordPress",
    color: "#21759B",
  },
  {
    slug: "rawhoney-theme",
    name: "Raw Honey Theme",
    description: "WordPress theme for Raw Honey",
    type: "wordpress",
    category: "WordPress",
    color: "#D97706",
  },
  {
    slug: "brooks-theme-update",
    name: "Brooks Theme Update",
    description: "WordPress theme updates",
    type: "wordpress",
    category: "WordPress",
    color: "#059669",
  },
  {
    slug: "current-tech-solutions-wp",
    name: "Current Tech Solutions WP",
    description: "WordPress version of CTS site",
    type: "wordpress",
    category: "WordPress",
    color: "#7C3AED",
  },
  {
    slug: "averis-electrical-wp",
    name: "Averis Electrical WP",
    description: "WordPress version of Averis site",
    type: "wordpress",
    category: "WordPress",
    color: "#BE185D",
  },
];

export const categories = [...new Set(projects.map((p) => p.category))];
