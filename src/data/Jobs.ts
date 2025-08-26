/**
 * Interface representing work experience details.
 *
 * @property {string} title - The job title of the position.
 * @property {string} startDate - The start date of the position in the format YYYY-MM-DD.
 * @property {string} [endDate] - The end date of the position in the format YYYY-MM-DD.
 *                                Optional, can be omitted if the position is current.
 * @property {string} company - The name of the company where the position was held.
 * @property {string} location - The geographic location of the company (e.g., city, state, country).
 * @property {string} description - A brief description of the roles and responsibilities
 *                                   associated with the position.
 * @property {string[]} goals - A list of professional goals achieved or targeted during the position.
 * @property {boolean} currentJob - Indicates whether the position is the current job.
 */
interface WorkExperience {
  title: string;
  startDate: string;
  endDate?: string;
  company: string;
  location: string;
  description: string;
  goals: string[];
  currentJob: boolean;
}

/**
 * Represents an array of work experiences.
 *
 * Each work experience object contains details about
 * a job position including the title, start and end dates,
 * company name, job location, description of the role,
 * a list of goals or achievements, and a flag indicating
 * if it is the current job.
 *
 * @type {Array<Object>}
 * @property {string} title - The job title.
 * @property {string} startDate - The start date of the job in YYYY-MM-DD format.
 * @property {string} [endDate] - The end date of the job in YYYY-MM-DD format. Optional for current jobs.
 * @property {string} company - The name of the company.
 * @property {string} location - The location of the job.
 * @property {string} description - A brief description of the job responsibilities.
 * @property {Array<string>} goals - A list of goals or achievements within the job.
 * @property {boolean} currentJob - A flag indicating if the job is the current one.
 */
const workExperience: WorkExperience[] = [
  {
    title: "Master Materials Data Analyst Intern",
    startDate: "2025-05-27",
    endDate: "2025-08-16",
    company: "Freeman",
    location: "United States",
    description:
      "At Freeman, I supported the integrity of over 3,000+ materials master records across enterprise systems. I collaborated with cross-functional teams to align data with business goals and contributed to the evaluation of MDM tools to improve governance. During a major ERP transition, I gained hands-on experience with large-scale data migration and system integration.",
    goals: [
      "Maintain high-quality, reliable master data to support enterprise-wide decision-making.",
      "Enhance data governance through modern MDM tools and practices.",
      "Continuously improve data processes through Agile methodologies",
    ],
    currentJob: false,
  },

  {
    title: "Data Operations Analyst",
    startDate: "2025-08-16",
    company: "Freeman",
    location: "United States",
    description:
      "At Freeman, I contined supporting the integrity of data across enterprise systems. I collaborate with multiple teams across the company to align data with business goals and contribute to the evaluation of MDM tools to improve governance. I continue to gain hands-on experience with large-scale data migration and system integration.",
    goals: [
      "Effective communication and collaboration with cross-functional teams",
      "Adaptability to evolving data management technologies and practices",
      "Strong problem-solving skills to address data quality issues",
      "Attention to detail in managing and validating large datasets",
      "Commitment to continuous learning and professional development in data management",
    ],
    currentJob: true,
  },
];
export default workExperience;
