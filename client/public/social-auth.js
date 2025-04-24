/**
 * Social Authentication Integration
 * 
 * This script provides integration with Google and Facebook authentication
 * for the Gaming Profile App.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize social auth buttons
  initSocialAuth();

  // Add login form to the page
  createLoginForm();
});

function initSocialAuth() {
  // Load Google Sign-In API
  loadGoogleSignInAPI();

  // Load Facebook SDK
  loadFacebookSDK();
}

function loadGoogleSignInAPI() {
  // Load the Google Sign-In API script
  const googleScript = document.createElement('script');
  googleScript.src = 'https://accounts.google.com/gsi/client';
  googleScript.async = true;
  googleScript.defer = true;
  document.head.appendChild(googleScript);

  // Initialize Google Sign-In when the script loads
  googleScript.onload = initGoogleSignIn;
}

function initGoogleSignIn() {
  // This function will be called when the Google Sign-In API is loaded
  // The actual implementation would require a valid Google Client ID
  console.log('Google Sign-In API loaded');
  
  // In a real implementation, you would use:
  /*
  google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID',
    callback: handleGoogleSignIn
  });
  
  google.accounts.id.renderButton(
    document.getElementById('google-signin-button'),
    { theme: 'outline', size: 'large', shape: 'rectangular', width: 250 }
  );
  */
}

function handleGoogleSignIn(response) {
  // This function handles the response from Google Sign-In
  if (response.credential) {
    // Send the ID token to your server
    const idToken = response.credential;
    
    // In a real implementation, you would send this token to your server
    console.log('Google Sign-In successful, token:', idToken);
    
    // Simulate authentication success
    showAuthSuccess('Google');
  }
}

function loadFacebookSDK() {
  // Load the Facebook SDK script
  window.fbAsyncInit = function() {
    FB.init({
      appId: 'YOUR_FACEBOOK_APP_ID', // This should be replaced with your actual Facebook App ID
      cookie: true,
      xfbml: true,
      version: 'v15.0'
    });
    
    console.log('Facebook SDK loaded');
  };

  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}

function handleFacebookLogin() {
  // This function initiates Facebook login
  FB.login(function(response) {
    if (response.authResponse) {
      // User is logged in
      const accessToken = response.authResponse.accessToken;
      const userID = response.authResponse.userID;
      
      // In a real implementation, you would send these values to your server
      console.log('Facebook login successful', accessToken, userID);
      
      // Simulate authentication success
      showAuthSuccess('Facebook');
    } else {
      console.log('Facebook login cancelled or failed');
    }
  }, {scope: 'public_profile,email'});
}

