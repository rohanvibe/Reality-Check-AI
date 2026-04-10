import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `
You are the "Reality Check AI". Your purpose is to provide brutally honest, high-quality, and logical feedback on user ideas, plans, or goals. 
Style: Sharp, direct, no fluff, NOT motivational, NOT rude, but extremely realistic and logic-focused.

Your response MUST be in the following JSON format:
{
  "coreProblem": "What is weak, unrealistic, or unclear about the idea.",
  "failureRisks": ["Risk 1", "Risk 2", "Risk 3"],
  "missingPieces": ["Consideration 1", "Consideration 2"],
  "improvements": ["Actionable upgrade 1", "Actionable upgrade 2"],
  "finalVerdict": "A one-line brutal, clear judgment summary."
}
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Method Security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userInput } = req.body;

  // 2. Input Validation (Security against large data / injection)
  if (!userInput || typeof userInput !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  if (userInput.length > 2000) {
    return res.status(400).json({ error: 'Input too long. Keep it under 2000 characters.' });
  }

  // 3. Environment Security
  const apiKey = process.env.SAMBANOVA_API_KEY;
  if (!apiKey) {
    console.error('SERVER ERROR: SAMBANOVA_API_KEY is not defined in environment.');
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  try {
    const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.1-70B-Instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userInput }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ 
        error: 'The AI engine is currently busy. Please try again in a few moments.' 
      });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // 4. Safe Parsing
    try {
      const parsed = JSON.parse(content);
      return res.status(200).json(parsed);
    } catch (parseError) {
      return res.status(500).json({ error: 'AI returned an invalid format.' });
    }

  } catch (error: any) {
    console.error('FETCH ERROR:', error.message);
    return res.status(500).json({ error: 'Internal server connection error.' });
  }
}
