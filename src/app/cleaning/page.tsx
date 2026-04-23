'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import NavBar from '@/components/NavBar';
import { CleaningTask } from '@/lib/types';
import { ClipboardList, CheckCircle2, Circle, User } from 'lucide-react';

export default function CleaningPage() {
  return (
    <AuthGuard>
      <NavBar />
      <CleaningManager />
    </AuthGuard>
  );
}

function CleaningManager() {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/cleaning');
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const completeTask = async (id: string) => {
    const res = await fetch('/api/cleaning', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'completed' }),
    });
    const data = await res.json();
    if (data.success) {
      fetchData();
    } else {
      alert(data.error || '操作失败');
    }
  };

  const assignTask = async (id: string, assignee: string) => {
    const res = await fetch('/api/cleaning', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, assignee }),
    });
    const data = await res.json();
    if (data.success) {
      fetchData();
    }
  };

  const pending = tasks.filter((t) => t.status === 'pending');
  const completed = tasks.filter((t) => t.status === 'completed');

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
        <ClipboardList className="w-5 h-5 text-blue-600" />
        清洁任务
      </h1>

      {/* Pending tasks */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          待清洁 ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center text-sm text-emerald-700">
            当前没有待清洁任务
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((task) => (
              <div
                key={task.id}
                className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center font-bold text-sm">
                    {task.roomNumber}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {task.roomNumber} 房清洁
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {task.assignee}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={task.assignee}
                    onBlur={(e) => assignTask(task.id, e.target.value)}
                    placeholder="负责人"
                    className="px-2 py-1.5 border rounded-lg text-xs w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => completeTask(task.id)}
                    className="flex items-center gap-1 bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    完成
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed tasks */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            已完成 ({completed.length})
          </h2>
          <div className="space-y-2">
            {completed.slice(0, 10).map((task) => (
              <div
                key={task.id}
                className="bg-gray-50 border rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {task.roomNumber} 房清洁
                  <span className="text-xs text-gray-400">— {task.assignee}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {task.completedAt
                    ? new Date(task.completedAt).toLocaleString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
