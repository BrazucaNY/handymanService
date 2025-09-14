// Admin Authentication System
// Handles GitHub OAuth login with domain restriction

import { auth, githubProvider, ADMIN_DOMAIN, ALLOWED_DOMAINS, REQUIRE_DOMAIN_VERIFICATION } from './firebase-config.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

class AdminAuth {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.handleAuthenticatedUser(user);
      } else {
        this.handleUnauthenticatedUser();
      }
    });
  }

  async signInWithGitHub() {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      
      // Check domain restriction
      if (REQUIRE_DOMAIN_VERIFICATION && !this.isAuthorizedDomain()) {
        await this.signOut();
        throw new Error(`Access denied. Admin access is restricted to ${ADMIN_DOMAIN} domain.`);
      }

      return user;
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      this.showError(error.message);
      throw error;
    }
  }

  async signOut() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.isAuthenticated = false;
      this.redirectToLogin();
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }

  handleAuthenticatedUser(user) {
    this.currentUser = user;
    this.isAuthenticated = true;
    
    // Check domain restriction
    if (REQUIRE_DOMAIN_VERIFICATION && !this.isAuthorizedDomain()) {
      this.signOut();
      return;
    }

    this.showAuthenticatedUI();
    this.hideLoginUI();
  }

  handleUnauthenticatedUser() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.showLoginUI();
    this.hideAuthenticatedUI();
  }

  isAuthorizedDomain() {
    const currentDomain = window.location.hostname;
    return ALLOWED_DOMAINS.includes(currentDomain);
  }

  showLoginUI() {
    const loginContainer = document.getElementById('login-container');
    const adminContent = document.getElementById('admin-content');
    
    if (loginContainer) loginContainer.style.display = 'block';
    if (adminContent) adminContent.style.display = 'none';
  }

  hideLoginUI() {
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) loginContainer.style.display = 'none';
  }

  showAuthenticatedUI() {
    const adminContent = document.getElementById('admin-content');
    const userInfo = document.getElementById('user-info');
    
    if (adminContent) adminContent.style.display = 'block';
    
    if (userInfo && this.currentUser) {
      userInfo.innerHTML = `
        <div class="user-profile">
          <img src="${this.currentUser.photoURL}" alt="Profile" class="profile-img">
          <span class="user-name">${this.currentUser.displayName}</span>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </div>
      `;
      
      // Add logout event listener
      document.getElementById('logout-btn').addEventListener('click', () => {
        this.signOut();
      });
    }
  }

  hideAuthenticatedUI() {
    const adminContent = document.getElementById('admin-content');
    if (adminContent) adminContent.style.display = 'none';
  }

  showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    } else {
      alert(message);
    }
  }

  redirectToLogin() {
    // Redirect to login page if not already there
    if (!window.location.pathname.includes('login')) {
      window.location.href = '/login.html';
    }
  }

  // Check if user is authenticated and authorized
  requireAuth() {
    if (!this.isAuthenticated) {
      this.redirectToLogin();
      return false;
    }
    
    if (REQUIRE_DOMAIN_VERIFICATION && !this.isAuthorizedDomain()) {
      this.signOut();
      return false;
    }
    
    return true;
  }
}

// Initialize authentication system
const adminAuth = new AdminAuth();

// Export for use in other files
window.adminAuth = adminAuth;

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('github-login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      adminAuth.signInWithGitHub();
    });
  }
});
