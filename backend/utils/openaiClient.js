import { openai, MODEL } from "../config/openai.js";

export async function callOpenAI(prompt, json = true) {
  const res = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: json ? 1500 : 600,
    messages: [{ role: "user", content: prompt }],
    ...(json && { response_format: { type: "json_object" } }),
  });

  const text = res.choices[0].message.content.trim();
  return json ? JSON.parse(text) : text;
}