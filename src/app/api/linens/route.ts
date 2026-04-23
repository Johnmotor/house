import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';

export async function GET() {
  const data = await readData();
  return NextResponse.json({ linens: data.linens });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, quantity, threshold } = body;

  if (!id) {
    return NextResponse.json({ error: '缺少布草ID' }, { status: 400 });
  }

  const data = await readData();
  const linen = data.linens.find((l) => l.id === id);
  if (!linen) {
    return NextResponse.json({ error: '布草不存在' }, { status: 404 });
  }

  if (typeof quantity === 'number') linen.quantity = quantity;
  if (typeof threshold === 'number') linen.threshold = threshold;

  await writeData(data);
  return NextResponse.json({ success: true, linen });
}
