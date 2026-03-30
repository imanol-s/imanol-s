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
  description: string;
  currentUni?: boolean;
}

export const workExperience: WorkExperience[] = [
  {
    title: "Associate Data Analyst",
    startDate: "2026-01-16",
    company: "Freeman",
    location: "United States",
    description:
      "Own data governance and documentation for material master data across legacy and target systems. Pioneered the team's data dictionary, drove cross-functional request implementation through a newly adopted platform, and lead stakeholder alignment on data standards and operational procedures.",
    goals: [
      "Pioneered a data dictionary spanning 300+ definitions — data types, frontend/backend translations, and governance metadata across legacy and target systems",
      "Drove cross-functional request implementation through a newly adopted internal platform, establishing the operational workflow from intake to completion",
      "Authored process documentation and led stakeholder walkthrough sessions to align teams on data standards and operational procedures",
    ],
    currentJob: true,
  },

  {
    title: "Data Operations Analyst - Part Time",
    startDate: "2025-08-16",
    endDate: "2026-01-16",
    company: "Freeman",
    location: "United States",
    description:
      "Took on independent ownership of material data validation and maintenance across U.S. operations. Led requirements analysis with cross-functional stakeholders, built validation workflows across production and legacy systems, and documented internal data processing workflows ahead of team transitions.",
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
      "Explored material master data governance during an active enterprise system migration. Facilitated cross-functional discovery sessions, investigated data lifecycle behaviors across legacy and target systems, and authored user stories to internal SDLC standards.",
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
    description: "",
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

/** The number of recent jobs shown on the homepage experience timeline. */
const TIMELINE_JOB_COUNT = 3;

/**
 * Returns the most recent work experiences for the homepage timeline preview.
 * The full list is available via `workExperience`.
 */
export function timelineJobs(): WorkExperience[] {
  return workExperience.slice(0, TIMELINE_JOB_COUNT);
}

/** Returns the primary education entry, or null if none exists. */
export function primaryEducation(): Education | null {
  return education[0] ?? null;
}
