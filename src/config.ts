import type { TechId } from "./data/techRegistry";

export const SITE = {
  website: "https://imanols.dev", // replace this with your deployed domain
  title: "Imanol Saldana",
  description:
    "Imanol Saldana — analytical engineer building processes and systems that solve data problems. Projects in data analysis, data science, automation, and software engineering.",
  tags: ["portfolio", "Resume cv", "Astro"],
  ogImage: "/og-image.webp",
  logo: "frog",
  logoText: "Imanol",
  lang: "en",
  favicon: "/favicon.png",
  repository: "https://github.com/imanol-s/oman-portfolio.git",
  author: "Imanol Saldana",
  profile: "https://imanols.dev",
};

export const ME: {
  name: string;
  profession: string[];
  profileImage: string;
  aboutMe: string;
  location: string;
  focusAreas: string[];
  coreLanguages: TechId[];
  competencies: string[];
  languages: { name: string; level: string }[];
  contactInfo: { email: string; linkedin: string; resumeDoc: string };
} = {
  name: "Imanol Saldana",
  profession: ["Analytical Engineer", "Software Developer"],
  profileImage: "Profile-1.png",
  aboutMe:
    "Analytical engineer building processes and systems that make enterprise data reliable. " +
    "From validation workflows to automation pipelines, I solve data problems with code.",
  location: "38.25\u00b0 N, 122.41\u00b0 W",
  focusAreas: [
    "Data engineering & analytics",
    "Automation & pipeline development",
    "Enterprise systems integration",
  ],
  coreLanguages: ["python", "java", "sql", "r"],
  competencies: [
    "Data Governance",
    "Simulation & Robotics",
    "ERP (SAP S/4HANA)",
    "Predictive Modeling",
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "Spanish", level: "Bilingual" },
  ],
  contactInfo: {
    email: "Imanol.dev@proton.me",
    linkedin: "https://linkedin.com/in/imanol-saldana",
    resumeDoc: "Saldana.Resume.pdf",
  },
};

export const SOCIALS = [
  {
    name: "GitHub",
    url: "https://github.com/imanol-s",
    icon: "github-fill",
    show: true,
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/imanol-saldana",
    icon: "linkedin-fill",
    show: true,
  },
];
