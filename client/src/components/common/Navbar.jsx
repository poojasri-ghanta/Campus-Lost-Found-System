import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Bell,
  PlusCircle,
  Search,
  User,
  LogOut,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-biscuit-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-cocoa-600 hover:bg-cream-200 hover:text-cocoa-950 transition cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <BrandLogo size="md" />
          </div>

          {/* Center: Quick navigation links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/lost-items"
              className="px-3.5 py-2 text-xs font-bold text-cocoa-700 hover:text-terracotta-600 hover:bg-terracotta-50/80 rounded-xl transition"
            >
              Browse Lost Items
            </Link>
            <Link
              to="/found-items"
              className="px-3.5 py-2 text-xs font-bold text-cocoa-700 hover:text-terracotta-600 hover:bg-terracotta-50/80 rounded-xl transition"
            >
              Browse Found Items
            </Link>
            {isAuthenticated && (
              <Link
                to="/matches"
                className="px-3.5 py-2 text-xs font-bold text-cocoa-700 hover:text-terracotta-600 hover:bg-terracotta-50/80 rounded-xl transition inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Smart Matches
              </Link>
            )}
          </nav>

          {/* Right: Actions, Notifications, Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Quick Action Button */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/lost-items/report"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rust-700 bg-rust-50 hover:bg-rust-100 border border-rust-200 rounded-xl transition shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Report Lost
                  </Link>
                  <Link
                    to="/found-items/report"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-olive-800 bg-olive-50 hover:bg-olive-100 border border-olive-200 rounded-xl transition shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Report Found
                  </Link>
                </div>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-2xl text-cocoa-600 hover:bg-cream-200 hover:text-cocoa-950 transition cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-card border border-biscuit-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between px-5 py-3 border-b border-biscuit-100">
                        <h4 className="font-bold text-sm text-cocoa-950 font-heading">Notifications</h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-terracotta-600 hover:text-terracotta-700 font-bold cursor-pointer"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-biscuit-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-cocoa-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((n) => (
                            <div
                              key={n._id}
                              onClick={() => {
                                markAsRead(n._id);
                                if (n.relatedModel === 'FoundItem') navigate(`/found-items/${n.relatedId}`);
                                else if (n.relatedModel === 'Handover') navigate('/handovers');
                                else if (n.relatedModel === 'Claim') navigate('/claims');
                                setShowNotifications(false);
                              }}
                              className={`p-4 hover:bg-cream-100 cursor-pointer transition flex items-start gap-3 ${
                                !n.isRead ? 'bg-terracotta-50/50' : ''
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  n.type.includes('MATCH')
                                    ? 'bg-amber-100 text-amber-700'
                                    : n.type.includes('APPROVED') || n.type.includes('RETURNED')
                                    ? 'bg-olive-100 text-olive-700'
                                    : 'bg-terracotta-100 text-terracotta-700'
                                }`}
                              >
                                {n.type.includes('MATCH') ? (
                                  <AlertCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-cocoa-950 leading-tight">
                                  {n.title}
                                </p>
                                <p className="text-xs text-cocoa-600 mt-1 line-clamp-2 leading-relaxed">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-cocoa-400 mt-1 block">
                                  {formatRelativeTime(n.createdAt)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-3 border-t border-biscuit-100 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifications(false)}
                          className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800"
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-cream-200 transition cursor-pointer"
                  >
                    <img
                      src={
                        user?.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.name || 'User'
                        )}&background=CD5C38&color=fff`
                      }
                      alt={user?.name}
                      className="w-8 h-8 rounded-xl object-cover border border-biscuit-300"
                    />
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-bold text-cocoa-900 leading-none">
                        {user?.name?.split(' ')[0]}
                      </div>
                      <div className="text-[10px] font-bold text-terracotta-600 uppercase tracking-wider mt-0.5">
                        {user?.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-cocoa-400 hidden lg:block" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-card border border-biscuit-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-3 border-b border-biscuit-100">
                        <p className="text-xs font-bold text-cocoa-950 truncate">{user?.name}</p>
                        <p className="text-[11px] text-cocoa-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-cream-200 text-cocoa-800 text-[10px] font-extrabold rounded-md uppercase border border-biscuit-300">
                          Role: {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-cocoa-800 hover:bg-terracotta-50 hover:text-terracotta-700 transition"
                        >
                          <Sliders className="w-4 h-4 text-cocoa-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-cocoa-800 hover:bg-terracotta-50 hover:text-terracotta-700 transition"
                        >
                          <User className="w-4 h-4 text-cocoa-400" />
                          My Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rust-600 hover:bg-rust-50 transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-rust-500" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-biscuit-100 pt-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rust-600 hover:bg-rust-50 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-cocoa-700 hover:text-terracotta-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4.5 py-2 text-xs font-bold text-white bg-terracotta-600 hover:bg-terracotta-700 rounded-2xl transition shadow-warm"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

