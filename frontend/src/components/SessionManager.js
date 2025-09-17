import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isTokenValid } from '../services/api';
import toast from 'react-hot-toast';

const SessionManager = () => {
  const { user, logout } = useAuth();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      const tokenSetTime = localStorage.getItem('tokenSetTime');
      if (!tokenSetTime) return;

      const tokenAge = new Date().getTime() - parseInt(tokenSetTime);
      const twentyFiveDaysInMs = 25 * 24 * 60 * 60 * 1000; // 25 days (5 days before 30-day expiry)
      const twentyNineDaysInMs = 29 * 24 * 60 * 60 * 1000; // 29 days (1 day before expiry)

      // Show warning at 25 days
      if (tokenAge > twentyFiveDaysInMs && tokenAge < twentyNineDaysInMs && !sessionWarningShown) {
        setSessionWarningShown(true);
        const daysLeft = Math.ceil((twentyNineDaysInMs - tokenAge) / (24 * 60 * 60 * 1000));
        
        toast(
          `Your session will expire in ${daysLeft} day(s). Please save your work and login again to continue.`,
          {
            duration: 10000,
            icon: '⚠️',
            style: {
              background: '#f59e0b',
              color: 'white',
            },
          }
        );
      }

      // Force logout at 30 days
      if (!isTokenValid()) {
        toast.error('Your session has expired. Please login again.');
        logout();
      }
    };

    // Check immediately
    checkSession();

    // Check every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, logout, sessionWarningShown]);

  // This component doesn't render anything
  return null;
};

export default SessionManager;