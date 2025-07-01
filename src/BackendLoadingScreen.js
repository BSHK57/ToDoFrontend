import { useState, useEffect } from 'react';

const BackendLoadingScreen = ({ onBackendReady }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Waking up the server...');

  useEffect(() => {
    let timer;
    let healthCheckInterval;

    // Start the countdown timer
    timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsConnecting(false);
          setConnectionStatus('Connection timeout - please try again');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Health check function
    const checkBackendHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('https://todobackend-shk.onrender.com', {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          clearInterval(timer);
          clearInterval(healthCheckInterval);
          setIsConnecting(false);
          setConnectionStatus('Connected! Redirecting...');
          setTimeout(() => onBackendReady(), 500);
        }
      } catch (error) {
        // Continue trying - this is expected during cold start
        console.log('Health check failed, retrying...', error.message);
      }
    };

    // Initial health check
    checkBackendHealth();

    // Check every 3 seconds
    healthCheckInterval = setInterval(checkBackendHealth, 3000);

    // Update status messages based on time
    const statusUpdater = setInterval(() => {
      if (timeLeft > 45) {
        setConnectionStatus('Waking up the server...');
      } else if (timeLeft > 30) {
        setConnectionStatus('Server is starting up...');
      } else if (timeLeft > 15) {
        setConnectionStatus('Almost ready...');
      } else if (timeLeft > 0) {
        setConnectionStatus('Final preparations...');
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(healthCheckInterval);
      clearInterval(statusUpdater);
    };
  }, [onBackendReady, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((60 - timeLeft) / 60) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
      </div>

      <div className="relative max-w-lg w-full backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="text-8xl mb-6 animate-bounce">⏳</div>
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Connecting to Server
          </h1>
          <p className="text-slate-300 font-medium text-lg mb-2">
            {connectionStatus}
          </p>
          <p className="text-slate-400 text-sm">
            Our server is hosted on Render and may take a moment to wake up
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 font-semibold text-sm">Progress</span>
            <span className="text-slate-300 font-semibold text-sm">{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 backdrop-blur-sm border border-slate-600/30">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${getProgressPercentage()}%` }}
            >
              <div className="h-full bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Timer display */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-slate-800/50 rounded-2xl px-6 py-4 border border-slate-600/30 backdrop-blur-sm">
            <span className="text-2xl">⏱️</span>
            <div>
              <div className="text-3xl font-black text-white font-mono">
                {formatTime(timeLeft)}
              </div>
              <div className="text-slate-400 text-xs font-medium">
                Time remaining
              </div>
            </div>
          </div>
        </div>

        {/* Loading animation */}
        {isConnecting && (
          <div className="flex justify-center mb-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {/* Status messages */}
        <div className="text-center">
          {timeLeft > 0 && isConnecting ? (
            <div className="space-y-2">
              <p className="text-slate-300 text-sm">
                🚀 Server is starting up on Render...
              </p>
              <p className="text-slate-400 text-xs">
                This usually takes 30-60 seconds for the first request
              </p>
            </div>
          ) : !isConnecting && timeLeft === 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 text-red-300 font-semibold justify-center">
                  <span className="text-xl">⚠️</span>
                  Connection Timeout
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
              >
                🔄 Try Again
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-300 font-semibold">
              <span className="text-xl">✅</span>
              Connected Successfully!
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="text-center text-slate-400 text-xs space-y-1">
            <p>💡 <strong>Why the wait?</strong></p>
            <p>Free tier servers go to sleep when inactive</p>
            <p>This happens only on the first visit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendLoadingScreen;