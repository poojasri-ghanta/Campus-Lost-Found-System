import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Plus,
  ClipboardList,
  FileCheck,
  X,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav = () => {
  const { isAuthenticated } = useAuth();
  const [showActionSheet, setShowActionSheet] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Quick Action Floating Sheet on Mobile */}
      {showActionSheet && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-cocoa-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowActionSheet(false)}
          />
          <div className="fixed inset-x-0 bottom-0 p-5 pb-8 bg-cream-50 rounded-t-3xl border-t border-biscuit-300 shadow-2xl z-50 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-biscuit-200">
              <span className="text-xs font-extrabold text-cocoa-500 uppercase tracking-wider">
                Quick Campus Actions
              </span>
              <button
                onClick={() => setShowActionSheet(false)}
                className="p-1 rounded-full text-cocoa-400 hover:bg-cream-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <Link
                to="/lost-items/report"
                onClick={() => setShowActionSheet(false)}
                className="p-4 rounded-2xl bg-rust-50/80 hover:bg-rust-100/90 border border-rust-200/80 flex flex-col items-center justify-center text-center space-y-2 transition shadow-xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-rust-600 text-white flex items-center justify-center shadow-md shadow-rust-600/25">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-rust-950">Report Lost Item</span>
                <span className="text-[10px] text-rust-700 leading-tight">I misplaced an item</span>
              </Link>

              <Link
                to="/found-items/report"
                onClick={() => setShowActionSheet(false)}
                className="p-4 rounded-2xl bg-olive-50/80 hover:bg-olive-100/90 border border-olive-200/80 flex flex-col items-center justify-center text-center space-y-2 transition shadow-xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-olive-600 text-white flex items-center justify-center shadow-md shadow-olive-600/25">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-olive-950">Report Found Item</span>
                <span className="text-[10px] text-olive-700 leading-tight">I found something</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Tab Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-biscuit-200 py-1.5 px-3 md:hidden shadow-lg safe-area-bottom">
        <div className="flex items-center justify-around">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition ${
                isActive ? 'text-terracotta-600 font-extrabold' : 'text-cocoa-500 hover:text-cocoa-900'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">Home</span>
          </NavLink>

          {/* Lost */}
          <NavLink
            to="/lost-items"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition ${
                isActive ? 'text-terracotta-600 font-extrabold' : 'text-cocoa-500 hover:text-cocoa-900'
              }`
            }
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">Lost</span>
          </NavLink>

          {/* Plus Quick Action Center Button */}
          <div className="relative -top-3">
            <button
              type="button"
              onClick={() => setShowActionSheet(!showActionSheet)}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-terracotta-600 via-terracotta-500 to-amber-500 text-white flex items-center justify-center shadow-warm hover:shadow-glow active:scale-95 transition-all duration-200 cursor-pointer border border-terracotta-400/30"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Found */}
          <NavLink
            to="/found-items"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition ${
                isActive ? 'text-terracotta-600 font-extrabold' : 'text-cocoa-500 hover:text-cocoa-900'
              }`
            }
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">Found</span>
          </NavLink>

          {/* Claims / Handovers */}
          <NavLink
            to="/claims"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition relative ${
                isActive ? 'text-terracotta-600 font-extrabold' : 'text-cocoa-500 hover:text-cocoa-900'
              }`
            }
          >
            <FileCheck className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">Claims</span>
          </NavLink>
        </div>
      </div>
    </>
  );
};

