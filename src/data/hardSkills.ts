interface HardSkill {
  name: string;
  description: string;
  icon: string;
}

const hardSkills: HardSkill[] = [
  {
    name: "Java",
    description: "Object-oriented language used for backend development and building scalable applications.",
    icon: "java-fill",
  },
  {
    name: "Python",
    description: "Versatile language used for data analysis, automation scripting, and workflow optimization.",
    icon: "python-fill",
  },
  {
    name: "MySQL",
    description: "Relational database system for structured data storage, querying, and reporting.",
    icon: "mysql",
  },
  {
    name: "SAP S/4HANA",
    description: "Enterprise ERP platform for managing materials master data, workflows, and business operations.",
    icon: "sap-fill",
  },
];

export default hardSkills;
