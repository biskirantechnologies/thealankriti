import { authAPI, setAuthToken } from '../services/api';

// Emergency authentication system that handles session expire issues
class EmergencyAuth {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  async login(credentials, isAdmin = false) {
    console.log('🚑 Emergency Auth: Starting enhanced login process...');
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Login attempt ${attempt}/${this.maxRetries}...`);
        
        // Clear any existing auth data first
        this.clearAuth();
        
        const endpoint = isAdmin ? authAPI.adminLogin : authAPI.login;
        const response = await endpoint(credentials);
        
        console.log('📥 Login response received:', response.data);
        
        const { user, token, refreshToken } = response.data;
        
        if (!token) {
          throw new Error('No token received from server');
        }
        
        // Enhanced token storage
        setAuthToken(token);
        
        // Store refresh token if available
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
          console.log('🔄 Refresh token stored');
        }
        
        // Store enhanced auth state
        const authState = {
          user,
          loginTime: new Date().getTime(),
          isAdmin,
          attempt,
          sessionId: Math.random().toString(36).substr(2, 9)
        };
        
        localStorage.setItem('authState', JSON.stringify(authState));
        localStorage.setItem('lastSuccessfulLogin', new Date().toISOString());
        
        console.log('✅ Emergency Auth: Login successful!');
        
        return { success: true, user, token };
        
      } catch (error) {
        console.error(`❌ Login attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          console.log(`⏳ Waiting ${this.retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          this.retryDelay *= 2; // Exponential backoff
        } else {
          console.error('💥 All login attempts failed');
          return { 
            success: false, 
            error: error.response?.data?.message || error.message || 'Login failed after multiple attempts'
          };
        }
      }
    }
  }

  clearAuth() {
    console.log('🧹 Emergency Auth: Clearing all authentication data...');
    
    // Clear all possible auth storage locations
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenSetTime');
    localStorage.removeItem('authState');
    localStorage.removeItem('authData');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    setAuthToken(null);
  }

  async validateSession() {
    console.log('🔍 Emergency Auth: Validating session...');
    
    const token = localStorage.getItem('authToken');
    const authState = localStorage.getItem('authState');
    
    if (!token || !authState) {
      console.log('❌ No valid session found');
      return false;
    }
    
    try {
      const parsedAuthState = JSON.parse(authState);
      const loginTime = parsedAuthState.loginTime;
      const currentTime = new Date().getTime();
      const sessionAge = currentTime - loginTime;
      
      // Session valid for 30 days (in ms)
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      if (sessionAge < thirtyDays) {
        console.log('✅ Session is valid');
        setAuthToken(token);
        return true;
      } else {
        console.log('⏰ Session expired');
        this.clearAuth();
        return false;
      }
    } catch (error) {
      console.error('❌ Session validation error:', error);
      this.clearAuth();
      return false;
    }
  }

  getSessionInfo() {
    const authState = localStorage.getItem('authState');
    const lastLogin = localStorage.getItem('lastSuccessfulLogin');
    
    if (authState) {
      try {
        const parsed = JSON.parse(authState);
        return {
          user: parsed.user,
          loginTime: new Date(parsed.loginTime),
          isAdmin: parsed.isAdmin,
          lastLogin: lastLogin ? new Date(lastLogin) : null,
          sessionAge: Math.floor((new Date().getTime() - parsed.loginTime) / (24 * 60 * 60 * 1000))
        };
      } catch (error) {
        console.error('Error parsing session info:', error);
      }
    }
    
    return null;
  }
}

const emergencyAuthInstance = new EmergencyAuth();
export default emergencyAuthInstance;