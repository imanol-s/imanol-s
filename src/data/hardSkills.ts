interface HardSkill {
  name: string;
  description: string;
  icon: string;
}

const hardSkills: HardSkill[] = [
  {
    name: "Java",
    description: "My first programming language formally learned.",
    icon: "java-fill",
  },
  {
    name: "Python",
    description: "My favorite for easy scripting and fast development.",
    icon: "python-fill",
  },
  {
    name: "MySQL",
    description: "First database I learned and used in a DBMS",
    icon: "mysql",
  },
];

export default hardSkills;
