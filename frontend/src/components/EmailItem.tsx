import React from 'react';
import { Email } from '../types';
import { getCategoryColor, getCategoryIcon, formatDate, truncateEmail } from '../utils/helpers';

interface EmailItemProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
}

const EmailItem: React.FC<EmailItemProps> = ({ email, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        email-item card cursor-pointer border-2
        ${isSelected 
          ? 'border-primary bg-primary/5 shadow-lg' 
          : 'border-base-300 bg-base-100 hover:border-primary/50 hover:shadow-md'
        }
      `}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10 h-10">
                <span className="text-sm font-bold">
                  {email.from.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base-content truncate">{email.from}</div>
              <div className="text-xs text-base-content/60">{formatDate(email.date)}</div>
            </div>
          </div>
        </div>

        {/* Subject */}
        <h3 className="font-semibold text-base-content line-clamp-1 mb-1">
          {email.subject}
        </h3>

        {/* Body Preview */}
        <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
          {email.body.substring(0, 120)}...
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          {email.category && (
            <span
              className="category-badge text-white"
              style={{ backgroundColor: getCategoryColor(email.category) }}
            >
              <span className="inline-flex items-center">{getCategoryIcon(email.category, 'w-3 h-3')}</span>
              {email.category}
            </span>
          )}
          <div className="badge badge-ghost badge-sm">
            {truncateEmail(email.accountEmail)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailItem;