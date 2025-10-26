import React from 'react';
import { 
  Briefcase, 
  User, 
  Gift, 
  Users, 
  Bell, 
  MessageCircle, 
  Trash2, 
  Star, 
  DollarSign, 
  Plane, 
  ShoppingBag, 
  Heart, 
  Mail 
} from 'lucide-react';

export const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Work': '#667eea',
    'Personal': '#764ba2',
    'Promotions': '#f59e0b',
    'Social': '#ec4899',
    'Updates': '#10b981',
    'Forums': '#8b5cf6',
    'Spam': '#ef4444',
    'Important': '#f43f5e',
    'Finance': '#14b8a6',
    'Travel': '#06b6d4',
    'Shopping': '#f97316',
    'Health': '#84cc16',
  };
  return colors[category] || '#6b7280';
};

export const getCategoryIcon = (category: string, className: string = 'w-4 h-4'): React.ReactNode => {
  const icons: { [key: string]: React.ReactNode } = {
    'Work': <Briefcase className={className} />,
    'Personal': <User className={className} />,
    'Promotions': <Gift className={className} />,
    'Social': <Users className={className} />,
    'Updates': <Bell className={className} />,
    'Forums': <MessageCircle className={className} />,
    'Spam': <Trash2 className={className} />,
    'Important': <Star className={className} />,
    'Finance': <DollarSign className={className} />,
    'Travel': <Plane className={className} />,
    'Shopping': <ShoppingBag className={className} />,
    'Health': <Heart className={className} />,
  };
  return icons[category] || <Mail className={className} />;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const truncateEmail = (email: string, maxLength: number = 20): string => {
  if (email.length <= maxLength) return email;
  const [name, domain] = email.split('@');
  if (name.length > maxLength - 3) {
    return `${name.substring(0, maxLength - 3)}...@${domain}`;
  }
  return email;
};
