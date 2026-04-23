import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { Booking } from '@/lib/types';

export async function GET() {
  const data = await readData();
  return NextResponse.json({ bookings: data.bookings });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { roomId, guestName, checkInDate, checkOutDate } = body;

  if (!roomId || !guestName || !checkInDate || !checkOutDate) {
    return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
  }

  const data = await readData();
  const room = data.rooms.find((r) => r.id === roomId);
  if (!room) {
    return NextResponse.json({ error: '房间不存在' }, { status: 404 });
  }
  if (room.status !== 'idle') {
    return NextResponse.json({ error: '房间不可用' }, { status: 400 });
  }

  const booking: Booking = {
    id: `b_${Date.now()}`,
    roomId: room.id,
    roomNumber: room.number,
    guestName,
    checkInDate,
    checkOutDate,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  data.bookings.push(booking);
  room.status = 'occupied';
  room.currentBookingId = booking.id;

  await writeData(data);
  return NextResponse.json({ success: true, booking });
}
