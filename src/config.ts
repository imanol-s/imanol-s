import type { TechId } from "./data/techRegistry";

export const SITE = {
  website: "https://imanols.dev", // replace this with your deployed domain
  title: "Imanol Saldana",
  description:
    "Imanol Saldana: analytical engineer building processes and systems that solve data problems. Projects in data analysis, data science, automation, and software engineering.",
  tags: ["portfolio", "Resume cv", "Astro"],
  ogImage: "/og-image.webp",
  logo: "frog",
  logoText: "Imanol",
  lang: "en",
  favicon: "/favicon.png",
  repository: "https://github.com/imanol-s/oman-portfolio.git",
  author: "Imanol Saldana",
};

export const ME: {
  name: string;
  profession: string[];
  aboutMe: string;
  headline: string[];
  portraitNote: string;
  workingStyle: string;
  approach: { title: string; description: string }[];
  contactNote: string;
  location: string;
  focusAreas: string[];
  coreLanguages: TechId[];
  competencies: string[];
  languages: { name: string; level: string }[];
  contactInfo: { email: string; linkedin: string; resumeDoc: string };
} = {
  name: "Imanol Saldana",
  profession: ["Analytical Engineer", "Software Developer"],
  aboutMe:
    "I build tools and workflows that make enterprise data easier to trust. My work connects data analysis, automation, and software development to the people who use them.",
  headline: ["Making data reliable.", "Making work simpler."],
  portraitNote: "Always learning. Usually building.",
  workingStyle:
    "I ask questions, learn the context, and work toward a useful first version. When the problem changes, I adapt and keep improving what I build.",
  approach: [
    {
      title: "Understand the problem",
      description:
        "Start with the people, the data, and the constraints. Make sure the right problem is getting solved.",
    },
    {
      title: "Build something useful",
      description:
        "Turn repetitive work into clear workflows and practical tools. Make the next person’s job easier.",
    },
    {
      title: "Keep learning",
      description:
        "Test assumptions, listen to feedback, and get comfortable with unfamiliar tools. Improve as I go.",
    },
  ],
  contactNote:
    "Have a role, a project, or a data problem in mind? I’d be glad to hear about it.",
  location: "38.25\u00b0 N, 122.41\u00b0 W",
  focusAreas: [
    "Data engineering & analytics",
    "Automation & pipeline development",
    "Enterprise data management",
  ],
  coreLanguages: ["python", "java", "sql", "r"],
  competencies: [
    "Data Governance",
    "Data Management",
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
    show: true,
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/imanol-saldana",
    show: true,
  },
];
