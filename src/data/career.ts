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
      "Own SAP data governance and connect business needs with technical delivery, from data setup and change requests to automation and reporting.",
    goals: [
      "Own SAP data governance from request intake through change execution and validation.",
      "Lead the setup of new data, including standardized workflows.",
      "Use my technical background to connect developers, business users, and enterprise teams.",
      "Manage project requirements and backlogs for automation, features, enhancements, and bug reports.",
      "Work with business users across the enterprise to identify process problems, gather requirements, investigate root causes, and deliver solutions through automation, data reporting, and improvements to request workflows.",
    ],
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
      "Analyzed and validated material master records across U.S. operations. Maintained data integrity throughout an active enterprise system migration",
      "Led cross-functional requirements analysis and stakeholder gathering. Surfaced business needs, defined scope, and structured development-ready user stories following internal SDLC standards",
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
      "Led cross-functional discovery and facilitation for a revenue-critical product attribute lacking governance. Ran stakeholder sessions that produced the governance model, metadata requirements, and user story",
      "Supported a bulk master data extension project enabling invoicing out of internal systems for a newly established business entity",
      "Investigated lifecycle flag behavior across legacy and target systems. Documented cross-system gaps in communication, audit trails, and stakeholder notification that informed future enhancements",
      "Authored user stories following internal SDLC standards. Led requirements gathering across cross-functional stakeholders, defined acceptance criteria, surfaced edge cases, and structured stories to development-ready state",
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

/** Returns the full work history in display order for the homepage timeline. */
export function timelineJobs(): WorkExperience[] {
  return workExperience.slice();
}

/** Returns the primary education entry, or null if none exists. */
export function primaryEducation(): Education | null {
  return education[0] ?? null;
}
