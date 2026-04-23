'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import NavBar from '@/components/NavBar';
import { BarChart3, AlertTriangle, TrendingUp, Trash2, X, Lock } from 'lucide-react';

interface ReportItem {
  linenId: string;
  name: string;
  unit: string;
  currentStock: number;
  threshold: number;
  totalUsed: number;
  theoretical: number;
  waste: number;
  suggestPurchase: number;
}

interface WeeklyReport {
  start: string;
  end: string;
  totalCheckouts: number;
  report: ReportItem[];
}

export default function ReportsPage() {
  return (
    <AuthGuard>
      <NavBar />
      <ReportsManager />
    </AuthGuard>
  );
}

function ReportsManager() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);
    setStart(lastWeek.toISOString().split('T')[0]);
    setEnd(today.toISOString().split('T')[0]);
  }, []);

  const fetchReport = async () => {
    if (!start || !end) return;
    setLoading(true);
    const res = await fetch(`/api/reports/weekly?start=${start}&end=${end}`);
    const data = await res.json();
    setReport(data);
    setLoading(false);
  };

  const handleReset = async () => {
    if (!resetPassword.trim()) return;
    setResetting(true);
    setResetError('');
    const res = await fetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetPassword.trim() }),
    });
    const data = await res.json();
    setResetting(false);
    if (data.success) {
      setShowReset(false);
      setResetPassword('');
      window.location.reload();
    } else {
      setResetError(data.error || '重置失败');
    }
  };

  useEffect(() => {
    if (start && end) fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        周报表
      </h1>

      <div className="flex items-center gap-3 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">开始日期</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">结束日期</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="self-end">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? '生成中...' : '生成报表'}
          </button>
        </div>
      </div>

      {/* Reset System */}
      <div className="mt-10 pt-6 border-t">
        <button
          onClick={() => setShowReset(true)}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition border border-red-200"
        >
          <Trash2 className="w-4 h-4" />
          重置系统
        </button>
        <p className="text-xs text-gray-400 mt-2">
          清空所有入住记录、布草消耗、清洁任务，并将库存和房间恢复为初始状态
        </p>
      </div>

      {/* Reset Modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                确认重置系统
              </h2>
              <button
                onClick={() => { setShowReset(false); setResetPassword(''); setResetError(''); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg">
                此操作不可撤销！将清空所有入住记录、布草消耗记录、清洁任务，并重置房间和库存到初始状态。
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  请输入员工密码确认
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="员工密码"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                {resetError && <p className="text-red-500 text-xs mt-1">{resetError}</p>}
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t">
              <button
                onClick={() => { setShowReset(false); setResetPassword(''); setResetError(''); }}
                className="flex-1 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                disabled={!resetPassword.trim() || resetting}
                className="flex-1 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {resetting ? '重置中...' : '确认重置'}
              </button>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-blue-800">
                {report.start} ~ {report.end}
              </div>
              <div className="text-xs text-blue-600 mt-0.5">
                期间共退房 {report.totalCheckouts} 次
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">布草</th>
                    <th className="text-right px-4 py-3 font-medium">总消耗</th>
                    <th className="text-right px-4 py-3 font-medium">理论用量</th>
                    <th className="text-right px-4 py-3 font-medium">损耗</th>
                    <th className="text-right px-4 py-3 font-medium">建议采购</th>
                    <th className="text-right px-4 py-3 font-medium">当前库存</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.report.map((item) => {
                    const isLow = item.currentStock <= item.threshold;
                    return (
                      <tr key={item.linenId} className={isLow ? 'bg-red-50/50' : ''}>
                        <td className="px-4 py-3 text-gray-800 font-medium">
                          {item.name}
                          <span className="text-xs text-gray-400 ml-1">({item.unit})</span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {item.totalUsed}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {item.theoretical}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.waste > 0 ? (
                            <span className="text-amber-600 font-medium">+{item.waste}</span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.suggestPurchase > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              {item.suggestPurchase}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={isLow ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                            {item.currentStock}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.report
              .filter((r) => r.suggestPurchase > 0)
              .map((item) => (
                <div
                  key={item.linenId}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-800">
                    <span className="font-medium">{item.name}</span> 建议采购{' '}
                    <span className="font-bold">{item.suggestPurchase}</span>{' '}
                    {item.unit}，当前库存低于安全阈值
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </main>
  );
}
