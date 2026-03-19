export interface Education {
  degree: string;
  institution: string;
  branch: string;
  cgpa: string;
  year: string;
}

export interface Project {
  name: string;
  description: string;
  tech: string;
  link: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
    location: string;
  };
  education: Education[];
  skills: {
    technical: string[];
    tools: string[];
    languages: string[];
    soft: string[];
  };
  projects: Project[];
  experience: Experience[];
  certifications: Certification[];
  achievements: string[];
}

export const emptyResume = (): ResumeData => ({
  personal: { name: "", email: "", phone: "", linkedin: "", github: "", portfolio: "", location: "" },
  education: [{ degree: "", institution: "", branch: "", cgpa: "", year: "" }],
  skills: { technical: [], tools: [], languages: [], soft: [] },
  projects: [{ name: "", description: "", tech: "", link: "" }],
  experience: [],
  certifications: [],
  achievements: [],
});
