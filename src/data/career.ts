export interface WorkExperience {
  title: string;
  startDate?: string;
  endDate?: string;
  company: string;
  location: string;
  description: string;
  goals: string[];
  currentJob: boolean;
}

export interface Education {
  title: string;
  endDate?: string;
  school: string;
  location: string;
}

export const workExperience: WorkExperience[] = [
  {
    title: "Data Analyst",
    startDate: "2026-10-01",
    company: "Freeman",
    location: "United States",
    description:
      "Building on my experience in SAP automation, data governance, and project delivery.",
    goals: [],
    currentJob: true,
  },
  {
    title: "Associate Data Analyst",
    startDate: "2026-01-16",
    endDate: "2026-10-01",
    company: "Freeman",
    location: "United States",
    description:
      "Built SAP automation and data governance tools while coordinating delivery and validating releases for enterprise data operations.",
    goals: [
      "Built a Python automation tool for SAP material changes, completing 3,000+ updates with built-in logging and self-healing for multi-day runs. Cut a multi-day manual task to ~3 hours (estimated).",
      "Created and operationalized an enterprise Data Dictionary documenting lineage and technical information for ~200+ SAP fields, helping teams interpret data clearly and consistently.",
      "Managed project and feature delivery for data operations, from requirements gathering and scoping through backlog prioritization and execution tracking. Delivered 30+ user stories.",
      "Performed user acceptance testing ahead of release, identifying gaps beyond the stated scope and routing issues to development.",
    ],
    currentJob: false,
  },

  {
    title: "Data Operations Analyst - Part Time",
    startDate: "2025-08-16",
    endDate: "2026-01-16",
    company: "Freeman",
    location: "United States",
    description:
      "Owned material data validation across U.S. operations during a system migration. Built workflows to compare production and legacy records, gathered stakeholder requirements, and documented processes for team handoffs.",
    goals: [
      "Analyzed and validated material master records across U.S. operations — maintained data integrity throughout an active enterprise system migration",
      "Led cross-functional requirements analysis and stakeholder gathering — surfaced business needs, defined scope, and structured development-ready user stories following internal SDLC standards",
      "Built validation workflows comparing production and legacy system hierarchies to verify data integrity during migration",
      "Documented internal data processing workflows to preserve institutional knowledge ahead of team transitions",
    ],
    currentJob: false,
  },
  {
    title: "Material Master Data Steward Intern",
    startDate: "2025-05-01",
    endDate: "2025-08-31",
    company: "Freeman",
    location: "United States",
    description:
      "Learned enterprise data governance through hands-on migration work. Facilitated discovery sessions, investigated data behavior across systems, and translated stakeholder needs into development-ready user stories.",
    goals: [
      "Led cross-functional discovery and facilitation for a revenue-critical product attribute lacking governance — ran stakeholder sessions that produced the governance model, metadata requirements, and user story",
      "Supported a bulk master data extension project enabling invoicing out of internal systems for a newly established business entity",
      "Investigated lifecycle flag behavior across legacy and target systems — documented cross-system gaps in communication, audit trails, and stakeholder notification that informed future enhancements",
      "Authored user stories following internal SDLC standards — led requirements gathering across cross-functional stakeholders, defined acceptance criteria, surfaced edge cases, and structured stories to development-ready state",
    ],
    currentJob: false,
  },
];

export const education: Education[] = [
  {
    title: "B.S. in Computer Science",
    endDate: "2025-12-18",
    school: "University of Texas at Dallas",
    location: "Texas, United States",
  },
];

// --- Accessors ---

/** Returns the parsed startDate as a Date, or null if not set. */
export function jobStartDate(job: WorkExperience): Date | null {
  return job.startDate ? new Date(job.startDate) : null;
}

/** Returns the parsed endDate as a Date, or null if not set. */
export function jobEndDate(job: WorkExperience): Date | null {
  return job.endDate ? new Date(job.endDate) : null;
}

/**
 * Returns the most recent work experiences for the homepage timeline preview.
 * The full list is available via `workExperience`.
 */
export function timelineJobs(): WorkExperience[] {
  return workExperience.slice(0, 3);
}

/** Returns the primary education entry, or null if none exists. */
export function primaryEducation(): Education | null {
  return education[0] ?? null;
}
