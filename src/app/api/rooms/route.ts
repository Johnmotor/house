import { NextResponse } from 'next/server';
import { readData } from '@/lib/data';

export async function GET() {
  const data = await readData();
  return NextResponse.json({ rooms: data.rooms });
}
