interface Education {
  title: string;
  endDate?: string;
  school: string;
  location: string;
  description: string;
  currentUni?: boolean;
}

const education: Education[] = [
  {
    title: "B.S. in Computer Science",
    endDate: "2025-12-18",
    school: "University of Texas at Dallas",
    location: "Texas, United States",
    description: "",
  },
];

export default education;
