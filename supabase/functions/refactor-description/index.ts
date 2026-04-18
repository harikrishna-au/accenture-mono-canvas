import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Always return 200 so the client can read the actual error message
const ok  = (body: unknown) => new Response(JSON.stringify(body), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
const err = (msg: string)   => new Response(JSON.stringify({ error: msg }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, type, label } = await req.json();

    if (!description || description.trim().length < 5) {
      return err("Description is too short to refactor.");
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return err("OPENAI_API_KEY secret is not configured.");

    const context = type === "experience"
      ? `Work experience: ${label}`
      : `Project: ${label}`;

    const prompt = `You are a professional resume writer. ${context}

Current description:
"${description.trim()}"

Rewrite this as exactly 2 concise, impactful bullet points using the STAR method (Situation/Task → Action → Result).
Rules:
- Start each bullet with a strong past-tense action verb (e.g. Built, Designed, Reduced, Led)
- Quantify impact wherever possible (%, time saved, users, etc.)
- Keep each point under 25 words
- IMPORTANT: Output ONLY 2 lines. Each line is one bullet point. Separate them with a newline character.
- Do NOT include bullet symbols, numbers, dashes, or any prefix — just the plain sentence text
- Do NOT put both points on the same line`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return err(`OpenAI error ${response.status}: ${body}`);
    }

    const result = await response.json();
    const raw = (result.choices?.[0]?.message?.content ?? "").trim();

    // Strip any bullet prefix (1. / - / • etc.)
    const clean = (s: string) => s.replace(/^[\-•*\d.)\s]+/, "").trim();

    let points: string[] = raw
      .split("\n")
      .map(clean)
      .filter((l: string) => l.length > 0)
      .slice(0, 2);

    // Fallback: AI put both on one line — split by sentence boundary
    if (points.length === 1 && points[0].length > 40) {
      const halves = points[0].split(/\.\s+(?=[A-Z])/);
      if (halves.length >= 2) {
        points = [
          halves[0].trim() + ".",
          halves.slice(1).join(". ").trim(),
        ];
      }
    }

    if (points.length === 0) return err("AI returned an empty response. Try adding more detail to the description.");

    return ok({ points });
  } catch (e: any) {
    console.error("[refactor-description]", e);
    return err(e.message ?? "Unexpected error");
  }
});
