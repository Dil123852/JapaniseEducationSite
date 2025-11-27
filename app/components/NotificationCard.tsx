'use client';

import { Notification } from '@/app/lib/db/notifications';

interface NotificationCardProps {
  notification: Notification;
}

export default function NotificationCard({ notification }: NotificationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-medium text-slate-800 flex-1">{notification.title}</h3>
        <span className="text-xs text-slate-400 ml-4 whitespace-nowrap">
          {new Date(notification.created_at).toLocaleDateString('en-US')}
        </span>
      </div>
      <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
        {notification.message}
      </p>
    </div>
  );
}

