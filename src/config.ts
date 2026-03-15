interface SiteConfig {
  website: string;
  title: string;
  description: string;
  tags: string[];
  ogImage: string;
  logo: string;
  logoText: string;
  lang: string;
  favicon: string;
  repository: string;
  author: string;
  profile: string;
}

interface ContactInfo {
  email: string;
  linkedin: string;
  resumeDoc: string;
}

interface Language {
  name: string;
  level: string;
}

interface PersonConfig {
  name: string;
  profession: string[];
  profileImage: string;
  bio: string;
  location: string;
  focusAreas: string[];
  coreLanguages: string[];
  competencies: string[];
  languages: Language[];
  contactInfo: ContactInfo;
}

interface SocialLink {
  name: string;
  url: string;
  icon: string;
  show: boolean;
}

export const SITE: SiteConfig = {
  website: "https://imanols.dev",
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

const bio =
  "Computer science–trained developer focused on data science, automation, and software. " +
  "I build data-driven tools and workflows that improve reliability, clarity, and decision-making in real-world systems.";

export const ME: PersonConfig = {
  name: "Imanol Saldana",
  profession: ["Data Analytics", "Data Science", "Software"],
  profileImage: "Profile-1.png",
  bio,
  location: "38.25\u00b0 N, 122.41\u00b0 W",
  focusAreas: [
    "Data science & analytics",
    "Automation & tooling",
    "Systems & reliability",
  ],
  coreLanguages: ["Python", "Java", "SQL", "R"],
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

export const SOCIALS: SocialLink[] = [
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
