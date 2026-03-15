interface Job {
  title: string;
  startDate: string;
  endDate?: string;
  company: string;
  location: string;
  description: string;
  goals: string[];
  currentJob: boolean;
}

const jobs: Job[] = [
  {
    title: "Associate Data Analyst",
    startDate: "2026-01-16",
    company: "Freeman",
    location: "United States",
    description:
      "Lead documentation and governance for 100+ material master data attributes across 4 legacy and S/4HANA systems. Develop Python automation for data validation and cleaning, supporting migration of 25,000+ material records during ERP transformation. Collaborate with Sales, Materials Management, and IT to define data standards and identify quality issues through analytical reporting.",
    goals: [
      "Defined validation rules and documentation for enterprise master data attributes across SAP and legacy systems.",
      "Built Python scripts to validate and clean data during a 25,000+ record ERP migration.",
      "Drive data quality improvements throughout S/4HANA migration and beyond.",
      "Lead project management and workflow coordination for data operations",
      "Develop comprehensive data governance documentation and process frameworks",
      "Drive cross-functional collaboration across Sales, IT, and Materials Management teams",
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
      "Supported data integrity across enterprise systems. Collaborated with multiple teams to align data with business goals and contributed to evaluation of MDM tools for governance. Worked on large-scale data migration and system integration.",
    goals: [
      "Effective communication and collaboration with cross-functional teams",
      "Adaptability to evolving data management technologies and practices",
      "Strong problem-solving skills to address data quality issues",
      "Attention to detail in managing and validating large datasets",
      "Commitment to continuous learning and professional development in data management",
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
      "Supported integrity of 3,000+ material master records across enterprise systems. Collaborated with cross-functional teams to align data with business goals and contributed to evaluation of MDM tools. Worked on large-scale data migration and system integration during ERP transition.",
    goals: [
      "Maintain high-quality, reliable master data to support enterprise-wide decision-making.",
      "Enhance data governance through modern MDM tools and practices.",
      "Continuously improve data processes through Agile methodologies",
    ],
    currentJob: false,
  },
];
export default jobs;
