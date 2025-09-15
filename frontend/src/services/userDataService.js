import { authAPI } from './api';

class UserDataService {
  constructor() {
    this.sessionStartTime = new Date();
    this.currentPage = '';
    this.pageStartTime = new Date();
    this.activityQueue = [];
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushActivityQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageExit();
      } else {
        this.trackPageEntry();
      }
    });
    
    // Track before page unload
    window.addEventListener('beforeunload', () => {
      this.trackPageExit();
      this.flushActivityQueue();
    });
  }

  // Initialize user session data
  async initializeSession(user) {
    try {
      const sessionData = {
        sessionId: this.generateSessionId(),
        startTime: this.sessionStartTime,
        deviceInfo: this.getDeviceInfo(),
        browserInfo: this.getBrowserInfo()
      };

      await this.saveSessionData(sessionData);
      return sessionData;
    } catch (error) {
      console.error('Error initializing session:', error);
      return null;
    }
  }

  // Track user login with comprehensive data
  async trackLogin(loginData) {
    try {
      const enhancedData = {
        ...loginData,
        deviceInfo: this.getDeviceInfo(),
        browserInfo: this.getBrowserInfo(),
        timestamp: new Date(),
        sessionId: this.generateSessionId()
      };

      // This data is already captured in the backend login route
      // But we can enhance it with frontend-specific data
      await this.updateUserActivity({
        loginData: enhancedData
      });

      return enhancedData;
    } catch (error) {
      console.error('Error tracking login:', error);
      return null;
    }
  }

  // Track page navigation
  trackPageNavigation(page) {
    if (this.currentPage) {
      this.trackPageExit();
    }
    
    this.currentPage = page;
    this.pageStartTime = new Date();
    
    this.queueActivity({
      type: 'PAGE_NAVIGATION',
      page: page,
      timestamp: new Date()
    });
  }

  // Track page exit
  trackPageExit() {
    if (this.currentPage) {
      const duration = Math.round((new Date() - this.pageStartTime) / 1000);
      
      this.queueActivity({
        type: 'PAGE_EXIT',
        page: this.currentPage,
        duration: duration,
        timestamp: new Date()
      });
    }
  }

  // Track page entry
  trackPageEntry() {
    this.pageStartTime = new Date();
    
    this.queueActivity({
      type: 'PAGE_ENTRY',
      page: this.currentPage,
      timestamp: new Date()
    });
  }

  // Track product view
  async trackProductView(productId, productData = {}) {
    try {
      await authAPI.post('/user/track-product-view', {
        productId,
        ...productData,
        timestamp: new Date()
      });

      this.queueActivity({
        type: 'PRODUCT_VIEW',
        productId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  }

  // Track user actions (add to cart, purchase, etc.)
  trackUserAction(actionType, data = {}) {
    this.queueActivity({
      type: actionType,
      data,
      timestamp: new Date()
    });
  }

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      await this.updateUserActivity({
        preferences
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  // Save session data
  async saveSessionData(sessionData) {
    try {
      await authAPI.post('/user/save-session-data', {
        sessionData
      });
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  // Update user activity
  async updateUserActivity(activityData) {
    try {
      const response = await authAPI.put('/user/activity', activityData);
      return response.data;
    } catch (error) {
      console.error('Error updating user activity:', error);
      return null;
    }
  }

  // Get complete user profile
  async getUserProfile() {
    try {
      const response = await authAPI.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Queue activity for batch processing
  queueActivity(activity) {
    this.activityQueue.push(activity);
    
    // Auto-flush queue when it gets too large or after a delay
    if (this.activityQueue.length >= 10) {
      this.flushActivityQueue();
    } else {
      setTimeout(() => this.flushActivityQueue(), 30000); // 30 seconds
    }
  }

  // Flush activity queue to server
  async flushActivityQueue() {
    if (this.activityQueue.length === 0 || !this.isOnline) {
      return;
    }

    try {
      const activities = [...this.activityQueue];
      this.activityQueue = [];

      await this.updateUserActivity({
        browsingData: {
          activities,
          flushTime: new Date()
        }
      });
    } catch (error) {
      console.error('Error flushing activity queue:', error);
      // Re-queue activities if they failed to send
      this.activityQueue.unshift(...this.activityQueue);
    }
  }

  // Get device information
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  // Get browser information
  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    
    return {
      name: browser,
      version: this.getBrowserVersion(ua, browser),
      userAgent: ua
    };
  }

  // Get browser version
  getBrowserVersion(ua, browser) {
    let version = 'Unknown';
    
    try {
      if (browser === 'Chrome') {
        version = ua.match(/Chrome\/([0-9.]+)/)[1];
      } else if (browser === 'Firefox') {
        version = ua.match(/Firefox\/([0-9.]+)/)[1];
      } else if (browser === 'Safari') {
        version = ua.match(/Safari\/([0-9.]+)/)[1];
      } else if (browser === 'Edge') {
        version = ua.match(/Edge\/([0-9.]+)/)[1];
      }
    } catch (error) {
      // Ignore version parsing errors
    }
    
    return version;
  }

  // Generate session ID
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Track scroll behavior
  trackScrollBehavior() {
    let scrollTimeout;
    let maxScroll = 0;
    
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      maxScroll = Math.max(maxScroll, scrollPercent);
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.queueActivity({
          type: 'SCROLL',
          maxScrollPercent: maxScroll,
          currentScrollPercent: scrollPercent,
          timestamp: new Date()
        });
      }, 1000);
    });
  }

  // Track click patterns
  trackClickPatterns() {
    document.addEventListener('click', (event) => {
      const element = event.target;
      
      this.queueActivity({
        type: 'CLICK',
        element: {
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          text: element.textContent?.slice(0, 100) // Limit text length
        },
        coordinates: {
          x: event.clientX,
          y: event.clientY
        },
        timestamp: new Date()
      });
    });
  }

  // Initialize all tracking
  initializeTracking() {
    this.trackScrollBehavior();
    this.trackClickPatterns();
  }
}

// Create singleton instance
const userDataService = new UserDataService();

export default userDataService;
