import React from 'react';
import { NavLink } from 'react-router-dom';
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
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { BrandLogo } from './BrandLogo';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

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
    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
      isActive
        ? 'bg-terracotta-600 text-white shadow-warm'
        : 'text-cocoa-700 hover:bg-cream-200 hover:text-cocoa-950'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-cocoa-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-biscuit-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-biscuit-100 lg:hidden">
          <BrandLogo size="sm" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-cocoa-400 hover:bg-cream-200 text-cocoa-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-biscuit-100">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-cream-100 border border-biscuit-200">
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'User'
                )}&background=CD5C38&color=fff`
              }
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover border border-biscuit-300 shrink-0 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-cocoa-950 truncate">{user?.name}</p>
              <p className="text-[11px] text-cocoa-500 truncate">{user?.department}</p>
              <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-terracotta-600">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-cocoa-400">
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
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-terracotta-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Admin Navigation Section */}
          {isAdmin && (
            <div className="pt-3 border-t border-biscuit-100">
              <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-rust-600 flex items-center gap-1.5">
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
                      `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-rust-600 text-white shadow-sm'
                          : 'text-cocoa-700 hover:bg-rust-50 hover:text-rust-800'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
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
        <div className="p-4 border-t border-biscuit-100 bg-cream-50">
          <div className="p-3 rounded-2xl bg-cream-100 border border-biscuit-200 text-xs text-cocoa-900">
            <p className="font-bold flex items-center gap-1.5 text-terracotta-700">
              <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
              Verified Ownership
            </p>
            <p className="mt-1 text-[11px] text-cocoa-600 leading-normal">
              Private item details are concealed to protect owner privacy and prevent fraudulent claims.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

