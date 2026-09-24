import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserCheck, UserX, AlertCircle, Check } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Pagination } from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminUsersPage = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleUserStatus = async (userObj) => {
    const newStatus = !userObj.isActive;
    const action = newStatus ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} user ${userObj.name}?`)) return;

    try {
      const res = await api.put(`/admin/users/${userObj._id}`, {
        isActive: newStatus,
        suspensionReason: newStatus ? '' : 'Account suspended by Campus Administrator'
      });

      if (res.data.success) {
        showToast(`User ${userObj.name} status updated.`, 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast('Failed to update user status.', 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, { role: newRole });
      if (res.data.success) {
        showToast(`Role updated to ${newRole}.`, 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast('Failed to update role.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
          User Account Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage campus students, reporting finders, role elevations, and account suspensions
        </p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, student ID, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-soft"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none shadow-soft"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="FINDER">Finder</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner label="Loading user registry..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Department / ID</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              u.name
                            )}&background=4f46e5&color=fff`
                          }
                          alt={u.name}
                          className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <strong className="text-slate-900 block font-semibold">{u.name}</strong>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800 font-medium block">{u.department}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{u.studentId || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="FINDER">FINDER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(u)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          u.isActive
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
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
