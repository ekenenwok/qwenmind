import OpenAI from 'openai';

export const qwen = new OpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: process.env.QWEN_BASE_URL,
});

export async function chatWithQwen(messages, systemPrompt = '') {
  const response = await qwen.chat.completions.create({
    model: process.env.QWEN_MODEL || 'qwen-plus',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  });
  return response.choices[0].message.content;
}

export async function getEmbedding(text) {
  const response = await qwen.embeddings.create({
    model: 'text-embedding-v3',
    input: text,
  });
  return response.data[0].embedding;
}
