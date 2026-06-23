export interface Project {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  imageUrl: string;
  status: "LIVE" | "BETA" | "ARCHIVED";
  link: string;
}

export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: number;
  abstract: string;
  link: string;
  tags: string[];
  status: "PUBLISHED" | "DRAFT";
  views?: string;
  lastEdited?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  desc: string;
  type: "WORK" | "EDUCATION";
}

export interface ProfileSettings {
  name: string;
  title: string;
  role: string;
  subtitle: string;
  heroBio: string;
  aboutTitle: string;
  aboutBio: string;
  portraitUrl: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  twitter: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
}

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: "nyra",
    title: "NYRA",
    desc: "A next-generation AI agent designed for complex task orchestration. Featuring real-time holographic feedback loops and multimodal voice interaction.",
    tags: ["DYNAMIC VOICE FEEDBACK", "HOLOGRAPHIC INTERFACE INTEGRATION", "AUTONOMOUS TOOL USE (LANGGRAPH)"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrbpHFWAjiotl3ESRmVAqgE2xTaMjXmeOIm6hOJ_txbcHK3DtfdZ_biImZ6Nv9691VG53QW9AEuUXsPKTlBzgwFtjw51Z3El9XjRwHRcSAukSzd2VsPgD6GtuRF7xkx0qwYqijnSPoROpOyt4HyRUgJvnITVQVuQbmUvPxPmxnI6M94hoNFLu70NaoUBb4NPR5Q_x2sohWljU0pql4LtFm7cy78IbpypmoiLbb6HHmcDSKrZ8UZSho-aO4rG-0PhSD2_HA61TndB0",
    status: "LIVE",
    link: "#",
  },
  {
    id: "aegis",
    title: "AEGIS V",
    desc: "Surgical-grade LLM security framework designed to detect and neutralize adversarial prompt injections and data poisoning in real-time.",
    tags: ["THREAT EMBEDDINGS", "SELF-HARDENING CORE", "ZERO-TRUST AI"],
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxpNrC_pEK7tH8m3U4X21RTGr7am09MQRrPym5pf6wcMWGDsVA40T4gP0RZwaRMAWNpi4iFcRPvzYqgP5WAvSp-GOOoIaFJnDzGw-IZf_tImoUN8wOlRITfqjs7Wz-qM1L-no_t-3mEYXX3UciZLvk-U3s8D_UejPj43s0GUUZODiVLGmgu90u4bBiELyBePDS5qgSIxTz8tyDTfuXKjrY3ssi61ug6-wDZ1t7SfOHp-vaRN7ybMOVyX0cmpd6JR_npI_pJCocOUM",
    status: "LIVE",
    link: "#",
  }
];

export const DEFAULT_PUBLICATIONS: Publication[] = [
  {
    id: "pub-1",
    title: "Adversarial Robustness in Distributed LLM Systems",
    venue: "ICDCN 2025",
    year: 2025,
    abstract: "Exploring the impact of multi-node poisoning on centralized reasoning engines.",
    link: "#",
    tags: ["DISTRIBUTED SYSTEMS", "FEDERATED LEARNING", "PROTOCOLS"],
    status: "PUBLISHED",
    views: "1.2k views",
  },
  {
    id: "pub-2",
    title: "Autonomous Agents for Real-time Threat Intelligence",
    venue: "IRJMETS 2025",
    year: 2025,
    abstract: "Framework for self-healing cybersecurity perimeters using LangGraph.",
    link: "#",
    tags: ["COMPUTER VISION", "TRANSFORMERS"],
    status: "PUBLISHED",
    views: "2.4k views",
  }
];

export const DEFAULT_EXPERIENCES: ExperienceItem[] = [
  {
    id: "exp-1",
    company: "Unified Mentors",
    role: "Data Analyst Intern",
    period: "2023 — 2024",
    desc: "Streamlined ETL pipelines and developed predictive models for user engagement. Reduced data latency by 40% through automated cloud triggers.",
    type: "WORK",
  },
  {
    id: "exp-2",
    company: "Advanced AI Research",
    role: "M.Tech AI & Data Science Candidate",
    period: "Present",
    desc: "Specializing in Large Language Model (LLM) security and autonomous agentic behavior.",
    type: "EDUCATION",
  }
];

export const DEFAULT_SETTINGS: ProfileSettings = {
  name: "Meet Nakum",
  title: "MEET NAKUM",
  role: "M.TECH AI & DS",
  subtitle: "AGENTIC AI DEVELOPER",
  heroBio: "Engineering precision intelligence. Specializing in autonomous agent systems and self-hardening LLM security architectures.",
  aboutTitle: "Engineering AI systems beyond chatbots.",
  aboutBio: "My work resides at the intersection of deep learning and defensive security. I focus on building autonomous agents like NYRA that can interact with the physical and digital world through advanced multimodal reasoning, while ensuring their safety through frameworks like AEGIS V.",
  portraitUrl: "/meet_nakum.jpg",
  stat1Value: "95%",
  stat1Label: "Inference Efficiency",
  stat2Value: "12+",
  stat2Label: "Agent Frameworks",
  email: "meet.nakum@ai.engineering",
  location: "Mumbai, India",
  github: "#",
  linkedin: "#",
  twitter: "#",
};

