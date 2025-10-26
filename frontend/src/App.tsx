import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import { Email, Stats } from './types';

const API_URL = 'http://localhost:3000/api';
const PAGE_SIZE = 50;

function App() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [suggestedReply, setSuggestedReply] = useState<string>('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalEmails, setTotalEmails] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch stats on mount
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get<{ success: boolean; data: Stats }>(`${API_URL}/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch emails
  const fetchEmails = useCallback(async (page: number = 0, append: boolean = false) => {
    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedAccount) params.append('account', selectedAccount);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await axios.get<{ success: boolean; data: Email[]; total: number }>(`${API_URL}/emails?${params}`);
      const newEmails = response.data.data;

      if (append) {
        setEmails((prev) => [...prev, ...newEmails]);
      } else {
        setEmails(newEmails);
      }

      setHasMore(newEmails.length === PAGE_SIZE);
      setCurrentPage(page);
      
      // Get total count from response
      if (response.data.total) {
        setTotalEmails(response.data.total);
      } else {
        setTotalEmails(append ? emails.length + newEmails.length : newEmails.length);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedAccount, selectedCategory, emails.length]);

  // Initial fetch
  useEffect(() => {
    fetchEmails(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps for initial load only

  // Apply filters
  const handleApplyFilters = () => {
    setSelectedEmail(null);
    setSuggestedReply('');
    fetchEmails(0, false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAccount('');
    setSelectedCategory('');
    setSelectedEmail(null);
    setSuggestedReply('');
    // Trigger refetch
    setTimeout(() => fetchEmails(0, false), 0);
  };

  // Load more emails
  const handleLoadMore = () => {
    fetchEmails(currentPage + 1, true);
  };

  // Refresh emails
  const handleRefresh = () => {
    fetchEmails(0, false);
    fetchStats();
  };

  // Handle category click
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setTimeout(() => fetchEmails(0, false), 0);
  };

  // Handle email selection
  const handleEmailClick = async (email: Email) => {
    setSelectedEmail(email);
    setSuggestedReply('');
    setLoadingReply(true);

    try {
      const response = await axios.get<{ success: boolean; data: { reply: string } }>(`${API_URL}/emails/${email.id}/suggested-reply`);
      setSuggestedReply(response.data.data.reply);
    } catch (error) {
      console.error('Error fetching suggested reply:', error);
      setSuggestedReply('');
    } finally {
      setLoadingReply(false);
    }
  };

  // Copy reply to clipboard
  const handleCopyReply = () => {
    if (suggestedReply) {
      navigator.clipboard.writeText(suggestedReply);
      // Show toast notification (you can implement this with a toast library)
      alert('Reply copied to clipboard!');
    }
  };

  const hasActiveFilters = !!(searchQuery || selectedAccount || selectedCategory);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-6">
      {/* Header */}
      <header className="flex-shrink-0 mb-4">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-center justify-between bg-base-100 rounded-xl shadow-lg p-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Email Onebox
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="stats shadow-sm">
                <div className="stat py-2 px-3">
                  <div className="stat-title text-[10px]">Emails</div>
                  <div className="stat-value text-xl text-primary">{stats?.total || 0}</div>
                </div>
                <div className="stat py-2 px-3">
                  <div className="stat-title text-[10px]">Categories</div>
                  <div className="stat-value text-xl text-secondary">
                    {stats?.byCategory ? Object.keys(stats.byCategory).length : 0}
                  </div>
                </div>
                <div className="stat py-2 px-3">
                  <div className="stat-title text-[10px]">Accounts</div>
                  <div className="stat-value text-xl text-accent">
                    {stats?.byAccount ? Object.keys(stats.byAccount).length : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden max-w-[1920px] mx-auto w-full">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Sidebar */}
          <div className="col-span-3 h-full overflow-hidden">
            <Sidebar
              stats={stats}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedAccount={selectedAccount}
              setSelectedAccount={setSelectedAccount}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              loading={loading}
              hasActiveFilters={hasActiveFilters}
              onCategoryClick={handleCategoryClick}
            />
          </div>

          {/* Email List */}
          <div className="col-span-4 h-full overflow-hidden">
            <EmailList
              emails={emails}
              selectedEmail={selectedEmail}
              onEmailClick={handleEmailClick}
              loading={loading}
              loadingMore={loadingMore}
              selectedCategory={selectedCategory}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              onRefresh={handleRefresh}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              totalEmails={totalEmails}
            />
          </div>

          {/* Email Detail */}
          <div className="col-span-5 h-full overflow-hidden">
            <EmailDetail
              email={selectedEmail}
              suggestedReply={suggestedReply}
              loadingReply={loadingReply}
              onCopyReply={handleCopyReply}
            />
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default App;