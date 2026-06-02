"use client";

import { useState, useEffect } from 'react';
import { X, QrCode, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function WhatsAppRecoveryModal({ clientId, initialQr, onClose, onConnected }) {
  const [qrCode, setQrCode] = useState(initialQr);
  const [state, setState] = useState(initialQr ? 'QR_REQUIRED' : 'INITIALIZING');
  const [dots, setDots] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Subtle loading animation dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Poll for connection status and real-time QR updates
  useEffect(() => {
    let isMounted = true;
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/whatsapp/status?clientId=${clientId}`);
        if (!res.ok) {
          throw new Error(`Failed to query status: ${res.statusText}`);
        }
        const data = await res.json();

        if (isMounted && data.success) {
          setState(data.state);
          
          if (data.qrBase64) {
            setQrCode(data.qrBase64);
          }

          if (data.state === 'READY') {
            setTimeout(() => {
              if (onConnected) onConnected();
            }, 1800);
          }
        }
      } catch (err) {
        console.error('Polling status failed:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Error syncing with gateway.');
        }
      }
    };

    // Run immediately, then poll
    checkStatus();
    const interval = setInterval(checkStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [clientId, onConnected]);

  // Color mapping based on status
  const getBadgeColor = () => {
    switch (state) {
      case 'READY':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'QR_REQUIRED':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'INITIALIZING':
      case 'AUTHENTICATED':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-rose-50 text-rose-600 border-rose-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-[420px] w-full text-center relative shadow-2xl border border-slate-100 animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-900"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex flex-col items-center gap-1.5 mb-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="font-lovelo text-[13px] tracking-widest text-black mt-0.5">AESTHETX WAYS</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">WhatsApp POS Terminal</span>
        </div>

        {/* State Indicators */}
        <div className="mb-6 flex justify-center">
          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${getBadgeColor()}`}>
            {state.replace('_', ' ')}
          </span>
        </div>

        {/* MAIN DISPLAY CONTAINER */}
        <div className="min-h-[260px] flex flex-col justify-center items-center py-2">
          {state === 'READY' ? (
            <div className="flex flex-col items-center justify-center gap-4 py-6 animate-slide-up-fade">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 relative">
                <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Session Established!</h3>
                <p className="text-[10px] text-slate-500 max-w-[280px] mt-1.5 leading-relaxed">
                  WhatsApp is linked. Delivering POS e-bills and held notifications in the background now.
                </p>
              </div>
            </div>
          ) : state === 'QR_REQUIRED' && qrCode ? (
            <div className="flex flex-col items-center justify-center w-full animate-slide-up-fade">
              <p className="text-[10.5px] text-slate-500 max-w-[320px] mb-4 leading-relaxed">
                POS Gateway connection is offline. Scan this QR code inside WhatsApp to resume automatically.
              </p>
              
              {/* QR Code Container with Pulsing Border */}
              <div className="relative p-2.5 bg-white border border-slate-100 rounded-2xl shadow-inner max-w-[210px] w-full aspect-square flex items-center justify-center">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                
                {/* Laser scan animation overlay */}
                <div className="absolute inset-x-2.5 top-0 bottom-0 overflow-hidden pointer-events-none">
                  <div className="h-0.5 w-full bg-emerald-500 opacity-60 shadow-[0_0_10px_2px_rgba(16,185,129,0.7)] animate-laser absolute" />
                </div>
              </div>
              
              <span className="text-[9px] font-bold text-slate-400 mt-4 tracking-wider uppercase">
                WhatsApp &rarr; Settings &rarr; Linked Devices
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-8 animate-slide-up-fade">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <RefreshCw className="w-7 h-7 text-blue-500 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-slate-800 tracking-wider uppercase">Syncing Gateway Session</h3>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[260px] leading-relaxed">
                  Provisioning Puppeteer instance and loading session parameters{dots}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error messaging box */}
        {errorMsg && state !== 'READY' && (
          <div className="mt-4 p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-left flex items-start gap-2 text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-[9px] font-semibold leading-normal">{errorMsg}</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <button
            onClick={onClose}
            className="w-full px-5 py-3 bg-slate-950 text-white rounded-2xl hover:bg-slate-900 active:scale-[0.98] transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Close Terminal
          </button>
        </div>

      </div>

      <style jsx global>{`
        @keyframes laser {
          0% {
            top: 5%;
          }
          50% {
            top: 95%;
          }
          100% {
            top: 5%;
          }
        }
        .animate-laser {
          animation: laser 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
