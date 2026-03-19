import type { TechId } from './data/techRegistry';

export const SITE = {
  website: "https://imanols.dev", // replace this with your deployed domain
  title: "Imanol Saldana",
  description: "Imanol Saldana — software engineer portfolio featuring projects in data science, robotics, and full-stack development.",
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
  bio?: string;
  location: string;
  focusAreas: string[];
  coreLanguages: TechId[];
  competencies: string[];
  languages: { name: string; level: string }[];
  contactInfo: { email: string; linkedin: string; resumeDoc: string };
} = {
  name: "Imanol Saldana",
  profession: ["Data Analytics", "Data Science", "Software"],
  profileImage: "Profile-1.png",
  aboutMe:
    "Computer science–trained developer focused on data science, automation, and software. " +
    "I build data-driven tools and workflows that improve reliability, clarity, and decision-making in real-world systems.",
  location: "38.25\u00b0 N, 122.41\u00b0 W",
  focusAreas: [
    "Data science & analytics",
    "Automation & tooling",
    "Systems & reliability",
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
