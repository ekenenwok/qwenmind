import { NextResponse } from 'next/server';
import { getAllMemories, forgetMemory } from '@/lib/memory';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const memories = await getAllMemories(userId);
  return NextResponse.json({ memories });
}

export async function DELETE(req) {
  const { memoryId } = await req.json();
  await forgetMemory(memoryId);
  return NextResponse.json({ success: true });
}
