import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';

export async function GET() {
  const data = await readData();
  return NextResponse.json({ tasks: data.cleaningTasks });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, status, assignee } = body;

  if (!id) {
    return NextResponse.json({ error: '缺少任务ID' }, { status: 400 });
  }

  const data = await readData();
  const task = data.cleaningTasks.find((t) => t.id === id);
  if (!task) {
    return NextResponse.json({ error: '任务不存在' }, { status: 404 });
  }

  if (assignee) task.assignee = assignee;

  if (status === 'completed' && task.status !== 'completed') {
    task.status = 'completed';
    task.completedAt = new Date().toISOString();

    // Release room
    const room = data.rooms.find((r) => r.id === task.roomId);
    if (room) {
      room.status = 'idle';
    }
  }

  await writeData(data);
  return NextResponse.json({ success: true, task });
}
