"use client";
import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { getAuditLogs } from '@/lib/auditService';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const data = await getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error("Gagal memuat audit log", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2A1B10]">Audit Log</h1>
          <p className="text-gray-500">Rekam jejak aktivitas sistem dan keamanan.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FAF9F7] text-gray-500 text-sm">
            <tr>
              <th className="p-4 font-medium border-b border-gray-100">Waktu</th>
              <th className="p-4 font-medium border-b border-gray-100">Modul</th>
              <th className="p-4 font-medium border-b border-gray-100">Aktivitas</th>
              <th className="p-4 font-medium border-b border-gray-100">Pengguna</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500 text-sm">{formatDate(new Date(log.created_at))}</td>
                <td className="p-4 text-sm font-medium">
                  <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-600">{log.entity_name}</span>
                </td>
                <td className="p-4 font-medium text-gray-900 flex items-center">
                  <FileText className="w-4 h-4 text-blue-500 mr-2" />
                  {log.action}
                </td>
                <td className="p-4 text-gray-700">
                  {log.profiles ? `${log.profiles.full_name} (${log.profiles.role})` : 'System'}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Belum ada aktivitas yang terekam.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