function createLoginForm() {
  // Create login modal/form for the app
  const loginModal = document.createElement('div');
  loginModal.className = 'login-modal hidden';
  loginModal.id = 'login-modal';
  
  loginModal.innerHTML = `
    <div class="login-container">
      <div class="login-header">
        <button class="close-button" id="close-login">×</button>
        <h2>Welcome to GameVault</h2>
        <p>Sign in to track your gaming stats and join the community</p>
      </div>
      
      <div class="login-tabs">
        <button class="tab-button active" data-tab="login">Login</button>
        <button class="tab-button" data-tab="register">Register</button>
      </div>
      
      <div class="tab-content active" id="login-tab">
        <form class="login-form" id="login-form">
          <div class="form-group">
            <label for="login-username">Username or Email</label>
            <input type="text" id="login-username" name="username" required>
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" name="password" required>
          </div>
          <div class="form-group">
            <div class="remember-me">
              <input type="checkbox" id="remember-me" name="remember">
              <label for="remember-me">Remember me</label>
            </div>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Login</button>
        </form>
        
        <div class="or-divider">
          <span>OR</span>
        </div>
        
        <div class="social-login">
          <button class="btn btn-social btn-google" id="google-signin-button">
            <i class="fab fa-google"></i> Continue with Google
          </button>
          <button class="btn btn-social btn-facebook" id="facebook-login-button">
            <i class="fab fa-facebook-f"></i> Continue with Facebook
          </button>
        </div>
      </div>
      
      <div class="tab-content" id="register-tab">
        <form class="register-form" id="register-form">
          <div class="form-group">
            <label for="register-name">Full Name</label>
            <input type="text" id="register-name" name="name" required>
          </div>
          <div class="form-group">
            <label for="register-username">Username</label>
            <input type="text" id="register-username" name="username" required>
          </div>
          <div class="form-group">
            <label for="register-email">Email</label>
            <input type="email" id="register-email" name="email" required>
          </div>
          <div class="form-group">
            <label for="register-password">Password</label>
            <input type="password" id="register-password" name="password" required>
          </div>
          <div class="form-group">
            <label for="register-password-confirm">Confirm Password</label>
            <input type="password" id="register-password-confirm" name="password-confirm" required>
          </div>
          <div class="form-group">
            <div class="terms-agreement">
              <input type="checkbox" id="terms-agree" name="terms" required>
              <label for="terms-agree">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Create Account</button>
        </form>
        
        <div class="or-divider">
          <span>OR</span>
        </div>
        
        <div class="social-login">
          <button class="btn btn-social btn-google" id="google-signup-button">
            <i class="fab fa-google"></i> Sign up with Google
          </button>
          <button class="btn btn-social btn-facebook" id="facebook-signup-button">
            <i class="fab fa-facebook-f"></i> Sign up with Facebook
          </button>
        </div>
      </div>
      
      <div class="auth-success hidden" id="auth-success">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>Authentication Successful!</h3>
        <p>You have successfully logged in with <span id="auth-provider"></span>.</p>
        <button class="btn btn-primary">Continue to Dashboard</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(loginModal);
  
  // Add event listeners
  document.getElementById('close-login').addEventListener('click', () => {
    loginModal.classList.add('hidden');
  });
  
  // Tab switching
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      
      button.classList.add('active');
      document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
    });
  });
  
  // Form submissions
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // In a real implementation, this would send the credentials to your server
    console.log('Login form submitted');
    
    // Simulate authentication success
    showAuthSuccess('Email');
  });
  
  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // In a real implementation, this would send the registration data to your server
    console.log('Registration form submitted');
    
    // Simulate authentication success
    showAuthSuccess('Email');
  });
  
  // Social login buttons
  document.getElementById('facebook-login-button').addEventListener('click', handleFacebookLogin);
  document.getElementById('facebook-signup-button').addEventListener('click', handleFacebookLogin);
  
  // For Google, we rely on the Google Sign-In API to render the buttons
  // But for demo purposes:
  document.getElementById('google-signin-button').addEventListener('click', () => {
    console.log('Google sign-in button clicked');
    // In a real implementation, this would be handled by the Google Sign-In API
    
    // Simulate authentication success
    showAuthSuccess('Google');
  });
  
  document.getElementById('google-signup-button').addEventListener('click', () => {
    console.log('Google sign-up button clicked');
    // In a real implementation, this would be handled by the Google Sign-In API
    
    // Simulate authentication success
    showAuthSuccess('Google');
  });
  
  // Add login/signup buttons to the navbar
  const authButtons = document.querySelector('.auth-buttons');
  if (authButtons) {
    const loginButton = authButtons.querySelector('.btn-outline');
    const signupButton = authButtons.querySelector('.btn-primary');
    
    if (loginButton) {
      loginButton.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
        document.querySelector('.tab-button[data-tab="login"]').click();
      });
    }
    
    if (signupButton) {
      signupButton.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
        document.querySelector('.tab-button[data-tab="register"]').click();
      });
    }
  }
}

function showAuthSuccess(provider) {
  document.getElementById('login-tab').classList.remove('active');
  document.getElementById('register-tab').classList.remove('active');
  document.getElementById('auth-success').classList.remove('hidden');
  document.getElementById('auth-provider').textContent = provider;
}