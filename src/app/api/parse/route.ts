import { NextRequest, NextResponse } from 'next/server';
import { parseTranscript } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const parsed = await parseTranscript(transcript);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: 'Failed to parse transcript' }, { status: 500 });
  }
}
