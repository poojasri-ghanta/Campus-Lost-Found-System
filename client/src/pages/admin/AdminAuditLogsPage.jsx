import React, { useState, useEffect } from 'react';
import { FileText, Search, ShieldCheck, Clock, User, HardDrive } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Pagination } from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/formatters';
import api from '../../services/api';

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (entityType !== 'ALL') params.append('entityType', entityType);
      params.append('page', page);
      params.append('limit', 15);

      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      if (res.data.success) {
        setLogs(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, entityType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
          Forensic Audit Trails
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Immutable system log recording item creation, claim submissions, dispute adjudications, and PIN handovers ({totalCount} entries)
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <input
            type="text"
            placeholder="Search by user email, action name, or entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-soft"
          />
        </form>

        <select
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none shadow-soft"
        >
          <option value="ALL">All Entity Types</option>
          <option value="USER">USER</option>
          <option value="LOST_ITEM">LOST_ITEM</option>
          <option value="FOUND_ITEM">FOUND_ITEM</option>
          <option value="CLAIM">CLAIM</option>
          <option value="HANDOVER">HANDOVER</option>
          <option value="MATCH">MATCH</option>
        </select>
      </div>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner label="Loading audit trail records..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <strong className="text-slate-900 block font-semibold">{log.userEmail}</strong>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold font-mono text-[11px] border border-indigo-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800 font-medium">{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ID: {log.entityId.substring(0, 10)}...
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-[11px] font-mono text-slate-500">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
