'use client';

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error locally for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    try {
      // Gather metadata about the error and client context
      const errorData = {
        errorName: error?.name || 'Error',
        errorMessage: error?.message || String(error),
        errorStack: error?.stack || errorInfo?.componentStack || 'No stack trace available',
        pageUrl: typeof window !== 'undefined' ? window.location.href : 'Unknown URL',
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown UA',
      };

      // Send error to the reports API endpoint
      fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'website-system-error-boundary',
          message: JSON.stringify(errorData, null, 2),
          fileUrl: '',
        }),
      }).catch((err) => {
        console.error('Failed to send error report to backend:', err);
      });
    } catch (e) {
      console.error('Failed to construct or send error report:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      // Premium minimalist maintenance screen matching Aesthetx Ways design identity
      return (
        <div className="flex flex-col flex-1 bg-white items-center justify-center text-center px-6 py-20 min-h-[75vh]">
          {/* Main Status SVG */}
          <div className="w-48 h-48 mb-8 select-none flex items-center justify-center">
            <img 
              src="/status/main.svg" 
              alt="Under Maintenance" 
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>

          {/* Under Maintenance Brand Slogan */}
          <h1 className="font-lovelo-black text-xl tracking-[0.15em] text-black mb-3">
            UNDER MAINTENANCE
          </h1>
          
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold max-w-[280px] leading-relaxed">
            The site is currently undergoing essential maintenance. It will get back in some time.
          </p>

          {/* Retro tech decorative element */}
          <div className="mt-8 flex items-center gap-1.5 opacity-60">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping"></span>
            <span className="text-[8px] font-mono tracking-widest text-zinc-400 uppercase select-none">
              [ AESTHETX WAYS SYSTEM GATE ]
            </span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
