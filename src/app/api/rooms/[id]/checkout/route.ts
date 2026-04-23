import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { CleaningTask, LinenUsage } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { operator, linens } = body as {
    operator: string;
    linens: Record<string, number>; // linenId -> quantity
  };

  if (!operator) {
    return NextResponse.json({ error: '缺少操作人' }, { status: 400 });
  }

  const data = await readData();
  const room = data.rooms.find((r) => r.id === id);
  if (!room) {
    return NextResponse.json({ error: '房间不存在' }, { status: 404 });
  }
  if (room.status !== 'occupied') {
    return NextResponse.json({ error: '房间未入住' }, { status: 400 });
  }

  const booking = data.bookings.find((b) => b.id === room.currentBookingId);
  if (!booking) {
    return NextResponse.json({ error: '未找到入住记录' }, { status: 404 });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Update booking
  booking.status = 'checked_out';
  booking.checkOutDate = dateStr;

  // Update room
  room.status = 'cleaning';
  room.currentBookingId = undefined;

  // Deduct linen inventory & create usage records
  const usageRecords: LinenUsage[] = [];
  for (const [linenId, qty] of Object.entries(linens)) {
    if (qty <= 0) continue;
    const linen = data.linens.find((l) => l.id === linenId);
    if (!linen) continue;
    if (linen.quantity < qty) {
      return NextResponse.json(
        { error: `${linen.name} 库存不足，当前剩余 ${linen.quantity}${linen.unit}` },
        { status: 400 }
      );
    }
    linen.quantity -= qty;
    usageRecords.push({
      id: `u_${Date.now()}_${linenId}`,
      date: dateStr,
      roomId: room.id,
      roomNumber: room.number,
      linenId: linen.id,
      linenName: linen.name,
      quantity: qty,
      operator,
      bookingId: booking.id,
    });
  }
  data.linenUsage.push(...usageRecords);

  // Create cleaning task
  const task: CleaningTask = {
    id: `c_${Date.now()}`,
    roomId: room.id,
    roomNumber: room.number,
    status: 'pending',
    assignee: '张三',
    createdAt: now.toISOString(),
    bookingId: booking.id,
  };
  data.cleaningTasks.push(task);

  await writeData(data);

  return NextResponse.json({
    success: true,
    room,
    booking,
    usageRecords,
    cleaningTask: task,
  });
}