export function getStoredProjects(): Project[] {
  if (typeof window === "undefined") return DEFAULT_PROJECTS;
  const stored = localStorage.getItem("portfolio_projects");
  if (!stored) {
    localStorage.setItem("portfolio_projects", JSON.stringify(DEFAULT_PROJECTS));
    return DEFAULT_PROJECTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function setStoredProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("portfolio_projects", JSON.stringify(projects));
}

export function getStoredPublications(): Publication[] {
  if (typeof window === "undefined") return DEFAULT_PUBLICATIONS;
  const stored = localStorage.getItem("portfolio_publications");
  if (!stored) {
    localStorage.setItem("portfolio_publications", JSON.stringify(DEFAULT_PUBLICATIONS));
    return DEFAULT_PUBLICATIONS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_PUBLICATIONS;
  }
}

export function setStoredPublications(publications: Publication[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("portfolio_publications", JSON.stringify(publications));
}

export function getStoredExperiences(): ExperienceItem[] {
  if (typeof window === "undefined") return DEFAULT_EXPERIENCES;
  const stored = localStorage.getItem("portfolio_experiences");
  if (!stored) {
    localStorage.setItem("portfolio_experiences", JSON.stringify(DEFAULT_EXPERIENCES));
    return DEFAULT_EXPERIENCES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_EXPERIENCES;
  }
}

export function setStoredExperiences(experiences: ExperienceItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("portfolio_experiences", JSON.stringify(experiences));
}

export function getStoredSettings(): ProfileSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const stored = localStorage.getItem("portfolio_settings");
  if (!stored) {
    localStorage.setItem("portfolio_settings", JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setStoredSettings(settings: ProfileSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem("portfolio_settings", JSON.stringify(settings));
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
}

export const DEFAULT_SKILLS: Skill[] = [
  { id: "skill-1", name: "Python", icon: "🐍" },
  { id: "skill-2", name: "PyTorch", icon: "🔥" },
  { id: "skill-3", name: "LangChain", icon: "🔗" },
  { id: "skill-4", name: "TensorFlow", icon: "🧠" },
  { id: "skill-5", name: "OpenAI", icon: "✨" },
  { id: "skill-6", name: "FastAPI", icon: "⚡" },
  { id: "skill-7", name: "MongoDB", icon: "🍃" },
  { id: "skill-8", name: "Docker", icon: "🐳" },
  { id: "skill-9", name: "Kubernetes", icon: "☸️" },
  { id: "skill-10", name: "Next.js", icon: "▲" },
  { id: "skill-11", name: "React", icon: "⚛️" },
  { id: "skill-12", name: "TypeScript", icon: "📘" },
  { id: "skill-13", name: "PostgreSQL", icon: "🐘" },
  { id: "skill-14", name: "Redis", icon: "🔴" },
  { id: "skill-15", name: "AWS", icon: "☁️" },
  { id: "skill-16", name: "GCP", icon: "🌐" },
  { id: "skill-17", name: "Git", icon: "📂" },
  { id: "skill-18", name: "Linux", icon: "🐧" },
  { id: "skill-19", name: "Hugging Face", icon: "🤗" },
  { id: "skill-20", name: "Scikit-learn", icon: "📊" },
];

export function getStoredSkills(): Skill[] {
  if (typeof window === "undefined") return DEFAULT_SKILLS;
  const stored = localStorage.getItem("portfolio_skills");
  if (!stored) {
    localStorage.setItem("portfolio_skills", JSON.stringify(DEFAULT_SKILLS));
    return DEFAULT_SKILLS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_SKILLS;
  }
}

export function setStoredSkills(skills: Skill[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("portfolio_skills", JSON.stringify(skills));
}

export function getStoredMessages(): ContactMessage[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("portfolio_messages");
  if (!stored) {
    localStorage.setItem("portfolio_messages", JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function setStoredMessages(messages: ContactMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("portfolio_messages", JSON.stringify(messages));
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatarUrl?: string;
}

export const DEFAULT_TESTIMONIALS: Testimonial[] = [];

export function getStoredTestimonials(): Testimonial[] {
  if (typeof window === "undefined") return DEFAULT_TESTIMONIALS;
  const stored = localStorage.getItem("portfolio_testimonials");
  if (!stored) {
    localStorage.setItem("portfolio_testimonials", JSON.stringify(DEFAULT_TESTIMONIALS));
    return DEFAULT_TESTIMONIALS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_TESTIMONIALS;
  }
}

export function setStoredTestimonials(testimonials: Testimonial[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("portfolio_testimonials", JSON.stringify(testimonials));
}


