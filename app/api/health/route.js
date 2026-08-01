import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = {
    mongodb: 'unknown',
    geminiKeySet: Boolean(process.env.GEMINI_API_KEY),
  };
  try {
    await connectDB();
    status.mongodb = 'connected';
  } catch (err) {
    status.mongodb = `error: ${err.message}`;
  }
  return NextResponse.json(status);
}
