import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';

const RESET_PASSWORD = '2026';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (password !== RESET_PASSWORD) {
    return NextResponse.json({ error: '密码错误' }, { status: 403 });
  }

  const data = await readData();

  // Reset all rooms to idle
  data.rooms = data.rooms.map((room) => ({
    ...room,
    status: 'idle' as const,
    currentBookingId: undefined,
  }));

  // Clear all dynamic data
  data.bookings = [];
  data.linenUsage = [];
  data.cleaningTasks = [];

  // Reset linen stock to default
  const defaultLinens = [
    { id: 'l1', name: '床单', category: 'bedding', quantity: 50, threshold: 15, unit: '套', standardUsage: { single: 1, double: 1, suite: 1 } },
    { id: 'l2', name: '被套', category: 'bedding', quantity: 45, threshold: 12, unit: '套', standardUsage: { single: 1, double: 1, suite: 1 } },
    { id: 'l3', name: '枕套', category: 'bedding', quantity: 80, threshold: 24, unit: '个', standardUsage: { single: 2, double: 2, suite: 2 } },
    { id: 'l4', name: '毛巾', category: 'towel', quantity: 60, threshold: 20, unit: '条', standardUsage: { single: 0, double: 0, suite: 0 } },
    { id: 'l5', name: '浴巾', category: 'towel', quantity: 35, threshold: 10, unit: '条', standardUsage: { single: 0, double: 0, suite: 0 } },
    { id: 'l6', name: '地巾', category: 'towel', quantity: 30, threshold: 10, unit: '条', standardUsage: { single: 0, double: 0, suite: 0 } },
  ];
  data.linens = defaultLinens;

  await writeData(data);

  return NextResponse.json({ success: true });
}
