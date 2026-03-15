export interface Education {
  title: string;
  endDate?: Date;
  school: string;
  location: string;
  description: string;
}

const education: Education[] = [
  {
    title: "B.S. in Computer Science",
    endDate: new Date("2025-12-18"),
    school: "University of Texas at Dallas",
    location: "Texas, United States",
    description: "",
  },
];

export default education;
