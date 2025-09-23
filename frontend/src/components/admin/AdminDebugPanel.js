import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const AdminDebugPanel = ({ error, authState, apiCalls = [], orderCount = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const [systemInfo, setSystemInfo] = useState({});

  useEffect(() => {
    // Collect system information
    setSystemInfo({
      userAgent: navigator.userAgent,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString(),
      localStorage: {
        authToken: !!localStorage.getItem('authToken'),
        user: !!localStorage.getItem('user'),
        authState: !!localStorage.getItem('authState')
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiUrl: process.env.REACT_APP_API_URL,
        isProduction: process.env.NODE_ENV === 'production'
      }
    });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 border-green-200 text-green-800';
      case 'error': return 'bg-red-100 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getOverallStatus = () => {
    if (error) return 'error';
    if (apiCalls.some(call => call.status === 'error')) return 'warning';
    if (orderCount > 0 || apiCalls.some(call => call.status === 'success')) return 'success';
    return 'info';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className={`border-l-4 p-4 mb-6 ${getStatusColor(overallStatus)}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {overallStatus === 'error' ? (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          ) : (
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          )}
        </div>
        <div className="ml-3 w-full">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">
              Admin Debug Information
              {overallStatus === 'error' && ' - Issues Detected'}
              {overallStatus === 'success' && ' - System OK'}
            </h3>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs underline focus:outline-none"
            >
              {expanded ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="mt-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>Authentication:</strong> {authState?.token || 'No token'}
              </div>
              <div>
                <strong>API Calls:</strong> {apiCalls.length} made
              </div>
              <div>
                <strong>Orders Loaded:</strong> {orderCount}
              </div>
            </div>
            
            {error && (
              <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-xs">
                <strong>Current Error:</strong> {error}
              </div>
            )}
          </div>

          {expanded && (
            <div className="mt-4 space-y-4">
              {/* System Information */}
              <div>
                <h4 className="font-medium text-sm mb-2">System Information</h4>
                <div className="bg-gray-50 rounded p-3 text-xs space-y-1">
                  <div><strong>Environment:</strong> {systemInfo.environment?.nodeEnv || 'unknown'}</div>
                  <div><strong>API URL:</strong> {systemInfo.environment?.apiUrl || 'not set'}</div>
                  <div><strong>Hostname:</strong> {systemInfo.hostname}</div>
                  <div><strong>Protocol:</strong> {systemInfo.protocol}</div>
                  <div><strong>Current URL:</strong> {systemInfo.currentUrl}</div>
                </div>
              </div>

              {/* Authentication Details */}
              <div>
                <h4 className="font-medium text-sm mb-2">Authentication Status</h4>
                <div className="bg-gray-50 rounded p-3 text-xs space-y-1">
                  <div><strong>Auth Token:</strong> {systemInfo.localStorage?.authToken ? '✅ Present' : '❌ Missing'}</div>
                  <div><strong>User Data:</strong> {systemInfo.localStorage?.user ? '✅ Present' : '❌ Missing'}</div>
                  <div><strong>Auth State:</strong> {systemInfo.localStorage?.authState ? '✅ Present' : '❌ Missing'}</div>
                </div>
              </div>

              {/* Recent API Calls */}
              {apiCalls.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Recent API Calls</h4>
                  <div className="space-y-2">
                    {apiCalls.slice(-5).map((call, index) => (
                      <div
                        key={index}
                        className={`text-xs p-2 rounded border ${
                          call.status === 'success' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <strong>{call.endpoint}</strong>
                            <span className={`ml-2 px-1 rounded text-xs ${
                              call.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {call.status}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(call.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {call.error && (
                          <div className="mt-1 text-red-600">{call.error}</div>
                        )}
                        {call.data && (
                          <div className="mt-1 text-gray-600">
                            Response keys: {Array.isArray(call.data) ? call.data.join(', ') : 'Object'}
                            {call.responseSize && ` (${call.responseSize} bytes)`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Troubleshooting Tips */}
              <div>
                <h4 className="font-medium text-sm mb-2">Troubleshooting</h4>
                <div className="bg-blue-50 rounded p-3 text-xs space-y-1">
                  {!systemInfo.localStorage?.authToken && (
                    <div>🔐 <strong>Missing Auth Token:</strong> Try logging in again as admin</div>
                  )}
                  {systemInfo.environment?.nodeEnv === 'production' && !systemInfo.environment?.apiUrl && (
                    <div>⚙️ <strong>API URL not configured:</strong> Check REACT_APP_API_URL environment variable</div>
                  )}
                  {apiCalls.some(call => call.status === 'error') && (
                    <div>🌐 <strong>API Errors Detected:</strong> Check network connectivity and backend status</div>
                  )}
                  {orderCount === 0 && (
                    <div>📦 <strong>No Orders:</strong> This could be normal if no orders have been placed yet</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDebugPanel;