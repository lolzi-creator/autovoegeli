'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Car, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react';

interface SyncResult {
  success: boolean;
  vehicles?: any[];
  count?: number;
  message?: string;
  error?: string;
  vehiclesProcessed?: number;
  timestamp?: string;
}

interface AutoScoutSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: (result: SyncResult) => void;
}

export default function AutoScoutSyncModal({ 
  isOpen, 
  onClose, 
  onSyncComplete 
}: AutoScoutSyncModalProps) {
  const [step, setStep] = useState<'idle' | 'checking' | 'syncing' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const startSync = async () => {
    try {
      setStep('checking');
      setMessage('Checking available vehicles...');
      setProgress(10);

      // First, check how many vehicles are available
      const checkResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'fetch_listings',
          dealerUrl: 'https://autoscout24.ch' // Default URL
        }),
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check vehicle listings');
      }

      const checkData = await checkResponse.json();
      setVehicleCount(checkData.count);
      setMessage(`Found ${checkData.count} vehicles to sync`);
      setProgress(25);

      // Wait a moment for user to see the count
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Start the actual sync
      setStep('syncing');
      setMessage('Starting sync process...');
      setProgress(30);

      const syncResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start_sync',
          dealerUrl: 'https://autoscout24.ch'
        }),
      });

      if (!syncResponse.ok) {
        throw new Error('Sync request failed');
      }

      const syncData = await syncResponse.json();
      
      if (syncData.success) {
        setStep('complete');
        setProgress(100);
        setMessage(syncData.message || `Successfully synced ${syncData.vehiclesProcessed || vehicleCount} vehicles`);
        
        // Call the completion callback
        onSyncComplete(syncData);
      } else {
        throw new Error(syncData.message || 'Sync failed');
      }

    } catch (error) {
      console.error('Sync error:', error);
      setStep('error');
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setMessage('Sync failed');
    }
  };

  const resetModal = () => {
    setStep('idle');
    setProgress(0);
    setVehicleCount(null);
    setMessage('');
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleStartAgain = () => {
    resetModal();
    startSync();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AutoScout24 Sync
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Import vehicle listings
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'idle' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Sync Vehicle Data
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                    Import the latest vehicle listings from AutoScout24. This will update your inventory with current pricing and availability.
                  </p>
                  <button
                    onClick={startSync}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Start Sync
                  </button>
                </div>
              )}

              {(step === 'checking' || step === 'syncing') && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  
                  {vehicleCount && (
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {vehicleCount}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        vehicles found
                      </div>
                    </div>
                  )}

                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {step === 'checking' ? 'Checking Listings' : 'Syncing Data'}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                    {message}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <motion.div
                      className="bg-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {progress}% complete
                  </div>
                </div>
              )}

              {step === 'complete' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Sync Complete!
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                    {message}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-3 px-4 rounded-xl font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleStartAgain}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Sync Again
                    </button>
                  </div>
                </div>
              )}

              {step === 'error' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Sync Failed
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">
                    {error}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 mb-6 text-xs">
                    Please try again or contact support if the problem persists.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-3 px-4 rounded-xl font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleStartAgain}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <ExternalLink className="w-3 h-3" />
                <span>Powered by AutoScout24 API</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
