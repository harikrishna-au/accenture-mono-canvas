import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText } = await req.json();

    // Cap at 6000 chars — resumes don't need more, avoids slow/expensive calls
    const trimmedText = resumeText.trim().slice(0, 6000);

    if (!trimmedText || trimmedText.length < 20) {
      return new Response(JSON.stringify({ error: "Invalid resume text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");

    const prompt = `You are a resume parser. Extract all information from the following resume text and return it as a valid JSON object with exactly this structure. If a field is not found, use an empty string or empty array.

Resume text:
"""
${trimmedText}
"""

Return ONLY a valid JSON object with this exact structure, no markdown, no explanation:
{
  "personal": {
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "portfolio": "",
    "location": ""
  },
  "education": [
    {
      "degree": "",
      "institution": "",
      "branch": "",
      "cgpa": "",
      "year": ""
    }
  ],
  "skills": {
    "technical": [],
    "tools": [],
    "languages": [],
    "soft": []
  },
  "projects": [
    {
      "name": "",
      "description": "",
      "tech": "",
      "link": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "description": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": ""
    }
  ],
  "achievements": []
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${err}`);
    }

    const result = await response.json();
    const raw = result.choices?.[0]?.message?.content ?? "";

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify({ data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[parse-resume]", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
