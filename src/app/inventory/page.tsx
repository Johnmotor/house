'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import NavBar from '@/components/NavBar';
import { LinenItem } from '@/lib/types';
import { AlertTriangle, Package, Edit2, Check, X } from 'lucide-react';

export default function InventoryPage() {
  return (
    <AuthGuard>
      <NavBar />
      <InventoryManager />
    </AuthGuard>
  );
}

function InventoryManager() {
  const [linens, setLinens] = useState<LinenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/linens');
    const data = await res.json();
    setLinens(data.linens || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEdit = (linen: LinenItem) => {
    setEditingId(linen.id);
    setEditQty(linen.quantity);
    setEditThreshold(linen.threshold);
  };

  const saveEdit = async (id: string) => {
    await fetch('/api/linens', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity: editQty, threshold: editThreshold }),
    });
    setEditingId(null);
    fetchData();
  };

  const lowStock = linens.filter((l) => l.quantity <= l.threshold);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="text-center text-gray-400 py-20">加载中...</div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-600" />
        布草库存
      </h1>

      {lowStock.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="text-sm text-red-800">
            <span className="font-medium">库存不足：</span>
            {lowStock.map((l) => `${l.name}剩余${l.quantity}${l.unit}`).join('、')}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">布草名称</th>
                <th className="text-left px-4 py-3 font-medium">当前库存</th>
                <th className="text-left px-4 py-3 font-medium">安全阈值</th>
                <th className="text-left px-4 py-3 font-medium">状态</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {linens.map((linen) => {
                const isLow = linen.quantity <= linen.threshold;
                const isEditing = editingId === linen.id;
                return (
                  <tr key={linen.id} className={isLow ? 'bg-red-50/50' : ''}>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {linen.name}
                      <span className="text-xs text-gray-400 ml-1">({linen.unit})</span>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editQty}
                          onChange={(e) => setEditQty(Number(e.target.value))}
                          className="w-20 px-2 py-1 border rounded text-sm"
                        />
                      ) : (
                        <span className={isLow ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {linen.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editThreshold}
                          onChange={(e) => setEditThreshold(Number(e.target.value))}
                          className="w-20 px-2 py-1 border rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-500">{linen.threshold}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          不足
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          充足
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveEdit(linen.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(linen)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        提示：点击编辑按钮可修改库存数量和安全阈值。标准用量在退房时自动扣除。
      </div>
    </main>
  );
}
