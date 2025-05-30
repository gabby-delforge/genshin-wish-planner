'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SilentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a storage-related error
    const isStorageError = 
      error.message?.includes('localStorage') ||
      error.message?.includes('JSON') ||
      error.message?.includes('sessionStorage') ||
      error.name === 'QuotaExceededError';

    return { hasError: isStorageError };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    const isStorageError = 
      error.message?.includes('localStorage') ||
      error.message?.includes('JSON') ||
      error.message?.includes('sessionStorage') ||
      error.name === 'QuotaExceededError';

    if (isStorageError) {
      console.warn('Storage error auto-fixed:', error.message);
      
      // Silently clear problematic storage
      try {
        // Only clear keys that might be related to our app
        const keysToCheck = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes('genshin-store')) {
            keysToCheck.push(key);
          }
        }
        
        keysToCheck.forEach(key => {
          try {
            const item = localStorage.getItem(key);
            if (item) JSON.parse(item); // Test if valid
          } catch (e) {
            localStorage.removeItem(key); // Remove if corrupted
          }
        });
      } catch (e) {
        // If localStorage is completely broken, just continue
      }
      
      // Auto-retry by resetting error state after a brief moment
      setTimeout(() => {
        this.setState({ hasError: false });
      }, 100);
    }
  }

  render() {
    if (this.state.hasError) {
      // Show nothing - just a brief flash while we auto-recover
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      );
    }

    return this.props.children;
  }
}