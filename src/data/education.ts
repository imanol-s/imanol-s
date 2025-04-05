interface Education {
  title: string;
  startDate: string;
  endDate?: string;
  school: string;
  location: string;
  description: string;
  currentUni: boolean;
}

const education: Education[] = [
  {
    title: "Bachelor of Science in Computer Science",
    startDate: "2020-08-15",
    endDate: "2025-12-15",
    school: "University of Texas at Dallas",
    location: "Texas, United States",
    description:
      "A rigorous program focused on algorithms, programming paradigms, and computational theory, " +
      "combined with hands-on training in software development, systems design, and data-driven " +
      "problem-solving. Emphasizes analytical thinking, collaborative project execution, and" +
      "technical expertise in tools like Python, Java, and R, preparing graduates for roles in" +
      "software engineering, data science, AI, and systems architecture.",
    currentUni: true,
  },
];

export default education;
