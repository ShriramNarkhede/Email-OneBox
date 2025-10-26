import React from 'react';
import { Email } from '../types';
import EmailItem from './EmailItem';

interface EmailListProps {
  emails: Email[];
  selectedEmail: Email | null;
  onEmailClick: (email: Email) => void;
  loading: boolean;
  loadingMore: boolean;
  selectedCategory: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onRefresh: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  totalEmails: number;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmail,
  onEmailClick,
  loading,
  loadingMore,
  selectedCategory,
  hasActiveFilters,
  onClearFilters,
  onRefresh,
  onLoadMore,
  hasMore,
  totalEmails,
}) => {
  return (
    <main className="bg-base-100 rounded-2xl shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-base-content flex items-center gap-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>
              Emails ({emails.length}
              {totalEmails > emails.length && <span className="text-base-content/50"> of {totalEmails}</span>})
            </span>
            {selectedCategory && (
              <span className="badge badge-primary badge-lg">{selectedCategory}</span>
            )}
          </h2>
          <button
            className="btn btn-ghost btn-sm gap-2"
            onClick={onRefresh}
            disabled={loading}
          >
            <svg 
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-base-content/60">Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="bg-base-200 rounded-full p-8">
              <svg className="w-16 h-16 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-base-content mb-2">No emails found</h3>
              {hasActiveFilters ? (
                <p className="text-base-content/60">
                  Try adjusting your filters or{' '}
                  <button className="link link-primary" onClick={onClearFilters}>
                    clear all filters
                  </button>
                </p>
              ) : (
                <p className="text-base-content/60">No emails in the last 30 days</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {emails.map((email) => (
                <EmailItem
                  key={email.id}
                  email={email}
                  isSelected={selectedEmail?.id === email.id}
                  onClick={() => onEmailClick(email)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  className="btn btn-primary btn-wide gap-2"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Loading more...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Load More Emails
                    </>
                  )}
                </button>
                <p className="text-sm text-base-content/60 mt-2">
                  Showing {emails.length} of {totalEmails > emails.length ? 'many more' : emails.length} emails
                </p>
              </div>
            )}

            {/* All Loaded */}
            {!hasMore && emails.length > 0 && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 text-success font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All emails loaded ({emails.length} total)
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default EmailList;