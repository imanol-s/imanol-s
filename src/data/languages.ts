interface Language {
  name: string;
  level: string;
  description: string;
  show: boolean;
}

const languages: Language[] = [
  {
    name: "English",
    level: "Native",
    description: "I speak fluently and write fluently",
    show: true,
  },
  {
    name: "Spanish",
    level: "Bilingual",
    description: "I speak fluently fluently",
    show: true,
  },
];

export default languages;
