import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  Sparkles,
  ClipboardList,
  ArrowLeftRight,
  Bell,
  User,
  Shield,
  Users,
  AlertOctagon,
  FileText,
  BarChart3,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Lost Items', path: '/lost-items', icon: Search },
    { name: 'Report Lost Item', path: '/lost-items/report', icon: PlusCircle },
    { name: 'Found Items', path: '/found-items', icon: ClipboardList },
    { name: 'Report Found Item', path: '/found-items/report', icon: PlusCircle },
    { name: 'Smart Matches', path: '/matches', icon: Sparkles },
    { name: 'Ownership Claims', path: '/claims', icon: FileText },
    { name: 'Handovers & Pickup', path: '/handovers', icon: ArrowLeftRight },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  const adminLinks = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: Shield },
    { name: 'Disputed Claims', path: '/admin/disputes', icon: AlertOctagon, highlight: true },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
    { name: 'Analytics & Trends', path: '/admin/analytics', icon: BarChart3 }
  ];

  const navItemClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <span className="text-sm font-bold text-slate-800">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'User'
                )}&background=4f46e5&color=fff`
              }
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.department}</p>
              <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Campus Recovery
            </div>
            <nav className="space-y-1">
              {studentLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={navItemClass}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Admin Navigation Section */}
          {isAdmin && (
            <div className="pt-2 border-t border-slate-100">
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Administration
              </div>
              <nav className="space-y-1">
                {adminLinks.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                          : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Verified Ownership
            </p>
            <p className="mt-1 text-[11px] text-indigo-700 leading-normal">
              Private item details are hidden to protect owner privacy and prevent fraudulent claims.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
