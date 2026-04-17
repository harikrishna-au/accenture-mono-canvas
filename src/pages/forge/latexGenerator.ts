import { ResumeData } from "./types";

/** Escape special LaTeX characters */
function e(s: string): string {
  if (!s) return "";
  return s
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

const PREAMBLE = `%-------------------------
% Resume - Harry Resume Style
% Author  : Nalla Hari Krishna
% Project : Resume builder for Harry The Blaze platform
%-------------------------
\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

%----- Custom commands -----
\\newcommand{\\resumeItem}[1]{
  \\item\\small{{#1 \\vspace{-2pt}}}
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
\\begin{document}`;

export function generateLatex(data: ResumeData): string {
  const { personal, education, skills, projects, experience, certifications, achievements } = data;

  /* ── Header ── */
  const contactParts: string[] = [];
  if (personal.phone)     contactParts.push(e(personal.phone));
  if (personal.email)     contactParts.push(`\\href{mailto:${e(personal.email)}}{\\underline{${e(personal.email)}}}`);
  if (personal.linkedin)  contactParts.push(`\\href{https://${e(personal.linkedin)}}{\\underline{${e(personal.linkedin)}}}`);
  if (personal.github)    contactParts.push(`\\href{https://${e(personal.github)}}{\\underline{${e(personal.github)}}}`);
  if (personal.portfolio) contactParts.push(`\\href{https://${e(personal.portfolio)}}{\\underline{${e(personal.portfolio)}}}`);

  const header = `
%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${e(personal.name || "Your Name")}} \\\\ \\vspace{1pt}
    \\small ${contactParts.join(" $|$ ")}
\\end{center}`;

  /* ── Education ── */
  const eduRows = education.filter(ed => ed.degree || ed.institution);
  const eduSection = eduRows.length > 0 ? `

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
${eduRows.map(ed => `    \\resumeSubheading
      {${e(ed.institution)}}{${e(ed.year)}}
      {${e(ed.degree)}${ed.branch ? ` -- ${e(ed.branch)}` : ""}}{${ed.cgpa ? `CGPA: ${e(ed.cgpa)}` : ""}}`).join("\n")}
  \\resumeSubHeadingListEnd` : "";

  /* ── Experience ── */
  const expRows = experience.filter(ex => ex.company || ex.role);
  const expSection = expRows.length > 0 ? `

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
${expRows.map(ex => {
    const lines = ex.description.split("\n").map(l => l.trim()).filter(Boolean);
    const items = lines.length > 0
      ? `      \\resumeItemListStart\n${lines.map(l => `        \\resumeItem{${e(l)}}`).join("\n")}\n      \\resumeItemListEnd`
      : "";
    return `    \\resumeSubheading
      {${e(ex.company)}}{${e(ex.duration)}}
      {${e(ex.role)}}{}
${items}`;
  }).join("\n")}
  \\resumeSubHeadingListEnd` : "";

  /* ── Projects ── */
  const projRows = projects.filter(p => p.name);
  const projSection = projRows.length > 0 ? `

%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
${projRows.map(p => {
    const lines = p.description.split("\n").map(l => l.trim()).filter(Boolean);
    const items = lines.length > 0
      ? `          \\resumeItemListStart\n${lines.map(l => `            \\resumeItem{${e(l)}}`).join("\n")}\n          \\resumeItemListEnd`
      : "";
    return `      \\resumeProjectHeading
          {\\textbf{${e(p.name)}}${p.tech ? ` $|$ \\emph{${e(p.tech)}}` : ""}}{${p.link ? `\\href{${e(p.link)}}{${e(p.link)}}` : ""}}
${items}`;
  }).join("\n")}
    \\resumeSubHeadingListEnd` : "";

  /* ── Technical Skills ── */
  const skillParts: string[] = [];
  if (skills.languages.length)  skillParts.push(`     \\textbf{Languages}{: ${skills.languages.map(e).join(", ")}}`);
  if (skills.technical.length)  skillParts.push(`     \\textbf{Frameworks}{: ${skills.technical.map(e).join(", ")}}`);
  if (skills.tools.length)      skillParts.push(`     \\textbf{Tools}{: ${skills.tools.map(e).join(", ")}}`);
  if (skills.soft.length)       skillParts.push(`     \\textbf{Soft Skills}{: ${skills.soft.map(e).join(", ")}}`);

  const skillsSection = skillParts.length > 0 ? `

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${skillParts.join(" \\\\\\\\\n")}
    }}
 \\end{itemize}` : "";

  /* ── Certifications ── */
  const certRows = certifications.filter(c => c.name);
  const certSection = certRows.length > 0 ? `

%-----------CERTIFICATIONS-----------
\\section{Certifications}
  \\resumeSubHeadingListStart
${certRows.map(c => `    \\resumeSubheading
      {${e(c.name)}}{${e(c.date)}}
      {${e(c.issuer)}}{}`).join("\n")}
  \\resumeSubHeadingListEnd` : "";

  /* ── Achievements ── */
  const achRows = achievements.filter(Boolean);
  const achSection = achRows.length > 0 ? `

%-----------ACHIEVEMENTS-----------
\\section{Achievements}
  \\resumeItemListStart
${achRows.map(a => `    \\resumeItem{${e(a)}}`).join("\n")}
  \\resumeItemListEnd` : "";

  return `${PREAMBLE}\n${header}\n${eduSection}${expSection}${projSection}${skillsSection}${certSection}${achSection}

%-------------------------------------------
\\end{document}`;
}
