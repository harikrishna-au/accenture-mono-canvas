import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ok  = (body: unknown) => new Response(JSON.stringify(body), { headers: { ...cors, "Content-Type": "application/json" } });
const err = (msg: string)   => new Response(JSON.stringify({ error: msg }), { headers: { ...cors, "Content-Type": "application/json" } });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { profile } = await req.json();
    if (!profile) return err("No profile provided.");

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return err("OPENAI_API_KEY not set.");

    const summary = `
Name: ${profile.personal?.name || "Student"}
Education: ${(profile.education || []).map((e: any) => `${e.degree} ${e.branch} at ${e.institution} (${e.year})`).join(", ")}
Skills - Languages: ${(profile.skills?.languages || []).join(", ")}
Skills - Frameworks: ${(profile.skills?.technical || []).join(", ")}
Skills - Tools: ${(profile.skills?.tools || []).join(", ")}
Experience: ${(profile.experience || []).map((e: any) => `${e.role} at ${e.company}`).join(", ") || "Fresher / No experience yet"}
Projects: ${(profile.projects || []).map((p: any) => `${p.name} (${p.tech})`).join(", ")}
Certifications: ${(profile.certifications || []).map((c: any) => c.name).join(", ")}
`.trim();

    const prompt = `You are a career advisor for Indian tech students. Based on this student profile:

${summary}

Return exactly 8 job/internship opportunities that are a strong fit for this person RIGHT NOW.
Mix internships and entry-level full-time roles. Focus on Indian job market (companies like TCS, Infosys, Wipro, startups, product companies).

Return ONLY a valid JSON array with this structure, no markdown:
[
  {
    "title": "Role title",
    "type": "Internship" | "Full-time" | "Part-time",
    "company_type": "e.g. Product Startup / MNC / Fintech / EdTech",
    "match_score": 85,
    "why": "One sentence explaining why this is a good fit",
    "skills_match": ["skill1", "skill2", "skill3"],
    "skills_gap": ["skill to learn"],
    "search_url": "https://www.linkedin.com/jobs/search/?keywords=ROLE+TITLE&location=India",
    "internshala_url": "https://internshala.com/internships/keywords-ROLE"
  }
]

Rules:
- match_score: 60-99 (be realistic, not everyone gets 99)
- skills_match: pick from the student's actual skills
- skills_gap: 1-2 skills they should learn to be stronger
- search_url: real LinkedIn jobs search URL with the role title URL-encoded
- internshala_url: real Internshala search URL (only for Internship type, else use empty string)
- Sort by match_score descending`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.5,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const e = await response.text();
      return err(`OpenAI error ${response.status}: ${e}`);
    }

    const result = await response.json();
    const raw = (result.choices?.[0]?.message?.content ?? "").trim()
      .replace(/^```json\n?/, "").replace(/\n?```$/, "");

    const jobs = JSON.parse(raw);
    return ok({ jobs });
  } catch (e: any) {
    console.error("[radar-jobs]", e);
    return err(e.message ?? "Unexpected error");
  }
});
