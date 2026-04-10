import OpenAI from 'openai';

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

export type RealityCheckResult = {
  coreProblem: string;
  failureRisks: string[];
  missingPieces: string[];
  improvements: string[];
  finalVerdict: string;
  timestamp: number;
  input: string;
};

export const getRealityCheck = async (userInput: string, customApiKey?: string): Promise<RealityCheckResult> => {
  // IF USER PROVIDED THEIR OWN KEY: Use it directly from the browser (Standard PWA behavior)
  if (customApiKey) {
    const openai = new OpenAI({
      apiKey: customApiKey,
      baseURL: "https://api.sambanova.ai/v1",
      dangerouslyAllowBrowser: true 
    });

    const response = await openai.chat.completions.create({
      model: "Meta-Llama-3.1-70B-Instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from AI");
    
    return {
      ...JSON.parse(content),
      timestamp: Date.now(),
      input: userInput
    };
  }

  // ELSE: Use our secure Serverless Function (Hides our global API Key)
  const response = await fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userInput })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to connect to the Reality Check Engine.');
  }

  const result = await response.json();
  return {
    ...result,
    timestamp: Date.now(),
    input: userInput
  };
};
