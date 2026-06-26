import { NextResponse } from 'next/server';
import { chatWithQwen } from '@/lib/qwen';
import { extractMemories, saveMemories, retrieveMemories } from '@/lib/memory';

export async function POST(req) {
  const { message, userId, sessionId, history } = await req.json();

  const memories = await retrieveMemories(message, userId);

  const memoryContext = memories.length > 0
    ? `What you know about this user:\n${memories.map(m => `- ${m.fact}`).join('\n')}\n\n`
    : '';

  const systemPrompt = `You are QwenMind, a personal AI assistant with persistent memory.
${memoryContext}Use this knowledge to give personalized responses.`;

  const reply = await chatWithQwen(history, systemPrompt);

  const newFacts = await extractMemories(message);
  if (newFacts.length > 0) {
    await saveMemories(newFacts, userId, sessionId);
  }

  return NextResponse.json({ reply, memoriesUsed: memories.length });
}
