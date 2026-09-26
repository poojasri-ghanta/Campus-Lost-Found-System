import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, AlertCircle, Clock, Check, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useNotifications } from '../context/NotificationContext';
import { formatDateTime } from '../utils/formatters';

export const NotificationsPage = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (n) => {
    markAsRead(n._id);
    if (n.relatedModel === 'FoundItem') {
      navigate(`/found-items/${n.relatedId}`);
    } else if (n.relatedModel === 'Handover') {
      navigate('/handovers');
    } else if (n.relatedModel === 'Claim') {
      navigate('/claims');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
            Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-cocoa-600 mt-1">
            Real-time updates regarding algorithmic matches, claim submissions, and handovers
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead}>
            <Check className="w-4 h-4" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="You don't have any notifications right now."
          icon={Bell}
        />
      ) : (
        <div className="bg-cream-50 rounded-3xl border border-biscuit-200/80 shadow-warm divide-y divide-biscuit-200/60 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`p-5 flex items-start gap-4 hover:bg-cream-100/70 transition cursor-pointer ${
                !n.isRead ? 'bg-terracotta-50/40' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-warm-sm ${
                  n.type.includes('MATCH')
                    ? 'bg-amber-100 text-amber-700'
                    : n.type.includes('APPROVED') || n.type.includes('RETURNED')
                    ? 'bg-olive-100 text-olive-700'
                    : 'bg-terracotta-100 text-terracotta-700'
                }`}
              >
                {n.type.includes('MATCH') ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-charcoal-900 font-display">{n.title}</h4>
                  <span className="text-[11px] text-cocoa-400 font-mono">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-cocoa-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
