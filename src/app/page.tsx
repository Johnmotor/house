'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import NavBar from '@/components/NavBar';
import {
  Room,
  Booking,
  LinenItem,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_COLORS,
  ROOM_TYPE_LABELS,
} from '@/lib/types';
import {
  Plus,
  LogOut,
  AlertTriangle,
  X,
  Minus,
  Plus as PlusIcon,
  User,
  Calendar,
} from 'lucide-react';

export default function HomePage() {
  return (
    <AuthGuard>
      <NavBar />
      <RoomManager />
    </AuthGuard>
  );
}

function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [linens, setLinens] = useState<LinenItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCheckin, setShowCheckin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Checkout form
  const [operator, setOperator] = useState('');
  const [checkoutLinens, setCheckoutLinens] = useState<Record<string, number>>({});

  // Checkin form
  const [guestName, setGuestName] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, bRes, lRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/bookings'),
        fetch('/api/linens'),
      ]);
      const rData = await rRes.json();
      const bData = await bRes.json();
      const lData = await lRes.json();
      setRooms(rData.rooms || []);
      setBookings(bData.bookings || []);
      setLinens(lData.linens || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const today = new Date().toISOString().split('T')[0];
    setCheckInDate(today);
    const next = new Date();
    next.setDate(next.getDate() + 1);
    setCheckOutDate(next.toISOString().split('T')[0]);
  }, [fetchData]);

  const openCheckout = (room: Room) => {
    setSelectedRoom(room);
    // Preset standard usage for suite (all rooms are suite)
    const presets: Record<string, number> = {};
    linens.forEach((l) => {
      const qty = l.standardUsage[room.type] || 0;
      if (qty > 0) presets[l.id] = qty;
    });
    setCheckoutLinens(presets);
    setOperator('张三');
    setShowCheckout(true);
  };

  const handleCheckout = async () => {
    if (!selectedRoom || !operator.trim()) return;
    const res = await fetch(`/api/rooms/${selectedRoom.id}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator: operator.trim(), linens: checkoutLinens }),
    });
    const data = await res.json();
    if (data.success) {
      setShowCheckout(false);
      fetchData();
    } else {
      alert(data.error || '退房失败');
    }
  };

  const handleCheckin = async () => {
    if (!selectedRoom || !guestName.trim() || !checkInDate || !checkOutDate) return;
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: selectedRoom.id,
        guestName: guestName.trim(),
        checkInDate,
        checkOutDate,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setShowCheckin(false);
      setGuestName('');
      fetchData();
    } else {
      alert(data.error || '入住登记失败');
    }
  };

  const getBookingForRoom = (roomId: string) =>
    bookings.find((b) => b.roomId === roomId && b.status === 'active');

  const lowStockLinens = linens.filter((l) => l.quantity <= l.threshold);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="text-center text-gray-400 py-20">加载中...</div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Low stock warning */}
      {lowStockLinens.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <span className="font-medium">库存预警：</span>
            {lowStockLinens.map((l) => `${l.name}剩余${l.quantity}${l.unit}`).join('、')}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {rooms.filter((r) => r.status === 'idle').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">空闲</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {rooms.filter((r) => r.status === 'occupied').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">入住中</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-sky-600">
            {rooms.filter((r) => r.status === 'cleaning').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">清洁中</div>
        </div>
      </div>

      {/* Room grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const booking = getBookingForRoom(room.id);
          return (
            <div
              key={room.id}
              className="bg-white border rounded-xl p-4 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-800">
                    {room.number}
                  </span>
                  <span className="text-xs text-gray-400">
                    {ROOM_TYPE_LABELS[room.type]}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    ROOM_STATUS_COLORS[room.status]
                  }`}
                >
                  {ROOM_STATUS_LABELS[room.status]}
                </span>
              </div>

              {booking ? (
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {booking.guestName}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {booking.checkInDate} ~ {booking.checkOutDate}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400 mb-3">暂无入住</div>
              )}

              <div className="flex gap-2">
                {room.status === 'occupied' && (
                  <button
                    onClick={() => openCheckout(room)}
                    className="flex-1 flex items-center justify-center gap-1 bg-amber-600 text-white text-sm py-2 rounded-lg hover:bg-amber-700 active:scale-[0.98] transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    退房
                  </button>
                )}
                {room.status === 'idle' && (
                  <button
                    onClick={() => {
                      setSelectedRoom(room);
                      setGuestName('');
                      setShowCheckin(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    入住
                  </button>
                )}
                {room.status === 'cleaning' && (
                  <div className="flex-1 text-center text-xs text-sky-600 bg-sky-50 py-2 rounded-lg border border-sky-100">
                    等待清洁
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-800">
                {selectedRoom.number} 退房登记
              </h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  操作人
                </label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  placeholder="请输入员工姓名"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  布草消耗
                </label>
                <div className="space-y-2">
                  {linens
                    .filter((l) => l.standardUsage[selectedRoom.type])
                    .map((linen) => {
                      const qty = checkoutLinens[linen.id] || 0;
                      return (
                        <div
                          key={linen.id}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <span className="text-sm text-gray-700">
                            {linen.name}
                            <span className="text-xs text-gray-400 ml-1">
                              (标准{linen.standardUsage[selectedRoom.type]}
                              {linen.unit})
                            </span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setCheckoutLinens((prev) => ({
                                  ...prev,
                                  [linen.id]: Math.max(0, (prev[linen.id] || 0) - 1),
                                }))
                              }
                              className="w-7 h-7 flex items-center justify-center bg-white border rounded-md hover:bg-gray-100 active:scale-95 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">
                              {qty}
                            </span>
                            <button
                              onClick={() =>
                                setCheckoutLinens((prev) => ({
                                  ...prev,
                                  [linen.id]: (prev[linen.id] || 0) + 1,
                                }))
                              }
                              className="w-7 h-7 flex items-center justify-center bg-white border rounded-md hover:bg-gray-100 active:scale-95 transition"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg">
                退房后将自动扣减布草库存并创建清洁任务，请确认数量无误。
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                取消
              </button>
              <button
                onClick={handleCheckout}
                disabled={!operator.trim()}
                className="flex-1 py-2 text-sm text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                确认退房
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkin Modal */}
      {showCheckin && selectedRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-800">
                {selectedRoom.number} 入住登记
              </h2>
              <button
                onClick={() => setShowCheckin(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客户姓名
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="请输入客户姓名"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    入住日期
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    退房日期
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t">
              <button
                onClick={() => setShowCheckin(false)}
                className="flex-1 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                取消
              </button>
              <button
                onClick={handleCheckin}
                disabled={!guestName.trim()}
                className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                确认入住
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
