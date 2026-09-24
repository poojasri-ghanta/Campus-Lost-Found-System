import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Plus,
  ClipboardList,
  FileCheck,
  Bell,
  User,
  ShieldCheck,
  X,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const MobileBottomNav = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Quick Action Floating Sheet on Mobile */}
      {showActionSheet && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowActionSheet(false)}
          />
          <div className="fixed inset-x-0 bottom-0 p-4 pb-6 bg-white rounded-t-3xl border-t border-slate-200/80 shadow-2xl z-50 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Quick Campus Actions
              </span>
              <button
                onClick={() => setShowActionSheet(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/lost-items/report"
                onClick={() => setShowActionSheet(false)}
                className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 flex flex-col items-center justify-center text-center space-y-2 transition"
              >
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-rose-900">Report Lost Item</span>
                <span className="text-[10px] text-rose-700 leading-tight">I misplaced an item</span>
              </Link>

              <Link
                to="/found-items/report"
                onClick={() => setShowActionSheet(false)}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex flex-col items-center justify-center text-center space-y-2 transition"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-900">Report Found Item</span>
                <span className="text-[10px] text-emerald-700 leading-tight">I found something</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Tab Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 md:hidden shadow-lg safe-area-bottom">
        <div className="flex items-center justify-around">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </NavLink>

          {/* Lost */}
          <NavLink
            to="/lost-items"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Lost</span>
          </NavLink>

          {/* Plus Quick Action Center Button */}
          <div className="relative -top-3">
            <button
              type="button"
              onClick={() => setShowActionSheet(!showActionSheet)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-400/40 active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Found */}
          <NavLink
            to="/found-items"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Found</span>
          </NavLink>

          {/* Claims / Handovers */}
          <NavLink
            to="/claims"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition relative ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <FileCheck className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Claims</span>
          </NavLink>
        </div>
      </div>
    </>
  );
};
