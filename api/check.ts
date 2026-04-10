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
  res.setHeader('x-api-version', '1.2.2');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userInput } = req.body;
  if (!userInput || typeof userInput !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const apiKey = process.env.SAMBANOVA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: API Key missing.' });
  }

  try {
    const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'RealityCheckAI/1.0'
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.1-70B-Instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userInput }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SAMBANOVA ERROR RAW:', response.status, errorText);
      
      return res.status(response.status).json({ 
        error: `AI Engine Error (${response.status}). Check Vercel logs for raw details.` 
      });
    }

    const data = await response.json();
    return res.status(200).json(JSON.parse(data.choices[0].message.content));

  } catch (error: any) {
    console.error('SERVER FETCH ERROR:', error.message);
    return res.status(500).json({ error: 'Internal server connection error.' });
  }
}
