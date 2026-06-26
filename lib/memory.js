import { supabase } from './supabase';
import { getEmbedding, chatWithQwen } from './qwen';

export async function extractMemories(userMessage) {
  const prompt = `You are a memory extraction system.
Analyze this message and extract important facts about the user.
Return ONLY a JSON array. No extra text.
Message: "${userMessage}"
Format: [{"fact":"...","category":"identity|preference|goal|decision|context","confidence":0.9}]
Return [] if nothing important.`;

  const result = await chatWithQwen([{ role: 'user', content: prompt }]);
  try {
    const clean = result.replace(/\`\`\`json|\`\`\`/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

export async function saveMemories(facts, userId, sessionId) {
  for (const item of facts) {
    const embedding = await getEmbedding(item.fact);
    await supabase.from('memories').insert({
      user_id: userId,
      fact: item.fact,
      category: item.category,
      confidence: item.confidence,
      embedding,
      source_session: sessionId,
    });
  }
}

export async function retrieveMemories(query, userId) {
  const queryEmbedding = await getEmbedding(query);
  const { data } = await supabase.rpc('match_memories', {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_count: 5,
  });
  return data || [];
}

export async function getAllMemories(userId) {
  const { data } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function forgetMemory(memoryId) {
  await supabase
    .from('memories')
    .update({ is_archived: true })
    .eq('id', memoryId);
}
