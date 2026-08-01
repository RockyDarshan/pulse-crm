/**
 * AI Lead Qualification
 * ----------------------
 * Calls the Groq API to score, prioritise, and draft outreach for a lead.
 * If the API key is missing or the call fails for any reason (quota, network,
 * bad response), we fall back to a transparent rule-based score so the product
 * never breaks a demo -- the `ai.error` field records what happened.
 */

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const API_KEY = process.env.GROQ_API_KEY;

const ICP_CONTEXT = `You are the lead qualification engine inside a CRM used by the sales team
at a B2B spend-management fintech (think: corporate cards, expense management,
and AP automation for growing companies).

Ideal customer profile (score HIGHER when a lead matches these):
- Company size 51-500 employees (mid-market sweet spot). Very small teams (1-10) or
  very large enterprises (500+) are lower fit unless other signals are strong.
- Currently on spreadsheets, a weak/manual process, or a known competitor tool
  (higher pain, easier to convert) rather than already happy with an in-house system.
- Monthly budget that realistically covers a mid-market SaaS spend tool (roughly
  $200-$5,000/month is a healthy fit; $0 or unclear budget lowers the score).
- Buyer role is a finance, operations, or founder/exec title (economic buyer or
  strong influencer) rather than an unrelated function.
- Timeline is immediate or 1-3 months (urgency to buy) rather than "just exploring".
- Notes mentioning real pain (manual reconciliation, lack of visibility, card control
  issues, approval bottlenecks, multi-entity/multi-currency ops) increase fit.

Score conservatively. Most inbound leads should land in the 30-75 range; reserve
85+ for leads that clearly hit most ICP criteria, and under 25 for clearly poor fits
(e.g. student, hobbyist, no budget, no urgency, tiny team with no pain signals).`;

function buildPrompt(lead) {
  return `${ICP_CONTEXT}

Qualify this lead and respond with ONLY the JSON object described below -- no markdown, no commentary.

JSON shape required:
{
  "score": <integer 0-100>,
  "priority": "Hot" | "Warm" | "Cold",
  "reasoning": "<2-3 sentences explaining the score using the specific lead details provided>",
  "recommendedAction": "<one concrete next action for the sales rep>",
  "followUpMessage": "<a short, personalised 3-5 sentence outreach message the rep can send as-is>"
}

Lead details:
- Contact name: ${lead.name}
- Role/title: ${lead.role || "Not provided"}
- Company: ${lead.company}
- Company size: ${lead.companySize}
- Industry: ${lead.industry || "Not provided"}
- Current solution: ${lead.currentSolution}
- Self-reported monthly budget (USD): ${lead.monthlyBudget || 0}
- Buying timeline: ${lead.timeline}
- Notes / stated pain points: ${lead.notes || "None provided"}`;
}

function ruleBasedFallback(lead, reason) {
  let score = 40;
  const sizeBoost = {
    "1-10": -10,
    "11-50": 5,
    "51-200": 20,
    "201-500": 15,
    "500+": 0,
  };
  score += sizeBoost[lead.companySize] ?? 0;

  const solutionBoost = {
    "Spreadsheets / manual": 15,
    "Competitor tool": 10,
    "In-house system": 0,
    None: 5,
    Other: 0,
  };
  score += solutionBoost[lead.currentSolution] ?? 0;

  const timelineBoost = {
    "Immediate (this month)": 20,
    "1-3 months": 10,
    "3-6 months": 0,
    "Just exploring": -15,
  };
  score += timelineBoost[lead.timeline] ?? 0;

  if (lead.monthlyBudget >= 200 && lead.monthlyBudget <= 5000) score += 10;
  else if (lead.monthlyBudget > 5000) score += 5;
  else score -= 10;

  if (lead.notes && lead.notes.trim().length > 15) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));
  const priority = score >= 70 ? "Hot" : score >= 45 ? "Warm" : "Cold";

  return {
    score,
    priority,
    reasoning: `Rule-based estimate (AI call unavailable: ${reason}). Based on company size (${lead.companySize}), current solution (${lead.currentSolution}), timeline (${lead.timeline}), and a monthly budget of $${lead.monthlyBudget || 0}, this lead scores ${score}/100.`,
    recommendedAction:
      priority === "Hot"
        ? "Reach out within 24 hours to schedule a demo."
        : priority === "Warm"
          ? "Send a tailored follow-up and check back in a week."
          : "Add to nurture sequence; revisit if timeline or budget changes.",
    followUpMessage: `Hi ${lead.name}, thanks for your interest! I'd love to show ${lead.company} how we help teams like yours cut down on manual expense work. Do you have 20 minutes this week for a quick walkthrough?`,
    model: "rule-based-fallback",
    error: reason,
  };
}

export async function qualifyLead(lead) {
  if (!API_KEY) {
    return ruleBasedFallback(lead, "GROQ_API_KEY is not set");
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You are a lead qualification engine. Respond with ONLY a JSON object with keys: score (integer 0-100), priority ("Hot"|"Warm"|"Cold"), reasoning (2-3 sentences), recommendedAction (one sentence), followUpMessage (3-5 sentences). No markdown, no commentary.',
          },
          { role: "user", content: buildPrompt(lead) },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");

    const parsed = JSON.parse(text);

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
    const priority = ["Hot", "Warm", "Cold"].includes(parsed.priority)
      ? parsed.priority
      : score >= 70
        ? "Hot"
        : score >= 45
          ? "Warm"
          : "Cold";

    return {
      score,
      priority,
      reasoning: String(parsed.reasoning || ""),
      recommendedAction: String(parsed.recommendedAction || ""),
      followUpMessage: String(parsed.followUpMessage || ""),
      model: MODEL,
      error: "",
    };
  } catch (err) {
    return ruleBasedFallback(lead, err.message || "Unknown error");
  }
}
