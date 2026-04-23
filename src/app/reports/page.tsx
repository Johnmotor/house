'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import NavBar from '@/components/NavBar';
import { BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';

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
