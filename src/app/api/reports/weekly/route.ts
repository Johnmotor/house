import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: '缺少 start 或 end 参数' }, { status: 400 });
  }

  const data = await readData();

  // Filter usage in range
  const usageInRange = data.linenUsage.filter(
    (u) => u.date >= start && u.date <= end
  );

  // Filter checkouts in range
  const checkoutsInRange = data.bookings.filter(
    (b) => b.status === 'checked_out' && b.checkOutDate >= start && b.checkOutDate <= end
  );

  // Build report per linen
  const report = data.linens.map((linen) => {
    const totalUsed = usageInRange
      .filter((u) => u.linenId === linen.id)
      .reduce((sum, u) => sum + u.quantity, 0);

    // Theoretical usage: count checkouts per room type * standard usage
    let theoretical = 0;
    for (const booking of checkoutsInRange) {
      const room = data.rooms.find((r) => r.id === booking.roomId);
      if (room) {
        const std = linen.standardUsage[room.type] || 0;
        theoretical += std;
      }
    }

    const waste = totalUsed - theoretical;
    // Suggested purchase: if current < threshold, suggest (threshold - current) + avg weekly consumption
    const avgWeekly = Math.max(totalUsed, theoretical);
    const suggest = linen.quantity < linen.threshold
      ? Math.ceil((linen.threshold - linen.quantity) + avgWeekly * 0.5)
      : 0;

    return {
      linenId: linen.id,
      name: linen.name,
      unit: linen.unit,
      currentStock: linen.quantity,
      threshold: linen.threshold,
      totalUsed,
      theoretical,
      waste,
      suggestPurchase: suggest,
    };
  });

  return NextResponse.json({
    start,
    end,
    totalCheckouts: checkoutsInRange.length,
    report,
  });
}
