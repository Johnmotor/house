import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const data = readData();
  let usage = data.linenUsage;

  if (start && end) {
    usage = usage.filter((u) => u.date >= start && u.date <= end);
  }

  // Sort by date desc
  usage = usage.sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({ usage });
}
