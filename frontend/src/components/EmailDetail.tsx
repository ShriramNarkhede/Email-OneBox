import React from 'react';
import { Email } from '../types';
import { getCategoryColor, getCategoryIcon, formatDateTime } from '../utils/helpers';

interface EmailDetailProps {
  email: Email | null;
  suggestedReply: string;
  loadingReply: boolean;
  onCopyReply: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  suggestedReply,
  loadingReply,
  onCopyReply,
}) => {
  if (!email) {
    return (
      <section className="bg-base-100 rounded-2xl shadow-xl flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="bg-base-200 rounded-full p-12 inline-block">
            <svg className="w-24 h-24 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-base-content mb-2">Select an email</h3>
            <p className="text-base-content/60">Click on any email from the list to view details</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-base-100 rounded-2xl shadow-xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-base-300 bg-gradient-to-r from-primary/10 to-secondary/10 flex-shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-base-content flex-1">{email.subject}</h2>
          {email.category && (
            <span
              className="category-badge text-white shrink-0"
              style={{ backgroundColor: getCategoryColor(email.category) }}
            >
              <span className="text-lg inline-flex items-center">{getCategoryIcon(email.category, 'w-5 h-5')}</span>
              {email.category}
            </span>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="p-6 bg-base-200 flex-shrink-0">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wide mb-1">From</div>
            <div className="text-sm font-medium">{email.from}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wide mb-1">Date</div>
            <div className="text-sm font-medium">{formatDateTime(email.date)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wide mb-1">Account</div>
            <div className="text-sm font-medium">{email.accountEmail}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wide mb-1">Folder</div>
            <div className="text-sm font-medium">{email.folder}</div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Body */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-bold">Message</h3>
          </div>
          <div className="prose max-w-none bg-base-200 rounded-xl p-4">
            <p className="whitespace-pre-wrap text-base-content/80 leading-relaxed">
              {email.body}
            </p>
          </div>
        </div>

        {/* AI Suggested Reply */}
        <div className="p-6 pt-0">
        <div className="card bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/30">
          <div className="card-body">
            <h3 className="card-title text-primary flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Suggested Reply
            </h3>

            {loadingReply ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="text-base-content/60">Generating intelligent reply...</p>
                </div>
              </div>
            ) : suggestedReply ? (
              <>
                <div className="bg-base-100 rounded-xl p-4 mb-4 shadow-inner">
                  <p className="whitespace-pre-wrap text-base-content/80 leading-relaxed">
                    {suggestedReply}
                  </p>
                </div>
                <button className="btn btn-primary gap-2" onClick={onCopyReply}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy to Clipboard
                </button>
              </>
            ) : (
              <div className="alert alert-error">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Unable to generate reply suggestion</span>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default EmailDetail;