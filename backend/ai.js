// ai.js — Uses the official Google Generative AI SDK
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI("AIzaSyBGaVIhnG7jpjqZxqZDOZa8D1YZC-FSuPM");

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function callWithRetry(fn, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const is429 = error.status === 429 || error.message?.includes('429') || error.message?.includes('Resource has been exhausted');
      if (is429 && i < retries - 1) {
        const waitTime = (i + 1) * 15000; // 15s, 30s, 45s
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
    const result = await callWithRetry(() => model.generateContent(prompt));
    const text = result.response.text().trim();
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
    // Convert OpenAI-style messages to Gemini format
    const systemMsg = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    // Build Gemini chat history
    const history = [];
    for (let i = 0; i < userMessages.length - 1; i++) {
      const msg = userMessages[i];
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    const chat = chatModel.startChat({
      history: history,
      systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
    });

    const lastMessage = userMessages[userMessages.length - 1];
    const result = await callWithRetry(() => chat.sendMessage(lastMessage.content));
    return result.response.text().trim();
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    return "I am currently offline or experiencing issues. Please try again in a moment.";
  }
}

module.exports = { generateAIInsight, generateAIChatResponse };
