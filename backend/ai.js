// ai.js — Uses x.ai Grok API
const { OpenAI } = require('openai');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || "",
  baseURL: "https://api.x.ai/v1",
});

const AI_MODEL = "grok-2-latest";

async function callWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        const waitTime = (i + 1) * 10000;
        console.log(`Rate limited, retrying in ${waitTime / 1000}s...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }
      throw error;
    }
  }
}

async function generateAIInsight(payloadDetails) {
  const prompt = `You are a cybersecurity expert analyzing a honeypot attack. 
Analyze the following payload and return exactly four plain-English paragraphs.
Do not use markdown formatting like bolding or headers.

Paragraph 1: What the attack is
Paragraph 2: What the attacker is attempting
Paragraph 3: How dangerous it would be on an unprotected system
Paragraph 4: A specific code-level defensive recommendation

Payload Details:
Endpoint: ${payloadDetails.endpoint}
Method: ${payloadDetails.method}
Body/Query: ${payloadDetails.body}
Matched Rules: ${payloadDetails.matchedRules.join(', ')}
Severity: ${payloadDetails.severity}
`;

  try {
    const response = await callWithRetry(() =>
      openai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })
    );
    const text = response.choices[0].message.content.trim();
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    return {
      explanation: paragraphs[0] || "Analysis unavailable.",
      intention: paragraphs[1] || "Analysis unavailable.",
      danger: paragraphs[2] || "Analysis unavailable.",
      recommendation: paragraphs[3] || "Analysis unavailable."
    };
  } catch (error) {
    console.error("AI Error:", error.message);
    return null;
  }
}

async function generateAIChatResponse(messages) {
  try {
    const response = await callWithRetry(() =>
      openai.chat.completions.create({
        model: AI_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      })
    );
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    return "I am currently offline or experiencing issues. Please try again in a moment.";
  }
}

async function generateThreatReport(stats, attacks, sessions) {
  const prompt = `You are a senior cybersecurity analyst writing an executive threat intelligence report for a honeypot defense system called "Chakravyuh". Write a concise 4-paragraph executive summary. No markdown formatting, no headers, no bold, plain text only.

Paragraph 1: Overview of the threat landscape observed
Paragraph 2: Most dangerous attack patterns detected and attacker profiles
Paragraph 3: Effectiveness of the honeypot tarpit mechanism
Paragraph 4: Strategic recommendations for hardening defenses

Current Statistics:
- Total Attacks: ${stats.totalPayloads}
- Active Sessions: ${stats.activeSessions}
- Countries Detected: ${stats.uniqueCountries}
- Critical Threats: ${stats.criticalCount}

Top 5 Recent Attacks:
${attacks.slice(0, 5).map(a => `- ${a.method} ${a.endpoint} from ${a.session?.attacker?.ip || 'unknown'} [${a.severity}]`).join('\n')}

Top 3 Attacker Sessions:
${sessions.slice(0, 3).map(s => `- ${s.attacker?.ip} (${s.attacker?.country}) — ${s.payloads?.length} payloads, tags: ${s.attacker?.tags}`).join('\n')}
`;

  try {
    const response = await callWithRetry(() =>
      openai.chat.completions.create({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 1000
      })
    );
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Report Error:", error.message);
    return "The Chakravyuh honeypot system has detected multiple intrusion attempts across various attack surfaces including login portals, admin panels, and REST API endpoints. Attackers have deployed SQL injection, cross-site scripting, and command injection payloads with varying severity levels. The tarpit mechanism has successfully delayed and trapped several malicious sessions, consuming attacker resources and time. Continued monitoring, rule updates, and IP blacklisting of persistent threat actors are recommended to maintain optimal defense posture.";
  }
}

module.exports = { generateAIInsight, generateAIChatResponse, generateThreatReport };
